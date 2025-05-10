import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Check if we're already on the auth page to prevent redirect loops
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

  try {
    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Handle authentication for protected routes
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!session) {
        // Create a URL for the auth page WITHOUT an error parameter
        // This prevents the annoying error message
        const redirectUrl = new URL("/auth", req.url)

        // Only add error param for actual expired sessions, not just missing sessions
        // This helps prevent the constant error messages
        if (req.cookies.has("sb-access-token") || req.cookies.has("sb-refresh-token")) {
          redirectUrl.searchParams.set("error", "session_expired")
        }

        return NextResponse.redirect(redirectUrl)
      }

      // Session exists, allow access to dashboard
      return res
    }

    // For auth page, if user is already logged in, redirect to dashboard
    if (isAuthPage && session) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("[MIDDLEWARE] Error:", error)

    // Don't redirect if already on auth page
    if (isAuthPage) {
      return res
    }

    // For protected routes, redirect to auth without error message
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth", req.url))
    }

    return res
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
