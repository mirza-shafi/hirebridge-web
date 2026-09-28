import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-text-muted">That page doesn&apos;t exist, or it has moved.</p>
      <Link href="/" className="text-primary underline underline-offset-4">
        Back to home
      </Link>
    </main>
  );
}
