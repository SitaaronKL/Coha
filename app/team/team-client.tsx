"use client"
import { Inter } from "next/font/google"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { FounderCard } from "./founder-card"

const inter = Inter({ subsets: ["latin"] })

// Founder data
const founders = [
  {
    id: 1,
    name: "David Gregory",
    avatar: "/placeholder.svg?height=400&width=400&text=DG",
    major: "Industrial Engineering",
    year: "Sophomore",
    compatibility: 98,
    bio: "I like making stuff",
    tags: ["Honors College", "Industrial Engineering", "Entrepreneur"],
    achievements: ["Cofounder of X Radar/RURadar", "Changemaking mentor", "Honors College"],
  },
  {
    id: 2,
    name: "Dhruv Lalwani",
    avatar: "/placeholder.svg?height=400&width=400&text=DL",
    major: "Computer Science & Neuroscience",
    year: "Freshman",
    compatibility: 97,
    bio: "I do not like making stuff",
    tags: ["Honors College", "Computer Science", "Neuroscience"],
    achievements: [
      "Incoming MongoDB backed startup founder",
      "Presidential Scholar",
    ],
  },
  {
    id: 3,
    name: "Murat Turkeli",
    avatar: "/placeholder.svg?height=400&width=400&text=MT",
    major: "Industrial Engineering",
    year: "Sophomore",
    compatibility: 96,
    bio: "I am international",
    tags: ["Honors College", "Industrial Engineering", "Tesla"],
    achievements: ["Incoming Tesla Intern"],
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
              The founders behind Coha - the first AI roommate matching platform for Rutgers
            </p>
          </motion.div>

          <div className="space-y-8">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FounderCard founder={founder} />
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
