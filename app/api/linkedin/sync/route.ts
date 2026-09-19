import { auth } from "@/lib/auth/config";
import { searchLinkedInJobs, getUserSavedJobs } from "@/lib/jobs/sources/linkedin";
import { saveJobsToDatabase } from "@/lib/db/jobs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { keywords, location, saveJobs = true } = body;

    const searchParams: any = {};
    if (keywords) searchParams.q = keywords;
    if (location) searchParams.locations = [location];

    const result = await searchLinkedInJobs(searchParams, { page: 1, resultsPerPage: 50 });

    let savedCount = 0;
    if (saveJobs && result.jobs.length > 0) {
      await saveJobsToDatabase(result.jobs);
      savedCount = result.jobs.length;
    }

    const savedJobs = await getUserSavedJobs(session.accessToken as string);

    return NextResponse.json({
      success: true,
      searched: result.jobs.length,
      saved: savedCount,
      userSavedJobs: savedJobs.length,
    });
  } catch (error) {
    console.error("LinkedIn sync error:", error);
    return NextResponse.json({ error: "Failed to sync LinkedIn jobs" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || undefined;
    const location = searchParams.get("location") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const searchParamsObj: any = {};
    if (q) searchParamsObj.q = q;
    if (location) searchParamsObj.locations = [location];

    const result = await searchLinkedInJobs(searchParamsObj, { page, resultsPerPage: pageSize });

    return NextResponse.json(result);
  } catch (error) {
    console.error("LinkedIn search error:", error);
    return NextResponse.json({ error: "Failed to search LinkedIn jobs" }, { status: 500 });
  }
}