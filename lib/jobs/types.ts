export type JobSource =
  | "linkedin"
  | "greenhouse"
  | "lever"
  | "remotive"
  | "company";

export type WorkplaceType = "remote" | "hybrid" | "onsite";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance";

export type ExperienceLevel =
  | "entry"
  | "junior"
  | "mid-level"
  | "senior"
  | "lead";

export type Company = {
  name: string;
  logo?: string;
  website?: string;
};

export type SalaryRange = {
  min?: number;
  max?: number;
  currency?: string;
};

export type Job = {
  id: string;
  externalId: string;
  source: JobSource;
  title: string;
  company: Company;
  location?: string;
  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  skills: string[];
  salary?: SalaryRange;
  publishedAt: string;
  fetchedAt: string;
  url: string;
  hasRemoteApplications?: boolean;
};

export type RawJob = Omit<Job, "id">;

export type SortOption = "relevance" | "newest" | "match" | "salary";

export type DatePostedFilter =
  | "any"
  | "24h"
  | "3d"
  | "week"
  | "month";

export type MatchResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
  needsProfile: boolean;
  breakdown?: {
    skills: number;
    title: number;
    experience: number;
    location: number;
    workplace: number;
  };
};

export type JobSearchParams = {
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
};