import "server-only";
import { JobModel } from "@/lib/models";
import type { Job } from "@/lib/jobs/types";

export async function saveJobsToDatabase(jobs: Job[]): Promise<void> {
  try {
    for (const job of jobs) {
      await JobModel.findOneAndUpdate(
        { source: job.source, externalId: job.externalId },
        { ...job, fetchedAt: new Date() },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("Failed to save jobs to database:", error);
  }
}

export async function getJobFromDatabase(externalId: string): Promise<Job | null> {
  try {
    const dbJob = await JobModel.findOne({ source: "linkedin", externalId }).lean();
    if (dbJob) {
      return {
        ...dbJob,
        id: dbJob._id.toString(),
        publishedAt: dbJob.publishedAt.toISOString(),
        fetchedAt: dbJob.fetchedAt.toISOString(),
      } as Job;
    }
  } catch {
  }
  return null;
}

export async function searchJobsFromDatabase(
  query: any,
  options: { page?: number; pageSize?: number; sort?: any } = {}
): Promise<Job[]> {
  const { page = 1, pageSize = 20, sort = { publishedAt: -1 } } = options;
  
  try {
    const jobs = await JobModel.find(query)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return jobs.map((job) => ({
      ...job,
      id: job._id.toString(),
      publishedAt: job.publishedAt.toISOString(),
      fetchedAt: job.fetchedAt.toISOString(),
    })) as Job[];
  } catch (error) {
    console.error("Failed to search jobs from database:", error);
    return [];
  }
}

export async function countJobsFromDatabase(query: any): Promise<number> {
  try {
    return await JobModel.countDocuments(query);
  } catch (error) {
    console.error("Failed to count jobs from database:", error);
    return 0;
  }
}