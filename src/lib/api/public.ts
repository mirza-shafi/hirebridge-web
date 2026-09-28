import { apiFetch } from "@/lib/api/client";

export interface PublicCompany {
  name: string;
  slug: string;
  website: string | null;
}

export interface PublicRequirement {
  text: string;
  type: "must" | "nice";
  skill: string | null;
  years: number | null;
}

export interface PublicJob {
  id: string;
  slug: string;
  title: string;
  seniority: string | null;
  employment_type: string | null;
  work_mode: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  min_years: number | null;
  must_have_skills: string[];
  nice_to_have_skills: string[];
  responsibilities: string[];
  requirements: PublicRequirement[];
  benefits: string[];
  team_context: string | null;
  published_at: string | null;
  closes_at: string | null;
  status: "published" | "closed";
  company: PublicCompany | null;
}

/** Unauthenticated and cacheable — no token may ever reach these. */
export function getPublicJob(slug: string, revalidate = 300) {
  return apiFetch<PublicJob>(`/v1/public/jobs/${slug}`, {
    next: { revalidate },
  } as Parameters<typeof apiFetch>[1]);
}

export function listPublicJobs(
  params: Record<string, string | undefined> = {},
  revalidate = 60,
) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][],
  );
  return apiFetch<{ data: PublicJob[] }>(`/v1/public/jobs?${search}`, {
    next: { revalidate },
  } as Parameters<typeof apiFetch>[1]);
}

export function listJobSlugs() {
  return apiFetch<{ data: { slug: string; published_at: string | null; status: string }[] }>(
    "/v1/public/jobs-index",
    { next: { revalidate: 300 } } as Parameters<typeof apiFetch>[1],
  );
}
