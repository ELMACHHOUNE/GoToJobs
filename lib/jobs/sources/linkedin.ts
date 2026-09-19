import "server-only";
import { Job, JobSearchParams, JobSource } from "../types";
import { normalizeJob } from "@/lib/jobs/normalize";
import { saveJobsToDatabase, getJobFromDatabase, getJobFromDatabaseById } from "@/lib/db/jobs";

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";

interface LinkedInJob {
  id: string;
  title: string;
  company: {
    name: string;
    universalName?: string;
    logoUrl?: string;
  };
  location: string;
  workplaceType?: string;
  employmentType?: string;
  experienceLevel?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  skills?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  postedAt: number;
  applyUrl: string;
  hasRemoteApplications?: boolean;
}

interface LinkedInJobResponse {
  elements: LinkedInJob[];
  paging: {
    count: number;
    start: number;
    total: number;
  };
}

function mapWorkplaceType(type?: string): "remote" | "hybrid" | "onsite" | undefined {
  if (!type) return undefined;
  const t = type.toLowerCase();
  if (t.includes("remote")) return "remote";
  if (t.includes("hybrid")) return "hybrid";
  return "onsite";
}

function mapEmploymentType(type?: string): "full-time" | "part-time" | "contract" | "internship" | "freelance" | undefined {
  if (!type) return undefined;
  const t = type.toLowerCase();
  if (t.includes("full")) return "full-time";
  if (t.includes("part")) return "part-time";
  if (t.includes("contract")) return "contract";
  if (t.includes("intern")) return "internship";
  if (t.includes("freelance")) return "freelance";
  return "full-time";
}

function mapExperienceLevel(level?: string): "entry" | "junior" | "mid-level" | "senior" | "lead" | undefined {
  if (!level) return undefined;
  const l = level.toLowerCase();
  if (l.includes("director") || l.includes("vp") || l.includes("head") || l.includes("lead")) return "lead";
  if (l.includes("senior") || l.includes("principal") || l.includes("staff")) return "senior";
  if (l.includes("mid") || l.includes("associate")) return "mid-level";
  if (l.includes("junior") || l.includes("entry") || l.includes("graduate")) return "junior";
  return "entry";
}

function extractSkillsFromDescription(description: string, title: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const skillPatterns = [
    "react", "next.js", "node.js", "typescript", "javascript", "python", "java", "go",
    "mongodb", "postgresql", "mysql", "redis", "docker", "kubernetes", "aws", "gcp", "azure",
    "git", "graphql", "rest", "express", "django", "fastapi", "vue", "angular", "svelte",
    "html", "css", "tailwind", "sass", "webpack", "vite", "jest", "cypress", "playwright",
    "ci/cd", "github actions", "gitlab", "terraform", "ansible", "linux", "bash",
    "php", "laravel", "wordpress", "swift", "ios", "swiftui", "xcode",
    "kotlin", "android", "flutter", "dart",
    "c#", ".net", "asp.net", "entity framework",
    "ruby", "rails", "elixir", "phoenix",
    "rust", "c++", "c", "zig",
    "machine learning", "ai", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "data science", "sql", "nosql", "elasticsearch", "kafka", "rabbitmq",
  ];
  return skillPatterns.filter((s) => text.includes(s));
}

function mapLinkedInJob(linkedinJob: LinkedInJob): Job {
  const skills = linkedinJob.skills?.length
    ? linkedinJob.skills
    : extractSkillsFromDescription(linkedinJob.description, linkedinJob.title);

  return normalizeJob({
    externalId: linkedinJob.id,
    source: "linkedin" as JobSource,
    title: linkedinJob.title || "Untitled Position",
    company: {
      name: linkedinJob.company?.name || "Unknown Company",
      logo: linkedinJob.company?.logoUrl,
      website: linkedinJob.company?.universalName
        ? `https://www.linkedin.com/company/${linkedinJob.company.universalName}`
        : undefined,
    },
    location: linkedinJob.location,
    workplaceType: mapWorkplaceType(linkedinJob.workplaceType),
    employmentType: mapEmploymentType(linkedinJob.employmentType),
    experienceLevel: mapExperienceLevel(linkedinJob.experienceLevel),
    description: linkedinJob.description,
    responsibilities: linkedinJob.responsibilities || [],
    requirements: linkedinJob.requirements || [],
    skills,
    salary: linkedinJob.salary
      ? {
          min: linkedinJob.salary.min,
          max: linkedinJob.salary.max,
          currency: linkedinJob.salary.currency || "USD",
        }
      : undefined,
    publishedAt: new Date(linkedinJob.postedAt).toISOString(),
    fetchedAt: new Date().toISOString(),
    url: linkedinJob.applyUrl,
    hasRemoteApplications: linkedinJob.hasRemoteApplications || false,
  });
}

