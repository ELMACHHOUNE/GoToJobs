import { describe, it, expect } from "vitest";
import { executeJobQuery } from "@/lib/jobs/queries";
import type { JobQueryInput } from "@/lib/jobs/queries";
import type { Job } from "@/lib/jobs/types";
import type { Profile } from "@/lib/store/schema";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

const profile: Profile = {
  name: "Test User",
  title: "Full Stack Developer",
  bio: "",
  skills: ["react", "node.js", "typescript"],
  preferredRoles: ["Full Stack Developer", "Software Engineer"],
  preferredLocations: ["Remote"],
  workplacePreferences: ["remote", "hybrid"],
  yearsOfExperience: 4,
  education: [],
  updatedAt: "",
};

const jobs: Job[] = [
  {
    id: "job-frontend",
    externalId: "ext-frontend",
    source: "linkedin",
    title: "Frontend Developer",
    company: { name: "Acme" },
    location: "Casablanca",
    workplaceType: "remote",
    employmentType: "full-time",
    experienceLevel: "mid-level",
    description: "Build interactive UIs with React",
    skills: ["react", "typescript"],
    salary: { min: 30000, max: 50000, currency: "MAD" },
    publishedAt: daysAgo(0.5),
    fetchedAt: daysAgo(0.5),
    url: "https://example.com/jobs/frontend",
  },
  {
    id: "job-backend",
    externalId: "ext-backend",
    source: "linkedin",
    title: "Backend Engineer",
    company: { name: "Beta" },
    location: "Rabat",
    workplaceType: "onsite",
    employmentType: "contract",
    experienceLevel: "senior",
    description: "Design Node.js APIs and MongoDB schemas",
    skills: ["node.js", "mongodb", "aws"],
    salary: { min: 60000, max: 80000, currency: "MAD" },
    publishedAt: daysAgo(5),
    fetchedAt: daysAgo(5),
    url: "https://example.com/jobs/backend",
  },
  {
    id: "job-fullstack",
    externalId: "ext-fullstack",
    source: "linkedin",
    title: "Full Stack Developer",
    company: { name: "Gamma" },
    location: "Remote",
    workplaceType: "hybrid",
    employmentType: "full-time",
    experienceLevel: "entry",
    description: "Ship features across the stack with React and Node.js",
    skills: ["react", "node.js"],
    salary: { min: 45000, max: 65000, currency: "MAD" },
    publishedAt: daysAgo(2),
    fetchedAt: daysAgo(2),
    url: "https://example.com/jobs/fullstack",
  },
  {
    id: "job-legacy",
    externalId: "ext-legacy",
    source: "linkedin",
    title: "Legacy Systems Engineer",
    company: { name: "Delta" },
    location: "Remote",
    workplaceType: "onsite",
    employmentType: "full-time",
    experienceLevel: "lead",
    description: "Maintain COBOL mainframes",
    skills: ["cobol"],
    salary: { min: 20000, max: 30000, currency: "MAD" },
    publishedAt: daysAgo(60),
    fetchedAt: daysAgo(60),
    url: "https://example.com/jobs/legacy",
  },
];

