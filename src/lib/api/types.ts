/**
 * Types mirroring hirebridge-api/openapi.json.
 *
 * Hand-written for now. `npm run api:types` generates `schema.d.ts` from the committed
 * schema, and CI fails when the two drift — these stay as the readable surface the
 * components import.
 */

export type ValidatorStatus = "passed" | "passed_with_warnings" | "failed" | "not_required";

export type LineStatus = "unchanged" | "modified" | "reordered" | "removed" | "added";

export type ApplicationStage =
  | "new"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface DiffLine {
  line_id: string;
  section: string;
  status: LineStatus;
  base: string | null;
  tailored: string | null;
  source_fact_ids: string[];
}

export interface DiffSection {
  name: string;
  lines: DiffLine[];
}

export interface DiffSummary {
  added: number;
  modified: number;
  removed: number;
  reordered: number;
  unchanged: number;
}

export interface ValidatorFinding {
  check: string;
  severity: "hard" | "soft";
  line_id: string;
  message: string;
}

export interface ResumeDiff {
  sections: DiffSection[];
  summary: DiffSummary;
  validator_status: ValidatorStatus | null;
  validator_findings: ValidatorFinding[];
}

export interface MatchedRequirement {
  requirement: string;
  fact_id: string;
  evidence: string;
}

export interface ApplicationScore {
  composite: number;
  lexical: number;
  semantic: number;
  rules: number;
  justification: string | null;
  matched: MatchedRequirement[];
  missing: string[];
  scoring_version: number;
}

export interface ApplicantListItem {
  application_id: string;
  stage: ApplicationStage;
  applied_at: string;
  score: ApplicationScore | null;
}

export interface ApplicantList {
  total: number;
  ranked: boolean;
  data: ApplicantListItem[];
}

export interface ResumeVersionSummary {
  id: string;
  version: number;
  kind: "base" | "tailored";
  validator_status: ValidatorStatus | null;
  approved: boolean;
  target_job_id: string | null;
  created_at: string;
}

export interface AcceptedRun {
  run_id: string;
  status: string;
  poll: string;
  events: string;
}
