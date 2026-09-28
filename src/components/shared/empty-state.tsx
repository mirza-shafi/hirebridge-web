import type { ReactNode } from "react";

/**
 * Every list ships with one of these. A blank panel is never an acceptable empty state
 * (docs/02-routes-and-screens.md, screen state checklist).
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-base)] border border-dashed border-border px-6 py-12 text-center">
      <p className="font-medium text-text">{title}</p>
      <p className="max-w-md text-sm text-text-muted">{description}</p>
      {action}
    </div>
  );
}
