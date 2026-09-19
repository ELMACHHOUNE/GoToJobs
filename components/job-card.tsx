"use client";

import { cn } from "@/lib/utils";
import { Building2Icon, MapPinIcon, BriefcaseIcon, ClockIcon, HeartIcon, HeartOffIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store/store-provider";
import type { Job } from "@/lib/jobs/types";

interface JobCardProps {
  job: Job;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  reasons?: string[];
  showMatch?: boolean;
}

export function JobCard({ job, matchScore, matchedSkills, missingSkills, reasons, showMatch = true }: JobCardProps) {
  const { isSaved, toggleSave } = useStore();
  const saved = isSaved(job.id);

  const getWorkplaceLabel = (type?: string) => {
    if (!type) return "—";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getEmploymentLabel = (type?: string) => {
    if (!type) return "—";
    return type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <Card className="flex flex-col h-full transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Building2Icon className="h-3.5 w-3.5" />
              <span className="truncate">{job.company.name}</span>
            </div>
            <h3 className="font-semibold text-lg truncate">{job.title}</h3>
          </div>
          {showMatch && matchScore !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {matchScore}% Match
                    </span>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-xs text-muted-foreground">
                        Based on matching skills, role, location, workplace preference, and experience.
                      </p>
                    </TooltipContent>
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5" />
              {job.location}
            </span>
          )}
          {job.workplaceType && (
            <Badge variant="secondary" className="gap-1">
              <BriefcaseIcon className="h-3 w-3" />
              {getWorkplaceLabel(job.workplaceType)}
            </Badge>
          )}
          {job.employmentType && (
            <Badge variant="outline" className="gap-1">
              <ClockIcon className="h-3 w-3" />
              {getEmploymentLabel(job.employmentType)}
            </Badge>
          )}
          {job.experienceLevel && (
            <Badge variant="outline" className="gap-1 text-xs">
              {job.experienceLevel.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </Badge>
          )}
        </div>

        {job.salary && (job.salary.min || job.salary.max) && (
          <div className="text-sm font-medium">
            {job.salary.min && job.salary.max
              ? `${job.salary.min.toLocaleString()}–${job.salary.max.toLocaleString()} ${job.salary.currency || "MAD"}/yr`
              : job.salary.min
              ? `From ${job.salary.min.toLocaleString()} ${job.salary.currency || "MAD"}/yr`
              : job.salary.max
              ? `Up to ${job.salary.max.toLocaleString()} ${job.salary.currency || "MAD"}/yr`
              : ""}
          </div>
        )}

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 6} more
              </Badge>
            )}
          </div>
        )}

        {showMatch && matchedSkills && matchedSkills.length > 0 && (
          <div className="pt-2 border-t">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Matched skills</p>
            <div className="flex flex-wrap gap-1">
              {matchedSkills.map((skill) => (
                <Badge key={skill} variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  ✓ {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showMatch && missingSkills && missingSkills.length > 0 && (
          <div className="pt-2 border-t">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Missing skills</p>
            <div className="flex flex-wrap gap-1">
              {missingSkills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300">
                  {skill}
                </Badge>
              ))}
              {missingSkills.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{missingSkills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={saved ? "default" : "ghost"}
                size="icon"
                className={cn("h-8 w-8", saved && "text-red-500")}
                onClick={() => toggleSave(job.id)}
                aria-label={saved ? "Remove from saved" : "Save job"}
              >
                {saved ? <HeartIcon className="h-4 w-4 fill-current" /> : <HeartOffIcon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{saved ? "Saved" : "Save job"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  Apply
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Opens on {job.source}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}