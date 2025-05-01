import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { user_id_1, user_id_2, compatibility_score, status = "pending" } = await request.json()

    // Validate required fields
    if (!user_id_1 || !user_id_2 || compatibility_score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: user_id_1, user_id_2, and compatibility_score are required" },
        { status: 400 },
      )
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Verify the current user has admin access or is one of the users
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if match already exists
    const { data: existingMatch, error: existingMatchError } = await supabase
      .from("matches")
      .select("*")
      .or(`user_id_1.eq.${user_id_1},user_id_2.eq.${user_id_1}`)
      .or(`user_id_1.eq.${user_id_2},user_id_2.eq.${user_id_2}`)
      .maybeSingle()

    if (existingMatchError) {
      console.error("Error checking for existing match:", existingMatchError)
      return NextResponse.json({ error: "Error checking for existing match" }, { status: 500 })
    }

    if (existingMatch) {
      return NextResponse.json(
        { error: "A match already exists between these users", match: existingMatch },
        { status: 409 },
      )
    }

    // Insert the new match
    const { data: match, error } = await supabase
      .from("matches")
      .insert({
        user_id_1,
        user_id_2,
        compatibility_score,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating match:", error)
      return NextResponse.json({ error: "Failed to create match" }, { status: 500 })
    }

    return NextResponse.json({ success: true, match }, { status: 201 })
  } catch (error) {
    console.error("Error in create match API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
