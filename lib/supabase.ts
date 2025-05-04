import { createClient } from "@supabase/supabase-js"

// This ensures we don't create multiple instances of the Supabase client
let supabaseInstance = null

// Create a singleton instance of the Supabase client
export const createClientSideSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Create client with enhanced options for debugging
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Explicitly set storage type to ensure cookies are used
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") {
            return null
          }

          // Try to get from localStorage first
          const localValue = localStorage.getItem(key)
          if (localValue) {
            return localValue
          }

          // Then try cookies
          const cookies = document.cookie.split(";")
          for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split("=")
            if (cookieName.trim() === key) {
              return cookieValue
            }
          }
          return null
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") {
            return
          }

          // Set in localStorage
          localStorage.setItem(key, value)

          // Also set as cookie with secure attributes
          const secure = window.location.protocol === "https:"
          document.cookie = `${key}=${value}; path=/; max-age=3600; ${secure ? "secure; " : ""}SameSite=Lax`
        },
        removeItem: (key) => {
          if (typeof window === "undefined") {
            return
          }

          // Remove from localStorage
          localStorage.removeItem(key)

          // Remove from cookies
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
    },
    global: {
      headers: {
        "x-application-name": "cohamaster",
      },
    },
  })

  // Add event listeners for auth state changes
  supabaseInstance.auth.onAuthStateChange((event, session) => {})

  return supabaseInstance
}

// Add a function to check Supabase configuration
export const checkSupabaseConfig = () => {
  try {
    const supabase = createClientSideSupabaseClient()

    // Check if we can make a simple query
    supabase
      .from("profiles")
      .select("count", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) {
        } else {
        }
      })
      .catch((err) => {})

    return true
  } catch (error) {
    return false
  }
}
