import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("[MIDDLEWARE] Session error:", error)
  }

  // Prevent redirect loops - if we're already on the auth page with an error parameter, don't redirect again
  const isAuthPageWithError = req.nextUrl.pathname.startsWith("/auth") && req.nextUrl.searchParams.has("error")

  if (isAuthPageWithError) {
    return res
  }

  // Handle authentication for protected routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      // Create a URL for the auth page with an error parameter
      const redirectUrl = new URL("/auth", req.url)
      redirectUrl.searchParams.set("error", "session_expired")

      return NextResponse.redirect(redirectUrl)
    }

    // Session exists, allow access to dashboard

    // Add session user ID to headers for debugging
    res.headers.set("x-user-id", session.user.id)

    return res
  }

  // For auth page, if user is already logged in, redirect to dashboard
  if (req.nextUrl.pathname.startsWith("/auth") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

// Only run middleware on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
