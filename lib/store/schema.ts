import { z } from "zod";

export const WORKPLACE_TYPES = ["remote", "hybrid", "onsite"] as const;
export type WorkplacePreference = (typeof WORKPLACE_TYPES)[number];

export const employmentTypeLabels: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
};

export const experienceLevelLabels: Record<string, string> = {
  entry: "Entry level",
  junior: "Junior",
  "mid-level": "Mid-level",
  senior: "Senior",
  lead: "Lead",
};

export const workplaceTypeLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const educationEntrySchema = z.object({
  id: z.string(),
  degree: z.string().default(""),
  fieldOfStudy: z.string().default(""),
  institution: z.string().default(""),
  startYear: z.number().int().min(1950).max(2100).optional(),
  endYear: z.number().int().min(1950).max(2100).optional(),
});

export type EducationEntry = z.infer<typeof educationEntrySchema>;

export const profileSchema = z.object({
  name: z.string().default(""),
  title: z.string().default(""),
  bio: z.string().max(2000).default(""),
  skills: z.array(z.string()).default([]),
  preferredRoles: z.array(z.string()).default([]),
  preferredLocations: z.array(z.string()).default([]),
  workplacePreferences: z.array(z.enum(WORKPLACE_TYPES)).default([]),
  yearsOfExperience: z.number().int().min(0).max(50).default(0),
  education: z.array(educationEntrySchema).default([]),
  updatedAt: z.string().default(""),
});

export type Profile = z.infer<typeof profileSchema>;

export const applicationStatuses = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const applicationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  status: z.enum(applicationStatuses).default("saved"),
  notes: z.string().max(2000).default(""),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JobApplication = z.infer<typeof applicationSchema>;

export const savedJobSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  savedAt: z.string(),
});

export type SavedJobEntry = z.infer<typeof savedJobSchema>;

export const jobAlertFrequencies = ["daily", "weekly"] as const;
export type JobAlertFrequency = (typeof jobAlertFrequencies)[number];

export const jobAlertSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  keywords: z.array(z.string()).default([]),
  location: z.string().default(""),
  minMatchPercent: z.number().int().min(0).max(100).default(75),
  frequency: z.enum(jobAlertFrequencies).default("daily"),
  enabled: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JobAlert = z.infer<typeof jobAlertSchema>;

export const appStateSchema = z.object({
  profile: profileSchema,
  savedJobs: z.array(savedJobSchema),
  applications: z.array(applicationSchema),
  alerts: z.array(jobAlertSchema),
});

export type AppState = z.infer<typeof appStateSchema>;

/**
 * A starter profile that makes personalized matching meaningful on first visit
 * without any setup. Users can change or clear it in /profile.
 */
export function defaultProfile(): Profile {
  return {
    name: "",
    title: "Full Stack Developer",
    bio: "",
    skills: [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "MongoDB",
      "Docker",
      "Git",
    ],
    preferredRoles: [
      "Software Engineer",
      "Full Stack Developer",
      "Frontend Developer",
    ],
    preferredLocations: ["Morocco", "Remote"],
    workplacePreferences: ["remote", "hybrid"],
    yearsOfExperience: 4,
    education: [],
    updatedAt: "",
  };
}

export function defaultAppState(): AppState {
  return {
    profile: defaultProfile(),
    savedJobs: [],
    applications: [],
    alerts: [],
  };
}