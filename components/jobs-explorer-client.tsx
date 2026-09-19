"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/empty-state";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { useStore } from "@/lib/store/store-provider";
import { Loader2, RefreshCw } from "lucide-react";
import type { Job } from "@/lib/jobs/types";

interface JobsExplorerClientProps {
  initialData: {
    jobs: Job[];
    total: number;
    totalPages: number;
    page: number;
  };
}

export function JobsExplorerClient({ initialData }: JobsExplorerClientProps) {
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

  const fetchJobs = useCallback(async (params: URLSearchParams) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs?${params.toString()}`);
      const result = await response.json();
      setData({
        jobs: result.jobs,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
      });
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const goToPage = useCallback((page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
    fetchJobs(params);
  }, [fetchJobs]);

  const setSort = useCallback((sort: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("sort", sort);
    params.delete("page");
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
    fetchJobs(params);
  }, [fetchJobs]);

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
        const fetchParams = new URLSearchParams(window.location.search);
        fetchParams.set("page", "1");
        fetchJobs(fetchParams);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  }, [session, fetchJobs]);

  const currentSort = useMemo(
    () => new URLSearchParams(window.location.search).get("sort") || "relevance",
    []
  );

  const matched = useMemo(() => {
    const byId = new Map<string, ReturnType<typeof calculateMatch>>();
    for (const job of data.jobs) {
      byId.set(job.id, calculateMatch(profile, job));
    }
    return byId;
  }, [data.jobs, profile]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            {data.total} {data.total === 1 ? "job" : "jobs"} found
            <span className="ml-2 text-sm px-2 py-0.5 rounded bg-muted">
              Source: LinkedIn
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="match">Best match</option>
            <option value="salary">Salary</option>
          </select>

          {session && (
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
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : data.jobs.length === 0 ? (
            <EmptyState
              title="No jobs found"
              description="No jobs synced yet. Sign in and sync your LinkedIn job search to get started."
              action={session ? <Button onClick={handleSync} disabled={syncing} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                {syncing ? "Syncing..." : "Sync LinkedIn"}
              </Button> : <Button asChild><Link href="/auth/signin">Sign in to sync</Link></Button>}
            />
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.jobs.map((job) => {
                  const match = matched.get(job.id) ?? calculateMatch(profile, job);
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