import { calculateMatch } from "@/lib/matching/calculateMatch";
import type { Profile } from "@/lib/store/schema";
import { normalizeSkill } from "@/lib/matching/normalizeSkill";
import { getMockJobs } from "@/lib/jobs/mock";
import { searchLinkedInJobs, getLinkedInJobById } from "@/lib/jobs/sources";
import { searchJobsFromDatabase, countJobsFromDatabase } from "@/lib/db/jobs";
import type {
  DatePostedFilter,
  EmploymentType,
  ExperienceLevel,
  Job,
  JobSearchParams,
  SortOption,
  WorkplaceType,
} from "@/lib/jobs/types";
import { MATCH_WEIGHTS } from "@/lib/matching/calculateMatch";

export type JobSourceType = "mock" | "linkedin";

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
  workplaceTypes?: WorkplaceType[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  skills?: string[];
  datePosted?: DatePostedFilter;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
  source?: JobSourceType;
  country?: string;
};

/** How fresh a job is (0–1), from publishedAt → now. */
function freshnessScore(job: Job): number {
  const now = Date.now();
  const published = new Date(job.publishedAt).getTime();
  const ageDays = Math.max(0, (now - published) / 86_400_000);
  return Math.max(0, 1 - ageDays / 30);
}

export function getQueryableJobs(): Job[] {
  return getMockJobs();
}

async function buildMongoQuery(params: JobSearchParams): Promise<any> {
  const query: any = { source: "linkedin" };
  
  if (params.q) {
    query.$text = { $search: params.q };
  }
  
  if (params.locations?.length) {
    query.location = { $in: params.locations.map((l) => new RegExp(l, "i")) };
  }
  
  if (params.workplaceTypes?.length) {
    query.workplaceType = { $in: params.workplaceTypes };
  }
  
  if (params.employmentTypes?.length) {
    query.employmentType = { $in: params.employmentTypes };
  }
  
  if (params.experienceLevels?.length) {
    query.experienceLevel = { $in: params.experienceLevels };
  }
  
  if (params.skills?.length) {
    query.skills = { $in: params.skills.map((s) => new RegExp(s, "i")) };
  }
  
  if (params.datePosted && params.datePosted !== "any") {
    const cutoffMs =
      params.datePosted === "24h"
        ? 86_400_000
        : params.datePosted === "3d"
          ? 3 * 86_400_000
          : params.datePosted === "week"
            ? 7 * 86_400_000
            : 30 * 86_400_000;
    const cutoffDate = new Date(Date.now() - cutoffMs);
    query.publishedAt = { $gte: cutoffDate };
  }

  return query;
}

function buildSort(params: JobSearchParams): any {
  const sort: any = {};
  if (params.sort === "newest") {
    sort.publishedAt = -1;
  } else if (params.sort === "salary") {
    sort["salary.min"] = -1;
  } else {
    sort.publishedAt = -1;
  }
  return sort;
}

async function searchJobsFromMongoDB(params: JobSearchParams, options: { page?: number; pageSize?: number } = {}): Promise<Job[]> {
  const { page = 1, pageSize = 20 } = options;
  const query = await buildMongoQuery(params);
  const sort = buildSort(params);
  return searchJobsFromDatabase(query, { page, pageSize, sort });
}

async function countJobsFromMongoDB(params: JobSearchParams): Promise<number> {
  const query = await buildMongoQuery(params);
  return countJobsFromDatabase(query);
}

function matchesValue(list: string[] | undefined, value: string): boolean {
  if (!list || list.length === 0) return true;
  return list.some((v) => v.toLowerCase() === value.toLowerCase());
}

/**
 * Full job search pipeline used by the explorer page and the API route:
 * fetch → filter → rank → sort → slice. Kept framework-agnostic so
 * it is testable without React.
 */
