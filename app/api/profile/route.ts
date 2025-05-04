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

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json({ success: false, error: "Session error" }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        universities (
          name,
          location
        )
      `)
      .eq("id", userId)
      .single()

    if (profileError) {
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
    }

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (preferencesError && preferencesError.code !== "PGRST116") {
      // Continue anyway as this is not critical
    }

    // Get privacy settings
    const { data: privacySettings, error: privacyError } = await supabase
      .from("privacy_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (privacyError && privacyError.code !== "PGRST116") {
      // Continue anyway as this is not critical
    }

    return NextResponse.json({
      success: true,
      profile,
      preferences: preferences || null,
      privacySettings: privacySettings || null,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
