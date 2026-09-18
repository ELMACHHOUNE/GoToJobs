import { normalizeSkill } from "@/lib/matching/normalizeSkill";

import type { Job } from "./types";

/**
 * Normalizes a single job into the canonical internal `Job` shape.
 * Skills are normalized (ReactJS -> react), lowercased and deduplicated.
 * The `id` is derived deterministically from source + externalId so it
 * stays stable across fetches and providers.
 */
export function normalizeJob(raw: Omit<Job, "id">): Job {
  const skills = Array.from(
    new Set(raw.skills.map(normalizeSkill).filter(Boolean))
  );

  return {
    ...raw,
    skills,
    id: slugifyId(raw.source, raw.externalId),
    fetchedAt: raw.fetchedAt ?? new Date().toISOString(),
  };
}

export function slugifyId(source: Job["source"], externalId: string): string {
  const safe = externalId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${source}-${safe}`;
}