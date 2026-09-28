import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/**
 * Two distinct audience paths above the fold — a merged pitch serves neither
 * (docs/02-routes-and-screens.md).
 */
export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <header className="mb-16 flex items-center justify-between">
        <span className="text-lg font-semibold">HireBridge</span>
        <nav className="flex items-center gap-2">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">
              Browse jobs
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        A CV written for the job. An interview you&apos;ve already had once.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-text-muted">
        HireBridge tailors your CV to each role using only what&apos;s already true about you, and
        gives employers a ranked shortlist that explains itself.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <section className="rounded-[var(--radius-base)] border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold">Find your next role</h2>
          <p className="mt-2 text-sm text-text-muted">
            Tailored CV per application, a mock interview for the exact job, and feedback you can
            act on before the real thing.
          </p>
          <Link href="/sign-up" className="mt-6 inline-block">
            <Button>Get started free</Button>
          </Link>
        </section>

        <section className="rounded-[var(--radius-base)] border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold">Hire faster</h2>
          <p className="mt-2 text-sm text-text-muted">
            400 applications become a reviewed shortlist in under 30 minutes — every candidate
            still visible, every score explained with evidence.
          </p>
          <Link href="/sign-up" className="mt-6 inline-block">
            <Button variant="secondary">Post a job</Button>
          </Link>
        </section>
      </div>
    </main>
  );
}
