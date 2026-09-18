import type { Job } from "./types";

/**
 * Primary key for a job across every provider.
 */
export function jobPrimaryKey(job: Pick<Job, "source" | "externalId">): string {
  return `${job.source}:${job.externalId}`;
}

/**
 * Secondary fingerprint used when providers differ on externalId but the
 * same role was posted by the same company in the same location.
 */
export function jobFingerprint(job: Pick<Job, "company" | "title" | "location">): string {
  const company = job.company.name.trim().toLowerCase();
  const title = job.title.trim().toLowerCase();
  const location = (job.location ?? "").trim().toLowerCase();
  return [company, title, location].join("|");
}

/**
 * De-duplicates a list of jobs:
 *  1. strongest key: source + externalId
 *  2. fallback fingerprint: company + title + location
 * The first occurrence wins; later duplicates are dropped.
 */
export function deduplicateJobs(jobs: Job[]): Job[] {
  const seenPrimary = new Set<string>();
  const seenFingerprint = new Set<string>();

  return jobs.filter((job) => {
    const primary = jobPrimaryKey(job);
    if (seenPrimary.has(primary)) {
      return false;
    }
    seenPrimary.add(primary);

    const fingerprint = jobFingerprint(job);
    if (seenFingerprint.has(fingerprint)) {
      return false;
    }
    seenFingerprint.add(fingerprint);

    return true;
  });
}