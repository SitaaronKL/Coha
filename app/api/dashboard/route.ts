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
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user profile with university info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        universities (
          id,
          name,
          location
        )
      `)
      .eq("id", userId)
      .single()

    if (profileError) {
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
    }

    // Fetch user's matches - first as user_id_1
    const { data: matchesAsUser1, error: matchesAsUser1Error } = await supabase
      .from("matches")
      .select(`
        *,
        matched_profile:user_id_2 (
          id,
          first_name,
          last_name,
          avatar_url,
          major,
          year,
          bio,
          email,
          phone,
          instagram,
          twitter
        )
      `)
      .eq("user_id_1", userId)
      .order("compatibility_score", { ascending: false })

    if (matchesAsUser1Error) {
      console.error("[API] Error fetching matches as user 1:", matchesAsUser1Error)
    }

    // Then, get matches where the user is user_id_2
    const { data: matchesAsUser2, error: matchesAsUser2Error } = await supabase
      .from("matches")
      .select(`
        *,
        matched_profile:user_id_1 (
          id,
          first_name,
          last_name,
          avatar_url,
          major,
          year,
          bio,
          email,
          phone,
          instagram,
          twitter
        )
      `)
      .eq("user_id_2", userId)
      .order("compatibility_score", { ascending: false })

    if (matchesAsUser2Error) {
      console.error("[API] Error fetching matches as user 2:", matchesAsUser2Error)
    }

    // Combine both sets of matches
    const allMatches = [...(matchesAsUser1 || []), ...(matchesAsUser2 || [])]

    // Check if user has preferences
    const { data: preferencesData, error: preferencesError } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", userId)
      .single()

    let hasPreferences = true
    if (preferencesError && preferencesError.code === "PGRST116") {
      // No preferences found
      hasPreferences = false
    } else if (preferencesError) {
      console.error("[API] Error checking preferences:", preferencesError)
      // Continue anyway, default is to assume they have preferences
    }

    // Get housing deadlines for the user's university
    const { data: deadlines, error: deadlinesError } = await supabase
      .from("housing_deadlines")
      .select("*")
      .eq("university_id", profile.university_id || "")
      .order("deadline_date", { ascending: true })

    if (deadlinesError) {
      console.error("[API] Error fetching deadlines:", deadlinesError)
      // Continue anyway as this is not critical
    }

    return NextResponse.json({
      success: true,
      profile,
      matches: allMatches || [],
      hasPreferences,
      deadlines: deadlines || [],
    })
  } catch (error) {
    console.error("[API] Dashboard data fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
