"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch, type RequestOptions } from "@/lib/api/client";
import { DEV_AUTH, DEV_TOKEN } from "@/lib/auth/dev";

/**
 * Authenticated client-side fetch.
 *
 * A 401 means the token we attached was stale. Clerk's `getToken({ skipCache: true })`
 * mints a fresh one; we retry exactly once and then send the user to sign-in
 * (docs/01-frontend-architecture.md §4). No refresh loop.
 */
export function useApi() {
  const getToken = useTokenSource();
  const router = useRouter();

  return useCallback(
    async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
      const token = await getToken();
      try {
        return await apiFetch<T>(path, { ...options, token });
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401 || DEV_AUTH) throw error;

        const fresh = await getToken(true);
        if (!fresh) {
          router.push("/sign-in");
          throw error;
        }
        try {
          return await apiFetch<T>(path, { ...options, token: fresh });
        } catch (retryError) {
          if (retryError instanceof ApiError && retryError.status === 401) {
            router.push("/sign-in");
          }
          throw retryError;
        }
      }
    },
    [getToken, router],
  );
}

/**
 * `useAuth` throws without a ClerkProvider above it, and demo mode deliberately has none.
 * The hook is still called unconditionally so hook order is identical in both modes.
 */
function useTokenSource(): (skipCache?: boolean) => Promise<string | null> {
  const auth = useAuth();
  return useCallback(
    async (skipCache = false) => {
      if (DEV_AUTH) return DEV_TOKEN;
      return auth.getToken({ skipCache });
    },
    [auth],
  );
}
