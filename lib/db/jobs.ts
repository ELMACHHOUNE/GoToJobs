import "server-only";
import { JobModel } from "@/lib/models";
import type { Job } from "@/lib/jobs/types";

type JobQueryFilter = Record<string, unknown>;
type JobQuerySort = Record<string, 1 | -1>;

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

export async function getJobFromDatabaseById(id: string): Promise<Job | null> {
  try {
    const dbJob = await JobModel.findById(id).lean();
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

export async function getJobsFromDatabaseByIds(ids: string[]): Promise<Job[]> {
  if (ids.length === 0) return [];
  try {
    const jobs = await JobModel.find({ _id: { $in: ids } }).lean();
    return jobs.map((job) => ({
      ...job,
      id: job._id.toString(),
      publishedAt: job.publishedAt.toISOString(),
      fetchedAt: job.fetchedAt.toISOString(),
    })) as Job[];
  } catch (error) {
    console.error("Failed to get jobs from database:", error);
    return [];
  }
}

export async function searchJobsFromDatabase(
  query: JobQueryFilter,
  options: { page?: number; pageSize?: number; sort?: JobQuerySort } = {}
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

export async function countJobsFromDatabase(query: JobQueryFilter): Promise<number> {
  try {
    return await JobModel.countDocuments(query);
  } catch (error) {
    console.error("Failed to count jobs from database:", error);
    return 0;
  }
}