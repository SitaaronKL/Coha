import { createClientSideSupabaseClient } from "./supabase"

export async function getMatchMessages(matchId: string) {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      read,
      sender_id,
      profiles (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })

  if (error) throw error

  return data
}

export async function sendMessage(matchId: string, senderId: string, content: string) {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content,
    })
    .select()

  if (error) throw error

  return data
}

export async function markMessagesAsRead(matchId: string, userId: string) {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("match_id", matchId)
    .neq("sender_id", userId)
    .eq("read", false)

  if (error) throw error

  return data
}
