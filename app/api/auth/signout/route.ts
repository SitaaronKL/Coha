import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Get the user's session from cookies
    const cookieStore = cookies()
    const supabaseUrl = process.env.SUPABASE_URL as string
    const supabaseKey = process.env.SUPABASE_ANON_KEY as string

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        cookieStore,
      },
    })

    // Sign out the user
    await supabase.auth.signOut({ scope: "global" })

    // Clear all cookies related to authentication
    const allCookies = cookieStore.getAll()
    for (const cookie of allCookies) {
      if (
        cookie.name.includes("supabase") ||
        cookie.name.includes("auth") ||
        cookie.name.includes("sb-") ||
        cookie.name.includes("_auth")
      ) {
        cookieStore.delete(cookie.name)
      }
    }

    // Add cache control headers to prevent caching
    const response = NextResponse.redirect(new URL("/auth", request.url))
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.redirect(new URL("/auth?error=signout_failed", request.url))
  }
}
