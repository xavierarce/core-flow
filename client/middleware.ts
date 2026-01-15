import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define routes that should be PUBLIC (accessible without login)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)", // ⚠️ Critical: Allow access to login page
  "/sign-up(.*)", // ⚠️ Critical: Allow access to register page
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the route is NOT public, force the user to log in
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
