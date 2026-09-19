"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/empty-state";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { searchJobs, type JobQueryInput, type JobQueryResult } from "@/lib/jobs/queries";
import { useStore } from "@/lib/store/store-provider";
import { Link, Loader2, RefreshCw, Database } from "lucide-react";

const PAGE_SIZE = 12;

interface JobsExplorerClientProps {
  initialData: {
    jobs: import("@/lib/jobs/types").Job[];
    total: number;
    totalPages: number;
    page: number;
  };
  searchParams: {
    q?: string;
    locations?: string[];
    workplaceTypes?: string[];
    employmentTypes?: string[];
    experienceLevels?: string[];
    skills?: string[];
    datePosted?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
    source?: string;
    country?: string;
  };
}

export function JobsExplorerClient({ initialData, searchParams }: JobsExplorerClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useStore();
  const { data: session } = useSession();
  const [data, setData] = useState({
    jobs: initialData.jobs,
    total: initialData.total,
    totalPages: initialData.totalPages,
    currentPage: initialData.page,
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const buildQueryInput = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    return {
      profile: undefined as any,
      q: sp.get("q") || undefined,
      locations: sp.getAll("locations") || undefined,
      workplaceTypes: sp.getAll("workplaceTypes") as any,
      employmentTypes: sp.getAll("employmentTypes") as any,
      experienceLevels: sp.getAll("experienceLevels") as any,
      skills: sp.getAll("skills") || undefined,
      datePosted: (sp.get("datePosted") as any) || "any",
      sort: (sp.get("sort") as any) || "relevance",
      page: parseInt(sp.get("page") || "1", 10),
      pageSize: 12,
      source: (sp.get("source") as "mock" | "linkedin") || "mock",
      country: sp.get("country") || "morocco",
    };
  }, []);

  const { jobs, total, totalPages, page: currentPage } = data;

  const goToPage = useCallback((page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
    setLoading(true);
    searchJobs({ ...buildQueryInput, page }).then((result) => {
      setData({
        jobs: result.jobs,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
      });
      setLoading(false);
    });
  }, [buildQueryInput]);

  const setSource = useCallback((source: "mock" | "linkedin") => {
    const params = new URLSearchParams(window.location.search);
    params.set("source", source);
    params.delete("page");
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
    setLoading(true);
    searchJobs({ ...buildQueryInput, source, page: 1 }).then((result) => {
      setData({
        jobs: result.jobs,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
      });
      setLoading(false);
    });
  }, [buildQueryInput]);

  const handleSync = useCallback(async () => {
    if (!session) return;
    
    setSyncing(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || undefined;
      const location = params.get("locations") || undefined;
      
      const response = await fetch("/api/linkedin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: q, location, saveJobs: true }),
      });
      
      const result = await response.json();
      if (result.success) {
        setLoading(true);
        searchJobs({ ...buildQueryInput, page: 1 }).then((result) => {
          setData({
            jobs: result.jobs,
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.page,
          });
          setLoading(false);
        });
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  }, [session, buildQueryInput]);

  const currentSource = new URLSearchParams(window.location.search).get("source") || "mock";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            {data.total} {data.total === 1 ? "job" : "jobs"} found
            <span className="ml-2 text-sm px-2 py-0.5 rounded bg-muted">
              Source: {currentSource === "linkedin" ? "LinkedIn" : "Mock Data"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Source:</span>
          <select
            value={currentSource}
            onChange={(e) => {
              const source = e.target.value as "mock" | "linkedin";
              const params = new URLSearchParams(window.location.search);
              params.set("source", source);
              params.delete("page");
              window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
              setLoading(true);
              searchJobs({ ...buildQueryInput, source, page: 1 }).then((result) => {
                setData({
                  jobs: result.jobs,
                  total: result.total,
                  totalPages: result.totalPages,
                  currentPage: result.page,
                });
                setLoading(false);
              });
            }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="mock">Mock Data (Demo)</option>
            <option value="linkedin">LinkedIn Jobs</option>
          </select>
          <span className="text-sm text-muted-foreground">Sort:</span>
          <select
            value={new URLSearchParams(window.location.search).get("sort") || "relevance"}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search);
              params.set("sort", e.target.value);
              params.delete("page");
              window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
              setLoading(true);
              searchJobs({ ...buildQueryInput, sort: e.target.value, page: 1 }).then((result) => {
                setData({
                  jobs: result.jobs,
                  total: result.total,
                  totalPages: result.totalPages,
                  currentPage: result.page,
                });
                setLoading(false);
              });
            }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="match">Best match</option>
            <option value="salary">Salary</option>
          </select>
          
          {session && currentSource === "linkedin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing || loading}
              className="gap-1.5"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync LinkedIn
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <JobFilters />
        </aside>
        <main className="flex-1 min-w-0">
          {data.jobs.length === 0 ? (
            <EmptyState
              title="No jobs found"
              description="Try changing your keywords or filters."
              action={<Button onClick={() => window.location.href = window.location.pathname}>Clear filters</Button>}
            />
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.jobs.map((job) => {
                  const match = calculateMatch(undefined as any, job);
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      matchScore={match.score}
                      matchedSkills={match.matchedSkills}
                      missingSkills={match.missingSkills}
                      reasons={match.reasons}
                    />
                  );
                })}
              </div>
              {data.totalPages > 1 && (
                <Pagination
                  className="mt-6 justify-center"
                  currentPage={data.currentPage}
                  totalPages={data.totalPages}
                  onPageChange={goToPage}
                  showFirstLast
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}