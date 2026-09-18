"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseIcon, BookmarkIcon, ClipboardListIcon, BellIcon, UserIcon, SettingsIcon, MenuIcon, XIcon, SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Jobs", href: "/jobs", icon: BriefcaseIcon },
  { label: "Saved", href: "/saved", icon: BookmarkIcon },
  { label: "Applications", href: "/applications", icon: ClipboardListIcon },
  { label: "Alerts", href: "/alerts", icon: BellIcon },
  { label: "Profile", href: "/profile", icon: UserIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" aria-label="GoToJobs home">
          <span className="text-primary">GoToJobs</span>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg">GoToJobs</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <SunIcon className="mr-2 h-5 w-5" />
                      Light mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="mr-2 h-5 w-5" />
                      Dark mode
                    </>
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}