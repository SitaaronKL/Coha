import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "Coha",
  description:
    "Cohamaster makes finding your ideal college roommate effortless. Create a profile, set your living preferences, browse compatible matches, and chat securely—all in one place. Stay on top of housing deadlines and build your perfect living situation. Sign up free today!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
