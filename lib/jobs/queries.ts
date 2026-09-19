import "server-only";

import type { Job } from "./types";
import { normalizeSkill } from "@/lib/matching/normalizeSkill";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import type { Profile } from "@/lib/store/schema";
import { searchJobsFromDatabase } from "@/lib/db/jobs";
import { getJobFromDatabaseById, getJobsFromDatabaseByIds } from "@/lib/db/jobs";

export type JobQueryResult = {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type JobQueryInput = {
  profile?: Profile | null;
  q?: string;
  locations?: string[];
  workplaceTypes?: string[];
  employmentTypes?: string[];
  experienceLevels?: string[];
  skills?: string[];
  datePosted?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

/** Freshness 0–1: how recently the job was published (decays over 30 days). */
function freshnessScore(job: Job): number {
  const ageDays =
    Math.max(0, Date.now() - new Date(job.publishedAt).getTime()) / 86_400_000;
  return Math.max(0, 1 - ageDays / 30);
}

/** Text relevance 0–1: how many query tokens land in title/skills/company. */
function relevanceScore(job: Job, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const haystack = [
    job.title,
    job.company.name,
    job.location ?? "",
    job.skills.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  let hits = 0;
  for (const t of tokens) if (haystack.includes(t)) hits += 1;
  return hits / tokens.length;
}

function matchesAny(filter: string[] | undefined, value: string | undefined): boolean {
  if (!filter || filter.length === 0) return true;
  if (!value) return false;
  return filter.some((f) => f.toLowerCase() === value.toLowerCase());
}

function hasAllSkills(skills: string[] | undefined, jobSkills: string[]): boolean {
  if (!skills || skills.length === 0) return true;
  const want = new Set(skills.map(normalizeSkill));
  const have = new Set(jobSkills.map(normalizeSkill));
  return [...want].every((s) => have.has(s));
}

/**
 * Pure, synchronous job query pipeline: filter → rank → sort → paginate.
 * Framework-agnostic — takes a plain in-memory job array, so it can be tested
 * directly and reused by the DB-backed search below without React or MongoDB.
 */
export function executeJobQuery(
  sourceJobs: Job[],
  input: {
    profile?: Profile | null;
    q?: string;
    locations?: string[];
    workplaceTypes?: string[];
    employmentTypes?: string[];
    experienceLevels?: string[];
    skills?: string[];
    datePosted?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  } = {}
): JobQueryResult {
  const {
    profile = null,
    q = "",
    locations,
    workplaceTypes,
    employmentTypes,
    experienceLevels,
    skills,
    datePosted = "any",
    sort = "relevance",
    page = 1,
    pageSize = 12,
  } = input;

  const tokens = q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const filtered = sourceJobs.filter((job) => {
    if (locations?.length) {
      const loc = job.location ?? "";
      if (!locations.some((l) => loc.toLowerCase().includes(l.toLowerCase()))) return false;
    }
    if (!matchesAny(workplaceTypes, job.workplaceType)) return false;
    if (!matchesAny(employmentTypes, job.employmentType)) return false;
    if (!matchesAny(experienceLevels, job.experienceLevel)) return false;
    if (skills?.length && !hasAllSkills(skills, job.skills)) return false;
    if (tokens.length) {
      const haystack = [
        job.title,
        job.company.name,
        job.location ?? "",
        job.skills.join(" "),
        job.description,
      ]
        .join(" ")
        .toLowerCase();
      if (!tokens.every((t) => haystack.includes(t))) return false;
    }
    if (datePosted !== "any") {
      const cutoffMs =
        datePosted === "24h"
          ? 86_400_000
          : datePosted === "3d"
            ? 3 * 86_400_000
            : datePosted === "week"
              ? 7 * 86_400_000
              : 30 * 86_400_000;
      if (Date.now() - new Date(job.publishedAt).getTime() > cutoffMs) return false;
    }
    return true;
  });

  const ranked = filtered.map((job) => {
    const match = profile ? calculateMatch(profile, job) : null;
    const relevance = tokens.length ? relevanceScore(job, tokens) : 0;
    const rank =
      0.6 * ((match?.score ?? 0) / 100) +
      0.25 * relevance +
      0.15 * freshnessScore(job);
    return { job, match, rank };
  });

  const sorted = [...ranked].sort((a, b) => {
    switch (sort) {
      case "newest":
        return (
          new Date(b.job.publishedAt).getTime() - new Date(a.job.publishedAt).getTime()
        );
      case "salary":
        return (b.job.salary?.min ?? 0) - (a.job.salary?.min ?? 0);
      default:
        return b.rank - a.rank;
    }
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    jobs: sorted.slice(start, start + pageSize).map((r) => r.job),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

/** How many jobs we scan from the database before ranking in memory. */
const MAX_SCANNED_JOBS = 500;

/** Search jobs in MongoDB, then filter/rank/sort/paginate via executeJobQuery. */
export async function searchJobs(input: JobQueryInput = {}): Promise<JobQueryResult> {
  const { page = 1, pageSize = 12 } = input     = input;
  const recent = await searchJobsFromDatabase(
    { source: "linkedin" },
    { page: 1, pageSize: MAX_SCANNED_JOBS, sort: { publishedAt: -1 } }
  );
  return executeJobQuery(recent, { profile: input.profile, q: input.q, locations: input.locations, workplaceTypes: input.workplaceTypes, employmentTypes: input.employmentTypes, experienceLevels: input.experienceLevels, skills: input.skills, datePosted: input.datePosted, sort: input.sort, page, pageSize });
}

export async function getJobById(id: string): Promise<Job | undefined> {
  const job = await getJobFromDatabaseById(id);
  return job ?? undefined;
}

export async function getRelatedJobs(job: Job, limit = 4): Promise<Job[]> {
  if (!job.skills || job.skills.length === 0) return [];
  const want = new Set(job.skills.map(normalizeSkill));

  const recent = await searchJobsFromDatabase(
    { source: "linkedin" },
    { page: 1, pageSize: 200, sort: { publishedAt: -1 } }
  );

  return recent
    .filter((candidate: Job) => candidate.id !== job.id)
    .map((candidate: Job) => ({
      candidate,
      overlap: candidate.skills.filter((s) => want.has(normalizeSkill(s))).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((x) => x.candidate);
}

export async function getJobsByIds(ids: string[]): Promise<Job[]> {
  return getJobsFromDatabaseByIds(ids);
}
