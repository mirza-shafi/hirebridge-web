/**
 * Local demo mode.
 *
 * When `NEXT_PUBLIC_DEV_AUTH` is on, the app runs with no Clerk account: no provider, no
 * middleware, and a fixed bearer token the API recognises. The API refuses the matching
 * flag unless `ENVIRONMENT=local`, so this cannot be switched on in a deployment by
 * setting one variable.
 */
export const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";
export const DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_AUTH_TOKEN ?? "dev-token";
