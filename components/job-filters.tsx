"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { XIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Checkbox,
} from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WORKPLACE_TYPES } from "@/lib/store/schema";
import type { WorkplaceType, EmploymentType, ExperienceLevel, DatePostedFilter, SortOption } from "@/lib/jobs/types";

const EMPLOYMENT_TYPES: EmploymentType[] = ["full-time", "part-time", "contract", "internship", "freelance"];
const EXPERIENCE_LEVELS: ExperienceLevel[] = ["entry", "junior", "mid-level", "senior", "lead"];
const DATE_POSTED_FILTERS: DatePostedFilter[] = ["any", "24h", "3d", "week", "month"];
const SORT_OPTIONS: SortOption[] = ["relevance", "newest", "match", "salary"];

const COMMON_SKILLS = [
  "react", "next.js", "node.js", "typescript", "javascript", "python", "java", "go",
  "mongodb", "postgresql", "mysql", "redis", "docker", "kubernetes", "aws", "gcp",
  "git", "graphql", "rest", "express", "django", "fastapi", "vue", "angular",
];

export function JobFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localSkills, setLocalSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const createQueryString = useCallback((updates: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });
    params.delete("page");
    return params.toString();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchParams.get("q") || "";
    router.push(`${pathname}?${createQueryString({ q })}`);
  };

  const handleSkillAdd = (skill: string) => {
    const normalized = skill.trim().toLowerCase();
    if (normalized && !localSkills.includes(normalized)) {
      setLocalSkills([...localSkills, normalized]);
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skill: string) => {
    setLocalSkills(localSkills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleSkillAdd(skillInput);
    }
  };

  const activeFilterCount = [
    searchParams.get("q"),
    searchParams.getAll("locations").length,
    searchParams.getAll("workplaceTypes").length,
    searchParams.getAll("employmentTypes").length,
    searchParams.getAll("experienceLevels").length,
    localSkills.length > 0 ? localSkills.length : searchParams.getAll("skills").length,
    searchParams.get("datePosted") !== "any" ? 1 : 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search jobs, skills, companies..."
          value={searchParams.get("q") || ""}
          onChange={(e) => router.push(`${pathname}?${createQueryString({ q: e.target.value })}`)}
          className="pl-10 w-full md:w-96"
          aria-label="Search jobs"
        />
      </form>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
            <XIcon className="mr-1 h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full md:hidden gap-2" onClick={() => setMobileOpen(true)}>
            <SlidersHorizontalIcon className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-4">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100%-100px)]">
            <FiltersContent
              searchParams={searchParams}
              createQueryString={createQueryString}
              router={router}
              pathname={pathname}
              localSkills={localSkills}
              setLocalSkills={setLocalSkills}
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              handleSkillAdd={handleSkillAdd}
              handleSkillRemove={handleSkillRemove}
              handleSkillKeyDown={handleSkillKeyDown}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="hidden md:block">
        <FiltersContent
          searchParams={searchParams}
          createQueryString={createQueryString}
          router={router}
          pathname={pathname}
          localSkills={localSkills}
          setLocalSkills={setLocalSkills}
          skillInput={skillInput}
          setSkillInput={setSkillInput}
          handleSkillAdd={handleSkillAdd}
          handleSkillRemove={handleSkillRemove}
          handleSkillKeyDown={handleSkillKeyDown}
        />
      </div>
    </div>
  );
}

function FiltersContent({
  searchParams,
  createQueryString,
  router,
  pathname,
  localSkills,
  setLocalSkills,
  skillInput,
  setSkillInput,
  handleSkillAdd,
  handleSkillRemove,
  handleSkillKeyDown,
}: {
  searchParams: URLSearchParams;
  createQueryString: (updates: Record<string, string | string[] | undefined>) => string;
  router: ReturnType<typeof useRouter>;
  pathname: string;
  localSkills: string[];
  setLocalSkills: React.Dispatch<React.SetStateAction<string[]>>;
  skillInput: string;
  setSkillInput: React.Dispatch<React.SetStateAction<string>>;
  handleSkillAdd: (skill: string) => void;
  handleSkillRemove: (skill: string) => void;
  handleSkillKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const locations = searchParams.getAll("locations");
  const workplaceTypes = searchParams.getAll("workplaceTypes");
  const employmentTypes = searchParams.getAll("employmentTypes");
  const experienceLevels = searchParams.getAll("experienceLevels");
  const urlSkills = searchParams.getAll("skills");
  const skills = localSkills.length > 0 ? localSkills : urlSkills;
  const datePosted = (searchParams.get("datePosted") as DatePostedFilter) || "any";
  const sort = (searchParams.get("sort") as SortOption) || "relevance";

  const toggleArrayParam = (param: string, value: string) => {
    const current = searchParams.getAll(param);
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    router.push(`${pathname}?${createQueryString({ [param]: updated })}`);
  };

  const setSingleParam = (param: string, value: string) => {
    router.push(`${pathname}?${createQueryString({ [param]: value })}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="locations" className="mb-2 block text-sm font-medium">
          Location
        </label>
        <Input
          id="locations"
          placeholder="e.g., Morocco, Remote, Casablanca"
          value={locations.join(", ")}
          onChange={(e) => {
            const vals = e.target.value.split(",").map((v) => v.trim()).filter(Boolean);
            router.push(`${pathname}?${createQueryString({ locations: vals })}`);
          }}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Workplace</label>
        <div className="flex flex-wrap gap-2">
          {WORKPLACE_TYPES.map((type) => (
            <Button
              key={type}
              variant={workplaceTypes.includes(type) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayParam("workplaceTypes", type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Employment type</label>
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPES.map((type) => (
            <Button
              key={type}
              variant={employmentTypes.includes(type) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayParam("employmentTypes", type)}
            >
              {type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Experience</label>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <Button
              key={level}
              variant={experienceLevels.includes(level) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayParam("experienceLevels", level)}
            >
              {level.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Skills</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="outline" className="gap-1">
              {skill}
              <button
                type="button"
                onClick={() => handleSkillRemove(skill)}
                className="ml-1 rounded hover:bg-accent"
                aria-label={`Remove ${skill}`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={() => handleSkillAdd(skillInput)}>
            Add
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Popular: {COMMON_SKILLS.slice(0, 10).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSkillAdd(s)}
              className="mr-1 underline hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </p>
      </div>

      <Separator />

      <div>
        <label htmlFor="datePosted" className="mb-2 block text-sm font-medium">
          Date posted
        </label>
        <Select value={datePosted} onValueChange={(v) => setSingleParam("datePosted", v)}>
          <SelectTrigger id="datePosted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_POSTED_FILTERS.map((filter) => (
              <SelectItem key={filter} value={filter}>
                {filter === "any" ? "Any time" : filter === "24h" ? "Past 24 hours" : filter === "3d" ? "Past 3 days" : filter === "week" ? "Past week" : "Past month"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="sort" className="mb-2 block text-sm font-medium">
          Sort by
        </label>
        <Select value={sort} onValueChange={(v) => setSingleParam("sort", v)}>
          <SelectTrigger id="sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="match">Best match</SelectItem>
            <SelectItem value="salary">Salary</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}