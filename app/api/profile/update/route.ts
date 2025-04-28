import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get the user's session from cookies
    const cookieStore = cookies()
    const supabaseUrl = process.env.SUPABASE_URL as string
    const supabaseKey = process.env.SUPABASE_ANON_KEY as string

    // Log the cookies for debugging
    console.log(
      "Cookies in profile update API:",
      cookieStore.getAll().map((c) => c.name),
    )

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
      console.error("Session error in profile update API:", sessionError)
      return NextResponse.json({ success: false, error: "Session error" }, { status: 500 })
    }

    if (!session) {
      console.log("No session found in profile update API")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    console.log("Session found in profile update API, user ID:", session.user.id)

    const userId = session.user.id
    const { profileData, preferencesData, privacyData } = await request.json()

    // Update profile if provided
    let profileResult = null
    if (profileData) {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          major: profileData.major,
          year: profileData.year,
          bio: profileData.bio,
          phone: profileData.phone,
          instagram: profileData.instagram,
          twitter: profileData.twitter,
          avatar_url: profileData.avatarUrl, // Include avatar URL in the update
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()

      if (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      profileResult = data[0]
    }

    // Update preferences if provided
    let preferencesResult = null
    if (preferencesData) {
      // Check if preferences exist
      const { data: existingPrefs, error: checkError } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking preferences:", checkError)
        return NextResponse.json({ success: false, error: checkError.message }, { status: 500 })
      }

      const prefsToSave = {
        user_id: userId,
        sleep_schedule: preferencesData.sleepSchedule,
        study_preference: preferencesData.studyPreference,
        cleanliness: preferencesData.cleanliness,
        guests_frequency: preferencesData.guestsFrequency,
        noise_tolerance: preferencesData.noiseTolerance,
        sharing_comfort: preferencesData.sharingComfort,
        schedule_type: preferencesData.scheduleType,
        overnight_guests: preferencesData.overnightGuests,
        temperature_preference: preferencesData.temperaturePreference,
        conflict_resolution: preferencesData.conflictResolution,
        updated_at: new Date().toISOString(),
      }

      let data, error
      if (existingPrefs) {
        // Update existing preferences
        ;({ data, error } = await supabase
          .from("user_preferences")
          .update(prefsToSave)
          .eq("id", existingPrefs.id)
          .select())
      } else {
        // Insert new preferences
        ;({ data, error } = await supabase
          .from("user_preferences")
          .insert({
            ...prefsToSave,
            created_at: new Date().toISOString(),
          })
          .select())
      }

      if (error) {
        console.error("Error updating preferences:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      preferencesResult = data[0]
    }

    // Update privacy settings if provided
    let privacyResult = null
    if (privacyData) {
      // Check if privacy settings exist
      const { data: existingSettings, error: checkError } = await supabase
        .from("privacy_settings")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking privacy settings:", checkError)
        return NextResponse.json({ success: false, error: checkError.message }, { status: 500 })
      }

      const settingsToSave = {
        show_email: privacyData.showEmail,
        show_phone: privacyData.showPhone,
        show_social_media: privacyData.showSocialMedia,
        updated_at: new Date().toISOString(),
      }

      let data, error
      if (existingSettings) {
        // Update existing settings
        ;({ data, error } = await supabase
          .from("privacy_settings")
          .update(settingsToSave)
          .eq("user_id", userId)
          .select())
      } else {
        // Insert new settings
        ;({ data, error } = await supabase
          .from("privacy_settings")
          .insert({
            user_id: userId,
            ...settingsToSave,
          })
          .select())
      }

      if (error) {
        console.error("Error updating privacy settings:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      privacyResult = data[0]
    }

    return NextResponse.json({
      success: true,
      profile: profileResult,
      preferences: preferencesResult,
      privacySettings: privacyResult,
    })
  } catch (error) {
    console.error("Error in profile update API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
