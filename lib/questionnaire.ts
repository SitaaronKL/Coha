import { saveUserPreferences } from "./preferences"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function submitQuestionnaire(userId: string, answers: Record<number, string>) {
  // Map the questionnaire answers to user preferences
  const preferences = {
    sleepSchedule: mapSleepSchedule(answers[1]),
    socialRoomPreference: mapSocialRoomPreference(answers[2]),
    overnightGuests: mapOvernightGuests(answers[3]),
    sharingComfort: mapSharingComfort(answers[4]),
    cleanliness: mapCleanliness(answers[5]),
    temperaturePreference: mapTemperaturePreference(answers[6]),
    eatingInRoom: mapEatingInRoom(answers[7]),
    noiseTolerance: mapNoiseTolerance(answers[8]),
    mbtiPersonality: answers[9], // Direct mapping for MBTI
  }

  // Save the preferences to the database
  return await saveUserPreferences(userId, preferences)
}

// New function to save question rankings
export async function saveQuestionRankings(
  userId: string,
  rankings: Array<{ id: number; question: string; rank: number }>,
) {
  try {
    // First delete any existing rankings for this user
    await supabase.from("question_rankings").delete().eq("user_id", userId)

    // Insert the new rankings
    const { error } = await supabase.from("question_rankings").insert(
      rankings.map((item) => ({
        user_id: userId,
        question_id: item.id,
        question_text: item.question,
        rank_order: item.rank,
      })),
    )

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error saving question rankings:", error)
    throw error
  }
}

// Helper functions to map questionnaire answers to preference values
function mapSleepSchedule(answer: string) {
  const map = {
    a: "early_bird",
    b: "night_owl",
    c: "unpredictable",
  }
  return map[answer]
}

function mapSocialRoomPreference(answer: string) {
  const map = {
    a: "extrovert",
    b: "balanced",
    c: "introvert",
  }
  return map[answer]
}

function mapOvernightGuests(answer: string) {
  const map = {
    a: "comfortable",
    b: "not_comfortable",
    c: "when_absent",
  }
  return map[answer]
}

function mapSharingComfort(answer: string) {
  const map = {
    a: "share_all",
    b: "share_clothing",
    c: "share_food",
    d: "no_sharing",
  }
  return map[answer]
}

function mapCleanliness(answer: string) {
  const map = {
    a: "very_neat",
    b: "somewhat_messy",
  }
  return map[answer]
}

function mapTemperaturePreference(answer: string) {
  const map = {
    a: "cool",
    b: "moderate",
    c: "warm",
  }
  return map[answer]
}

function mapEatingInRoom(answer: string) {
  const map = {
    a: "never",
    b: "occasional",
    c: "frequently",
  }
  return map[answer]
}

function mapNoiseTolerance(answer: string) {
  const map = {
    a: "quiet",
    b: "moderate_daytime",
    c: "loud",
  }
  return map[answer]
}
