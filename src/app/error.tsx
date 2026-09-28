"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-text-muted">
        The page couldn&apos;t load. Try again, and if it keeps happening send us the reference below.
      </p>
      <Button onClick={reset} className="self-start">
        Try again
      </Button>
      {error.digest && (
        <details className="text-sm text-text-subtle">
          <summary className="cursor-pointer">Technical details</summary>
          <code className="mt-2 block font-mono text-xs">{error.digest}</code>
        </details>
      )}
    </main>
  );
}
