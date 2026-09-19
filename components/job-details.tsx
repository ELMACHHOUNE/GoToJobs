"use client";

import { cn } from "@/lib/utils";
import { Building2Icon, MapPinIcon, BriefcaseIcon, ClockIcon, CalendarIcon, ExternalLinkIcon, HeartIcon, HeartOffIcon, ArrowLeftIcon, ClipboardListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store/store-provider";
import Link from "next/link";
import type { Job, MatchResult } from "@/lib/jobs/types";

interface JobDetailsProps {
  job: Job;
  match: MatchResult;
  related: Array<{ job: Job; match: MatchResult }>;
}

function MatchBreakdown({ match }: { match: MatchResult; job: Job }) {
  if (match.needsProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Why this job matches you</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Create a profile to get a personalized match breakdown.</p>
          <Button asChild className="mt-4 w-full">
            <Link href="/profile">Create Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Why this job matches you</CardTitle>
          <div className="text-2xl font-bold text-primary">{match.score}% Match</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {match.breakdown && [
            { label: "Skills", value: match.breakdown.skills, color: "bg-blue-500" },
            { label: "Role", value: match.breakdown.title, color: "bg-purple-500" },
            { label: "Experience", value: match.breakdown.experience, color: "bg-green-500" },
            { label: "Location", value: match.breakdown.location, color: "bg-orange-500" },
            { label: "Workplace", value: match.breakdown.workplace, color: "bg-pink-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium">{item.label}</span>
              <div className="flex-1 h-2 rounded-full bg-muted">
                <Progress value={item.value} className={cn(item.color, "h-2")} />
              </div>
              <span className="w-10 text-sm font-medium text-right">{item.value}%</span>
            </div>
          ))}
        </div>

        <Separator />

        {match.matchedSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
              <span className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                ✓
              </span>
              Matched skills ({match.matchedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {match.matchedSkills.map((skill: string) => (
                <Badge key={skill} variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {match.missingSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <span className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                !
              </span>
              Missing skills ({match.missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {match.missingSkills.map((skill: string) => (
                <Badge key={skill} variant="outline" className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {match.reasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Why this match</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {match.reasons.map((reason: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RelatedJobs({ jobs }: { jobs: Array<{ job: Job; match: MatchResult }> }) {
  if (jobs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Related jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map(({ job, match }) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="group flex flex-col p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium group-hover:text-primary transition-colors">{job.title}</h4>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {match.score}% Match
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{job.company.name}</p>
              <div className="mt-auto flex flex-wrap gap-1">
                {job.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function JobDetails({ job, match, related }: JobDetailsProps) {
  const { isSaved, toggleSave, setApplicationStatus } = useStore();
  const saved = isSaved(job.id);

  const getWorkplaceLabel = (type?: string) => {
    if (!type) return "—";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getEmploymentLabel = (type?: string) => {
    if (!type) return "—";
    return type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/jobs" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Building2Icon className="h-4 w-4" />
                    <span>{job.company.name}</span>
                    {job.source && (
                      <Badge variant="secondary" className="ml-2">
                        {job.source.charAt(0).toUpperCase() + job.source.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
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
                      <Badge variant="outline" className="text-xs">
                        {job.experienceLevel.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Posted {formatDate(job.publishedAt)}
                    </span>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={saved ? "default" : "ghost"}
                        size="icon"
                        className={cn("h-10 w-10", saved && "text-red-500")}
                        onClick={() => toggleSave(job.id)}
                        aria-label={saved ? "Remove from saved" : "Save job"}
                      >
                        {saved ? <HeartIcon className="h-5 w-5 fill-current" /> : <HeartOffIcon className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{saved ? "Saved" : "Save job"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>

              {job.salary && (job.salary.min || job.salary.max) && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">
                    {job.salary.min && job.salary.max
                      ? `${job.salary.min.toLocaleString()}–${job.salary.max.toLocaleString()} ${job.salary.currency || "MAD"}/yr`
                      : job.salary.min
                      ? `From ${job.salary.min.toLocaleString()} ${job.salary.currency || "MAD"}/yr`
                      : job.salary.max
                      ? `Up to ${job.salary.max.toLocaleString()} ${job.salary.currency || "MAD"}/yr`
                      : ""}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="about" className="space-y-4">
            <TabsList>
              <TabsTrigger value="about">About the job</TabsTrigger>
              <TabsTrigger value="match">Match details</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="mb-3 text-lg font-semibold">Description</h3>
                <div className="whitespace-pre-wrap text-muted-foreground">{job.description}</div>
              </div>
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="prose prose-sm max-w-none">
                  <h3 className="mb-3 text-lg font-semibold">Responsibilities</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {job.requirements && job.requirements.length > 0 && (
                <div className="prose prose-sm max-w-none">
                  <h3 className="mb-3 text-lg font-semibold">Requirements</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </TabsContent>
            <TabsContent value="match">
              <MatchBreakdown match={match} job={job} />
            </TabsContent>
          </Tabs>

          <RelatedJobs jobs={related} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Apply on the original job site:</p>
                <p className="font-medium truncate">{job.source.charAt(0).toUpperCase() + job.source.slice(1)}</p>
              </div>
              <Button className="w-full" size="lg" asChild>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  Apply on {job.source.charAt(0).toUpperCase() + job.source.slice(1)}
                </a>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This will open the application page on the external site.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => toggleSave(job.id)}>
                {saved ? <HeartIcon className="mr-2 h-4 w-4 fill-current text-red-500" /> : <HeartOffIcon className="mr-2 h-4 w-4" />}
                {saved ? "Remove from saved" : "Save job"}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setApplicationStatus(job.id, "applied")}>
                <ClipboardListIcon className="mr-2 h-4 w-4" />
                Mark as applied
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={`/jobs/${job.id}`}>Share this job</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}