import { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetails } from "@/components/job-details";
import { getJobById, getRelatedJobs } from "@/lib/jobs/queries";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
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
  const job = await getJobById(id);

  if (!job) notFound();

  const related = await getRelatedJobs(job, 4);

  return <JobDetails job={job} related={related} />;
}