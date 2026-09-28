import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { DEV_AUTH } from "@/lib/auth/dev";

/** Public routes stay crawlable — they are the growth engine. */
const isProtected = createRouteMatcher(["/app(.*)", "/hr(.*)", "/onboarding(.*)"]);

const clerk = clerkMiddleware(async (auth, request) => {
  if (isProtected(request)) {
    await auth.protect();
  }
});

// In demo mode there is no session to protect; everything is the one local identity.
export default DEV_AUTH ? () => NextResponse.next() : clerk;

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|png|svg|ico|webp|woff2?)).*)", "/(api|trpc)(.*)"],
};
