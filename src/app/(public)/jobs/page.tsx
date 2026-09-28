import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { listPublicJobs, type PublicJob } from "@/lib/api/public";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Open roles on HireBridge. Apply with a CV tailored to each one.",
};

// ISR — the board is a crawlable surface, not a client-fetched list.
export const revalidate = 60;

const SENIORITIES = ["junior", "mid", "senior", "lead"] as const;
const WORK_MODES = ["onsite", "hybrid", "remote"] as const;

type Search = { q?: string; location?: string; seniority?: string; work_mode?: string };

function salary(job: PublicJob): string | null {
  if (!job.salary_min || !job.currency) return null;
  const fmt = (v: number) => new Intl.NumberFormat("en-US").format(v);
  return job.salary_max
    ? `${job.currency} ${fmt(job.salary_min)}–${fmt(job.salary_max)}`
    : `${job.currency} ${fmt(job.salary_min)}+`;
}

/** Filters live in the URL so every filtered view is linkable and crawlable. */
function filterHref(current: Search, key: keyof Search, value: string): string {
  const next = { ...current };
  if (next[key] === value) delete next[key];
  else next[key] = value;
  const search = new URLSearchParams(
    Object.entries(next).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString();
  return search ? `/jobs?${search}` : "/jobs";
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;

  let jobs: PublicJob[] = [];
  let failed = false;
  try {
    jobs = (await listPublicJobs(params)).data;
  } catch {
    // The board is a public page; a backend blip should degrade it, not 500 it.
    failed = true;
  }

  const filtered = Boolean(params.q || params.location || params.seniority || params.work_mode);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Open roles</h1>
      <p className="mt-2 text-text-muted">
        Every posting here comes from the employer who owns it.
      </p>

      <form action="/jobs" className="mt-8 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="q">
          Search roles
        </label>
        <input
          id="q"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search by title or skill…"
          className="min-w-0 flex-1 rounded-[var(--radius-base)] border border-border bg-surface px-3 py-2 text-sm"
        />
        <label className="sr-only" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          defaultValue={params.location ?? ""}
          placeholder="Location"
          className="w-40 rounded-[var(--radius-base)] border border-border bg-surface px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-[var(--radius-base)] bg-primary px-4 py-2 text-sm font-medium text-primary-fg"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SENIORITIES.map((value) => (
          <Link
            key={value}
            href={filterHref(params, "seniority", value)}
            aria-current={params.seniority === value ? "true" : undefined}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              params.seniority === value
                ? "border-border-strong bg-surface-raised font-medium"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            {value}
          </Link>
        ))}
        {WORK_MODES.map((value) => (
          <Link
            key={value}
            href={filterHref(params, "work_mode", value)}
            aria-current={params.work_mode === value ? "true" : undefined}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              params.work_mode === value
                ? "border-border-strong bg-surface-raised font-medium"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            {value}
          </Link>
        ))}
      </div>

      {failed && (
        <div role="status" className="mt-8">
          <EmptyState
            title="Couldn't load roles just now"
            description="The listings service didn't respond. Refresh in a moment — nothing is wrong with your account."
          />
        </div>
      )}

      {!failed && jobs.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title={filtered ? "No roles match those filters" : "No roles posted yet"}
            description={
              filtered
                ? "Try widening the search, or clear the filters to see everything."
                : "The board fills up as employers publish roles. Meanwhile you can still tailor your CV against any job description you paste in."
            }
            action={
              filtered ? (
                <Link href="/jobs" className="text-sm text-primary underline underline-offset-4">
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <p className="mt-8 text-sm text-text-subtle">
            {jobs.length} open role{jobs.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-3 divide-y divide-border rounded-[var(--radius-base)] border border-border bg-surface">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.slug}`} className="block px-4 py-4 hover:bg-surface-raised">
                  <p className="font-medium">{job.title}</p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    {job.company?.name ?? "Confidential"}
                    {job.location && ` · ${job.location}`}
                    {job.work_mode && ` · ${job.work_mode}`}
                    {salary(job) && ` · ${salary(job)}`}
                  </p>
                  {job.must_have_skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.must_have_skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border px-2 py-0.5 text-xs text-text-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
