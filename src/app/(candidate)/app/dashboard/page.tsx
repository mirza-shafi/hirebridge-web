import { EmptyState } from "@/components/shared/empty-state";

export default function CandidateDashboard() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Your dashboard</h1>
      <div className="mt-8">
        <EmptyState
          title="Let&apos;s set up your profile"
          description="Upload your CV and we&apos;ll turn it into a structured profile. Everything else — tailoring, interviews, applications — builds on it."
        />
      </div>
    </main>
  );
}
