import { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetails } from "@/components/job-details";
import { getJobById, getRelatedJobs } from "@/lib/jobs/queries";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { defaultProfile } from "@/lib/store/schema";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = getJobById(id);
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

export default async function JobDetailsPage({ params }: Props) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) notFound();

  const profile = defaultProfile();
  const match = calculateMatch(profile, job);
  const related = getRelatedJobs(job, 4).map((j) => {
    const m = calculateMatch(profile, j);
    return { job: j, match: m };
  });

  return <JobDetails job={job} match={match} related={related} />;
}