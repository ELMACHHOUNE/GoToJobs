"use client";

import { useMemo, useState } from "react";
import { KanbanIcon, PlusIcon, Trash2Icon, MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { JobCard } from "@/components/job-card";
import { EmptyState } from "@/components/empty-state";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { defaultProfile } from "@/lib/store/schema";
import { getQueryableJobs } from "@/lib/jobs/queries";
import { useStore } from "@/lib/store/store-provider";
import type { ApplicationStatus } from "@/lib/store/schema";

const STATUS_ORDER: ApplicationStatus[] = ["saved", "applied", "interview", "offer", "rejected", "withdrawn"];
const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};
const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  interview: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  withdrawn: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function () {
  const { applications, profile, getApplication, setApplicationStatus, removeApplication } = useStore();
  const [mobileColumn, setMobileColumn] = useState<ApplicationStatus>("saved");

  const allJobs = useMemo(() => getQueryableJobs(), []);
  const appsByStatus = useMemo(() => {
    const map: Record<ApplicationStatus, typeof applications> = {
      saved: [],
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
      withdrawn: [],
    };
    applications.forEach((app) => {
      const job = allJobs.find((j) => j.id === app.jobId);
      if (job) {
        const match = calculateMatch(profile, job);
        map[app.status].push({ ...app, job, match });
      }
    });
    return map;
  }, [applications, profile]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Track new application
        </Button>
      </div>

      {STATUS_ORDER.every((s) => appsByStatus[s].length === 0) ? (
        <EmptyState
          title="No applications yet"
          description="Start tracking the jobs you apply to."
          variant="applications"
        />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STATUS_ORDER.map((status) => {
              const items = appsByStatus[status];
              return (
                <div key={status} className="w-80 flex-shrink-0 flex flex-col">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge className={STATUS_COLORS[status]}>
                      {STATUS_LABELS[status]} <span className="ml-1.5 text-xs font-normal opacity-70">{items.length}</span>
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {items.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">Drop jobs here or use dropdown</div>
                    ) : (
                      items.map(({ job, match, ...app }) => (
                        <Card key={app.id} className="overflow-hidden transition-shadow hover:shadow-md">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{job.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{job.company.name}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {STATUS_ORDER.map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      className={app.status === s ? "bg-accent" : ""}
                                      onClick={() => setApplicationStatus(app.jobId, s)}
                                    >
                                      {STATUS_LABELS[s]}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuItem className="text-red-600" onClick={() => removeApplication(app.jobId)}>
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              {job.workplaceType && <Badge variant="secondary">{job.workplaceType}</Badge>}
                              {match.score !== undefined && (
                                <Badge variant="outline" className="text-primary border-primary">
                                  {match.score}% Match
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}