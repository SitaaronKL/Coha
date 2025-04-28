import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Inter } from "next/font/google"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const inter = Inter({ subsets: ["latin"] })

export default function SuccessPage() {
  return (
    <div className={`min-h-screen bg-white text-gray-900 flex flex-col ${inter.className}`}>
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-softblack flex items-center justify-center text-white font-semibold">
              CH
            </div>
            <span className="font-medium text-gray-900">Coha</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Remove this Home link section */}
            {/* <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link> */}

            {/* Profile Icon - Logged in state */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-800">TS</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-softblack/5 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-softblack" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Questionnaire Completed!</CardTitle>
            <CardDescription className="text-gray-600">
              Thank you for completing your roommate preferences questionnaire
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-gray-700">
            <p>
              We've received your preferences and will use them to find your ideal roommate matches. You'll receive
              notifications when we find potential matches that align with your preferences.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild className="w-full bg-softblack hover:bg-gray-800 text-white">
              <Link href="/dashboard">View Your Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className="py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-gray-500">© {new Date().getFullYear()} Coha. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
