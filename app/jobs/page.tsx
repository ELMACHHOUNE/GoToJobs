import { Metadata } from "next";
import { JobsExplorerClient } from "@/components/jobs-explorer-client";
import { searchJobs } from "@/lib/jobs/queries";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Search and discover jobs that match your skills and preferences.",
};

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    locations?: string[];
    workplaceTypes?: string[];
    employmentTypes?: string[];
    experienceLevels?: string[];
    skills?: string[];
    datePosted?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const q = params.q || undefined;
  const locations = params.locations ? (Array.isArray(params.locations) ? params.locations : [params.locations]) : undefined;
  const workplaceTypes = params.workplaceTypes ? (Array.isArray(params.workplaceTypes) ? params.workplaceTypes : [params.workplaceTypes]) : undefined;
  const employmentTypes = params.employmentTypes ? (Array.isArray(params.employmentTypes) ? params.employmentTypes : [params.employmentTypes]) : undefined;
  const experienceLevels = params.experienceLevels ? (Array.isArray(params.experienceLevels) ? params.experienceLevels : [params.experienceLevels]) : undefined;
  const skills = params.skills ? (Array.isArray(params.skills) ? params.skills : [params.skills]) : undefined;
  const datePosted = params.datePosted || "any";
  const sort = params.sort || "relevance";
  const page = parseInt(params.page || "1", 10);

  const result = await searchJobs({
    q,
    locations,
    workplaceTypes: workplaceTypes as any,
    employmentTypes: employmentTypes as any,
    experienceLevels: experienceLevels as any,
    skills,
    datePosted: datePosted as any,
    sort: sort as any,
    page,
    pageSize: 12,
  });

  return <JobsExplorerClient initialData={result} />;
}