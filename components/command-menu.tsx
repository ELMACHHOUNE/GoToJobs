"use client";

import { useEffect, useState } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command";
import { SearchIcon, BriefcaseIcon, BookmarkIcon, ClipboardListIcon, BellIcon, UserIcon, SettingsIcon, SunIcon, MoonIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store/store-provider";

const NAV_ITEMS = [
  { label: "Jobs", href: "/jobs", icon: BriefcaseIcon },
  { label: "Saved", href: "/saved", icon: BookmarkIcon },
  { label: "Applications", href: "/applications", icon: ClipboardListIcon },
  { label: "Alerts", href: "/alerts", icon: BellIcon },
  { label: "Profile", href: "/profile", icon: UserIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
] as const;

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { profile, updateProfile } = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    html.classList.remove(isDark ? "dark" : "light");
    html.classList.add(isDark ? "light" : "dark");
    localStorage.setItem("gotojobs.theme", isDark ? "light" : "dark");
    setOpen(false);
  };

  return (
    <Command open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => (
            <CommandItem key={item.label} onSelect={() => navigate(item.href)}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              {pathname === item.href && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={toggleTheme}>
            <SunIcon className="mr-2 h-4 w-4" />
            Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => navigate("/profile")}>
            <UserIcon className="mr-2 h-4 w-4" />
            Edit profile
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Quick search">
          <CommandItem>
            <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Search jobs (coming soon)</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}