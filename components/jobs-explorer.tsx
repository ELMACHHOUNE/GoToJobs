"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/empty-state";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { searchJobs, type JobQueryInput } from "@/lib/jobs/queries";
import { useStore } from "@/lib/store/store-provider";

const PAGE_SIZE = 12;

export function JobsExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useStore();
  const [loading, setLoading] = useState(false);

  const buildQueryInput = useMemo((): JobQueryInput => {
    const q = searchParams.get("q") || undefined;
    const locations = searchParams.getAll("locations") || undefined;
    const workplaceTypes = searchParams.getAll("workplaceTypes") as JobQueryInput["workplaceTypes"];
    const employmentTypes = searchParams.getAll("employmentTypes") as JobQueryInput["employmentTypes"];
    const experienceLevels = searchParams.getAll("experienceLevels") as JobQueryInput["experienceLevels"];
    const skills = searchParams.getAll("skills") || undefined;
    const datePosted = (searchParams.get("datePosted") as JobQueryInput["datePosted"]) || "any";
    const sort = (searchParams.get("sort") as JobQueryInput["sort"]) || "relevance";
    const page = parseInt(searchParams.get("page") || "1", 10);
    return {
      profile,
      q,
      locations,
      workplaceTypes,
      employmentTypes,
      experienceLevels,
      skills,
      datePosted,
      sort,
      page,
      pageSize: PAGE_SIZE,
    };
  }, [searchParams, profile]);

  const searchResult = useMemo(() => searchJobs(buildQueryInput), [buildQueryInput]);

  const { jobs, total, totalPages, page: currentPage } = searchResult;

  const goToPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            {total} {total === 1 ? "job" : "jobs"} found
            {buildQueryInput.q && <span className="ml-2">for &ldquo;{buildQueryInput.q}&rdquo;</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <select
            value={buildQueryInput.sort || "relevance"}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("sort", e.target.value);
              params.delete("page");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="match">Best match</option>
            <option value="salary">Salary</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <JobFilters />
        </aside>
        <main className="flex-1 min-w-0">
          {jobs.length === 0 ? (
            <EmptyState
              title="No jobs found"
              description="Try changing your keywords or filters."
              action={<Button onClick={() => router.push(pathname)}>Clear filters</Button>}
            />
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => {
                  const match = calculateMatch(profile, job);
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
              {totalPages > 1 && (
                <Pagination
                  className="mt-6 justify-center"
                  currentPage={currentPage}
                  totalPages={totalPages}
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