"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterIcon, XIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "@/components/job-card";
import { EmptyState } from "@/components/empty-state";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { useStore } from "@/lib/store/store-provider";
import type { Job } from "@/lib/jobs/types";

type FilterValue = "all" | "remote" | "high-match" | "recent";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "remote", label: "Remote" },
  { value: "high-match", label: "High match (80%+)" },
  { value: "recent", label: "Recently saved" },
] as const satisfies { value: FilterValue; label: string }[];

export default function () {
  const { savedJobs, profile, isSaved, toggleSave, removeApplication } = useStore();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [savedJobDetails, setSavedJobDetails] = useState<Job[]>([]);

  useEffect(() => {
    const ids = savedJobs.map((s) => s.jobId);
    if (ids.length === 0) {
      setSavedJobDetails([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/jobs/batch?${ids.map((id) => `id=${encodeURIComponent(id)}`).join("&")}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSavedJobDetails(data.jobs ?? []);
      })
      .catch(() => {
        if (!cancelled) setSavedJobDetails([]);
      });
    return () => {
      cancelled = true;
    };
  }, [savedJobs]);

  const jobs = useMemo(() => {
    return savedJobs
      .map((s) => {
        const job = savedJobDetails.find((j) => j.id === s.jobId);
        return job ? { job, savedAt: s.savedAt } : null;
      })
      .filter((entry): entry is { job: Job; savedAt: string } => !!entry)
      .map(({ job, savedAt }) => {
        const match = calculateMatch(profile, job);
        return { job, match, savedAt };
      })
      .filter(({ job, match }) => {
        if (filter === "remote") return job.workplaceType === "remote";
        if (filter === "high-match") return match.score >= 80;
        if (filter === "recent") return true; // sorted by savedAt below
        return true;
      })
      .sort((a, b) => {
        if (filter === "recent") return new Date(b.savedAt ?? "").getTime() - new Date(a.savedAt ?? "").getTime();
        return b.match.score - a.match.score;
      });
  }, [savedJobs, savedJobDetails, profile, filter]);

  if (jobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Saved Jobs</h1>
        </div>
        <EmptyState
          title="No saved jobs yet"
          description={savedJobs.length === 0 ? "Save jobs you want to revisit later." : "No jobs match the current filter."}
          variant="saved"
          action={<Button onClick={() => setFilter("all")}>Clear filter</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Jobs</h1>
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map(({ job, match }) => (
          <JobCard
            key={job.id}
            job={job}
            matchScore={match.score}
            matchedSkills={match.matchedSkills}
            missingSkills={match.missingSkills}
            reasons={match.reasons}
          />
        ))}
      </div>
    </div>
  );
}