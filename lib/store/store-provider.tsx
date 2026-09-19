"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  appStateSchema,
  defaultAppState,
  defaultProfile,
  type AppState,
  type Profile,
  type ApplicationStatus,
  type JobAlert,
} from "@/lib/store/schema";

const STORAGE_KEY = "gotojobs.store.v1";

type StoreContextValue = {
  appState: AppState;
  profile: Profile;
  savedJobs: { id: string; jobId: string; savedAt: string }[];
  applications: { id: string; jobId: string; status: ApplicationStatus; notes: string; createdAt: string; updatedAt: string }[];
  alerts: { id: string; name: string; keywords: string[]; location: string; minMatchPercent: number; frequency: "daily" | "weekly"; enabled: boolean; createdAt: string; updatedAt: string }[];
  hydrated: boolean;
  seedProfileFromJob: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  resetProfile: () => void;
  toggleSave: (jobId: string) => void;
  isSaved: (jobId: string) => boolean;
  setApplicationStatus: (jobId: string, status: ApplicationStatus) => void;
  getApplication: (jobId: string) => { id: string; jobId: string; status: ApplicationStatus; notes: string; createdAt: string; updatedAt: string } | undefined;
  removeApplication: (jobId: string) => void;
  createAlert: (alert: Omit<{ id: string; name: string; keywords: string[]; location: string; minMatchPercent: number; frequency: "daily" | "weekly"; enabled: boolean; createdAt: string; updatedAt: string }, "id" | "createdAt" | "updatedAt">) => void;
  updateAlert: (id: string, patch: Partial<{ id: string; name: string; keywords: string[]; location: string; minMatchPercent: number; frequency: "daily" | "weekly"; enabled: boolean; createdAt: string; updatedAt: string }>) => void;
  removeAlert: (id: string) => void;
  persist: () => { ok: true } | { ok: false; reason: string };
  load: () => { ok: true } | { ok: false; reason: string };
  clearAll: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readStorage(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const result = appStateSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function writeStorage(state: AppState): { ok: true } | { ok: false; reason: string } {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

function getInitialAppState(): AppState {
  if (typeof window === "undefined") return defaultAppState();
  const existing = readStorage();
  return existing ?? defaultAppState();
}

function getInitialHydrated(): boolean {
  return typeof window !== "undefined";
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>(getInitialAppState);
  const [hydrated] = useState<boolean>(getInitialHydrated);

  const persist = useCallback((): { ok: true } | { ok: false; reason: string } => {
    const result = appStateSchema.safeParse(appState);
    if (!result.success) return { ok: false, reason: "State did not validate" };
    return writeStorage(result.data);
  }, [appState]);

  const load = useCallback((): { ok: true } | { ok: false; reason: string } => {
    const loaded = readStorage();
    if (!loaded) return { ok: false, reason: "No saved state" };
    setAppState(loaded);
    return { ok: true };
  }, []);

  const clearAll = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAppState(defaultAppState());
  }, []);

  const seedProfileFromJob = useCallback((profile: Profile) => {
    setAppState((prev) => ({ ...prev, profile: { ...prev.profile, ...profile, updatedAt: new Date().toISOString() } }));
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setAppState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const resetProfile = useCallback(() => {
    setAppState((prev) => ({ ...prev, profile: defaultProfile() }));
  }, []);

  const toggleSave = useCallback((jobId: string) => {
    setAppState((prev) => {
      const exists = prev.savedJobs.some((s) => s.jobId === jobId);
      const savedJobs = exists
        ? prev.savedJobs.filter((s) => s.jobId !== jobId)
        : [...prev.savedJobs, { id: crypto.randomUUID(), jobId, savedAt: new Date().toISOString() }];
      return { ...prev, savedJobs };
    });
  }, []);

  const isSaved = useCallback((jobId: string) => appState.savedJobs.some((s) => s.jobId === jobId), [appState.savedJobs]);

  const setApplicationStatus = useCallback((jobId: string, status: ApplicationStatus) => {
    setAppState((prev) => {
      const existing = prev.applications.find((a) => a.jobId === jobId);
      const applications = existing
        ? prev.applications.map((a) =>
            a.jobId === jobId
              ? { ...a, status, updatedAt: new Date().toISOString() }
              : a,
          )
        : [
            ...prev.applications,
            {
              id: crypto.randomUUID(),
              jobId,
              status,
              notes: "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
      return { ...prev, applications };
    });
  }, []);

  const getApplication = useCallback(
    (jobId: string) => appState.applications.find((a) => a.jobId === jobId),
    [appState.applications],
  );

  const removeApplication = useCallback((jobId: string) => {
    setAppState((prev) => ({ ...prev, applications: prev.applications.filter((a) => a.jobId !== jobId) }));
  }, []);

  const createAlert = useCallback((alert: Omit<JobAlert, "id" | "createdAt" | "updatedAt">) => {
    setAppState((prev) => ({
      ...prev,
      alerts: [
        ...prev.alerts,
        {
          ...alert,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const updateAlert = useCallback((id: string, patch: Partial<JobAlert>) => {
    setAppState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a)),
    }));
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAppState((prev) => ({ ...prev, alerts: prev.alerts.filter((a) => a.id !== id) }));
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      appState,
      profile: appState.profile,
      savedJobs: appState.savedJobs,
      applications: appState.applications,
      alerts: appState.alerts,
      hydrated,
      seedProfileFromJob,
      updateProfile,
      resetProfile,
      toggleSave,
      isSaved,
      setApplicationStatus,
      getApplication,
      removeApplication,
      createAlert,
      updateAlert,
      removeAlert,
      persist,
      load,
      clearAll,
    }),
    [
      appState,
      hydrated,
      seedProfileFromJob,
      updateProfile,
      resetProfile,
      toggleSave,
      isSaved,
      setApplicationStatus,
      getApplication,
      removeApplication,
      createAlert,
      updateAlert,
      removeAlert,
      persist,
      load,
      clearAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}