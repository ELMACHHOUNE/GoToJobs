import { NextRequest, NextResponse } from "next/server";
import { getJobById, getRelatedJobs } from "@/lib/jobs/queries";
import { calculateMatch } from "@/lib/matching/calculateMatch";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const profile = null;
  const match = calculateMatch(profile, job);
  const related = await getRelatedJobs(job, 4);
  const relatedWithMatch = related.map((j) => {
    const m = calculateMatch(profile, j);
    return { job: j, match: m };
  });

  return NextResponse.json({
    job,
    match,
    related: relatedWithMatch,
  });
}