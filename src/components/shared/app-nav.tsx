"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { DEV_AUTH } from "@/lib/auth/dev";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export interface NavItem {
  href: string;
  label: string;
}

export const CANDIDATE_NAV: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/profile", label: "Profile" },
  { href: "/app/resumes", label: "CVs" },
  { href: "/app/applications", label: "Applications" },
  { href: "/app/interviews", label: "Interviews" },
];

export const EMPLOYER_NAV: NavItem[] = [
  { href: "/hr/dashboard", label: "Dashboard" },
  { href: "/hr/jobs", label: "Jobs" },
  { href: "/hr/settings/team", label: "Team" },
];

/**
 * A user can be a candidate and a recruiter at their own company, so the shells are
 * separate routes and the switch is explicit — never an inferred "mode"
 * (docs/01-frontend-architecture.md §2).
 */
export function AppNav({ items, context }: { items: NavItem[]; context: "candidate" | "employer" }) {
  const pathname = usePathname();
  const { orgId } = useAuth();

  const otherHref = context === "candidate" ? "/hr/dashboard" : "/app/dashboard";
  const otherLabel = context === "candidate" ? "Employer view" : "Job seeker view";
  const showSwitch = context === "employer" || DEV_AUTH || Boolean(orgId);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 md:px-8">
        <Link href="/" className="font-semibold">
          HireBridge
        </Link>

        <nav aria-label="Main" className="flex flex-1 items-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-[var(--radius-base)] px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-surface-raised font-medium text-text"
                    : "text-text-muted hover:text-text",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {showSwitch && (
            <Link
              href={otherHref}
              className="hidden text-sm text-text-muted hover:text-text sm:block"
            >
              {otherLabel}
            </Link>
          )}
          <ThemeToggle />
          {DEV_AUTH ? (
            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs text-warning">
              demo
            </span>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
    </header>
  );
}
