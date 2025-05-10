"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Inter } from "next/font/google"
import Link from "next/link"
// Remove this line:
// import { ArrowLeft, Loader2, UserIcon as Male, UserIcon as Female } from 'lucide-react'
// Replace with:
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { debugAuthState, getCurrentUser, signIn, signUp } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { checkSupabaseConfig, createClientSideSupabaseClient } from "@/lib/supabase"

const inter = Inter({ subsets: ["latin"] })

// Pre-defined list of universities (for fallback if API fails)
const UNIVERSITY_LIST = [
  "Stanford University",
  "Harvard University",
  "MIT",
  "UC Berkeley",
  "UCLA",
  "Rutgers University",
]

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "login"
  const errorParam = searchParams.get("error")

  const [isLoading, setIsLoading] = useState(false)
  const [universities, setUniversities] = useState<string[]>(UNIVERSITY_LIST)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Add error state variables
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null)

  // Check if user is already logged in - but with safeguards against redirect loops
  useEffect(() => {
    console.log("[AUTH PAGE] Checking if user is already logged in")

    // Clear error parameter from URL to prevent it from persisting
    if (errorParam && window.history.replaceState) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("error")
      window.history.replaceState({}, document.title, newUrl.toString())
    }

    const checkUser = async () => {
      try {
        const user = await getCurrentUser()
        console.log("[AUTH PAGE] User check result:", user ? "User found" : "No user")

        if (user) {
          console.log("[AUTH PAGE] User is logged in, redirecting to dashboard")
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("[AUTH PAGE] Error checking user:", error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkUser()

    // Also check Supabase config
    checkSupabaseConfig()
  }, [router, errorParam])

  // Set error message from URL parameter - but only show toast, not error state
  useEffect(() => {
    if (errorParam) {
      console.log("[AUTH PAGE] Error parameter found:", errorParam)

      if (errorParam === "session_expired") {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
      } else if (errorParam === "server_error") {
        toast({
          title: "Server error",
          description: "A server error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [errorParam])

  // Reset errors when switching tabs
  useEffect(() => {
    setLoginError(null)
    setSignupError(null)
    setSignupSuccess(null)
    setActiveTab(defaultTab)
  }, [defaultTab])

  // Fetch universities from database
  useEffect(() => {
    async function fetchUniversities() {
      try {
        console.log("[AUTH PAGE] Fetching universities")
        const supabase = createClientSideSupabaseClient()
        const { data, error } = await supabase.from("universities").select("name").order("name")

        if (error) {
          console.error("[AUTH PAGE] Error fetching universities:", error)
          throw error
        }

        if (data && data.length > 0) {
          console.log("[AUTH PAGE] Universities fetched:", data.length)
          setUniversities(data.map((uni) => uni.name))
        }
      } catch (error) {
        console.error("[AUTH PAGE] Exception fetching universities:", error)
        // Fallback to hardcoded list if fetching fails
      }
    }

    fetchUniversities()
  }, [])

  // Update the signupData state to include gender
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    year: "",
    gender: "", // Add this line
    password: "",
    terms: false,
  })

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  })

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    })
    setLoginError(null) // Clear error on input change
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSignupData({
      ...signupData,
      [name]: type === "checkbox" ? checked : value,
    })
    setSignupError(null) // Clear error on input change
    setSignupSuccess(null)
  }

  const handleUniversityChange = (value: string) => {
    setSignupData({
      ...signupData,
      university: value,
    })
    setSignupError(null) // Clear error on university change
    setSignupSuccess(null)
  }

  const handleYearChange = (value: string) => {
    setSignupData({
      ...signupData,
      year: value,
    })
    setSignupError(null) // Clear error on year change
    setSignupSuccess(null)
  }

  // Add a handler for gender selection
  const handleGenderSelect = (gender: string) => {
    setSignupData({
      ...signupData,
      gender,
    })
    setSignupError(null)
    setSignupSuccess(null)
  }

  // Update the handleSignup function to validate gender
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)
    setDebugInfo(null) // Always clear debug info

    try {
      console.log("[AUTH PAGE] Attempting login with:", loginData.email)
      const authData = await signIn(loginData.email, loginData.password)
      console.log("[AUTH PAGE] Login successful, auth data:", authData)

      // Debug auth state before redirect - but don't display to user
      const debugResult = await debugAuthState()
      console.log("[AUTH PAGE] Debug auth state before redirect:", debugResult)
      // Don't set debug info to UI: setDebugInfo(JSON.stringify(debugResult, null, 2))

      // Show success message
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      })

      // Add a small delay to ensure toast is shown
      setTimeout(() => {
        console.log("[AUTH PAGE] Redirecting to dashboard with hard redirect")
        // Use a hard redirect instead of Next.js router
        window.location.href = "/dashboard"
      }, 1000)
    } catch (error) {
      console.error("[AUTH PAGE] Login error details:", error)
      setLoginError(error.message || "Invalid login credentials. Please check your email and password.")

      // Run debug to get more info - but don't display to user
      try {
        const debugResult = await debugAuthState()
        console.log("[AUTH PAGE] Debug after error:", debugResult)
        // Don't set debug info to UI: setDebugInfo(JSON.stringify(debugResult, null, 2))
      } catch (debugError) {
        console.error("[AUTH PAGE] Debug error:", debugError)
      }

      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSignupError(null)
    setSignupSuccess(null)

    try {
      if (!signupData.terms) {
        throw new Error("You must agree to the terms of service and privacy policy")
      }

      // TEMPORARILY DISABLED FOR TESTING
      // if (!signupData.email.endsWith(".edu")) {
      //   throw new Error("Please use a valid university email address (.edu)")
      // }

      if (!signupData.university) {
        throw new Error("Please select your university")
      }

      if (!signupData.year) {
        throw new Error("Please select your year")
      }

      if (!signupData.gender) {
        throw new Error("Please select your gender")
      }

      console.log("[AUTH PAGE] Signup data:", signupData)

      try {
        await signUp(signupData.email, signupData.password, {
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          university: signupData.university,
          year: signupData.year,
          gender: signupData.gender,
        })

        setSignupSuccess("Account created! Please check your email to verify your account.")

        // Show toast notification
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        })

        // Delay redirect to show success message
        setTimeout(() => {
          router.push("/auth?tab=login")
        }, 2000)
      } catch (error) {
        console.error("[AUTH PAGE] Signup error:", error)

        // Handle specific error cases
        if (error.message?.includes("verification failed")) {
          // This is actually a success case - the user was created but verification step failed
          setSignupSuccess("Account created! Please check your email to verify your account.")

          toast({
            title: "Account created",
            description: "Please check your email to verify your account.",
          })

          // Delay redirect to show success message
          setTimeout(() => {
            router.push("/auth?tab=login")
          }, 2000)
          return
        } else if (error.message?.includes("foreign key constraint")) {
          setSignupError("Account creation failed due to a database error. Please try again in a few moments.")
        } else if (error.message?.includes("duplicate key") || error.message?.includes("profiles_email_key")) {
          // Improved error message for duplicate email
          setSignupError("This email is already taken! Please use a different email address.")

          toast({
            title: "Signup failed",
            description: "This email is already taken! Please use a different email address.",
            variant: "destructive",
          })
        } else {
          setSignupError(error.message || "Failed to create account. Please check your information and try again.")

          toast({
            title: "Signup failed",
            description: error.message || "Please check your information and try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("[AUTH PAGE] Form validation error:", error)
      setSignupError(error.message || "Please check your information and try again.")

      toast({
        title: "Signup failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If still checking auth status, show loading
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white text-gray-900 flex flex-col ${inter.className}`}>
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          {/* Removed the user icon dropdown from here */}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-md bg-softblack flex items-center justify-center text-white font-semibold">
              CH
            </div>
            <span className="font-medium text-xl text-gray-900">Coha</span>
          </div>

          {/* Debug info display - only show in development and when explicitly needed */}
          {process.env.NODE_ENV === "development" && debugInfo && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono overflow-auto max-h-40">
              <pre>{debugInfo}</pre>
            </div>
          )}

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8 bg-gray-100">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="bg-white border-gray-200 shadow-md">
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900">Welcome back</CardTitle>
                    <CardDescription className="text-gray-600">
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-800">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.name@university.edu"
                        className="bg-white border-gray-300 text-gray-900"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-gray-800">
                          Password
                        </Label>
                        <Link href="#" className="text-xs text-gray-600 hover:text-black">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        className="bg-white border-gray-300 text-gray-900"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        name="remember"
                        checked={loginData.remember}
                        onCheckedChange={(checked) => setLoginData({ ...loginData, remember: checked === true })}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>

                    {/* Display login error */}
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {loginError}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-softblack hover:bg-gray-800 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log in"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <Card className="bg-white border-gray-200 shadow-md">
                <form onSubmit={handleSignup}>
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900">Create an account</CardTitle>
                    <CardDescription className="text-gray-600">
                      Join Coha to find your ideal college roommate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-800">
                          First name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          className="bg-white border-gray-300 text-gray-900"
                          value={signupData.firstName}
                          onChange={handleSignupChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-800">
                          Last name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          className="bg-white border-gray-300 text-gray-900"
                          value={signupData.lastName}
                          onChange={handleSignupChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupEmail" className="text-gray-800">
                        University email
                      </Label>
                      <Input
                        id="signupEmail"
                        name="email"
                        type="email"
                        placeholder="your.name@university.edu"
                        className="bg-white border-gray-300 text-gray-900"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        We only accept .edu email addresses to ensure a safe community
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Select value={signupData.university} onValueChange={handleUniversityChange}>
                        <SelectTrigger id="university" className="w-full">
                          <SelectValue placeholder="Select your university" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((uni) => (
                            <SelectItem key={uni} value={uni}>
                              {uni}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Add Year dropdown after university is selected */}
                    {signupData.university && (
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select value={signupData.year} onValueChange={handleYearChange}>
                          <SelectTrigger id="year" className="w-full">
                            <SelectValue placeholder="Select your year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Incoming Freshman">Incoming Freshman</SelectItem>
                            <SelectItem value="Incoming Sophomore">Incoming Sophomore</SelectItem>
                            <SelectItem value="Incoming Junior">Incoming Junior</SelectItem>
                            <SelectItem value="Incoming Senior">Incoming Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Replace the existing gender selection UI with this */}
                    {signupData.year && (
                      <div className="space-y-2">
                        <Label className="text-gray-800">Gender</Label>
                        <div className="flex gap-4 justify-center mt-2">
                          <button
                            type="button"
                            onClick={() => handleGenderSelect("MALE")}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                              signupData.gender === "MALE"
                                ? "border-softblack bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            style={{ width: "100px" }}
                          >
                            <div
                              className={`text-2xl mb-1 ${signupData.gender === "MALE" ? "text-softblack" : "text-gray-500"}`}
                            >
                              ♂
                            </div>
                            <span className={`text-sm ${signupData.gender === "MALE" ? "font-medium" : ""}`}>Male</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenderSelect("FEMALE")}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                              signupData.gender === "FEMALE"
                                ? "border-softblack bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            style={{ width: "100px" }}
                          >
                            <div
                              className={`text-2xl mb-1 ${signupData.gender === "FEMALE" ? "text-softblack" : "text-gray-500"}`}
                            >
                              ♀
                            </div>
                            <span className={`text-sm ${signupData.gender === "FEMALE" ? "font-medium" : ""}`}>
                              Female
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword" className="text-gray-800">
                        Password
                      </Label>
                      <Input
                        id="signupPassword"
                        name="password"
                        type="password"
                        className="bg-white border-gray-300 text-gray-900"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        required
                      />
                      <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        name="terms"
                        checked={signupData.terms}
                        onCheckedChange={(checked) => setSignupData({ ...signupData, terms: checked === true })}
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                      >
                        I agree to the{" "}
                        <Link href="#" className="text-gray-900 hover:underline">
                          terms of service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-gray-900 hover:underline">
                          privacy policy
                        </Link>
                      </label>
                    </div>

                    {/* Display signup error */}
                    {signupError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {signupError}
                      </div>
                    )}

                    {/* Display signup success */}
                    {signupSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                        {signupSuccess}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-softblack hover:bg-gray-800 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-gray-500">© {new Date().getFullYear()} Coha. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
