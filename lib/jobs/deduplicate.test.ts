import { describe, it, expect } from "vitest";
import { jobPrimaryKey, jobFingerprint, deduplicateJobs } from "@/lib/jobs/deduplicate";
import type { Job } from "@/lib/jobs/types";

const baseJob: Job = {
  id: "test-1",
  externalId: "ext-123",
  source: "linkedin",
  title: "Software Engineer",
  company: { name: "Acme Corp" },
  location: "Casablanca",
  workplaceType: "remote",
  employmentType: "full-time",
  experienceLevel: "mid-level",
  description: "Test job",
  skills: ["react", "node.js"],
  publishedAt: new Date().toISOString(),
  fetchedAt: new Date().toISOString(),
  url: "https://example.com/job/1",
};

describe("jobPrimaryKey", () => {
  it("creates unique key from source and externalId", () => {
    expect(jobPrimaryKey({ source: "linkedin", externalId: "123" })).toBe("linkedin:123");
    expect(jobPrimaryKey({ source: "greenhouse", externalId: "abc" })).toBe("greenhouse:abc");
  });
});

describe("jobFingerprint", () => {
  it("creates fingerprint from company, title, location", () => {
    const fp = jobFingerprint({
      company: { name: "Acme Corp" },
      title: "Software Engineer",
      location: "Casablanca",
    });
    expect(fp).toBe("acme corp|software engineer|casablanca");
  });

  it("handles missing location", () => {
    const fp = jobFingerprint({
      company: { name: "Acme Corp" },
      title: "Software Engineer",
      location: undefined,
    });
    expect(fp).toBe("acme corp|software engineer|");
  });

  it("normalizes case and whitespace", () => {
    const fp1 = jobFingerprint({
      company: { name: "  ACME CORP  " },
      title: "  Software Engineer  ",
      location: "  CASABLANCA  ",
    });
    const fp2 = jobFingerprint({
      company: { name: "Acme Corp" },
      title: "Software Engineer",
      location: "Casablanca",
    });
    expect(fp1).toBe(fp2);
  });
});

describe("deduplicateJobs", () => {
  it("removes duplicates by primary key (source + externalId)", () => {
    const job1 = { ...baseJob, id: "1" };
    const job2 = { ...baseJob, id: "2" }; // same externalId
    const result = deduplicateJobs([job1, job2]);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1"); // first wins
  });

  it("removes duplicates by fingerprint when primary key differs", () => {
    const job1 = { ...baseJob, id: "1", externalId: "ext-1" };
    const job2 = { ...baseJob, id: "2", externalId: "ext-2" }; // different externalId, same company/title/location
    const result = deduplicateJobs([job1, job2]);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1");
  });

  it("keeps distinct jobs", () => {
    const job1 = { ...baseJob, id: "1", externalId: "ext-1", title: "Engineer" };
    const job2 = { ...baseJob, id: "2", externalId: "ext-2", title: "Developer" };
    const job3 = { ...baseJob, id: "3", externalId: "ext-3", company: { name: "Other Corp" } };
    const result = deduplicateJobs([job1, job2, job3]);
    expect(result.length).toBe(3);
  });

it("preserves order of first occurrence", () => {
    const jobA = { ...baseJob, id: "A", externalId: "ext-A", title: "Engineer A" };
    const jobB = { ...baseJob, id: "B", externalId: "ext-B", title: "Engineer B" };
    const jobC = { ...baseJob, id: "C", externalId: "ext-A", title: "Engineer A" }; // duplicate of A
    const result = deduplicateJobs([jobA, jobB, jobC]);
    expect(result.map((j) => j.id)).toEqual(["A", "B"]);
  });

  it("handles empty array", () => {
    expect(deduplicateJobs([])).toEqual([]);
  });
});