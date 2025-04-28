"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Inter } from "next/font/google"
import { CheckCircle, Instagram, Loader2, Save, Twitter, ArrowLeft, LinkIcon, AlertCircle } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientSideSupabaseClient } from "@/lib/supabase"

const inter = Inter({ subsets: ["latin"] })

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const dataFetchedRef = useRef(false)

  // User data state
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    major: "",
    year: "",
    bio: "",
    phone: "",
    instagram: "",
    twitter: "",
    avatarUrl: "", // Added avatarUrl field
    showEmail: false,
    showPhone: false,
    showSocial: false,
  })

  // Fetch user data on component mount
  useEffect(() => {
    // Use a ref to prevent multiple fetches
    if (dataFetchedRef.current) return

    async function fetchUserData() {
      setIsLoadingProfile(true)
      try {
        dataFetchedRef.current = true

        // First check if we have a valid session
        const supabase = createClientSideSupabaseClient()
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.error("Session error or no session:", sessionError)
          setAuthError("Your session has expired. Please log in again.")
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })

          // Delay redirect to show the error message
          setTimeout(() => {
            router.push("/auth?error=session_expired")
          }, 2000)
          return
        }

        console.log("Session found, user ID:", session.user.id)

        // Try to get profile data directly from Supabase
        try {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select(`
              *,
              universities (
                name,
                location
              )
            `)
            .eq("id", session.user.id)
            .single()

          if (profileError) {
            console.error("Error fetching profile from Supabase:", profileError)
            throw profileError
          }

          console.log("Profile data fetched directly from Supabase")

          // Get privacy settings
          const { data: privacySettings, error: privacyError } = await supabase
            .from("privacy_settings")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle()

          if (privacyError && privacyError.code !== "PGRST116") {
            console.error("Error fetching privacy settings from Supabase:", privacyError)
          }

          if (profile) {
            setUserData({
              ...userData,
              firstName: profile.first_name || "",
              lastName: profile.last_name || "",
              email: profile.email || "",
              university: profile.universities?.name || "",
              major: profile.major || "",
              year: profile.year || "",
              bio: profile.bio || "",
              phone: profile.phone || "",
              instagram: profile.instagram || "",
              twitter: profile.twitter || "",
              avatarUrl: profile.avatar_url || "", // Set avatar URL from profile data
              // Set privacy settings if available
              ...(privacySettings && {
                showEmail: privacySettings.show_email || false,
                showPhone: privacySettings.show_phone || false,
                showSocial: privacySettings.show_social_media || false,
              }),
            })
            setIsLoadingProfile(false)
            return
          }
        } catch (supabaseError) {
          console.error("Failed to fetch directly from Supabase, falling back to API:", supabaseError)
          // Continue to API fallback
        }

        // Fallback to API if direct Supabase fetch fails
        const response = await fetch("/api/profile", {
          credentials: "include", // Important for cookies
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          console.error("Profile fetch failed:", response.status, response.statusText)

          if (response.status === 401) {
            setAuthError("Your session has expired. Please log in again.")
            toast({
              title: "Session expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            })
            setTimeout(() => {
              router.push("/auth?error=session_expired")
            }, 2000)
            return
          }

          throw new Error(`Failed to fetch profile data: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch profile data")
        }

        if (data.profile) {
          setUserData({
            ...userData,
            firstName: data.profile.first_name || "",
            lastName: data.profile.last_name || "",
            email: data.profile.email || "",
            university: data.profile.universities?.name || "",
            major: data.profile.major || "",
            year: data.profile.year || "",
            bio: data.profile.bio || "",
            phone: data.profile.phone || "",
            instagram: data.profile.instagram || "",
            twitter: data.profile.twitter || "",
            avatarUrl: data.profile.avatar_url || "", // Set avatar URL from profile data
            // Set privacy settings if available
            ...(data.privacySettings && {
              showEmail: data.privacySettings.show_email || false,
              showPhone: data.privacySettings.show_phone || false,
              showSocial: data.privacySettings.show_social_media || false,
            }),
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserData({ ...userData, [name]: value })
    setIsSaved(false)
  }

  const handleSelectChange = (name: string, value: string) => {
    setUserData({ ...userData, [name]: value })
    setIsSaved(false)
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setUserData({ ...userData, [name]: checked })
    setIsSaved(false)
  }

  // Update the save button
  const handleSave = async () => {
    setIsLoading(true)
    setIsSaved(false)

    try {
      // Try to update directly with Supabase first
      try {
        const supabase = createClientSideSupabaseClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("User not authenticated")
        }

        // Prepare data for Supabase
        const profileData = {
          first_name: userData.firstName,
          last_name: userData.lastName,
          major: userData.major,
          year: userData.year,
          bio: userData.bio,
          phone: userData.phone,
          instagram: userData.instagram,
          twitter: userData.twitter,
          avatar_url: userData.avatarUrl,
          updated_at: new Date().toISOString(),
        }

        // Update profile
        const { error: profileError } = await supabase.from("profiles").update(profileData).eq("id", session.user.id)

        if (profileError) {
          console.error("Error updating profile with Supabase:", profileError)
          throw profileError
        }

        // Update privacy settings
        const privacyData = {
          user_id: session.user.id,
          show_email: userData.showEmail,
          show_phone: userData.showPhone,
          show_social_media: userData.showSocial,
          updated_at: new Date().toISOString(),
        }

        // Check if privacy settings exist
        const { data: existingPrivacy } = await supabase
          .from("privacy_settings")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle()

        if (existingPrivacy) {
          // Update existing privacy settings
          const { error: privacyError } = await supabase
            .from("privacy_settings")
            .update(privacyData)
            .eq("user_id", session.user.id)

          if (privacyError) {
            console.error("Error updating privacy settings with Supabase:", privacyError)
          }
        } else {
          // Insert new privacy settings
          const { error: privacyError } = await supabase.from("privacy_settings").insert(privacyData)

          if (privacyError) {
            console.error("Error inserting privacy settings with Supabase:", privacyError)
          }
        }

        console.log("Profile updated directly with Supabase")
        setIsSaved(true)
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })

        return
      } catch (supabaseError) {
        console.error("Failed to update directly with Supabase, falling back to API:", supabaseError)
        // Continue to API fallback
      }

      // Fallback to API
      // Prepare data for API
      const profileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        major: userData.major,
        year: userData.year,
        bio: userData.bio,
        phone: userData.phone,
        instagram: userData.instagram,
        twitter: userData.twitter,
        avatarUrl: userData.avatarUrl, // Include avatar URL in profile data
      }

      const privacyData = {
        showEmail: userData.showEmail,
        showPhone: userData.showPhone,
        showSocialMedia: userData.showSocial,
      }

      // Send data to API
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({
          profileData,
          privacyData,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError("Your session has expired. Please log in again.")
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          setTimeout(() => {
            router.push("/auth?error=session_expired")
          }, 2000)
          return
        }

        throw new Error(`Failed to update profile: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to update profile")
      }

      setIsSaved(true)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get user's initials for avatar fallback
  const getInitials = () => {
    return `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}` || "U"
  }

  // If there's an auth error, show it
  if (authError) {
    return (
      <div className={`min-h-screen bg-white text-gray-900 ${inter.className}`}>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader />
          <div className="flex flex-1">
            <main className="flex-1 p-6 flex items-center justify-center">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                  </div>
                  <CardTitle className="text-center">Authentication Error</CardTitle>
                  <CardDescription className="text-center">{authError}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button asChild className="bg-softblack hover:bg-gray-800 text-white">
                    <Link href="/auth">Log In Again</Link>
                  </Button>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    )
  }

  if (isLoadingProfile) {
    return (
      <div className={`min-h-screen bg-white text-gray-900 ${inter.className}`}>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white text-gray-900 ${inter.className}`}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />

        <main className="flex-1 p-6">
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Manage your personal information and settings</p>
                <Button variant="outline" size="sm" asChild className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="bg-gray-100 mb-6">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="privacy">Privacy & Settings</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <div className="grid gap-6">
                  {/* Profile Photo */}
                  <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Profile Photo</CardTitle>
                      <CardDescription className="text-gray-600">Enter a URL for your profile picture</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <Avatar className="h-24 w-24 border-2 border-gray-200">
                          <AvatarImage
                            src={userData.avatarUrl || `/placeholder.svg?height=96&width=96&text=${getInitials()}`}
                            alt="Profile"
                          />
                          <AvatarFallback className="bg-gray-100 text-gray-800">{getInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="avatarUrl" className="text-gray-800">
                            Profile Image URL
                          </Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                              <Input
                                id="avatarUrl"
                                name="avatarUrl"
                                value={userData.avatarUrl}
                                onChange={handleInputChange}
                                className="bg-white border-gray-300 text-gray-900 pl-9"
                                placeholder="https://example.com/your-image.jpg"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Enter a direct URL to your profile image (JPG, PNG, or GIF)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Basic Information */}
                  <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Basic Information</CardTitle>
                      <CardDescription className="text-gray-600">Your personal and academic details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-gray-800">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-gray-800">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-800">
                          University Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          className="bg-white border-gray-300 text-gray-900"
                          disabled
                        />
                        <p className="text-xs text-gray-500">Your university email cannot be changed</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="university" className="text-gray-800">
                            University
                          </Label>
                          <Input
                            id="university"
                            name="university"
                            value={userData.university}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-gray-900"
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="major" className="text-gray-800">
                            Major
                          </Label>
                          <Input
                            id="major"
                            name="major"
                            value={userData.major}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-gray-800">
                          Year
                        </Label>
                        <Select value={userData.year} onValueChange={(value) => handleSelectChange("year", value)}>
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue placeholder="Select your year" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 text-gray-900">
                            <SelectItem value="Freshman">Freshman</SelectItem>
                            <SelectItem value="Sophomore">Sophomore</SelectItem>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bio & Contact */}
                  <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Bio & Contact Information</CardTitle>
                      <CardDescription className="text-gray-600">
                        Tell others about yourself and how to reach you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-gray-800">
                          About Me
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={userData.bio}
                          onChange={handleInputChange}
                          className="bg-white border-gray-300 text-gray-900 min-h-[120px]"
                          placeholder="Tell others about yourself, your interests, and what you're looking for"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-800">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={userData.phone}
                          onChange={handleInputChange}
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="instagram" className="text-gray-800">
                            <Instagram className="h-4 w-4 inline mr-2" />
                            Instagram Username
                          </Label>
                          <Input
                            id="instagram"
                            name="instagram"
                            value={userData.instagram}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-gray-900"
                            placeholder="username (without @)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter" className="text-gray-800">
                            <Twitter className="h-4 w-4 inline mr-2" />
                            Twitter Username
                          </Label>
                          <Input
                            id="twitter"
                            name="twitter"
                            value={userData.twitter}
                            onChange={handleInputChange}
                            className="bg-white border-gray-300 text-gray-900"
                            placeholder="username (without @)"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Privacy & Settings Tab */}
              <TabsContent value="privacy">
                <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Privacy Settings</CardTitle>
                    <CardDescription className="text-gray-600">
                      Control what information is visible to others
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-gray-800">Show Email Address</Label>
                        <p className="text-sm text-gray-600">Allow others to see your email address</p>
                      </div>
                      <Switch
                        checked={userData.showEmail}
                        onCheckedChange={(checked) => handleSwitchChange("showEmail", checked)}
                        className="data-[state=checked]:bg-softblack"
                      />
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-gray-800">Show Phone Number</Label>
                        <p className="text-sm text-gray-600">Allow others to see your phone number</p>
                      </div>
                      <Switch
                        checked={userData.showPhone}
                        onCheckedChange={(checked) => handleSwitchChange("showPhone", checked)}
                        className="data-[state=checked]:bg-softblack"
                      />
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-gray-800">Show Social Media</Label>
                        <p className="text-sm text-gray-600">Allow others to see your social media profiles</p>
                      </div>
                      <Switch
                        checked={userData.showSocial}
                        onCheckedChange={(checked) => handleSwitchChange("showSocial", checked)}
                        className="data-[state=checked]:bg-softblack"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="bg-softblack hover:bg-gray-800 text-white">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
