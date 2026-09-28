import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicJob, listJobSlugs, type PublicJob } from "@/lib/api/public";
import { buildJobPostingJsonLd } from "@/lib/seo/job-posting";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateStaticParams() {
  try {
    const { data } = await listJobSlugs();
    return data.map((job) => ({ slug: job.slug }));
  } catch {
    // A build must not fail because the API is briefly unavailable; pages fall back to ISR.
    return [];
  }
}

async function load(slug: string): Promise<PublicJob> {
  try {
    return await getPublicJob(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await load(slug);
  const company = job.company?.name ?? "a company";
  const where = job.work_mode === "remote" ? "Remote" : (job.location ?? "");

  return {
    title: `${job.title} at ${company}`,
    description: `${job.title} — ${company}${where ? ` · ${where}` : ""}. Apply with a CV tailored to this role.`,
    alternates: { canonical: `${SITE}/jobs/${slug}` },
    openGraph: {
      title: `${job.title} at ${company}`,
      description: where ? `${where} · ${job.employment_type ?? "Full time"}` : company,
      url: `${SITE}/jobs/${slug}`,
      type: "website",
    },
    // A closed role stays indexed but should stop attracting new applicants.
    robots: job.status === "closed" ? { index: false, follow: true } : undefined,
  };
}

function formatSalary(job: PublicJob): string | null {
  if (!job.salary_min || !job.currency) return null;
  const fmt = (v: number) => new Intl.NumberFormat("en-US").format(v);
  return job.salary_max
    ? `${job.currency} ${fmt(job.salary_min)}–${fmt(job.salary_max)} / month`
    : `${job.currency} ${fmt(job.salary_min)}+ / month`;
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await load(slug);
  const closed = job.status === "closed";
  const salary = formatSalary(job);

  const must = job.requirements.filter((r) => r.type === "must");
  const nice = job.requirements.filter((r) => r.type === "nice");

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJobPostingJsonLd(job, `${SITE}/jobs/${slug}`)),
        }}
      />

      {closed && (
        // Never 404 a URL Google has indexed: it loses the ranking and dead-ends anyone
        // who saved the link.
        <div role="status" className="mb-6 rounded-[var(--radius-base)] bg-surface-raised p-4">
          <p className="font-medium">This role is closed</p>
          <p className="mt-1 text-sm text-text-muted">
            It&apos;s no longer accepting applications.{" "}
            <Link href="/jobs" className="underline underline-offset-4">
              Browse open roles
            </Link>
            .
          </p>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
        <p className="mt-2 text-text-muted">
          {job.company ? (
            <Link href={`/companies/${job.company.slug}`} className="hover:text-text">
              {job.company.name}
            </Link>
          ) : (
            "Confidential"
          )}
          {job.location && ` · ${job.location}`}
          {job.work_mode && ` · ${job.work_mode}`}
        </p>
        {salary && <p className="mt-1 text-sm text-text-muted">{salary}</p>}
      </header>

      {!closed && (
        <div className="mt-6">
          <Link href={`/sign-up?redirect=/jobs/${slug}`}>
            <Button size="lg">Apply with a tailored CV</Button>
          </Link>
          <p className="mt-2 text-sm text-text-subtle">
            We rewrite your CV for this role using only what&apos;s already in your profile.
          </p>
        </div>
      )}

      <div className="prose-reading mt-10 space-y-8">
        {job.team_context && (
          <section>
            <h2 className="text-lg font-semibold">About the role</h2>
            <p className="mt-2 text-text-muted">{job.team_context}</p>
          </section>
        )}

        {job.responsibilities.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">What you&apos;ll do</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-text-muted">
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {must.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Required</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-text-muted">
              {must.map((r) => (
                <li key={r.text}>{r.text}</li>
              ))}
            </ul>
          </section>
        )}

        {nice.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Nice to have</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-text-muted">
              {nice.map((r) => (
                <li key={r.text}>{r.text}</li>
              ))}
            </ul>
          </section>
        )}

        {job.benefits.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Benefits</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-text-muted">
              {job.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
