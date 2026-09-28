import { describe, expect, it } from "vitest";
import { buildJobPostingJsonLd } from "@/lib/seo/job-posting";
import type { PublicJob } from "@/lib/api/public";

const base: PublicJob = {
  id: "1",
  slug: "backend-engineer",
  title: "Backend Engineer",
  seniority: "mid",
  employment_type: "full_time",
  work_mode: "onsite",
  location: "Dhaka",
  salary_min: 80000,
  salary_max: 120000,
  currency: "BDT",
  min_years: 3,
  must_have_skills: ["python"],
  nice_to_have_skills: [],
  responsibilities: ["Build APIs"],
  requirements: [{ text: "3 years Python", type: "must", skill: "python", years: 3 }],
  benefits: [],
  team_context: "Small backend team",
  published_at: "2026-09-01T00:00:00Z",
  closes_at: "2026-12-01T00:00:00Z",
  status: "published",
  company: { name: "Autofy Solution", slug: "autofy", website: "https://autofybit.tech" },
};

describe("JobPosting JSON-LD", () => {
  it("emits the properties Google Jobs requires", () => {
    const ld = buildJobPostingJsonLd(base, "https://x.dev/jobs/backend-engineer");
    expect(ld["@type"]).toBe("JobPosting");
    for (const key of ["title", "description", "datePosted", "hiringOrganization"]) {
      expect(ld).toHaveProperty(key);
    }
    expect(ld.hiringOrganization).toMatchObject({ name: "Autofy Solution" });
  });

  it("maps employment type to the schema.org vocabulary", () => {
    expect(buildJobPostingJsonLd(base, "u").employmentType).toBe("FULL_TIME");
  });

  it("emits validThrough so the posting expires rather than going stale", () => {
    expect(buildJobPostingJsonLd(base, "u").validThrough).toBe("2026-12-01T00:00:00Z");
  });

  it("omits validThrough entirely when there is no closing date", () => {
    const ld = buildJobPostingJsonLd({ ...base, closes_at: null }, "u");
    expect(ld).not.toHaveProperty("validThrough");
  });

  it("marks a remote role as TELECOMMUTE rather than inventing a place", () => {
    const ld = buildJobPostingJsonLd({ ...base, work_mode: "remote" }, "u");
    expect(ld.jobLocationType).toBe("TELECOMMUTE");
    expect(ld).not.toHaveProperty("jobLocation");
  });

  it("omits salary entirely when it was not stated", () => {
    const ld = buildJobPostingJsonLd({ ...base, salary_min: null, currency: null }, "u");
    expect(ld).not.toHaveProperty("baseSalary");
  });

  it("builds a description from the real content, never an empty string", () => {
    const ld = buildJobPostingJsonLd(base, "u");
    expect(ld.description).toContain("Build APIs");
    expect(ld.description).toContain("3 years Python");
  });
});
