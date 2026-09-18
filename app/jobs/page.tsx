import { JobsExplorer } from "@/components/jobs-explorer";

export const metadata = {
  title: "Jobs",
  description: "Search and discover jobs that match your skills and preferences.",
};

export default function JobsPage() {
  return <JobsExplorer />;
}