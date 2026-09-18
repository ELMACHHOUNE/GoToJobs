# GoToJobs — Full-Stack Job Discovery Platform

## 1. Project Overview

Build a modern job discovery web application called **GoToJobs** inside the existing Next.js project.

The goal is to create a fast, clean, professional platform that helps users discover jobs relevant to their professional profile.

The application should eventually aggregate jobs from multiple legitimate job sources and provide:

- Job search
- Job filtering
- Personalized job matching
- Job details
- Saved jobs
- User profile
- Job alerts
- Application tracking
- External application links

### Important constraints

- The existing Next.js project is already created.
- DO NOT recreate the Next.js project.
- DO NOT replace the existing package configuration unnecessarily.
- Use **Next.js App Router**.
- Use **TypeScript**.
- Use **Tailwind CSS**.
- Use **shadcn/ui** extensively.
- Use **Lucide React** icons.
- Do NOT use Python.
- Do NOT use an AI API.
- Do NOT use OpenAI, Gemini, Claude, Ollama, or other AI services.
- Do NOT implement LinkedIn login scraping.
- Do NOT ask for LinkedIn passwords, cookies, session tokens, or credentials.
- Do NOT build an unauthorized LinkedIn scraper.
- The architecture must support legitimate job APIs, RSS feeds, public feeds, or permitted integrations later.
- For the MVP, use mock/seed job data if a legitimate external job API is not configured.

The application should be production-oriented even if the first version uses mock data.

---

# 2. Product Name

## GoToJobs

Suggested tagline:

> Find jobs that fit your skills.

Alternative:

> Your personalized job discovery platform.

Use the brand name **GoToJobs** consistently throughout the UI.

---

# 3. Main Product Concept

GoToJobs is a personalized job discovery platform.

A user creates a professional profile containing:

- Job title
- Skills
- Experience
- Preferred roles
- Preferred locations
- Remote preference
- Employment type
- Education
- Technologies

The platform compares the user's profile against available jobs using a **deterministic TypeScript matching algorithm**.

Example:

User skills:

```text
React
Next.js
Node.js
TypeScript
MongoDB
Docker
```

Job requirements:

```text
React
Node.js
TypeScript
MongoDB
AWS
Docker
```

The application calculates:

```text
5 / 6 matching skills
```

and displays:

```text
83% Match
```

The matching system must be transparent.

Show users:

```text
Why this job matches you

✓ React
✓ Node.js
✓ TypeScript
✓ MongoDB
✓ Docker

Missing:
• AWS
```

Do not use machine learning or AI for this.

---

# 4. Target Stack

Use the existing project's stack where possible.

Preferred stack:

```text
Next.js
TypeScript
App Router
Tailwind CSS
shadcn/ui
Lucide React
MongoDB
Mongoose
Auth.js / NextAuth if authentication is implemented
```

Use Server Components by default.

Use Client Components only when interactivity requires them.

Use Server Actions or Route Handlers where appropriate.

---

# 5. UI / Design Direction

The UI should feel like a modern SaaS product.

Design inspiration:

- Linear
- Vercel
- Notion
- modern job platforms
- modern developer dashboards

Do NOT copy any specific website.

The interface should be:

- Clean
- Minimal
- Professional
- Fast
- Responsive
- Accessible
- Developer-oriented
- Mobile friendly

Use generous spacing.

Avoid excessive gradients.

Avoid excessive animations.

Avoid huge decorative sections.

The application should prioritize usability.

---

# 6. Theme

Support:

```text
Light mode
Dark mode
System mode
```

If the project already has a theme provider, keep it.

Use semantic Tailwind/shadcn colors rather than hardcoded colors everywhere.

Use CSS variables for the main theme.

Suggested visual identity:

```text
Primary:
Blue / Indigo

Background:
Neutral

Cards:
White / dark neutral

Success:
Green

Warning:
Amber

Error:
Red
```

Do not overuse colors.

---

# 7. shadcn/ui

Use shadcn/ui components wherever appropriate.

Expected components:

```text
Button
Input
Textarea
Badge
Card
Avatar
DropdownMenu
Select
Checkbox
Switch
Slider
Dialog
Sheet
Tabs
Tooltip
Popover
Command
Separator
Skeleton
Pagination
Breadcrumb
Progress
Alert
Calendar
Table
ScrollArea
```

