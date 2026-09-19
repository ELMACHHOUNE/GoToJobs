import { describe, it, expect } from "vitest";
import { calculateMatch, MATCH_WEIGHTS } from "./calculateMatch";
import type { Profile } from "@/lib/store/schema";
import type { Job } from "@/lib/jobs/types";

const testProfile: Profile = {
  name: "Test User",
  title: "Full Stack Developer",
  bio: "",
  skills: ["react", "next.js", "node.js", "typescript", "mongodb", "docker", "git"],
  preferredRoles: ["Software Engineer", "Full Stack Developer", "Frontend Developer"],
  preferredLocations: ["Morocco", "Remote"],
  workplacePreferences: ["remote", "hybrid"],
  yearsOfExperience: 4,
  education: [],
  updatedAt: "",
};

const testJob: Job = {
  id: "test-1",
  externalId: "test-1",
  source: "linkedin",
  title: "Full Stack Developer",
  company: { name: "Test Corp", website: "https://test.com" },
  location: "Casablanca",
  workplaceType: "hybrid",
  employmentType: "full-time",
  experienceLevel: "mid-level",
  description: "Build features with React and Node.js",
  responsibilities: [],
  requirements: [],
  skills: ["react", "node.js", "typescript", "mongodb", "aws", "docker"],
  salary: { min: 20000, max: 30000, currency: "MAD" },
  publishedAt: new Date().toISOString(),
  fetchedAt: new Date().toISOString(),
  url: "https://test.com/jobs/1",
  hasRemoteApplications: false,
};

describe("calculateMatch", () => {
  it("returns needsProfile=true when profile is null", () => {
    const result = calculateMatch(null, testJob);
    expect(result.needsProfile).toBe(true);
    expect(result.score).toBe(0);
    expect(result.reasons).toContain("Create a profile to get a personalized match");
  });

  it("calculates a match score between 0 and 100", () => {
    const result = calculateMatch(testProfile, testJob);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.needsProfile).toBe(false);
  });

  it("identifies matched and missing skills correctly", () => {
    const result = calculateMatch(testProfile, testJob);
    expect(result.matchedSkills).toContain("react");
    expect(result.matchedSkills).toContain("node.js");
    expect(result.matchedSkills).toContain("typescript");
    expect(result.matchedSkills).toContain("mongodb");
    expect(result.matchedSkills).toContain("docker");
    expect(result.missingSkills).toContain("aws");
  });

  it("returns breakdown with all five components", () => {
    const result = calculateMatch(testProfile, testJob);
    expect(result.breakdown).toHaveProperty("skills");
    expect(result.breakdown).toHaveProperty("title");
    expect(result.breakdown).toHaveProperty("experience");
    expect(result.breakdown).toHaveProperty("location");
    expect(result.breakdown).toHaveProperty("workplace");
    expect(typeof result.breakdown.skills).toBe("number");
    expect(typeof result.breakdown.title).toBe("number");
    expect(typeof result.breakdown.experience).toBe("number");
    expect(typeof result.breakdown.location).toBe("number");
    expect(typeof result.breakdown.workplace).toBe("number");
  });

  it("provides human-readable reasons", () => {
    const result = calculateMatch(testProfile, testJob);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.some((r) => r.includes("skills"))).toBe(true);
  });

  it("handles job with no skills gracefully", () => {
    const jobNoSkills: Job = { ...testJob, skills: [] };
    const result = calculateMatch(testProfile, jobNoSkills);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("handles profile with no skills", () => {
    const emptyProfile: Profile = { ...testProfile, skills: [] };
    const result = calculateMatch(emptyProfile, testJob);
    expect(result.matchedSkills.length).toBe(0);
    expect(result.missingSkills.length).toBe(testJob.skills.length);
  });

  it("weights match components correctly", () => {
    const result = calculateMatch(testProfile, testJob);
    const expectedWeightSum = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(expectedWeightSum).toBe(1.0);
    // The final score should be a weighted combination
    const manualScore = Math.round(
      result.breakdown.skills * MATCH_WEIGHTS.skills +
      result.breakdown.title * MATCH_WEIGHTS.title +
      result.breakdown.experience * MATCH_WEIGHTS.experience +
      result.breakdown.location * MATCH_WEIGHTS.location +
      result.breakdown.workplace * MATCH_WEIGHTS.workplace
    );
    expect(result.score).toBe(manualScore);
  });
});