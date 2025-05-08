import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Coha",
  description:
    "Coha makes finding your ideal college roommate effortless. Create a profile, set your living preferences, browse compatible matches, and chat securely—all in one place. Stay on top of housing deadlines and build your perfect living situation. Sign up free today!",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/svg+xml" },
    ],
    apple: "/favicon.png",
  },
  // Add Open Graph metadata for rich link previews
  openGraph: {
    title: "Find Your Perfect College Roommate",
    description: "Match with compatible roommates based on lifestyle, study habits, and personality traits.",
    url: "https://coha.club",
    siteName: "Coha",
    images: [
      {
        url: "/og-image.jpg", // Using the new image
        width: 1200,
        height: 630,
        alt: "Coha - Find your perfect college roommate match",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // Add Twitter card metadata
  twitter: {
    card: "summary_large_image",
    title: "Find Your Perfect College Roommate",
    description: "Match with compatible roommates based on lifestyle, study habits, and personality traits.",
    images: ["/og-image.jpg"], // Using the new image
    creator: "@cohaapp",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>

        {/* Google Analytics - Using next/script */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-R2SMXVHM1T" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R2SMXVHM1T');
            
            // Debug log to confirm script execution
            console.log('Google Analytics script loaded');
          `}
        </Script>
      </body>
    </html>
  )
}