describe("executeJobQuery", () => {
  it("returns paginated results with metadata", () => {
    const input: JobQueryInput = { profile, page: 1, pageSize: 2 };
    const result = executeJobQuery(jobs, input);
    expect(result).toHaveProperty("jobs");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("pageSize");
    expect(result).toHaveProperty("totalPages");
    expect(result.jobs.length).toBeLessThanOrEqual(2);
    expect(result.total).toBe(jobs.length);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(2);
  });

  it("returns all jobs when no filters are applied", () => {
    const result = executeJobQuery(jobs, { profile });
    expect(result.jobs).toHaveLength(jobs.length);
    const ids = new Set(result.jobs.map((j) => j.id));
    expect(ids.size).toBe(jobs.length);
  });

  it("filters by query string", () => {
    const result = executeJobQuery(jobs, { profile, q: "react", pageSize: 10 });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) =>
      j.title.toLowerCase().includes("react") ||
      j.company.name.toLowerCase().includes("react") ||
      j.skills.some((s) => s.toLowerCase().includes("react")) ||
      j.description.toLowerCase().includes("react")
    )).toBe(true);
  });

  it("filters by location", () => {
    const result = executeJobQuery(jobs, { profile, locations: ["Casablanca"], pageSize: 10 });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) => j.location?.toLowerCase().includes("casablanca"))).toBe(true);
  });

  it("filters by workplace type", () => {
    const result = executeJobQuery(jobs, { profile, workplaceTypes: ["remote"], pageSize: 10 });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) => j.workplaceType === "remote")).toBe(true);
  });

  it("filters by employment type", () => {
    const result = executeJobQuery(jobs, { profile, employmentTypes: ["full-time"], pageSize: 10 });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) => j.employmentType === "full-time")).toBe(true);
  });

  it("filters by experience level", () => {
    const result = executeJobQuery(jobs, { profile, experienceLevels: ["mid-level"], pageSize: 10 });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) => j.experienceLevel === "mid-level")).toBe(true);
  });

  it("filters by skills (all must match)", () => {
    const result = executeJobQuery(jobs, { profile, skills: ["react", "typescript"], pageSize: 10 });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) =>
      j.skills.some((s) => s.toLowerCase() === "react") &&
      j.skills.some((s) => s.toLowerCase() === "typescript")
    )).toBe(true);
  });

  it("filters by date posted", () => {
    const result = executeJobQuery(jobs, { profile, datePosted: "24h", pageSize: 10 });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) => Date.now() - new Date(j.publishedAt).getTime() <= 86_400_000)).toBe(true);
    expect(result.jobs.some((j) => j.id === "job-legacy")).toBe(false);
  });

  it("sorts by newest", () => {
    const result = executeJobQuery(jobs, { profile, sort: "newest", pageSize: 10 });
    for (let i = 1; i < result.jobs.length; i++) {
      expect(new Date(result.jobs[i - 1].publishedAt).getTime())
        .toBeGreaterThanOrEqual(new Date(result.jobs[i].publishedAt).getTime());
    }
  });

  it("sorts by salary", () => {
    const result = executeJobQuery(jobs, { profile, sort: "salary", pageSize: 10 });
    for (let i = 1; i < result.jobs.length; i++) {
      expect(result.jobs[i - 1].salary?.min ?? 0)
        .toBeGreaterThanOrEqual(result.jobs[i].salary?.min ?? 0);
    }
  });

  it("handles pagination correctly", () => {
    const page1 = executeJobQuery(jobs, { profile, page: 1, pageSize: 3 });
    const page2 = executeJobQuery(jobs, { profile, page: 2, pageSize: 3 });
    expect(page1.jobs.length).toBeLessThanOrEqual(3);
    expect(page2.jobs.length).toBeLessThanOrEqual(3);
    expect(page1.page).toBe(1);
    expect(page2.page).toBe(2);
    const ids = new Set([...page1.jobs, ...page2.jobs].map((j) => j.id));
    expect(ids.size).toBe(page1.jobs.length + page2.jobs.length);
  });

  it("clamps page beyond totalPages to the last page", () => {
    const result = executeJobQuery(jobs, { profile, page: 99, pageSize: 3 });
    expect(result.page).toBe(result.totalPages);
  });

  it("returns totalPages based on total and pageSize", () => {
    const result = executeJobQuery(jobs, { profile, pageSize: 3 });
    expect(result.totalPages).toBe(Math.ceil(result.total / 3));
  });

  it("defaults pageSize to 12", () => {
    const result = executeJobQuery(jobs, { profile });
    expect(result.pageSize).toBe(12);
  });

  it("works without a profile", () => {
    const result = executeJobQuery(jobs, { profile: null, q: "developer", pageSize: 5 });
    expect(result.jobs.length).toBeLessThanOrEqual(5);
    expect(result.jobs.length).toBeGreaterThan(0);
  });
});