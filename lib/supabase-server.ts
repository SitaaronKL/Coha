import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a Supabase client for server components
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseKey = process.env.SUPABASE_ANON_KEY as string

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      cookieStore,
    },
  })
}
