"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AsyncRunStatus } from "@/components/shared/async-run-status";
import { RedFlagPanel, type RedFlag } from "@/components/employer/red-flag-panel";
import { Button } from "@/components/ui/button";
import { useAgentRun } from "@/lib/hooks/use-agent-run";
import { useApi } from "@/lib/api/use-api";

interface CreatedJob {
  job_id: string;
  run_id: string;
}

interface JobDraft {
  id: string;
  title: string;
  seniority: string | null;
  must_have_skills: string[];
  nice_to_have_skills: string[];
  red_flags: RedFlag[];
}

export default function NewJobPage() {
  const api = useApi();
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [draft, setDraft] = useState<JobDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useAgentRun(runId);

  useEffect(() => {
    if (run.status !== "succeeded" || !jobId || draft) return;
    void api<JobDraft[]>("/v1/jobs").then((jobs) => {
      const found = jobs.find((j) => j.id === jobId);
      if (found) setDraft(found);
    });
  }, [run.status, jobId, draft, api]);

  const unresolved = (draft?.red_flags ?? []).filter((f) => !f.resolved).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Post a role</h1>
      <p className="mt-2 text-text-muted">
        Paste the job description. We&apos;ll structure it, flag anything that could exclude
        qualified candidates, and give you a page to share.
      </p>

      {!runId && (
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            try {
              const created = await api<CreatedJob>("/v1/jobs", {
                method: "POST",
                body: { description_raw: description },
                idempotencyKey: crypto.randomUUID(),
              });
              setJobId(created.job_id);
              setRunId(created.run_id);
            } catch {
              setError("We couldn't start processing that. Try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor="jd" className="block text-sm font-medium">
            Job description
          </label>
          <textarea
            id="jd"
            required
            minLength={50}
            rows={14}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Paste the whole posting — responsibilities, requirements, benefits…"
            className="w-full rounded-[var(--radius-base)] border border-border bg-surface p-3 text-sm"
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy || description.length < 50}>
            {busy ? "Starting…" : "Process description"}
          </Button>
        </form>
      )}

      {(run.status === "queued" || run.status === "running") && (
        <div className="mt-8">
          <AsyncRunStatus run={run} />
        </div>
      )}

      {draft && (
        <div className="mt-8 space-y-6">
          <section className="rounded-[var(--radius-base)] border border-border bg-surface p-4">
            <h2 className="font-medium">What we understood</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-text-subtle">Title</dt>
                <dd>{draft.title}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-text-subtle">Seniority</dt>
                <dd>{draft.seniority ?? "not stated"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-text-subtle">Must have</dt>
                <dd>{draft.must_have_skills.join(", ") || "none identified"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-text-subtle">Nice to have</dt>
                <dd>{draft.nice_to_have_skills.join(", ") || "none identified"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-text-subtle">
              The must-have list drives ranking. If something here is wrong, fix it before
              publishing — it decides who gets surfaced.
            </p>
          </section>

          <RedFlagPanel
            flags={draft.red_flags}
            resolving={busy}
            onResolve={async (index) => {
              setBusy(true);
              await api(`/v1/jobs/${draft.id}/red-flags/resolve`, {
                method: "POST",
                body: { index, resolved: true },
              });
              setDraft({
                ...draft,
                red_flags: draft.red_flags.map((f, i) =>
                  i === index ? { ...f, resolved: true } : f,
                ),
              });
              setBusy(false);
            }}
          />

          <div className="flex items-center gap-3">
            <Button
              disabled={busy || unresolved > 0}
              onClick={async () => {
                setBusy(true);
                try {
                  await api(`/v1/jobs/${draft.id}/publish`, { method: "POST" });
                  router.push(`/hr/jobs/${draft.id}/applicants`);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Publish
            </Button>
            {unresolved > 0 && (
              <p className="text-sm text-warning">
                Review {unresolved} flagged phrase{unresolved === 1 ? "" : "s"} first.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
