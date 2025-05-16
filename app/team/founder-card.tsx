"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface TeamMemberProps {
  member: {
    id: number
    name: string
    avatar: string
    role: string
    bio: string
  }
}

export function TeamMemberCard({ member }: TeamMemberProps) {
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
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} className="object-cover" />
                <AvatarFallback className="bg-gray-100 text-gray-800">{getInitials(member.name)}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center">
                <div className="bg-black/10 backdrop-blur-sm text-gray-900 text-sm font-medium px-2 py-1 rounded-full mb-1 border border-gray-200 min-w-[100px] text-center">
                  {member.role}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-2">
                <h3 className="text-xl font-medium text-gray-900">{member.name}</h3>
              </div>

              <p className="text-gray-700 mb-3">{member.bio}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
