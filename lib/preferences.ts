import { createClientSideSupabaseClient } from "./supabase"

export async function saveUserPreferences(
  userId: string,
  preferences: {
    sleepSchedule?: string
    socialRoomPreference?: string
    cleanliness?: string
    overnightGuests?: string
    noiseTolerance?: string
    sharingComfort?: string
    temperaturePreference?: string
    eatingInRoom?: string
    mbtiPersonality?: string
  },
) {
  const supabase = createClientSideSupabaseClient()

  // Check if preferences already exist
  const { data: existingPrefs, error: checkError } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (checkError) throw checkError

  // Convert camelCase to snake_case for database
  const dbPreferences = {
    user_id: userId,
    sleep_schedule: preferences.sleepSchedule,
    social_room_preference: preferences.socialRoomPreference,
    cleanliness: preferences.cleanliness,
    overnight_guests: preferences.overnightGuests,
    noise_tolerance: preferences.noiseTolerance,
    sharing_comfort: preferences.sharingComfort,
    temperature_preference: preferences.temperaturePreference,
    eating_in_room: preferences.eatingInRoom,
    mbti_personality: preferences.mbtiPersonality,
    updated_at: new Date().toISOString(),
  }

  let data, error

  if (existingPrefs) {
    // Update existing preferences
    ;({ data, error } = await supabase
      .from("user_preferences")
      .update(dbPreferences)
      .eq("id", existingPrefs.id)
      .select())
  } else {
    // Insert new preferences
    ;({ data, error } = await supabase.from("user_preferences").insert(dbPreferences).select())
  }

  if (error) throw error

  return data
}

export async function getUserPreferences(userId: string) {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") throw error

  return data
}

// Function to check if user has completed their questionnaire
export async function hasCompletedQuestionnaire(userId: string) {
  try {
    const preferences = await getUserPreferences(userId)

    // If no preferences record exists, they haven't completed the questionnaire
    if (!preferences) return false

    // Check if essential preferences are filled out
    // We'll consider the questionnaire complete if at least 5 key preferences are set
    const essentialPreferences = [
      preferences.sleep_schedule,
      preferences.social_room_preference,
      preferences.cleanliness,
      preferences.noise_tolerance,
      preferences.sharing_comfort,
      preferences.overnight_guests,
      preferences.temperature_preference,
      preferences.eating_in_room,
      preferences.mbti_personality,
    ]

    const filledPreferences = essentialPreferences.filter((pref) => pref !== null && pref !== undefined && pref !== "")

    // Consider questionnaire complete if at least 5 preferences are filled
    return filledPreferences.length >= 5
  } catch (error) {
    return false
  }
}
