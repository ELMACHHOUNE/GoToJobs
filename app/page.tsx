import Link from "next/link";
import {
  BriefcaseIcon,
  BookmarkIcon,
  ClipboardListIcon,
  BellIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldIcon,
  ZapIcon,
  GlobeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CircleCheckIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchJobs } from "@/lib/jobs/queries";
import { MATCH_WEIGHTS } from "@/lib/matching/calculateMatch";

export const metadata = {
  title: "GoToJobs — Personalized job matching from live sources",
  description:
    "Match your skills against real jobs from LinkedIn with a transparent, explainable score. No black boxes, no fake data.",
};

function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <SparklesIcon className="h-4 w-4" />
          <span>Transparent, skill-based matching</span>
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Find jobs that fit your <span className="text-primary">skills</span>.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
          We compare your profile against real jobs synced from LinkedIn, explain exactly why
          each one matches (or doesn&apos;t), and keep your applications organized.
        </p>
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <Button size="lg" asChild>
            <Link href="/jobs">
              Explore live jobs
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/profile">Build your profile</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Press <kbd className="px-2 py-0.5 rounded bg-muted">⌘K</kbd> to open command menu
        </p>
      </div>
    </section>
  );
}

function JobsStrip({ jobs }: { jobs: Awaited<ReturnType<typeof searchJobs>>["jobs"] }) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Live from LinkedIn</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            These are real, freshly synced postings. Scores shown are for a job seeker with no
            profile yet — create your profile to get a personalized match.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-muted-foreground">{job.company.name}</p>
                  <h3 className="truncate font-semibold group-hover:text-primary">{job.title}</h3>
                </div>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{job.description}</p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {job.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{job.skills.length - 4} more</span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  {job.location ?? "Remote"}
                </span>
                {job.workplaceType && (
                  <span className="inline-flex items-center gap-1">
                    <GlobeIcon className="h-3.5 w-3.5" />
                    {job.workplaceType}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  {new Date(job.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheckIcon className="h-4 w-4 text-primary" />
                  Score breakdown always visible
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link href="/jobs">
              View all live jobs
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function MatchingExplanation() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Matching you can verify, not magic</h2>
            <p className="mb-6 text-muted-foreground">
              Scores are transparent and explainable — no hidden algorithm. Here is the exact
              breakdown used for every job:
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">{Math.round(MATCH_WEIGHTS.skills * 100)}%</span> Skills overlap</li>
              <li className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">{Math.round(MATCH_WEIGHTS.title * 100)}%</span> Role relevance</li>
              <li className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">{Math.round(MATCH_WEIGHTS.experience * 100)}%</span> Experience fit</li>
              <li className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">{Math.round(MATCH_WEIGHTS.location * 100)}%</span> Location match</li>
              <li className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">{Math.round(MATCH_WEIGHTS.workplace * 100)}%</span> Workplace preference</li>
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Scores are clamped 0–100. You always see matched skills, missing skills, and
              plain-English reasons for the score.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 font-semibold">What a score includes</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Every match shows the same five sections, so you can compare opportunities fairly:
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><CircleCheckIcon className="h-4 w-4 text-primary" /> Skills you already have</li>
              <li className="flex items-center gap-2"><ShieldIcon className="h-4 w-4 text-primary" /> Skills the role wants but you lack</li>
              <li className="flex items-center gap-2"><ZapIcon className="h-4 w-4 text-primary" /> Experience-level fit</li>
              <li className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-primary" /> Location &amp; remote match</li>
              <li className="flex items-center gap-2"><BriefcaseIcon className="h-4 w-4 text-primary" /> Workplace-type preference</li>
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              No profile yet? Every job is still listed with all its details — the match score
              simply waits until you create one.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: UserIcon,
      title: "Build your profile",
      description: "Add your skills, experience, preferred roles, locations, and workplace preferences.",
    },
    {
      icon: ZapIcon,
      title: "We match live jobs",
      description: "Your profile is compared against every opportunity we sync from LinkedIn.",
    },
    {
      icon: ShieldIcon,
      title: "See why you match",
      description: "Every score includes a breakdown: skills, role, experience, location, workplace.",
    },
    {
      icon: BookmarkIcon,
      title: "Stay organized",
      description: "Save jobs, track applications, set alerts — all in one place.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">Four steps to your next opportunity</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Card key={step.title} className="relative">
              <CardHeader>
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to find your match?</h2>
        <p className="mb-8 text-muted-foreground">
          Set up your profile in a few minutes and start seeing personalized matches against live jobs.
        </p>
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <Button size="lg" asChild>
            <Link href="/profile">Create your profile</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/jobs">Browse live jobs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default async function LandingPage() {
  const result = await searchJobs({ pageSize: 6 });

  return (
    <div className="flex flex-col">
      <Hero />
      <JobsStrip jobs={result.jobs} />
      <MatchingExplanation />
      <HowItWorks />
      <CTA />
    </div>
  );
}
