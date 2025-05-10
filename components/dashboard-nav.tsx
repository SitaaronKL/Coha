"use client"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState, useRef } from "react"
// Import the LogoutButton at the top of the file
import { LogoutButton } from "@/components/logout-button"

interface DashboardNavProps {
  user?: any
}

export function DashboardNav({ user: initialUser }: DashboardNavProps) {
  const [user, setUser] = useState(initialUser)
  // Add a ref to track if data has been fetched
  const dataFetchedRef = useRef(false)
  // Add a ref to track ongoing fetch operations
  const fetchingRef = useRef(false)

  // If user is not provided as a prop, fetch it
  useEffect(() => {
    if (!initialUser && !dataFetchedRef.current && !fetchingRef.current) {
      const fetchUser = async () => {
        try {
          fetchingRef.current = true
          // Use the API endpoint instead of direct Supabase calls
          const response = await fetch("/api/profile", {
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
            },
          })
          const data = await response.json()
          if (data.success && data.profile) {
            setUser(data.profile)
            dataFetchedRef.current = true
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          fetchingRef.current = false
        }
      }
      fetchUser()
    } else if (initialUser && !dataFetchedRef.current) {
      // If initialUser is provided, set it and mark as fetched
      setUser(initialUser)
      dataFetchedRef.current = true
    }
  }, [initialUser])

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!user) return "U"
    return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` || "U"
  }

  // Get user's full name
  const getFullName = () => {
    if (!user) return ""
    return user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : ""
  }

  const fullName = getFullName()

  // Handle profile navigation
  const handleProfileClick = (e) => {
    e.preventDefault()
    // Use window.location for a full page navigation
    window.location.href = "/dashboard/profile"
  }

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 bg-white/80 backdrop-blur-md p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={user?.avatar_url || `/placeholder.svg?height=40&width=40&text=${getInitials()}`}
              alt="Your profile"
            />
            <AvatarFallback className="bg-gray-100 text-gray-800">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{fullName || user?.first_name || "Profile"}</p>
            <p className="text-xs text-gray-500">{user?.email || ""}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={handleProfileClick}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </nav>
      </div>

      <div className="mt-auto">
        <LogoutButton />
      </div>
    </aside>
  )
}