Install missing shadcn components if necessary.

Do not manually recreate components that shadcn already provides.

Use Lucide icons instead of manually created SVG icons.

---

# 8. Main Routes

Create the following application structure:

```text
/
```

Landing page.

```text
/jobs
```

Job discovery page.

```text
/jobs/[id]
```

Job details page.

```text
/profile
```

Professional profile.

```text
/saved
```

Saved jobs.

```text
/applications
```

Application tracking.

```text
/alerts
```

Job alerts.

```text
/settings
```

Account/application settings.

If authentication is implemented:

```text
/login
/register
```

---

# 9. Landing Page

Create a polished SaaS landing page.

Structure:

```text
Navbar
Hero
Features
How it works
Job discovery preview
Matching explanation
CTA
Footer
```

### Navbar

Logo:

```text
GoToJobs
```

Navigation:

```text
Jobs
Saved
Applications
Alerts
```

Right side:

```text
Theme toggle
Profile avatar
```

For unauthenticated users:

```text
Sign in
Get Started
```

---

# 10. Hero Section

Hero title:

> Find jobs that fit your skills.

Subtitle:

> Discover relevant opportunities, understand why they match your profile, and keep your applications organized.

Primary CTA:

```text
Explore Jobs
```

Secondary CTA:

```text
Create Profile
```

Add a visual job-search preview below the hero.

---

# 11. Jobs Page

The `/jobs` page is the main product experience.

Desktop layout:

```text
---------------------------------------------------------
Navbar
---------------------------------------------------------

Search jobs...

---------------------------------------------------------

Filters              Job Results
---------             ----------------------------------
Role                  12,482 jobs
Location              Sorted by: Relevance
Remote
Experience
Employment Type
Skills

                      Job Card
                      Job Card
                      Job Card
                      Job Card
```

Mobile:

Use a filter Sheet.

---

# 12. Search

Create a large search bar.

Placeholder:

```text
Search jobs, skills, companies...
```

Support searches such as:

```text
React Developer
Next.js
Full Stack
Software Engineer
Frontend Developer
Node.js
```

Search should work against the normalized job dataset.

---

# 13. Job Filters

Implement:

### Location

Examples:

```text
Morocco
Rabat
Casablanca
Kenitra
Remote
Europe
```

### Workplace

```text
Remote
Hybrid
On-site
```

### Employment type

```text
Full-time
Part-time
Contract
Internship
Freelance
```

### Experience

```text
Entry level
Junior
Mid-level
Senior
Lead
```

### Skills

Allow selecting multiple skills.

### Date posted

```text
Any time
Past 24 hours
Past 3 days
Past week
Past month
```

---

# 14. Job Card

Create a reusable:

```text
JobCard
```

component.

Example layout:

```text
┌─────────────────────────────────────────────────────┐
│ [Company Logo]                                      │
│                                                     │
│ Full Stack Developer                     87% Match │
│ Company Name                                        │
│                                                     │
│ 📍 Remote · Morocco                                 │
│ 💼 Full-time                                        │
│                                                     │
│ React   Node.js   TypeScript   MongoDB              │
│                                                     │
│ Posted 2 hours ago                                  │
│                                                     │
│ [View Job]                          [♡ Save]        │
└─────────────────────────────────────────────────────┘
```

Use:

```text
Badge
Button
Card
Avatar
Tooltip
```

from shadcn.

---

# 15. Match Score

Create a reusable component:

```text
MatchScore
```

Display:

```text
87% Match
```

Use a circular progress indicator or a compact badge.

Avoid making the score look scientifically precise.

The score is simply a transparent rule-based compatibility indicator.

Add tooltip:

> Based on matching skills, role, location, workplace preference, and experience.

---

# 16. Job Details Page

Route:

```text
/jobs/[id]
```

Layout:

```text
Company
Job title
Location
Workplace
Employment type
Posted date

[Apply] [Save]

------------------------------------------------

About the job

Description

Responsibilities

Requirements

Skills

------------------------------------------------

Why this job matches you

87% Match

✓ React
✓ Node.js
✓ TypeScript
✓ MongoDB
✓ Docker

Missing:
• AWS

------------------------------------------------

Company information

------------------------------------------------

Related jobs
```