export async function searchJobs({
  profile,
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
  source = "mock",
  country = "morocco",
}: JobQueryInput = {}): Promise<JobQueryResult> {
  let sourceJobs: Job[];
  let total = 0;

  const searchParams = { q, locations, workplaceTypes, employmentTypes, experienceLevels, skills, datePosted, sort };

  if (source === "linkedin") {
    sourceJobs = await searchJobsFromMongoDB(searchParams, { page, pageSize });
    total = await countJobsFromMongoDB(searchParams);
  } else {
    sourceJobs = getQueryableJobs();
    total = sourceJobs.length;
  }

  const term = q.trim().toLowerCase();
  const termTokens = term.split(/\s+/).filter(Boolean);

  const filtered = sourceJobs.filter((job) => {
    if (locations?.length && !locations.some((l) => job.location?.toLowerCase().includes(l.toLowerCase()))) {
      return false;
    }
    if (
      workplaceTypes?.length &&
      (!job.workplaceType || !workplaceTypes.includes(job.workplaceType))
    ) {
      return false;
    }
    if (
      employmentTypes?.length &&
      !employmentTypes.some((e) => e === job.employmentType)
    ) {
      return false;
    }
    if (
      experienceLevels?.length &&
      !experienceLevels.some((e) => e === job.experienceLevel)
    ) {
      return false;
    }
    if (skills?.length) {
      const jobSkills = new Set(job.skills.map(normalizeSkill));
      const hasAll = skills.every((s) => jobSkills.has(normalizeSkill(s)));
      if (!hasAll) return false;
    }
    if (term) {
      const haystack = [
        job.title,
        job.company.name,
        job.location ?? "",
        job.skills.join(" "),
        job.description,
      ]
        .join(" ")
        .toLowerCase();
      const allMatch = termTokens.every((t) => haystack.includes(t));
      if (!allMatch) return false;
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
      const age = Date.now() - new Date(job.publishedAt).getTime();
      if (age > cutoffMs) return false;
    }
    return true;
  });

  const ranked = filtered.map((job) => {
    const match = calculateMatch(profile ?? null, job);
    const relevance = term
      ? scoreRelevance(job, termTokens)
      : match.score / 100;
    const score = 0.6 * (match.score / 100) + 0.25 * relevance + 0.15 * freshnessScore(job);
    return { job, match, relevance, score };
  });

  const sorted = [...ranked].sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.job.publishedAt).getTime() - new Date(a.job.publishedAt).getTime();
      case "match":
        return b.match.score - a.match.score;
      case "salary": {
        const ab = a.job.salary?.min ?? 0;
        const bb = b.job.salary?.min ?? 0;
        return bb - ab;
      }
      default:
        return b.score - a.score;
    }
  });

  const filteredTotal = sorted.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = sorted.slice(start, start + pageSize).map((r) => r.job);

  return { jobs: slice, total: filteredTotal, page: safePage, pageSize, totalPages };
}

/** Lightweight text relevance: how many query tokens land in title/skills/company. */
function scoreRelevance(job: Job, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const title = job.title.toLowerCase();
  const skills = job.skills.join(" ").toLowerCase();
  const company = job.company.name.toLowerCase();
  let hits = 0;
  for (const t of tokens) {
    if (title.includes(t) || skills.includes(t) || company.includes(t)) hits += 1;
  }
  return hits / tokens.length;
}

export async function getJobById(id: string, source: JobSourceType = "mock"): Promise<Job | undefined> {
  if (source === "linkedin") {
    const job = await getLinkedInJobById(id);
    return job ?? undefined;
  }
  return getMockJobs().find((j: Job) => j.id === id);
}

export async function getRelatedJobs(job: Job, limit = 4): Promise<Job[]> {
  if (!job.skills || job.skills.length === 0) return [];
  const jobs = getMockJobs().filter((j: Job) => j.id !== job.id);
  const want = new Set(job.skills.map(normalizeSkill));
  return jobs
    .map((candidate: Job) => {
      const have = candidate.skills.filter((s: string) => want.has(normalizeSkill(s))).length;
      return { candidate, have };
    })
    .filter((x) => x.have > 0)
    .sort((a: { candidate: Job; have: number }, b: { candidate: Job; have: number }) => b.have - a.have)
    .slice(0, limit)
    .map((x: { candidate: Job; have: number }) => x.candidate);
}