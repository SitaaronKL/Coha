"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Inter } from "next/font/google"
import { Calendar, Settings, Loader2, ClipboardList, UserCircle } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { MatchCard } from "@/components/match-card"
import Link from "next/link"
import { format } from "date-fns"
import { useAuth } from "@/components/auth-provider"
import { createClientSideSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const inter = Inter({ subsets: ["latin"] })

export default function DashboardClientPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPreferences, setHasPreferences] = useState(true) // Default to true, will be updated after checking
  const [isProfileComplete, setIsProfileComplete] = useState(true) // Default to true, will be updated after checking
  const { toast } = useToast()

  useEffect(() => {
    // If not loading and no user, redirect to auth
    if (!loading && !user) {
      console.log("[DASHBOARD] No user found, redirecting to auth")
      router.push("/auth?error=session_expired")
      return
    }

    // If we have a user, fetch profile and deadlines
    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      console.log("[DASHBOARD] Fetching dashboard data for user:", user?.id)

      const supabase = createClientSideSupabaseClient()

      // Verify session is valid
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error("[DASHBOARD] Session error or no session:", sessionError)
        setError("Your session has expired. Please log in again.")
        setTimeout(() => {
          router.push("/auth?error=session_expired")
        }, 2000)
        return
      }

      console.log("[DASHBOARD] Session verified, user ID:", session.user.id)

      // Fetch profile with university info
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          universities (
            id,
            name,
            location
          )
        `)
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("[DASHBOARD] Error fetching profile:", profileError)
        setError("Failed to load profile data")
        return
      }

      setProfile(profileData)

      // Check if profile is complete
      checkProfileCompleteness(profileData)

      // Fetch user's matches - using the actual schema structure
      try {
        // First, get matches where the user is user_id_1
        const { data: matchesAsUser1, error: matchesAsUser1Error } = await supabase
          .from("matches")
          .select(`
            *,
            matched_profile:user_id_2 (
              id,
              first_name,
              last_name,
              avatar_url,
              major,
              year,
              bio,
              email,
              phone,
              instagram
            )
          `)
          .eq("user_id_1", user.id)
          .order("compatibility_score", { ascending: false })

        if (matchesAsUser1Error) {
          console.error("[DASHBOARD] Error fetching matches as user 1:", matchesAsUser1Error)
        }

        // Then, get matches where the user is user_id_2
        const { data: matchesAsUser2, error: matchesAsUser2Error } = await supabase
          .from("matches")
          .select(`
            *,
            matched_profile:user_id_1 (
              id,
              first_name,
              last_name,
              avatar_url,
              major,
              year,
              bio,
              email,
              phone,
              instagram
            )
          `)
          .eq("user_id_2", user.id)
          .order("compatibility_score", { ascending: false })

        if (matchesAsUser2Error) {
          console.error("[DASHBOARD] Error fetching matches as user 2:", matchesAsUser2Error)
        }

        // Combine both sets of matches
        const allMatches = [...(matchesAsUser1 || []), ...(matchesAsUser2 || [])]
        console.log("[DASHBOARD] Fetched matches:", allMatches)
        setMatches(allMatches || [])
      } catch (matchesErr) {
        console.error("[DASHBOARD] Exception fetching matches:", matchesErr)
      }

      // Check if user has preferences
      try {
        const { data: preferencesData, error: preferencesError } = await supabase
          .from("user_preferences")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (preferencesError && preferencesError.code === "PGRST116") {
          // No preferences found
          console.log("[DASHBOARD] No preferences found for user, showing questionnaire prompt")
          setHasPreferences(false)
        } else if (preferencesError) {
          console.error("[DASHBOARD] Error checking preferences:", preferencesError)
          // Continue anyway, default is to assume they have preferences
        } else {
          // Preferences found
          setHasPreferences(true)
        }
      } catch (prefsErr) {
        console.error("[DASHBOARD] Exception checking preferences:", prefsErr)
        // Continue anyway, default is to assume they have preferences
      }

      // Fetch housing deadlines
      try {
        const { data: deadlinesData, error: deadlinesError } = await supabase
          .from("housing_deadlines")
          .select("*")
          .eq("university_id", profileData?.university_id || "")
          .order("deadline_date", { ascending: true })

        if (deadlinesError) {
          console.error("[DASHBOARD] Error fetching deadlines:", deadlinesError)
          // Continue anyway as this is not critical
        } else {
          setDeadlines(deadlinesData || [])
        }
      } catch (deadlineErr) {
        console.error("[DASHBOARD] Exception fetching deadlines:", deadlineErr)
        // Continue anyway as this is not critical
      }
    } catch (err) {
      console.error("[DASHBOARD] Dashboard data fetch error:", err)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if profile is complete
  const checkProfileCompleteness = (profileData) => {
    if (!profileData) {
      setIsProfileComplete(false)
      return
    }

    // Check essential fields (excluding Twitter as mentioned)
    const requiredFields = ["first_name", "last_name", "major", "year", "bio"]

    const missingFields = requiredFields.filter((field) => !profileData[field] || profileData[field].trim() === "")

    setIsProfileComplete(missingFields.length === 0)
  }

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!profile) return "U"
    return `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}` || "U"
  }

  // Calculate days remaining for a deadline
  const getDaysRemaining = (deadlineDate: string) => {
    const today = new Date()
    const deadline = new Date(deadlineDate)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? `${diffDays} days remaining` : "Deadline passed"
  }

  // Convert gender text to symbol
  const getGenderSymbol = (gender: string | null | undefined) => {
    if (!gender) return ""
    if (gender.toUpperCase() === "MALE") return "♂"
    if (gender.toUpperCase() === "FEMALE") return "♀"
    return ""
  }

  // Handle navigation to profile page
  const handleProfileClick = (e) => {
    e.preventDefault()

    // Ensure we have a valid session before navigating
    const checkSession = async () => {
      try {
        const supabase = createClientSideSupabaseClient()
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error || !session) {
          console.error("Session error before profile navigation:", error)
          toast({
            title: "Session error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          router.push("/auth?error=session_expired")
          return
        }

        console.log("Session valid, navigating to profile")
        // Use window.location for a full page navigation to ensure cookies are sent
        window.location.href = "/dashboard/profile"
      } catch (err) {
        console.error("Error checking session:", err)
        router.push("/auth?error=session_error")
      }
    }

    checkSession()
  }

  // Format match data for the MatchCard component
  const formatMatchData = (match) => {
    const matchedProfile = match.matched_profile || {}

    return {
      id: match.id,
      name: `${matchedProfile.first_name || ""} ${matchedProfile.last_name || ""}`.trim() || "Unknown User",
      avatar:
        matchedProfile.avatar_url ||
        `/placeholder.svg?height=400&width=400&text=${matchedProfile.first_name?.[0] || ""}${matchedProfile.last_name?.[0] || ""}`,
      major: matchedProfile.major || "Undeclared",
      year: matchedProfile.year || "Unknown",
      // compatibility: Math.round(match.compatibility_score || 0),
      compatibility: 0, // Removed from UI but still needed for the interface
      bio: matchedProfile.bio || "No bio available",
      tags: [], // We don't have tags in the current schema
      instagram: matchedProfile.instagram,
      email: matchedProfile.email || "No email available",
      phone: matchedProfile.phone || "No phone available",
      matchingTraits: [], // We don't have matching traits in the current schema
    }
  }

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className={`min-h-screen bg-white text-gray-900 flex items-center justify-center ${inter.className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen bg-white text-gray-900 flex items-center justify-center ${inter.className}`}>
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => fetchDashboardData()} className="bg-softblack hover:bg-gray-800 text-white">
              Try Again
            </Button>
            <Button variant="outline" onClick={signOut} className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Log Out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white text-gray-900 ${inter.className}`}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader user={profile} />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-8">
            {/* User Profile Summary */}
            <section className="rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-20 w-20 border-2 border-gray-200">
                  <AvatarImage
                    src={profile?.avatar_url || `/placeholder.svg?height=80&width=80&text=${getInitials()}`}
                    alt="Your profile"
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-800">{getInitials()}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.first_name || "User"}</h1>
                  <p className="text-gray-600">
                    {profile?.major || "Major"} • {profile?.year || "Year"} •{" "}
                    {profile?.gender ? (
                      <span className="inline-flex items-center">
                        <span className="font-semibold text-lg" aria-label={profile.gender}>
                          {getGenderSymbol(profile.gender)}
                        </span>
                      </span>
                    ) : (
                      ""
                    )}{" "}
                    • {profile?.universities?.name || "University"}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                      Profile {isProfileComplete ? "Complete" : "Incomplete"}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                      {matches.length} Matches
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 self-end md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={handleProfileClick}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="space-y-4 mt-6">
                {/* Questionnaire Prompt - Only show if user doesn't have preferences */}
                {!hasPreferences && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <ClipboardList className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-blue-800">Complete your roommate questionnaire</h3>
                        <p className="text-blue-600 text-sm mb-3">
                          Find your perfect roommate match by completing our quick questionnaire
                        </p>
                      </div>
                      <Link href="/questionnaire" className="block">
                        <Button className="bg-softblack hover:bg-blue-700 text-white">Complete Questionnaire</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Profile Completion Prompt - Only show if profile is incomplete */}
                {!isProfileComplete && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="bg-amber-100 p-3 rounded-full">
                        <UserCircle className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-amber-800">Complete your profile</h3>
                        <p className="text-amber-600 text-sm mb-3">
                          Update your profile information to help us find better matches for you
                        </p>
                      </div>
                      <Link href="/dashboard/profile" className="block">
                        <Button className="bg-softblack hover:bg-amber-700 text-white">Update Profile</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Matches Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Matches</h2>
              </div>

              {matches.length > 0 ? (
                <div className="space-y-6">
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={formatMatchData(match)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Matches will be given out on May 14th</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We're working on finding your perfect roommate matches. Check back soon!
                  </p>
                </div>
              )}
            </section>

            {/* Upcoming Events/Reminders */}
            <section className="rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Housing Deadlines</h2>
              {deadlines && deadlines.length > 0 ? (
                <div className="space-y-4">
                  {deadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-start gap-4 p-3 rounded-lg border border-gray-200 bg-gray-50 backdrop-blur-sm"
                    >
                      <div className="bg-gray-100 p-2 rounded-md border border-gray-200">
                        <Calendar className="h-5 w-5 text-gray-800" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                        <p className="text-sm text-gray-600">
                          {format(new Date(deadline.deadline_date), "MMMM d, yyyy")} •{" "}
                          {getDaysRemaining(deadline.deadline_date)}
                        </p>
                        {deadline.description && <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-600">
                  <Calendar className="mx-auto h-12 w-12 opacity-30 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No upcoming deadlines</h3>
                  <p>Check back later for housing deadlines from your university.</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
