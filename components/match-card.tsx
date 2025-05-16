"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Instagram, Mail, Phone, Star } from "lucide-react"

interface MatchProps {
  id: string
  name: string
  avatar: string
  major: string
  year: string
  compatibility: number
  bio: string
  tags?: string[]
  instagram?: string
  email?: string
  phone?: string
  matchingTraits?: string[]
}

export function MatchCard({ match }: { match: MatchProps }) {
  const [expanded, setExpanded] = useState(false)

  // Get initials for avatar fallback
  const getInitials = () => {
    return match.name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
      <CardContent className="p-0">
        {/* Basic Info - Always Visible */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <Avatar className="h-20 w-20 border-2 border-gray-200">
              <AvatarImage src={match.avatar || "/placeholder.svg"} alt={match.name} className="object-cover" />
              <AvatarFallback className="bg-gray-100 text-gray-800">{getInitials()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{match.name}</h3>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <Star className="h-4 w-4 text-gray-500" />
                    <span className="sr-only">Favorite</span>
                  </Button>
                </div>
              </div>

              <p className="text-gray-600 mb-3">
                {match.major} • {match.year}
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {match.tags?.map((tag, i) => (
                  <Badge key={i} variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 p-0 h-auto"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Less Info
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  More Info
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Info */}
        {expanded && (
          <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50/80">
            <div className="space-y-4">
              {/* Bio Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
                <p className="text-gray-700">{match.bio}</p>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="space-y-2">
                  {match.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{match.email}</span>
                    </div>
                  )}
                  {match.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{match.phone}</span>
                    </div>
                  )}
                  {match.instagram && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Instagram className="h-4 w-4 text-gray-500" />
                      <span>@{match.instagram}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