The Apply button should send the user to the original job source URL.

Example:

```text
Apply on LinkedIn
Apply on Company Website
Apply on Job Board
```

Do not proxy or scrape the application process.

---

# 17. Job Source

Every job must have a source.

Example:

```ts
source: "linkedin";
```

or:

```ts
source: "greenhouse";
```

or:

```ts
source: "lever";
```

or:

```ts
source: "company";
```

Display:

```text
Source: LinkedIn
```

or:

```text
Source: Company Website
```

The application URL must point to the legitimate external application page.

---

# 18. Professional Profile

Create:

```text
/profile
```

The user should be able to manage:

### Basic information

```text
Full name
Professional title
Bio
```

### Skills

Allow adding/removing skills.

Example:

```text
React
Next.js
TypeScript
Node.js
Express
MongoDB
Docker
Git
```

### Preferred roles

```text
Software Engineer
Full Stack Developer
Frontend Developer
React Developer
```

### Locations

```text
Morocco
Remote
Europe
```

### Preferences

```text
Remote
Hybrid
On-site
```

### Experience

```text
Years of experience
```

### Education

Allow adding education entries.

---

# 19. Profile Completion

Show:

```text
Profile completion

████████████████░░░░ 80%

Complete your profile to improve job matching.
```

Calculate this deterministically.

Example:

```text
Name              10%
Title             15%
Skills            25%
Experience        15%
Roles             15%
Location          10%
Preferences       10%
```

---

# 20. Matching Algorithm

Create a dedicated utility:

```text
lib/matching/
```

Example:

```text
lib/matching/calculateMatch.ts
lib/matching/normalizeSkill.ts
lib/matching/explainMatch.ts
```

Do not put matching logic directly inside React components.

---

# 21. Skill Normalization

Create aliases.

Example:

```ts
const skillAliases = {
  reactjs: "react",
  react: "react",
  "react.js": "react",

  nextjs: "next.js",
  "next.js": "next.js",

  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",

  ts: "typescript",
  typescript: "typescript",
};
```

Normalize:

```text
ReactJS
React.js
react
```

into:

```text
react
```

This improves matching.

---

# 22. Matching Formula

Implement an understandable deterministic score.

Suggested weighting:

```text
Skills           50%
Job title        20%
Experience       15%
Location         10%
Workplace         5%
```

Example:

```ts
score =
  skillScore * 0.5 +
  titleScore * 0.2 +
  experienceScore * 0.15 +
  locationScore * 0.1 +
  workplaceScore * 0.05;
```

Return:

```ts
{
  score: 87,
  matchedSkills: [],
  missingSkills: [],
  reasons: [],
  breakdown: {
    skills: 45,
    title: 18,
    experience: 12,
    location: 7,
    workplace: 5
  }
}
```

Clamp the final score between:

```text
0
100
```

---

# 23. Important Matching Rule

Never claim:

```text
"You're perfect for this job."
```

Instead use:

```text
"87% profile match"
```

and explain the factors.

The system is a heuristic, not an employment prediction.

---

# 24. Saved Jobs

Create:

```text
/saved
```

Users can:

```text
Save
Unsave
View saved jobs
```

Allow filtering:

```text
All
Remote
High match
Recently saved
```

---

# 25. Application Tracking

Create:

```text
/applications
```

Allow the user to track jobs manually.

Statuses:

```text
Saved
Applied
Interview
Offer
Rejected
Withdrawn
```

Create a Kanban-style interface:

```text
Saved       Applied       Interview       Offer
───────     ───────       ─────────       ─────
Job A       Job C         Job E           Job G
Job B       Job D         Job F
```

On mobile, convert this into tabs or horizontally scrollable columns.

---

# 26. Job Alerts

Create:

```text
/alerts
```

Users can create an alert:

```text
Alert name:
Frontend Remote Jobs

Keywords:
React
Next.js
TypeScript

Location:
Remote

Minimum match:
75%

Frequency:
Daily
```

For MVP, store the alert configuration.

Do not implement email delivery unless an email provider is already configured.

---

# 27. Job Data Architecture

Create a normalized internal job model.

Example:

