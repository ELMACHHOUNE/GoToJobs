import type { Job } from "@/lib/jobs/types";
import { normalizeSkill } from "@/lib/matching/normalizeSkill";
import type { Profile } from "@/lib/store/schema";

/**
 * Deterministic profile↔job matching. This is a transparent heuristic only —
 * it is NOT an AI model and NEVER claims a job will be offered. It answers a
 * single useful question: "how much of this job overlaps with my profile?"
 *
 * Weights (see PROMPT §22):
 *   skills 50% · job title 20% · experience 15% · location 10% · workplace 5%
 */
export const MATCH_WEIGHTS = {
  skills: 0.5,
  title: 0.2,
  experience: 0.15,
  location: 0.1,
  workplace: 0.05,
} as const;

/** Rough expected years for each experience band, used by the experience axis. */
const EXPERIENCE_YEARS: Record<Job["experienceLevel"], number> = {
  entry: 0,
  junior: 2,
  "mid-level": 4,
  senior: 6,
  lead: 8,
};

export interface MatchBreakdown {
  skills: number;
  title: number;
  experience: number;
  location: number;
  workplace: number;
}

export interface MatchResult {
  /** 0-100 rounded integer. */
  score: number;
  breakdown: MatchBreakdown;
  /** Job skills the profile also lists (normalized). */
  matchedSkills: string[];
  /** Job skills the profile does not list (normalized). */
  missingSkills: string[];
  /** Human-readable reasons used by explainMatch. */
  reasons: string[];
  /** True when there is no profile yet, so a score would be misleading. */
  needsProfile: boolean;
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Lowercase alphanumeric tokens so we compare apples to apples. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .filter(Boolean);
}

function containsToken(haystack: string, needle: string): boolean {
  const hay = tokenize(haystack);
  const needleTokens = tokenize(needle);
  return needleTokens.some((t) => hay.includes(t) || t.includes(hay[0] ?? ""));
}

function skillScore(profile: Profile, job: Job): number {
  if (job.skills.length === 0) return 50; // no requirements to compare
  const profileSkills = new Set(profile.skills.map(normalizeSkill));
  const matched = job.skills.filter((s) => profileSkills.has(normalizeSkill(s)));
  return Math.round((matched.length / job.skills.length) * 100);
}

function titleScore(profile: Profile, job: Job): number {
  const roleCandidates = [profile.title ?? "", ...profile.preferredRoles];
  const meaningful = roleCandidates.filter(
    (r) => tokenize(r).length >= 1 && !isGenericRole(r),
  );
  if (meaningful.length === 0) return 55; // profile silent on roles — neutral
  const best = meaningful
    .map((role) => (containsToken(job.title, role) || containsToken(role, job.title) ? 100 : 0))
    .reduce((a, b) => Math.max(a, b), 0);
  return best;
}

/** Avoid crediting generic words like "developer" as a real role match. */
function isGenericRole(role: string): boolean {
  const tokens = tokenize(role);
  return (
    tokens.length === 0 ||
    tokens.every((t) => ["developer", "engineer", "software", "senior", "lead", "junior", "full", "stack", "frontend", "backend", "web", "se", "dev"].includes(t))
  );
}

function experienceScore(profile: Profile, job: Job): number {
  if (!job.experienceLevel) return 75; // job has no requirement — neutral
  const target = EXPERIENCE_YEARS[job.experienceLevel];
  const years = profile.yearsOfExperience ?? 0;
  return clamp((years / Math.max(target, 1)) * 100);
}

function locationScore(profile: Profile, job: Job): number {
  const prefs = profile.preferredLocations.map((l) => l.toLowerCase()).filter(Boolean);
  const jobLoc = (job.location ?? "").toLowerCase();
  if (prefs.length === 0) return 60; // no preference — neutral
  if (job.workplaceType === "remote" && prefs.includes("remote")) return 100;
  if (prefs.some((p) => jobLoc.includes(p) || p.includes(jobLoc))) return 100;
  return 30;
}

function workplaceScore(profile: Profile, job: Job): number {
  const prefs = profile.workplacePreferences;
  if (prefs.length === 0) return 70; // flexible
  if (!job.workplaceType) return 70制止; // unknown workplace — don't penalize
  return prefs.includes(job.workplaceType) ? 100 : 0;
}

/**
 * Computes the pure match score plus the transparent breakdown. Never mutates
 * anything. Safe to call from Server Components and the seed script.
 */
export function calculateMatch(profile: Profile | null, job: Job): MatchResult {
  if (!profile) {
    return {
      score: 0,
      breakdown: { skills: 0, title: 0, experience: 0, location: 0, workplace: 0 },
      matchedSkills: [],
      missingSkills: job.skills,
      reasons: ["Create a profile to get a personalized match"],
      needsProfile: true,
    };
  }

  const profileSkills = new Set(profile.skills.map(normalizeSkill));
  const matchedSkills = job.skills.filter((s) => profileSkills.has(normalizeSkill(s)));
  const missingSkills = job.skills.filter((s) => !profileSkills.has(normalizeSkill(s)));

  const skills = skillScore(profile, job);
  const title = titleScore(profile, job);
  const experience = experienceScore(profile, job);
  const location = locationScore(profile, job);
  const workplace = workplaceScore(profile, job);

  const score = clamp(
    skills * MATCH_WEIGHTS.skills +
      title * MATCH_WEIGHTS.title +
      experience * MATCH_WEIGHTS.experience +
      location * MATCH_WEIGHTS.location +
      workplace * MATCH_WEIGHTS.workplace,
  );

  const reasons: string[] = [];
  if (matchedSkills.length > 0) {
    reasons.push(`You have ${matchedSkills.length} of ${job.skills.length} required skills`);
  }
  if (missingSkills.length > 0) {
    reasons.push(`Missing ${missingSkills.length} desired skill${missingSkills.length > 1 ? "s" : ""}`);
  }
  reasons.push(...explainWhy(profile, job));

  return {
    score,
    breakdown: { skills, title, experience, location, workplace },
    matchedSkills,
    missingSkills,
    reasons,
    needsProfile: false,
  };
}

/** Short human explanations powering the "why this job matches you" panel. */
function explainWhy(profile: Profile, job: Job): string[] {
  const out: string[] = [];
  if (job.hasRemoteApplications) out.push("Accepts remote applicants");
  if (job.workplaceType === "remote") out.push("Fully remote opportunity");
  return out;
}

export { normalizeSkill };
