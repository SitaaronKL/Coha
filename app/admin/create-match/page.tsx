"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createClientSideSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CreateMatchPage() {
  const [users, setUsers] = useState<any[]>([])
  const [user1, setUser1] = useState("")
  const [user2, setUser2] = useState("")
  const [compatibilityScore, setCompatibilityScore] = useState(85)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClientSideSupabaseClient()

        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth")
          return
        }

        // Fetch all users
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .order("first_name", { ascending: true })

        if (error) {
          console.error("Error fetching users:", error)
          toast({
            title: "Error",
            description: "Failed to load users. Please try again.",
            variant: "destructive",
          })
          return
        }

        setUsers(data || [])
      } catch (error) {
        console.error("Exception fetching users:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user1 || !user2 || user1 === user2) {
      toast({
        title: "Invalid selection",
        description: "Please select two different users.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/matches/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id_1: user1,
          user_id_2: user2,
          compatibility_score: compatibilityScore,
          status: "matched",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create match")
      }

      toast({
        title: "Success",
        description: "Match created successfully!",
      })

      // Reset form
      setUser1("")
      setUser2("")
      setCompatibilityScore(85)
    } catch (error) {
      console.error("Error creating match:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create match",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Match</CardTitle>
          <CardDescription>Create a new match between two users</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user1">User 1</Label>
              <Select value={user1} onValueChange={setUser1}>
                <SelectTrigger id="user1">
                  <SelectValue placeholder="Select user 1" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user2">User 2</Label>
              <Select value={user2} onValueChange={setUser2}>
                <SelectTrigger id="user2">
                  <SelectValue placeholder="Select user 2" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compatibilityScore">Compatibility Score (%)</Label>
              <Input
                id="compatibilityScore"
                type="number"
                min="1"
                max="100"
                value={compatibilityScore}
                onChange={(e) => setCompatibilityScore(Number.parseInt(e.target.value))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Match"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