```ts
type JobSource =
  | "linkedin"
  | "greenhouse"
  | "lever"
  | "adzuna"
  | "remotive"
  | "company"
  | "mock";

type WorkplaceType = "remote" | "hybrid" | "onsite";

type Job = {
  id: string;

  externalId: string;

  source: JobSource;

  title: string;

  company: {
    name: string;
    logo?: string;
    website?: string;
  };

  location?: string;

  workplaceType?: WorkplaceType;

  employmentType?: string;

  experienceLevel?: string;

  description: string;

  skills: string[];

  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };

  publishedAt: string;

  fetchedAt: string;

  url: string;
};
```

---

# 28. Job Source Architecture

Do NOT couple the application directly to one job provider.

Create an abstraction:

```text
lib/jobs/
├── types.ts
├── normalize.ts
├── deduplicate.ts
├── sources/
│   ├── mock.ts
│   ├── greenhouse.ts
│   ├── lever.ts
│   └── index.ts
```

Each source should eventually implement something similar to:

```ts
interface JobSource {
  name: string;

  searchJobs(params: JobSearchParams): Promise<Job[]>;
}
```

This makes it possible to add sources later without rewriting the application.

---

# 29. MVP Job Data

For the initial implementation, create realistic mock jobs.

Create at least:

```text
30 jobs
```

Cover:

```text
React
Next.js
Node.js
TypeScript
JavaScript
.NET
Python
Java
DevOps
Cloud
UI/UX
Software Engineering
Frontend
Backend
Full Stack
```

Locations:

```text
Morocco
Rabat
Casablanca
Kenitra
Tangier
Remote
France
Europe
```

Different companies should be represented.

Clearly mark mock data internally as:

```text
source: "mock"
```

Do not present fake jobs as real job listings.

If displayed in the UI, add a subtle:

```text
Demo data
```

indicator.

---

# 30. Data Fetching

Use a clean data-access layer.

Example:

```text
lib/db/
lib/jobs/
```

Avoid making database calls directly from many unrelated components.

Create reusable functions:

```ts
getJobs();
getJobById();
searchJobs();
getSavedJobs();
saveJob();
unsaveJob();
getApplications();
createApplication();
```

---

# 31. API Routes

Create appropriate Route Handlers where needed.

Example:

```text
/api/jobs
/api/jobs/[id]
/api/saved
/api/applications
/api/profile
/api/alerts
```

Support:

```text
GET
POST
PATCH
DELETE
```

where appropriate.

Do not create unnecessary APIs when a Server Action or Server Component is more appropriate.

---

# 32. Performance

Performance is a major requirement.

Follow these principles:

### Server Components

Use Server Components by default.

### Client Components

Only use `"use client"` when necessary.

### Database

Use indexes for:

```text
source
externalId
publishedAt
title
location
```

Create a compound unique constraint for:

```text
source + externalId
```

to prevent duplicate jobs.

### Pagination

Never load thousands of jobs into the browser.

Use:

```text
20 jobs per page
```

or cursor pagination.

### Debounced search

Search input should be debounced.

### Images

Use:

```text
next/image
```

where appropriate.

### Loading

Use:

```text
loading.tsx
```

and shadcn Skeleton components.

### Errors

Create:

```text
error.tsx
not-found.tsx
```

where appropriate.

---

# 33. Job Deduplication

Different providers may return the same job.

Create:

```text
lib/jobs/deduplicate.ts
```

Use:

```text
source + externalId
```

as the strongest identifier.

When necessary, create a secondary fingerprint based on:

```text
company
title
location
```

Do not accidentally create duplicate cards for the same job.

---

# 34. Future Real-Time Synchronization

The architecture must support background synchronization later.

Desired future architecture:

```text
External Sources
      ↓
Job ingestion
      ↓
Normalize
      ↓
Deduplicate
      ↓
MongoDB
      ↓
GoToJobs
```

The user frontend should read from MongoDB instead of directly querying external providers.

This keeps the UI fast.

A future scheduled process can run every:

```text
5–15 minutes
```

depending on the source's permitted rate limits and update policy.

Do not implement aggressive polling.

Respect each provider's terms, rate limits, robots rules, API policies, and licensing.

---

# 35. LinkedIn Integration

Do NOT implement:

