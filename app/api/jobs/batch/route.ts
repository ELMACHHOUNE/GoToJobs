import { NextRequest, NextResponse } from "next/server";
import { getJobsByIds } from "@/lib/jobs/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("id");

  if (ids.length === 0) {
    return NextResponse.json({ jobs: [] });
  }

  const jobs = await getJobsByIds(ids);

  return NextResponse.json({ jobs });
}