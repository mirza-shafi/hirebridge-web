import "server-only";

import { auth } from "@clerk/nextjs/server";
import { apiFetch, type RequestOptions } from "@/lib/api/client";

/** Authenticated fetch from a Server Component or Route Handler. */
export async function serverFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { getToken } = await auth();
  return apiFetch<T>(path, { ...options, token: await getToken() });
}

/**
 * Unauthenticated fetch for the public, cacheable surface (/jobs, /jobs/[slug]).
 * Kept separate so an auth token can never accidentally end up in a cached response.
 */
export async function publicFetch<T>(path: string, revalidate = 60): Promise<T> {
  return apiFetch<T>(path, { next: { revalidate } } as RequestOptions);
}
