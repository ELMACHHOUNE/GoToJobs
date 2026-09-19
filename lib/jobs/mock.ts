import type { Job } from "./types";

export function getMockJobs(): Job[] {
  return mockJobs;
}

function daysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * 86_400_000 - hours * 3_600_000).toISOString();
}

const RAW_JOBS: Array<Omit<Job, "id">> = [
  {
    externalId: "mock-001",
    source: "mock",
    title: "Full Stack Developer — React & Node.js",
    company: { name: "Yassir", website: "https://yassir.com" },
    location: "Casablanca",
    workplaceType: "hybrid",
    employmentType: "full-time",
    experienceLevel: "mid-level",
    description:
      "Build the delivery platform used by millions across North Africa. You'll own features end-to-end — from React UIs to the Node.js services behind them — with a product team that ships every week.",
    responsibilities: [
      "Design and ship product features in React/Next.js",
      "Build and maintain Node.js + MongoDB APIs",
      "Write tests and review code in a small senior team",
    ],
    requirements: [
      "3+ years full-stack development with JavaScript/TypeScript",
      "Strong React and Node.js fundamentals",
      "Comfort with MongoDB, SQL and Git",
    ],
    skills: ["react", "next.js", "node.js", "typescript", "mongodb", "docker", "git"],
    salary: { min: 18000, max: 26000, currency: "MAD" },
    publishedAt: daysAgo(1, 5),
    fetchedAt: new Date().toISOString(),
    url: "https://yassir.com/careers/full-stack",
    hasRemoteApplications: false,
  },
  {
    externalId: "mock-002",
    source: "mock",
    title: "Backend Engineer — Node.js",
    company: { name: "Anjori", website: "https://anjori.com" },
    location: "Remote (Morocco)",
    workplaceType: "remote",
    employmentType: "full-time",
    experienceLevel: "mid-level",
    description:
      "Design the services that keep logistics moving. 100% remote-friendly team based in Morocco, building a platform that connects hauliers with freight from Europe to West Africa.",
    responsibilities: [
      "Build distributed services with Node.js and PostgreSQL",
      "Model complex pricing and routing domains",
      "Own reliability, observability, and testing",
    ],
    requirements: [
      "3+ years with Node.js and TypeScript",
      "Solid PostgreSQL and API design experience",
      "Nice to have: Python, Kafka, or map/geo experience",
    ],
    skills: ["node.js", "typescript", "postgresql", "rest apis", "docker", "kafka"],
    salary: { min: 15000, max: 22000, currency: "MAD" },
    publishedAt: daysAgo(4, 5),
    fetchedAt: new Date().toISOString(),
    url: "https://anjori.com/careers/backend",
    hasRemoteApplications: false,
  },
  {
    externalId: "mock-003",
    source: "mock",
    title: "Frontend Engineer — React",
    company: { name: "Chari", website: "https://chari.ma" },
    location: "Casablanca",
    workplaceType: "onsite",
    employmentType: "full-time",
    experienceLevel: "junior",
    description:
      "Help our merchant dashboard reach thousands of shops across Morocco. A junior-friendly team where you'll grow fast writing real, customer-facing React day one.",
    responsibilities: [
      "Implement merchant-facing features in React",
      "Collaborate with design on our design system",
      "Ship, measure, and iterate with product",
    ],
    requirements: [
      "1+ year of React (or strong portfolio)",
      "Comfortable with HTML, CSS and JavaScript",
      "Curious and meticulous about UI details",
    ],
    skills: ["react", "typescript", "tailwind css", "css", "javascript"],
    salary: { min: 9000, max: 13000, currency: "MAD" },
    publishedAt: daysAgo(3, 12),
    fetchedAt: new Date().toISOString(),
    url: "https://chari.ma/careers/frontend",
    hasRemoteApplications: false,
  },
];

import { normalizeJob } from "./normalize";
import { deduplicateJobs } from "./deduplicate";

export const mockJobs = deduplicateJobs(RAW_JOBS.map(normalizeJob));