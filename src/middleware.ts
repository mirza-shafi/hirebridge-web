import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/** Public routes stay crawlable — they are the growth engine. */
const isProtected = createRouteMatcher(["/app(.*)", "/hr(.*)", "/onboarding(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtected(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|png|svg|ico|webp|woff2?)).*)", "/(api|trpc)(.*)"],
};