```text
LinkedIn username/password login
LinkedIn cookie extraction
LinkedIn session extraction
Browser automation against LinkedIn
HTML scraping of LinkedIn jobs
Automated LinkedIn account access
```

Instead, the architecture should allow jobs from legitimate integrations later.

If a job's original URL is LinkedIn, simply provide:

```text
View on LinkedIn
```

as an external link.

The platform should never pretend to have an official LinkedIn API integration unless one is actually configured and authorized.

---

# 36. Search Ranking

Sort jobs using deterministic criteria.

Possible ranking:

```text
Match score
+
Recency
+
Search relevance
```

For example:

```ts
rank = matchScore * 0.6 + searchRelevance * 0.25 + freshness * 0.15;
```

Keep the calculation simple and explainable.

Do not call this an AI ranking system.

---

# 37. Empty States

Create polished empty states.

Example:

```text
No jobs found

Try changing your keywords or filters.
```

Saved jobs:

```text
No saved jobs yet.

Save jobs you want to revisit later.
```

Applications:

```text
No applications yet.

Start tracking the jobs you apply to.
```

Alerts:

```text
No alerts configured.

Create an alert to monitor new opportunities.
```

---

# 38. Loading States

Use shadcn Skeleton components.

Example:

```text
JobCardSkeleton
ProfileSkeleton
JobDetailsSkeleton
```

Avoid blank screens while loading.

---

# 39. Error Handling

Handle:

```text
Database unavailable
Job not found
Invalid search
Unauthorized request
Invalid form
External source unavailable
```

Never expose internal stack traces to users.

---

# 40. Forms

Use proper validation.

If the project already has a validation library, reuse it.

Otherwise use:

```text
Zod
```

for schemas.

Validate:

```text
Profile
Job alerts
Application status
Search parameters
```

---

# 41. Accessibility

Follow accessibility best practices.

Ensure:

- Keyboard navigation
- Visible focus states
- Proper labels
- Accessible dialogs
- Accessible buttons
- Correct heading hierarchy
- Sufficient contrast
- Screen-reader-friendly controls

Do not use icons without accessible labels when the icon is the only control.

---

# 42. Responsive Design

The application must work well at:

```text
320px
375px
768px
1024px
1440px+
```

Desktop:

```text
Sidebar filters + job list
```

Mobile:

```text
Search
Filter button
Job list
```

Use shadcn Sheet for mobile filters.

---

# 43. Components

Create reusable components.

Suggested structure:

```text
components/
├── layout/
│   ├── navbar.tsx
│   ├── footer.tsx
│   └── mobile-nav.tsx
│
├── jobs/
│   ├── job-card.tsx
│   ├── job-list.tsx
│   ├── job-filters.tsx
│   ├── job-search.tsx
│   ├── match-score.tsx
│   ├── match-breakdown.tsx
│   ├── job-source.tsx
│   └── job-card-skeleton.tsx
│
├── profile/
│   ├── profile-form.tsx
│   ├── skills-input.tsx
│   ├── experience-form.tsx
│   └── profile-completion.tsx
│
├── applications/
│   ├── application-board.tsx
│   ├── application-card.tsx
│   └── status-badge.tsx
│
└── alerts/
    ├── alert-form.tsx
    └── alert-card.tsx
```

---

# 44. Database

If MongoDB is not already configured, prepare the project for MongoDB.

Create:

```text
lib/mongodb.ts
```

Use a cached MongoDB connection suitable for Next.js development.

Create models:

```text
models/User.ts
models/Job.ts
models/SavedJob.ts
models/Application.ts
models/JobAlert.ts
```

Do not create a new database connection for every request.

---

# 45. Environment Variables

Create or update:

```text
.env.example
```

Example:

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

Only add variables that are actually used.

Never commit:

```text
.env
.env.local
```

---

# 46. Seed Script

Create a seed mechanism for development.

Example:

```text
scripts/seed-jobs.ts
```

It should populate the database with demo jobs.

If the project doesn't currently have a suitable script system, add one cleanly to package.json.

Do not seed fake jobs automatically in production.

---

# 47. SEO

Add metadata for the main pages.

Example:

```text
GoToJobs — Find jobs that fit your skills
```

Use appropriate:

