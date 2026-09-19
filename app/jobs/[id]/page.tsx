import { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetails } from "@/components/job-details";
import { getJobById, getRelatedJobs } from "@/lib/jobs/queries";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { defaultProfile } from "@/lib/store/schema";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { source = "mock" } = await searchParams;
  const job = await getJobById(id, source as "mock" | "adzuna");
  if (!job) return { title: "Job not found" };
  return {
    title: `${job.title} at ${job.company.name}`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: `${job.title} at ${job.company.name}`,
      description: job.description.slice(0, 160),
      type: "website",
    },
  };
}

export default async function JobDetailsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { source = "mock" } = await searchParams;
  const job = await getJobById(id, source as "mock" | "adzuna");

  if (!job) notFound();

  const profile = defaultProfile();
  const match = calculateMatch(profile, job);
  const related = await getRelatedJobs(job, 4);
  const relatedWithMatch = related.map((j) => ({
    job: j,
    match: calculateMatch(profile, j),
  }));

  return <JobDetails job={job} match={match} related={relatedWithMatch} />;
}