import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a new Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      persistSession: false,
    },
  },
)

// Update the POST function to handle gender
export async function POST(request: Request) {
  try {
    const { userId, firstName, lastName, email, university, year, gender } = await request.json()

    if (!userId || !firstName || !lastName || !email || !university || !year || !gender) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get university ID from name
    const { data: universityData, error: universityError } = await supabaseAdmin
      .from("universities")
      .select("id")
      .eq("name", university)
      .single()

    if (universityError) {
      console.error("Error fetching university:", universityError)
      return NextResponse.json({ success: false, error: "University not found" }, { status: 404 })
    }

    // Check if profile already exists to avoid duplicate creation attempts
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (existingProfile) {
      // Profile already exists, return success
      return NextResponse.json({
        success: true,
        message: "Profile already exists",
        profile: existingProfile,
      })
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        university_id: universityData.id,
        year: year,
        gender: gender,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (profileError) {
      console.error("Error creating profile:", profileError)

      // If the error is a foreign key constraint violation, provide a more helpful message
      if (profileError.message.includes("foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "User account is still being created. Please try logging in instead.",
          },
          { status: 409 },
        )
      }

      // Improved error message for duplicate email
      if (profileError.message.includes("duplicate key") || profileError.message.includes("profiles_email_key")) {
        return NextResponse.json(
          {
            success: false,
            error: "This email is already taken! Please use a different email address.",
          },
          { status: 409 },
        )
      }

      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
    }

    // Create default privacy settings
    const { error: privacyError } = await supabaseAdmin.from("privacy_settings").insert({
      user_id: userId,
      show_email: false,
      show_phone: false,
      show_social_media: false,
      updated_at: new Date().toISOString(),
    })

    if (privacyError) {
      console.error("Error creating privacy settings:", privacyError)
      // Continue anyway as this is not critical
    }

    return NextResponse.json({
      success: true,
      message: "Profile created successfully",
      profile: profileData[0],
    })
  } catch (error) {
    console.error("Error in create-profile API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