```text
title
description
OpenGraph metadata
```

For job pages, dynamically generate metadata from the job title/company where appropriate.

---

# 48. Security

Never trust client input.

Validate server-side.

Never expose:

```text
MONGODB_URI
API keys
authentication secrets
private environment variables
```

Do not store external job-provider credentials in the browser.

Sanitize/render job descriptions safely.

Do not use dangerous HTML injection.

---

# 49. Demo User Experience

For development, make it possible to experience the product without complicated setup.

The homepage should lead to:

```text
Explore Jobs
```

The jobs page should immediately show demo jobs.

The user should be able to:

```text
Search
Filter
Open a job
See match information
Save a job
View saved jobs
Create a profile
See personalized matches
Track an application
Create an alert
```

---

# 50. Dashboard

If useful, create:

```text
/dashboard
```

with:

```text
Good evening 👋

Your job search overview

┌─────────────┐
│ 42          │
│ Matching    │
│ jobs        │
└─────────────┘

┌─────────────┐
│ 8           │
│ New today   │
└─────────────┘

┌─────────────┐
│ 12          │
│ Saved       │
└─────────────┘

┌─────────────┐
│ 5           │
│ Applications│
└─────────────┘

Top matches
...
```

---

# 51. Navigation

Desktop navigation:

```text
GoToJobs

Jobs
Saved
Applications
Alerts

Profile
Settings
```

Mobile navigation:

```text
Jobs
Saved
Applications
Profile
```

Use a mobile Sheet/menu for additional navigation.

---

# 52. Command Menu

Use shadcn Command to implement a global command menu.

Keyboard shortcut:

```text
⌘ K
```

or:

```text
Ctrl K
```

Commands:

```text
Search jobs
Go to Jobs
Go to Saved
Go to Applications
Go to Alerts
Go to Profile
Toggle theme
```

---

# 53. Toast Notifications

Use shadcn toast/sonner where available.

Examples:

```text
Job saved
Job removed from saved jobs
Application status updated
Profile updated
Alert created
```

---

# 54. Important UX Details

When a user saves a job:

```text
♡
```

changes to:

```text
♥
```

and shows:

```text
Job saved
```

When applying:

```text
Apply
```

should clearly indicate:

```text
Opens external website
```

Do not make users think they are applying inside GoToJobs.

---

# 55. Code Quality

Use:

- TypeScript strict mode
- Strong typing
- Reusable components
- Small functions
- Clear naming
- No unnecessary duplication
- No `any` unless absolutely necessary
- Server-side validation
- Error boundaries where appropriate

Avoid huge components.

If a component becomes difficult to maintain, split it.

---

# 56. Folder Structure

Aim for a structure similar to:

```text
app/
├── (marketing)/
│   ├── page.tsx
│   └── ...
│
├── (app)/
│   ├── dashboard/
│   ├── jobs/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── saved/
│   ├── applications/
│   ├── alerts/
│   ├── profile/
│   └── settings/
│
├── api/
│   ├── jobs/
│   ├── saved/
│   ├── applications/
│   ├── profile/
│   └── alerts/
│
├── layout.tsx
├── loading.tsx
├── not-found.tsx
└── globals.css

components/
├── ui/
├── layout/
├── jobs/
├── profile/
├── applications/
└── alerts/

lib/
├── db/
├── jobs/
├── matching/
├── validation/
└── utils/

models/
├── User.ts
├── Job.ts
├── SavedJob.ts
├── Application.ts
└── JobAlert.ts

scripts/
└── seed-jobs.ts
```

Adapt this to the existing project's structure rather than blindly moving existing files.

---

# 57. Implementation Strategy

Do not try to implement everything in one giant component.

Implement in stages.

## Stage 1 — UI foundation

Build:

```text
Navbar
Footer
Theme
Landing page
Jobs page
Job cards
Job filters
Job details
```

Use mock data initially.

---

## Stage 2 — Data layer

Implement:

```text
MongoDB
Mongoose
Job model
Seed script
Job queries
```

Move the job listing from static mock data to MongoDB.

---

## Stage 3 — User profile

Implement:

```text
Profile
Skills
Experience
Preferences
Profile completion
```

---

## Stage 4 — Matching

Implement:

