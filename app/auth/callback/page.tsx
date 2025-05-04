"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/supabase-js"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Create a Supabase client
        const supabase = createClientComponentClient({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        })

        if (code) {
          // Exchange the code for a session
          await supabase.auth.exchangeCodeForSession(code)
        } else {
          // If no code is present, just get the session
          await supabase.auth.getSession()
        }

        // Redirect to the confirmation page
        router.replace("/auth/confirmed")
      } catch (error) {
        // Even if there's an error, redirect to the confirmation page
        router.replace("/auth/confirmed")
      }
    }

    handleCallback()
  }, [router, code])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-4 text-center text-xl font-semibold">Processing your confirmation...</h2>
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      </div>
    </div>
  )
}
