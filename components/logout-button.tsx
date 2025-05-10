"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      console.log("Logging out...")
      await signOut()
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even on error
      window.location.href = "/auth"
    }
  }

  return (
    <Button variant="destructive" onClick={handleLogout} className="w-full">
      Log Out
    </Button>
  )
}
