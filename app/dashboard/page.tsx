"use client";

import { useMemo } from "react";
import { BriefcaseIcon, BookmarkIcon, ClipboardListIcon, BellIcon, TrendingUpIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/job-card";
import { EmptyState } from "@/components/empty-state";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { defaultProfile } from "@/lib/store/schema";
import { getQueryableJobs } from "@/lib/jobs/queries";
import { useStore } from "@/lib/store/store-provider";
import Link from "next/link";

export default function () {
  const { profile, savedJobs, applications, alerts } = useStore();
  const allJobs = getQueryableJobs();
  const profileForMatch = defaultProfile();

  const stats = useMemo(() => {
    const matchingJobs = allJobs
      .map((j) => ({ job: j, match: calculateMatch(profileForMatch, j) }))
      .filter(({ match }) => match.score >= 70).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = allJobs.filter((j) => new Date(j.publishedAt) >= today).length;
    return {
      matching: matchingJobs,
      newToday,
      saved: savedJobs.length,
      applications: applications.length,
    };
  }, [allJobs, savedJobs, applications]);

  const topMatches = useMemo(() => {
    return allJobs
      .map((job) => ({ job, match: calculateMatch(profileForMatch, job) }))
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 3);
  }, [allJobs]);

  const recentApplications = useMemo(() => {
    return applications
      .map((app) => {
        const job = allJobs.find((j) => j.id === app.jobId);
        return job ? { ...app, job } : null;
      })
      .filter((a): a is NonNullable<typeof a> => !!a)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [applications, allJobs]);

  const activeAlerts = alerts.filter((a) => a.enabled);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Good evening 👋</h1>
        <p className="text-muted-foreground">Your job search overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Matching jobs"
          value={stats.matching}
          icon={TrendingUpIcon}
          description="Jobs with 70%+ match"
          action={<Button variant="ghost" size="sm" asChild><Link href="/jobs">View all</Link></Button>}
        />
        <StatCard
          title="New today"
          value={stats.newToday}
          icon={CalendarIcon}
          description="Jobs posted today"
          action={<Button variant="ghost" size="sm" asChild><Link href="/jobs">View all</Link></Button>}
        />
        <StatCard
          title="Saved"
          value={stats.saved}
          icon={BookmarkIcon}
          description="Jobs you've saved"
          action={<Button variant="ghost" size="sm" asChild><Link href="/saved">View all</Link></Button>}
        />
        <StatCard
          title="Applications"
          value={stats.applications}
          icon={ClipboardListIcon}
          description="Active applications"
          action={<Button variant="ghost" size="sm" asChild><Link href="/applications">View all</Link></Button>}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle className="text-lg">Top matches for you</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/jobs">View all</Link></Button>
          </div>
          {topMatches.length > 0 ? (
            <div className="space-y-4">
              {topMatches.map(({ job, match }) => (
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
          ) : (
            <EmptyState
              title="No matches yet"
              description="Create a profile to see personalized matches."
              variant="default"
              action={<Button asChild><Link href="/profile">Create profile</Link></Button>}
            />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle className="text-lg">Recent applications</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/applications">View all</Link></Button>
          </div>
          {recentApplications.length > 0 ? (
            <Card>
              <CardContent className="space-y-3 p-0">
                {recentApplications.map(({ job, status, updatedAt }) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border-b last:border-0">
                    <Link href={`/jobs/${job.id}`} className="flex-1 flex flex-col">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company.name}</p>
                    </Link>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{status}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              title="No applications yet"
              description="Start tracking the jobs you apply to."
              variant="applications"
            />
          )}
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <CardTitle className="text-lg">Active alerts</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link href="/alerts">Manage</Link></Button>
        </div>
        {activeAlerts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{alert.name}</CardTitle>
                    <Badge variant={alert.enabled ? "default" : "secondary"}>
                      {alert.enabled ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Keywords: {alert.keywords.join(", ")}</p>
                    <p>Min match: {alert.minMatchPercent}% · {alert.frequency}</p>
                    {alert.location && <p>Location: {alert.location}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active alerts"
            description="Create an alert to monitor new opportunities."
            variant="alerts"
            action={<Button asChild><Link href="/alerts">Create alert</Link></Button>}
          />
        )}
      </section>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  action?: React.ReactNode;
}

function StatCard({ title, value, icon: Icon, description, action }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">{value}</CardTitle>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-3">{action}</div>}
      </CardContent>
    </Card>
  );
}