export async function searchLinkedInJobsViaAPI(
  accessToken: string,
  params: JobSearchParams = {},
  options: { country?: string; page?: number; resultsPerPage?: number } = {}
): Promise<{ jobs: Job[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const { page = 1, resultsPerPage = 20 } = options;

  const searchParams = new URLSearchParams({
    start: String((page - 1) * resultsPerPage),
    count: String(resultsPerPage),
  });
  if (params.q) searchParams.set("keywords", params.q);
  if (params.locations?.length) searchParams.set("location", params.locations.join(", "));
  if (params.workplaceTypes?.includes("remote")) searchParams.set("workType", "REMOTE");
  if (params.employmentTypes?.length) searchParams.set("jobType", params.employmentTypes.join(","));
  if (params.experienceLevels?.length) searchParams.set("experienceLevel", params.experienceLevels.join(","));
  if (params.datePosted && params.datePosted !== "any") {
    const daysMap: Record<string, string> = { "24h": "DAY", "3d": "WEEK", "week": "WEEK", "month": "MONTH" };
    searchParams.set("datePosted", daysMap[params.datePosted] || "MONTH");
  }
  searchParams.set("sortBy", "RECENT");

  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/jobSearch?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as LinkedInJobResponse;
    const jobs = data.elements.map(mapLinkedInJob);

    await saveJobsToDatabase(jobs);

    return {
      jobs,
      total: data.paging.total,
      page,
      pageSize: resultsPerPage,
      totalPages: Math.ceil(data.paging.total / resultsPerPage),
    };
  } catch (error) {
    console.error("LinkedIn API search failed:", error);
    return { jobs: [], total: 0, page, pageSize: resultsPerPage, totalPages: 0 };
  }
}

export async function getLinkedInJobByIdViaAPI(accessToken: string, jobId: string): Promise<Job | null> {
  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!response.ok) return null;

    const job = (await response.json()) as LinkedInJob;
    const mappedJob = mapLinkedInJob(job);

    await saveJobsToDatabase([mappedJob]);

    return mappedJob;
  } catch {
    return null;
  }
}

