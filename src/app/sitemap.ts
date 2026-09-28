import type { MetadataRoute } from "next";
import { listJobSlugs } from "@/lib/api/public";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/jobs`, changeFrequency: "hourly", priority: 0.9 },
  ];

  try {
    const { data } = await listJobSlugs();
    return [
      ...base,
      ...data
        // A closed role stays reachable but should not be advertised for crawling.
        .filter((job) => job.status === "published")
        .map((job) => ({
          url: `${SITE}/jobs/${job.slug}`,
          lastModified: job.published_at ? new Date(job.published_at) : undefined,
          changeFrequency: "daily" as const,
          priority: 0.8,
        })),
    ];
  } catch {
    return base;
  }
}
