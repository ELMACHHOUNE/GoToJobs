import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="font-bold text-xl">
              GoToJobs
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Find jobs that fit your skills. Personalized job discovery for developers.
            </p>
          </div>
          <nav className="space-y-3" aria-label="Product">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-foreground">Jobs</Link></li>
              <li><Link href="/saved" className="hover:text-foreground">Saved Jobs</Link></li>
              <li><Link href="/applications" className="hover:text-foreground">Applications</Link></li>
              <li><Link href="/alerts" className="hover:text-foreground">Job Alerts</Link></li>
            </ul>
          </nav>
          <nav className="space-y-3" aria-label="Account">
            <h3 className="font-semibold">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/profile" className="hover:text-foreground">Profile</Link></li>
              <li><Link href="/settings" className="hover:text-foreground">Settings</Link></li>
            </ul>
          </nav>
          <nav className="space-y-3" aria-label="Legal">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GoToJobs. Demo data — not a real job board.</p>
        </div>
      </div>
    </footer>
  );
}