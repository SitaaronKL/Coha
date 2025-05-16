"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Instagram,
  Mail,
  Phone,
  Star,
  ThumbsUp,
  XCircle,
  Twitter,
} from "lucide-react"

interface MatchingTrait {
  category: string
  value: string
  match: boolean
}

interface Match {
  id: number
  name: string
  avatar: string
  major: string
  year: string
  compatibility: number
  bio: string
  tags: string[]
  instagram?: string
  twitter?: string
  email: string
  phone: string
  matchingTraits: MatchingTrait[]
}

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-row md:flex-col gap-4 items-center">
              <Avatar className="h-20 w-20 border-2 border-gray-200">
                <AvatarImage src={match.avatar || "/placeholder.svg"} alt={match.name} />
                <AvatarFallback className="bg-gray-100 text-gray-800">{getInitials(match.name)}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center">
                {/* Remove this div:
                <div className="bg-black/10 backdrop-blur-sm text-gray-900 text-sm font-medium px-2 py-1 rounded-full mb-1 border border-gray-200">
                  {match.compatibility}% Match
                </div>
                */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between mb-2">
                <div>
                  <h3 className="text-xl font-medium text-gray-900">{match.name}</h3>
                  <p className="text-sm text-gray-600">
                    {match.major}, {match.year}
                  </p>
                </div>

                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <>
                        Less Info
                        <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        More Info
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{match.bio}</p>

              <div className="flex flex-wrap gap-2">
                {match.tags && match.tags.length > 0 ? (
                  match.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700 border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No tags available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  {match.instagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <Instagram className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">@{match.instagram}</span>
                      <a
                        href={`https://instagram.com/${match.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-gray-900 hover:text-gray-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}

                  {match.twitter && (
                    <div className="flex items-center gap-2 text-sm">
                      <Twitter className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">@{match.twitter}</span>
                      <a
                        href={`https://twitter.com/${match.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-gray-900 hover:text-gray-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">{match.email}</span>
                    <a href={`mailto:${match.email}`} className="ml-auto text-gray-900 hover:text-gray-700">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">{match.phone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Matching Traits</h4>
                {match.matchingTraits && match.matchingTraits.length > 0 ? (
                  <div className="space-y-3">
                    {match.matchingTraits.map((trait, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        {trait.match ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        )}
                        <div>
                          <div className="text-gray-600">{trait.category}</div>
                          <div className={trait.match ? "text-gray-900" : "text-gray-500"}>{trait.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No matching traits information available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
