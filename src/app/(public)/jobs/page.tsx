import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Open roles on HireBridge.",
};

// ISR — the board is a crawlable surface, not a client-fetched list.
export const revalidate = 60;

export default function JobsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Open roles</h1>
      <p className="mt-2 text-text-muted">
        Every posting here comes from the employer who owns it.
      </p>

      <div className="mt-8">
        <EmptyState
          title="No jobs posted yet"
          description="The board fills up as employers publish roles. Meanwhile, you can still tailor your CV and run a mock interview against any job description you paste in."
        />
      </div>
    </main>
  );
}
