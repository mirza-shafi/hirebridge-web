import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  // Published jobs get appended here once /jobs/[slug] exists (Phase 1).
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/jobs`, changeFrequency: "hourly", priority: 0.9 },
  ];
}
