import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Set up your profile" };
export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Upload your CV",
    body: "PDF or DOCX. We turn it into a structured profile — the thing every other feature builds on.",
  },
  {
    title: "Check what we found",
    body: "You confirm anything we read with low confidence. This step decides the quality of every tailored CV and interview afterwards, so it isn't skippable.",
  },
  {
    title: "Tell us what you're looking for",
    body: "Target roles, location, and work mode.",
  },
] as const;

export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Set up your profile</h1>
      <p className="mt-2 text-text-muted">Three steps. You can stop and come back to it.</p>

      <ol className="mt-10 space-y-6">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-raised text-sm font-medium"
            >
              {index + 1}
            </span>
            <div>
              <h2 className="font-medium">{step.title}</h2>
              <p className="mt-1 text-sm text-text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Upload wiring lands in Phase 1 — see PROGRESS.md. */}
      <Button className="mt-10" disabled>
        Upload CV
      </Button>
    </main>
  );
}
