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
      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
    }

    // Get housing deadlines for the user's university
    const { data: deadlines, error: deadlinesError } = await supabase
      .from("housing_deadlines")
      .select("*")
      .eq("university_id", profile.university_id)
      .order("deadline_date", { ascending: true })

    if (deadlinesError) {
      console.error("Error fetching deadlines:", deadlinesError)
      // Continue anyway as this is not critical
    }

    // Get matches (for now, we'll return an empty array as requested)
    // In a real implementation, we would fetch actual matches from the database
    const matches = []

    return NextResponse.json({
      success: true,
      profile,
      deadlines: deadlines || [],
      matches,
    })
  } catch (error) {
    console.error("Error in dashboard API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