```text
Skill normalization
Match score
Match breakdown
Why this job matches
```

---

## Stage 5 — Saved jobs

Implement:

```text
Save
Unsave
Saved page
```

---

## Stage 6 — Applications

Implement:

```text
Application tracking
Statuses
Kanban board
```

---

## Stage 7 — Alerts

Implement:

```text
Create alert
Edit alert
Delete alert
Enable/disable alert
```

---

## Stage 8 — Job source abstraction

Implement:

```text
JobSource interface
Normalization
Deduplication
Source adapters
```

Initially:

```text
MockJobSource
```

Then prepare the architecture for legitimate providers.

---

# 58. External Job Sources

When adding real providers later, do not scrape websites blindly.

Prefer:

1. Official APIs
2. Official feeds
3. Partner APIs
4. Public job feeds explicitly intended for aggregation
5. Company career APIs/pages where permitted

Respect:

```text
Terms of Service
robots.txt
API rate limits
Licensing
Attribution requirements
Data retention rules
```

The provider adapter should be isolated from the rest of GoToJobs.

Example:

```text
lib/jobs/sources/adzuna.ts
lib/jobs/sources/greenhouse.ts
lib/jobs/sources/lever.ts
```

---

# 59. No AI

The first version must NOT use AI.

Do not add:

```text
AI matching
LLM summaries
AI recommendations
embeddings
vector databases
RAG
```

The product should demonstrate that a good job-matching experience can be built with deterministic algorithms.

AI can be considered as a future optional feature, but don't implement it now.

---

# 60. No Python

Everything must be implemented with:

```text
TypeScript
Next.js
Node.js
MongoDB
```

Do not create Python scripts.

---

# 61. Testing

If the project already has a testing setup, use it.

Otherwise, create tests for the most important pure functions:

```text
normalizeSkill()
calculateMatch()
deduplicateJobs()
```

Especially test:

```text
React
React.js
ReactJS
react
```

being normalized consistently.

Test match scores for:

```text
perfect match
partial match
zero match
missing skills
remote mismatch
location mismatch
```

---

# 62. Final Quality Check

Before considering the implementation complete:

Run:

```text
npm run lint
```

and:

```text
npm run build
```

Fix all TypeScript and lint errors.

Check:

```text
Desktop
Tablet
Mobile
Dark mode
Light mode
Empty states
Loading states
Error states
```

Check that there are no:

```text
console errors
broken links
hydration errors
unnecessary client components
hardcoded secrets
```

---

# 63. Important Agent Behavior

Before changing existing files:

1. Inspect the existing project.
2. Understand the current dependencies.
3. Reuse existing components/configuration.
4. Do not overwrite working functionality unnecessarily.
5. Install only necessary dependencies.
6. Follow the project's existing conventions where they are reasonable.

Do not regenerate the project.

Do not switch frameworks.

Do not migrate to another CSS system.

Do not introduce Python.

Do not introduce AI APIs.

---

# 64. Definition of Done

The first complete MVP should allow a user to:

```text
✓ Open GoToJobs
✓ Explore jobs
✓ Search jobs
✓ Filter jobs
✓ Open job details
✓ See job source
✓ See match score
✓ Understand matching reasons
✓ Create/edit professional profile
✓ Add skills
✓ Save jobs
✓ View saved jobs
✓ Track applications
✓ Create job alerts
✓ Switch dark/light mode
✓ Use the application on mobile
```

The architecture should additionally be ready for:

```text
✓ Multiple legitimate job providers
✓ Background job synchronization
✓ Job deduplication
✓ Near-real-time job ingestion
✓ Email notifications
✓ Additional job sources
```

---

# 65. Final Product Principle

GoToJobs should feel like:

> **A fast, transparent, personalized job search engine — not an AI chatbot and not an unauthorized scraper.**

The core loop is:

```text
Profile
   ↓
Job sources
   ↓
Normalize
   ↓
Deduplicate
   ↓
Match
   ↓
Rank
   ↓
Discover
   ↓
Save
   ↓
Apply externally
   ↓
Track application
```

Build the MVP with clean architecture so that adding legitimate real-world job sources later does not require rewriting the frontend or matching system.

Start by inspecting the existing repository and then implement the project incrementally, beginning with the UI and mock job data.
