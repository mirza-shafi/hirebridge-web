import type { PublicJob } from "@/lib/api/public";

/**
 * schema.org JobPosting.
 *
 * Google Jobs will not surface a posting without this, and it is the whole reason the job
 * pages are server-rendered. Required properties are `title`, `description`, `datePosted`
 * and `hiringOrganization`; omitting `validThrough` makes a posting go stale rather than
 * expire, so it is always emitted when we know it.
 *
 * The return type is declared rather than inferred: conditional spreads infer a union, and
 * a union type means callers cannot read the optional properties at all.
 */
export interface JobPostingJsonLd {
  "@context": "https://schema.org";
  "@type": "JobPosting";
  title: string;
  description: string;
  datePosted: string | null;
  url: string;
  hiringOrganization: { "@type": "Organization"; name: string; sameAs?: string };
  validThrough?: string;
  employmentType?: string;
  jobLocationType?: "TELECOMMUTE";
  jobLocation?: {
    "@type": "Place";
    address: { "@type": "PostalAddress"; addressLocality: string };
  };
  baseSalary?: {
    "@type": "MonetaryAmount";
    currency: string;
    value: {
      "@type": "QuantitativeValue";
      minValue: number;
      maxValue?: number;
      unitText: string;
    };
  };
  experienceRequirements?: string;
}

const EMPLOYMENT_TYPES: Record<string, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
};

export function buildJobPostingJsonLd(job: PublicJob, url: string): JobPostingJsonLd {
  const description =
    [
      job.team_context,
      job.responsibilities.length ? `Responsibilities: ${job.responsibilities.join(". ")}` : null,
      job.requirements.length
        ? `Requirements: ${job.requirements.map((r) => r.text).join(". ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n") || job.title;

  const ld: JobPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: job.published_at,
    url,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company?.name ?? "Confidential",
      ...(job.company?.website ? { sameAs: job.company.website } : {}),
    },
  };

  if (job.closes_at) ld.validThrough = job.closes_at;

  const employmentType = job.employment_type ? EMPLOYMENT_TYPES[job.employment_type] : undefined;
  if (employmentType) ld.employmentType = employmentType;

  if (job.work_mode === "remote") {
    ld.jobLocationType = "TELECOMMUTE";
  } else if (job.location) {
    ld.jobLocation = {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location },
    };
  }

  if (job.salary_min && job.currency) {
    ld.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary_min,
        ...(job.salary_max ? { maxValue: job.salary_max } : {}),
        unitText: "MONTH",
      },
    };
  }

  if (job.min_years) ld.experienceRequirements = `${job.min_years} years`;

  return ld;
}
