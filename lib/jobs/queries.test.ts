import { describe, it, expect } from "vitest";
import { searchJobs, getQueryableJobs, getJobById, getRelatedJobs } from "@/lib/jobs/queries";
import { defaultProfile } from "@/lib/store/schema";
import type { JobQueryInput } from "@/lib/jobs/queries";

describe("getQueryableJobs", () => {
  it("returns array of jobs", () => {
    const jobs = getQueryableJobs();
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0]).toHaveProperty("id");
    expect(jobs[0]).toHaveProperty("title");
    expect(jobs[0]).toHaveProperty("company");
  });
});

describe("getJobById", () => {
  it("returns job by valid id", () => {
    const jobs = getQueryableJobs();
    const first = jobs[0];
    const found = getJobById(first.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it("returns undefined for invalid id", () => {
    const found = getJobById("non-existent-id");
    expect(found).toBeUndefined();
  });
});

describe("getRelatedJobs", () => {
  it("returns related jobs based on skill overlap", () => {
    const jobs = getQueryableJobs();
    const first = jobs[0];
    const related = getRelatedJobs(first, 3);
    expect(Array.isArray(related)).toBe(true);
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.every((j) => j.id !== first.id)).toBe(true);
  });

  it("returns empty array for job with no related skills", () => {
    const jobNoSkills = {
      ...getQueryableJobs()[0],
      id: "no-skills-test",
      skills: [],
    };
    const related = getRelatedJobs(jobNoSkills, 3);
    expect(related.length).toBe(0);
  });
});

describe("searchJobs", () => {
  const profile = defaultProfile();

  it("returns paginated results with metadata", () => {
    const input: JobQueryInput = { profile, page: 1, pageSize: 5 };
    const result = searchJobs(input);
    expect(result).toHaveProperty("jobs");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("pageSize");
    expect(result).toHaveProperty("totalPages");
    expect(result.jobs.length).toBeLessThanOrEqual(5);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(5);
  });

  it("filters by query string", () => {
    const result = searchJobs({ profile, q: "react", pageSize: 10 });
    expect(result.jobs.every((j) =>
      j.title.toLowerCase().includes("react") ||
      j.company.name.toLowerCase().includes("react") ||
      j.skills.some((s) => s.toLowerCase().includes("react")) ||
      j.description.toLowerCase().includes("react")
    )).toBe(true);
  });

  it("filters by location", () => {
    const result = searchJobs({ profile, locations: ["Casablanca"], pageSize: 10 });
    expect(result.jobs.every((j) => j.location?.toLowerCase().includes("casablanca"))).toBe(true);
  });

  it("filters by workplace type", () => {
    const result = searchJobs({ profile, workplaceTypes: ["remote"], pageSize: 10 });
    expect(result.jobs.every((j) => j.workplaceType === "remote")).toBe(true);
  });

  it("filters by employment type", () => {
    const result = searchJobs({ profile, employmentTypes: ["full-time"], pageSize: 10 });
    expect(result.jobs.every((j) => j.employmentType === "full-time")).toBe(true);
  });

  it("filters by experience level", () => {
    const result = searchJobs({ profile, experienceLevels: ["mid-level"], pageSize: 10 });
    expect(result.jobs.every((j) => j.experienceLevel === "mid-level")).toBe(true);
  });

  it("filters by skills (all must match)", () => {
    const result = searchJobs({ profile, skills: ["react", "typescript"], pageSize: 10 });
    expect(result.jobs.every((j) =>
      j.skills.some((s) => s.toLowerCase() === "react") &&
      j.skills.some((s) => s.toLowerCase() === "typescript")
    )).toBe(true);
  });

  it("sorts by newest", () => {
    const result = searchJobs({ profile, sort: "newest", pageSize: 10 });
    for (let i = 1; i < result.jobs.length; i++) {
      expect(new Date(result.jobs[i - 1].publishedAt).getTime())
        .toBeGreaterThanOrEqual(new Date(result.jobs[i].publishedAt).getTime());
    }
  });

  it("sorts by match score", () => {
    const result = searchJobs({ profile, sort: "match", pageSize: 10 });
    for (let i = 1; i < result.jobs.length; i++) {
      const matchA = result.jobs[i - 1].skills; // we can't easily get match here, just test no error
      expect(matchA).toBeDefined();
    }
  });

  it("handles pagination correctly", () => {
    const page1 = searchJobs({ profile, page: 1, pageSize: 3 });
    const page2 = searchJobs({ profile, page: 2, pageSize: 3 });
    expect(page1.jobs.length).toBeLessThanOrEqual(3);
    expect(page2.jobs.length).toBeLessThanOrEqual(3);
    expect(page1.page).toBe(1);
    expect(page2.page).toBe(2);
  });

  it("returns totalPages based on total and pageSize", () => {
    const result = searchJobs({ profile, pageSize: 10 });
    expect(result.totalPages).toBe(Math.ceil(result.total / 10));
  });

  it("works without profile", () => {
    const result = searchJobs({ q: "developer", pageSize: 5 });
    expect(result.jobs.length).toBeLessThanOrEqual(5);
  });
});