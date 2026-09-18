import Link from "next/link";
import { BriefcaseIcon, BookmarkIcon, ClipboardListIcon, BellIcon, ArrowRightIcon, SparklesIcon, ShieldIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryableJobs } from "@/lib/jobs/queries";
import { calculateMatch, defaultProfile } from "@/lib/matching/calculateMatch";

function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
          <SparklesIcon className="h-4 w-4" />
          <span>New: Personalized job matching</span>
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Find jobs that fit your <span className="text-primary">skills</span>.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Discover relevant opportunities, understand why they match your profile, and keep your applications organized.
        </p>
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <Button size="lg" asChild>
            <Link href="/jobs">Explore Jobs <ArrowRightIcon className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/profile">Create Profile</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Press <kbd className="px-2 py-0.5 rounded bg-muted">⌘K</kbd> to open command menu
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: UserIcon, title: "Create your profile", description: "Add your skills, experience, preferred roles, locations, and workplace preferences." },
    { icon: ZapIcon, title: "We match instantly", description: "Our transparent algorithm compares your profile against every job in real time." },
    { icon: ShieldIcon, title: "See why you match", description: "Every match shows a score breakdown: skills, role, experience, location, workplace." },
    { icon: BookmarkIcon, title: "Stay organized", description: "Save jobs, track applications, set alerts — all in one place." },
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
                <step.icon className="mb-2 h-10 w-10 text-primary" />
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

function MatchingExplanation() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Transparent matching, not AI magic</h2>
            <p className="mb-6 text-muted-foreground">
              We don&apos;t use black-box algorithms. Every match score is a simple, explainable formula:
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">50%</span> Skills overlap</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">20%</span> Role relevance</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">15%</span> Experience fit</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">10%</span> Location match</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">5%</span> Workplace preference</li>
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Scores are clamped 0–100. You always see matched skills, missing skills, and plain-English reasons.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-6">
            <h3 className="mb-4 font-semibold">Example match breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Your skills</span>
                <span className="font-medium">React, Next.js, TypeScript, Node.js, MongoDB, Docker</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Job requires</span>
                <span className="font-medium">React, Node.js, TypeScript, MongoDB, AWS, Docker</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-medium">
                  <span>5/6 skills match</span>
                  <span className="text-primary">83% Match</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-full w-[83%] rounded-full bg-primary transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function JobPreview() {
  const jobs = getQueryableJobs().slice(0, 3);
  const profile = defaultProfile();

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Top matches for demo profile</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            With a sample Full Stack Developer profile (React, Next.js, TypeScript, Node.js, MongoDB, Docker)
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {jobs.map((job) => {
            const match = calculateMatch(profile, job);
            return (
              <Card key={job.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{job.company.name}</p>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {match.score}% Match
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-3 flex flex-wrap gap-1">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                    <span>{job.workplaceType ? job.workplaceType.charAt(0).toUpperCase() + job.workplaceType.slice(1) : "Remote"} · {job.location}</span>
                    <span>{job.employmentType}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link href="/jobs">View all jobs <ArrowRightIcon className="ml-2 h-4 w-4" /></Link>
          </Button>
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
          Create your profile in minutes and start seeing personalized job matches instantly.
        </p>
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <Button size="lg" asChild>
            <Link href="/profile">Create your profile</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/jobs">Browse jobs first</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <HowItWorks />
      <MatchingExplanation />
      <JobPreview />
      <CTA />
    </div>
  );
}