import { createClientSideSupabaseClient } from "./supabase"

export async function signUp(
  email: string,
  password: string,
  userData: {
    firstName: string
    lastName: string
    university: string
  },
) {
  const supabase = createClientSideSupabaseClient()

  try {
    // 1. Create the user in Supabase Auth with explicit redirect URL
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      // Check for rate limiting error
      if (authError.message.includes("security purposes") || authError.message.includes("seconds")) {
        throw new Error("Too many signup attempts. Please wait 10 seconds before trying again.")
      }
      throw authError
    }

    if (!authData?.user) {
      throw new Error("Failed to create user account")
    }

    // Add a delay to ensure the auth user is fully committed to the database
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 2. Call the server API to create profile (bypasses RLS)
    const response = await fetch("/api/create-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: authData.user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: email,
        university: userData.university,
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      // Check for duplicate email error
      if (result.error && (result.error.includes("duplicate key") || result.error.includes("profiles_email_key"))) {
        throw new Error("This email is already taken! Please use a different email address.")
      }

      throw new Error(result.error || "Failed to create user profile")
    }

    return authData
  } catch (error) {
    console.error("SignUp function error:", error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  console.log("[AUTH] SignIn function called with email:", email)
  const supabase = createClientSideSupabaseClient()

  try {
    console.log("[AUTH] Calling supabase.auth.signInWithPassword")
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[AUTH] Supabase auth error:", error)
      throw error
    }

    if (!data || !data.session) {
      console.error("[AUTH] No session returned from Supabase")
      throw new Error("Authentication failed - no session returned")
    }

    console.log("[AUTH] Auth successful, session established")
    console.log("[AUTH] Session expires at:", new Date(data.session.expires_at * 1000).toISOString())
    console.log("[AUTH] User ID:", data.user.id)

    // Ensure the session is properly stored before redirecting
    await new Promise((resolve) => setTimeout(resolve, 500))

    return data
  } catch (error) {
    console.error("[AUTH] SignIn function error:", error)
    throw error
  }
}

export async function signOut() {
  console.log("[AUTH] SignOut function called")
  const supabase = createClientSideSupabaseClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[AUTH] SignOut error:", error)
      throw error
    }

    console.log("[AUTH] SignOut successful")

    // Use a hard redirect to auth page
    window.location.href = "/auth"
  } catch (error) {
    console.error("[AUTH] SignOut error:", error)
    throw error
  }
}

export async function getCurrentUser() {
  console.log("[AUTH] getCurrentUser called")
  const supabase = createClientSideSupabaseClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("[AUTH] getSession error:", error)
      throw error
    }

    console.log("[AUTH] Session check result:", session ? "Session found" : "No session")

    if (session) {
      console.log("[AUTH] Session expires at:", new Date(session.expires_at * 1000).toISOString())
    }

    return session?.user || null
  } catch (error) {
    console.error("[AUTH] getCurrentUser error:", error)
    throw error
  }
}

// Add a debug function to check session status
export async function debugAuthState() {
  console.log("[AUTH DEBUG] Starting auth state debug")
  const supabase = createClientSideSupabaseClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    console.log("[AUTH DEBUG] Session present:", !!session)
    console.log("[AUTH DEBUG] Session error:", error || "None")

    if (session) {
      console.log("[AUTH DEBUG] User ID:", session.user.id)
      console.log("[AUTH DEBUG] Session expires:", new Date(session.expires_at * 1000).toISOString())
      console.log("[AUTH DEBUG] Access token (first 10 chars):", session.access_token.substring(0, 10) + "...")

      // Check if we can refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      console.log("[AUTH DEBUG] Session refresh:", refreshError ? "Failed" : "Success")
      if (refreshError) {
        console.error("[AUTH DEBUG] Refresh error:", refreshError)
      }
    }

    // Check cookies
    console.log("[AUTH DEBUG] Document cookies present:", document.cookie.length > 0)

    return {
      hasSession: !!session,
      error: error || null,
    }
  } catch (error) {
    console.error("[AUTH DEBUG] Debug error:", error)
    return {
      hasSession: false,
      error,
    }
  }
}
