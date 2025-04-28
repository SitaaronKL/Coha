import { createClientSideSupabaseClient } from "./supabase"

export async function getUserMatches(userId: string, status = "all") {
  const supabase = createClientSideSupabaseClient()

  let query = supabase
    .from("matches")
    .select(`
      id,
      compatibility_score,
      status,
      user_1_action,
      user_2_action,
      created_at,
      profiles!matches_user_id_1_fkey (
        id,
        first_name,
        last_name,
        major,
        year,
        bio,
        avatar_url,
        universities (
          name
        )
      ),
      profiles!matches_user_id_2_fkey (
        id,
        first_name,
        last_name,
        major,
        year,
        bio,
        avatar_url,
        universities (
          name
        )
      )
    `)
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) throw error

  // Transform the data to make it easier to work with
  const transformedMatches = data.map((match) => {
    const isUser1 = match.profiles.id === userId
    const otherUser = isUser1 ? match.profiles1 : match.profiles
    const userAction = isUser1 ? match.user_1_action : match.user_2_action
    const otherUserAction = isUser1 ? match.user_2_action : match.user_1_action

    return {
      id: match.id,
      compatibilityScore: match.compatibility_score,
      status: match.status,
      userAction,
      otherUserAction,
      createdAt: match.created_at,
      otherUser: {
        id: otherUser.id,
        firstName: otherUser.first_name,
        lastName: otherUser.last_name,
        major: otherUser.major,
        year: otherUser.year,
        bio: otherUser.bio,
        avatarUrl: otherUser.avatar_url,
        university: otherUser.universities?.name,
      },
    }
  })

  return transformedMatches
}

export async function updateMatchAction(matchId: string, userId: string, action: "liked" | "passed") {
  const supabase = createClientSideSupabaseClient()

  // First, get the match to determine if user is user_id_1 or user_id_2
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("user_id_1, user_id_2, user_1_action, user_2_action")
    .eq("id", matchId)
    .single()

  if (matchError) throw matchError

  const isUser1 = match.user_id_1 === userId
  const userField = isUser1 ? "user_1_action" : "user_2_action"
  const otherUserAction = isUser1 ? match.user_2_action : match.user_1_action

  // Determine new status
  let newStatus = "pending"
  if (action === "liked" && otherUserAction === "liked") {
    newStatus = "accepted"
  } else if (action === "passed" || otherUserAction === "passed") {
    newStatus = "rejected"
  }

  // Update the match
  const { data, error } = await supabase
    .from("matches")
    .update({
      [userField]: action,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select()

  if (error) throw error

  return data
}
