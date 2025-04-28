"use client"

import Link from "next/link"
import { Search, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileNav } from "@/components/mobile-nav"
import { useEffect, useState } from "react"

interface DashboardHeaderProps {
  user?: any
}

export function DashboardHeader({ user: initialUser }: DashboardHeaderProps) {
  const [user, setUser] = useState(initialUser)

  // If user is not provided as a prop, fetch it
  useEffect(() => {
    if (!initialUser) {
      const fetchUser = async () => {
        try {
          const response = await fetch("/api/profile")
          const data = await response.json()
          if (data.success && data.profile) {
            setUser(data.profile)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
      fetchUser()
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

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <MobileNav user={user} />

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center font-semibold">
              CH
            </div>
            <span className="font-medium hidden md:inline text-gray-900">Coha</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatar_url || `/placeholder.svg?height=32&width=32&text=${getInitials()}`}
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-800">{getInitials()}</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{fullName || user?.first_name || "Profile"}</p>
                  <p className="text-xs leading-none text-gray-500">{user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Removed Profile Settings option */}
              <DropdownMenuItem asChild>
                <Link
                  href="/auth"
                  onClick={async (e) => {
                    e.preventDefault()
                    try {
                      await fetch("/api/auth/signout")
                      window.location.href = "/"
                    } catch (error) {
                      console.error("Error signing out:", error)
                      window.location.href = "/"
                    }
                  }}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
