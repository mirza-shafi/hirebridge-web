import { EmptyState } from "@/components/shared/empty-state";

export default function EmployerDashboard() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Hiring dashboard</h1>
      <div className="mt-8">
        <EmptyState
          title="No open roles"
          description="Paste a job description and we&apos;ll structure it, flag anything that could exclude qualified candidates, and publish a page you can share."
        />
      </div>
    </main>
  );
}
