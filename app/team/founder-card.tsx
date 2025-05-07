"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Award } from "lucide-react"

interface FounderCardProps {
  founder: {
    id: number
    name: string
    avatar: string
    major: string
    year: string
    compatibility: number
    bio: string
    tags: string[]
    achievements: string[]
  }
}

export function FounderCard({ founder }: FounderCardProps) {
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
                <AvatarImage src={founder.avatar || "/placeholder.svg"} alt={founder.name} />
                <AvatarFallback className="bg-gray-100 text-gray-800">{getInitials(founder.name)}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center">
                <div className="bg-black/10 backdrop-blur-sm text-gray-900 text-sm font-medium px-2 py-1 rounded-full mb-1 border border-gray-200">
                  Founder
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between mb-2">
                <div>
                  <h3 className="text-xl font-medium text-gray-900">{founder.name}</h3>
                  <p className="text-sm text-gray-600">
                    {founder.major}, {founder.year}
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

              <p className="text-gray-700 mb-3">{founder.bio}</p>

              <div className="flex flex-wrap gap-2">
                {founder.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Achievements</h4>
              <div className="space-y-3">
                {founder.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Award className="h-4 w-4 text-softblack mt-0.5" />
                    <div className="text-gray-700">{achievement}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
