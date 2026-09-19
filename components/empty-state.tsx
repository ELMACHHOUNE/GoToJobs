"use client";

import { FilterIcon, BriefcaseIcon, BookmarkIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "saved" | "applications" | "alerts";
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  default: BriefcaseIcon,
  saved: BookmarkIcon,
  applications: BriefcaseIcon,
  alerts: FilterIcon,
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "default",
}: EmptyStateProps) {
  const IconComponent = icon ? null : ICON_MAP[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon ? (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      ) : IconComponent ? (
        <IconComponent className="mb-4 h-16 w-16 text-muted-foreground/50" />
      ) : null}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}