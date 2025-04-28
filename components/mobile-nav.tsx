"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Users, MessageSquare, Calendar, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface MobileNavProps {
  user?: any
}

export function MobileNav({ user: initialUser }: MobileNavProps) {
  const [open, setOpen] = useState(false)
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-white border-gray-200 pt-10">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
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
              asChild
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <Link href="/dashboard/matches">
                <Users className="mr-2 h-4 w-4" />
                Matches
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <Link href="/dashboard/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <Link href="/dashboard/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Link>
            </Button>
          </nav>

          <Separator className="my-4" />

          <nav className="flex flex-col gap-1">
            <Button
              variant="ghost"
              asChild
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </Button>
          </nav>

          <div className="mt-auto">
            <Button
              variant="ghost"
              asChild
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full"
            >
              <Link
                href="/auth"
                onClick={async (e) => {
                  e.preventDefault()
                  setOpen(false)
                  try {
                    await fetch("/api/auth/signout")
                    window.location.href = "/"
                  } catch (error) {
                    console.error("Error signing out:", error)
                    window.location.href = "/"
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