export async function searchLinkedInJobs(
  params: JobSearchParams = {},
  options: { country?: string; page?: number; resultsPerPage?: number } = {}
): Promise<{ jobs: Job[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (accessToken) {
    return searchLinkedInJobsViaAPI(accessToken, params, options);
  }

  return searchLinkedInJobsViaScraping(params, options);
}

async function searchLinkedInJobsViaScraping(
  params: JobSearchParams = {},
  options: { country?: string; page?: number; resultsPerPage?: number } = {}
): Promise<{ jobs: Job[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const { country = "morocco", page = 1, resultsPerPage = 20 } = options;

  try {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const pageInstance = await browser.newPage();
    await pageInstance.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const searchUrl = buildLinkedInSearchUrl(params, country, page);
    await pageInstance.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

    await pageInstance.waitForSelector("[data-job-id], .job-search-card, .jobs-search-results__list-item", {
      timeout: 10000,
    }).catch(() => {});

    const jobs = await pageInstance.evaluate(() => {
      const jobCards = document.querySelectorAll("[data-job-id], .job-search-card, .jobs-search-results__list-item");
      const results: Array<{ id: string; title: string; company: string; location: string; url: string; postedAt: string }> = [];

      jobCards.forEach((card) => {
        try {
          const id = card.getAttribute("data-job-id") || card.getAttribute("data-entity-urn")?.split(":").pop() || "";
          const titleEl = card.querySelector("h3, .job-title, .base-search-card__title");
          const companyEl = card.querySelector("h4, .company-name, .base-search-card__subtitle");
          const locationEl = card.querySelector(".job-search-card__location, .job-location, .base-search-card__metadata");
          const linkEl = card.querySelector("a[href*='/jobs/view/'], a.base-card__full-link");
          const timeEl = card.querySelector("time, .job-search-card__listdate");

          const title = titleEl?.textContent?.trim() || "";
          const company = companyEl?.textContent?.trim() || "";
          const location = locationEl?.textContent?.trim() || "";
          const url = linkEl?.getAttribute("href") || "";
          const postedAt = timeEl?.getAttribute("datetime") || timeEl?.textContent?.trim() || "";

          if (title && company) {
            results.push({ id, title, company, location, url, postedAt });
          }
        } catch {
        }
      });

      return results;
    });

    await browser.close();

    const mappedJobs = jobs.map((job) => {
      const skills = extractSkillsFromDescription("", job.title);
      return normalizeJob({
        externalId: job.id || `scraped-${Date.now()}-${Math.random()}`,
        source: "linkedin" as JobSource,
        title: job.title,
        company: { name: job.company },
        location: job.location,
        workplaceType: inferWorkplaceType(job.title, job.location),
        employmentType: "full-time",
        experienceLevel: inferExperienceLevel(job.title),
        description: `${job.title} at ${job.company}. Location: ${job.location}`,
        responsibilities: [],
        requirements: [],
        skills,
        publishedAt: job.postedAt ? new Date(job.postedAt).toISOString() : new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        url: job.url.startsWith("http") ? job.url : `https://www.linkedin.com${job.url}`,
        hasRemoteApplications: job.location.toLowerCase().includes("remote"),
      });
    });

    await saveJobsToDatabase(mappedJobs);

    return {
      jobs: mappedJobs,
      total: mappedJobs.length,
      page,
      pageSize: resultsPerPage,
      totalPages: 1,
    };
  } catch (error) {
    console.error("LinkedIn scraping failed:", error);
    return { jobs: [], total: 0, page, pageSize: resultsPerPage, totalPages: 0 };
  }
}

function buildLinkedInSearchUrl(params: JobSearchParams, country: string, page: number): string {
  const baseUrl = "https://www.linkedin.com/jobs/search";
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("keywords", params.q);
  if (params.locations?.length) searchParams.set("location", params.locations.join(", "));
  if (params.workplaceTypes?.includes("remote")) searchParams.set("f_WT", "2");
  if (params.workplaceTypes?.includes("hybrid")) searchParams.set("f_WT", "3");
  if (params.workplaceTypes?.includes("onsite")) searchParams.set("f_WT", "1");
  if (params.employmentTypes?.length) {
    const typeMap: Record<string, string> = {
      "full-time": "F",
      "part-time": "P",
      contract: "C",
      internship: "I",
      freelance: "FL",
    };
    searchParams.set("f_JT", params.employmentTypes.map((t) => typeMap[t]).join(","));
  }
  if (params.experienceLevels?.length) {
    const levelMap: Record<string, string> = {
      entry: "1",
      junior: "2",
      "mid-level": "3",
      senior: "4",
      lead: "5",
    };
    searchParams.set("f_E", params.experienceLevels.map((l) => levelMap[l]).join(","));
  }
  if (params.datePosted && params.datePosted !== "any") {
    const dateMap: Record<string, string> = { "24h": "r86400", "3d": "r259200", "week": "r604800", "month": "r2592000" };
    searchParams.set("f_TPR", dateMap[params.datePosted] || "");
  }
  searchParams.set("start", String((page - 1) * 25));
  searchParams.set("origin", "JOB_SEARCH_PAGE_SEARCH_BUTTON");

  return `${baseUrl}?${searchParams.toString()}`;
}

function inferWorkplaceType(title: string, location: string): "remote" | "hybrid" | "onsite" | undefined {
  const text = `${title} ${location}`.toLowerCase();
  if (text.includes("remote") || text.includes("work from home") || text.includes("distributed")) return "remote";
  if (text.includes("hybrid")) return "hybrid";
  return "onsite";
}

function inferExperienceLevel(title: string): "entry" | "junior" | "mid-level" | "senior" | "lead" | undefined {
  const text = title.toLowerCase();
  if (text.includes("senior") || text.includes("lead") || text.includes("principal") || text.includes("staff")) return "senior";
  if (text.includes("junior") || text.includes("entry") || text.includes("graduate")) return "junior";
  if (text.includes("mid")) return "mid-level";
  if (text.includes("director") || text.includes("head") || text.includes("vp")) return "lead";
  return "mid-level";
}

export async function getLinkedInJobById(id: string): Promise<Job | null> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (accessToken) {
    return getLinkedInJobByIdViaAPI(accessToken, id);
  }

  const byId = await getJobFromDatabaseById(id);
  if (byId) return byId;

  return getJobFromDatabase(id);
}

export async function getUserLinkedInProfile(accessToken: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function getUserSavedJobs(accessToken: string): Promise<Job[]> {
  try {
    const response = await fetch(`${LINKEDIN_API_BASE}/jobSaved?count=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return (data.elements || []).map(mapLinkedInJob);
  } catch {
    return [];
  }
}