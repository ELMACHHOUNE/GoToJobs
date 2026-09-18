import { NextRequest, NextResponse } from "next/server";
import { searchJobs, getQueryableJobs, type JobQueryInput } from "@/lib/jobs/queries";
import { defaultProfile } from "@/lib/matching/calculateMatch";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const locations = searchParams.getAll("locations") || undefined;
  const workplaceTypes = searchParams.getAll("workplaceTypes") as JobQueryInput["workplaceTypes"];
  const employmentTypes = searchParams.getAll("employmentTypes") as JobQueryInput["employmentTypes"];
  const experienceLevels = searchParams.getAll("experienceLevels") as JobQueryInput["experienceLevels"];
  const skills = searchParams.getAll("skills") || undefined;
  const datePosted = (searchParams.get("datePosted") as JobQueryInput["datePosted"]) || "any";
  const sort = (searchParams.get("sort") as JobQueryInput["sort"]) || "relevance";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

  const profile = defaultProfile();

  const result = searchJobs({
    profile,
    q,
    locations,
    workplaceTypes,
    employmentTypes,
    experienceLevels,
    skills,
    datePosted,
    sort,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}