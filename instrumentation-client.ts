import * as Sentry from "@sentry/nextjs";

/**
 * Next.js loads this file for browser instrumentation.
 *
 * Do not import it from a client component instead: that resolves `@sentry/nextjs` to its
 * server entry and drags `@sentry/node` and OpenTelemetry into the browser bundle.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,
    beforeSend(event) {
      // CV content must never leave in an error payload.
      delete event.request?.data;
      return event;
    },
  });
}
