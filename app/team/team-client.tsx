"use client"
import { Inter } from "next/font/google"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { TeamMemberCard } from "./founder-card"

const inter = Inter({ subsets: ["latin"] })

// Team member data
const teamMembers = [
  {
    id: 1,
    name: "David",
    avatar: "/images/team/david.png",
    role: "Co-Founder",
    bio: "Hello! I'm a rising junior at Rutgers studying industrial engineering. Outside of academics, I love traveling and skiing. I'm passionate about entrepreneurship, and I hope that one day every Rutgers student will start and end their roommate search with Coha.",
  },
  {
    id: 2,
    name: "Dhruv",
    avatar: "/images/team/aryan.png",
    role: "Co-Founder",
    bio: "Hello! I'm a rising sophomore at Rutgers studying Computer Science and Neuroscience. In my free time, I design clothes and play videogames competitively. I joined this team to help create the kind of roommate-matching experience I wish I had when I was searching.",
  },
  {
    id: 3,
    name: "Murat",
    avatar: "/images/team/murat.png",
    role: "Co-Founder",
    bio: "Hey! I'm a rising junior at Rutgers and am studying industrial engineering. I love to play tennis and chess in my free time. I came up with the idea of Coha during my out-of-state roommate search— now, I can make my vision reality with the perfect team!",
  },
  {
    id: 4,
    name: "Violette",
    avatar: "/images/team/violette.png",
    role: "Social Media Lead",
    bio: "Hi everyone! I'm a rising sophomore at Rutgers studying Cognitive Science with minors in Psych and Business Admin. I love concerts, reading, and day trips. I can't wait to help our website grow and for students to use Coha for their roommate search!",
  },
  {
    id: 5,
    name: "Aryan",
    avatar: "/images/team/dhruv.png",
    role: "Matching Lead",
    bio: "Hello! I'm a rising junior at Rutgers studying Math, Computer Science, and Economics. In my free time, I enjoy working on cars and calisthenics, and I hope to one day work in quant. I joined this team to apply machine learning to a more practical solution!",
  },
]

export default function TeamPage() {
  return (
    <div className={`min-h-screen bg-white text-gray-900 ${inter.className}`}>
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Meet Our Team</h1>
            <p className="text-lg text-gray-600 text-center mb-12">
              The team behind Coha - the first (and most advanced) roommate matching platform for Rutgers
            </p>
          </motion.div>

          <div className="space-y-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TeamMemberCard member={member} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-softblack flex items-center justify-center text-white font-semibold">
              CH
            </div>
            <span className="font-medium text-gray-900">Coha</span>
          </div>
          <p className="text-sm text-center text-gray-600">© {new Date().getFullYear()} Coha. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
