"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientSideSupabaseClient } from "@/lib/supabase"
import type { Session, User } from "@supabase.supabase-js"

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  error: Error | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClientSideSupabaseClient()

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("[AUTH PROVIDER] Session error:", error)
          setError(error)
        } else {
          setSession(data.session)
          setUser(data.session?.user || null)
        }
      } catch (err) {
        console.error("[AUTH PROVIDER] Session check exception:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[AUTH PROVIDER] Auth state change:", event)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(newSession)
        setUser(newSession?.user || null)
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
      } else if (event === "USER_UPDATED") {
        // Refresh the session to get the latest user data
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        setUser(data.session?.user || null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      const supabase = createClientSideSupabaseClient()

      // First clear the session state
      setSession(null)
      setUser(null)

      // Then sign out from Supabase
      await supabase.auth.signOut()
      console.log("[AUTH PROVIDER] Supabase signOut called")

      // Clear any auth-related cookies manually
      document.cookie =
        "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" + window.location.hostname
      document.cookie =
        "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" + window.location.hostname

      // Small delay to ensure cookies are cleared
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Call the server-side signout route
      try {
        await fetch("/api/auth/signout", {
          method: "GET",
          credentials: "include",
        })
        console.log("[AUTH PROVIDER] Server-side signout called")
      } catch (apiError) {
        console.error("[AUTH PROVIDER] API signout error:", apiError)
        // Continue with redirect even if this fails
      }

      // Force hard redirect to auth page
      window.location.href = "/auth"
    } catch (err) {
      console.error("[AUTH PROVIDER] Sign out error:", err)
      setError(err instanceof Error ? err : new Error(String(err)))

      // Even if there's an error, redirect to auth page
      window.location.href = "/auth"
    }
  }

  return <AuthContext.Provider value={{ session, user, loading, error, signOut }}>{children}</AuthContext.Provider>
}
