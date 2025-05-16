"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientSideSupabaseClient } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"

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
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(newSession)
        setUser(newSession?.user || null)
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      const supabase = createClientSideSupabaseClient()
      await supabase.auth.signOut()

      // Force hard redirect to auth page
      window.location.href = "/auth"
    } catch (err) {
      console.error("[AUTH PROVIDER] Sign out error:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  return <AuthContext.Provider value={{ session, user, loading, error, signOut }}>{children}</AuthContext.Provider>
}
