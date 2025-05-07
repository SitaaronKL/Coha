"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCurrentUser } from "@/lib/auth"
import { submitQuestionnaire } from "@/lib/questionnaire"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import "./metallic-shimmer.css"

const inter = Inter({ subsets: ["latin"] })

// Define the questions and options
const lifestyleQuestions = [
  {
    id: 1,
    question: "What's your sleep time preference?",
    options: [
      { id: "a", text: "Early Bird (10pm - 8am)" },
      { id: "b", text: "Night Owl (Past midnight - 10am)" },
      { id: "c", text: "Unpredictable" },
    ],
  },
  {
    id: 2,
    question: "How social are you in relation to your room?",
    options: [
      { id: "a", text: "Extrovert - plan on meeting many people and having them over" },
      { id: "b", text: "Happy balance" },
      { id: "c", text: "Introvert - my room is my sanctuary" },
    ],
  },
  {
    id: 3,
    question:
      "Are you comfortable with your roommate having close friends or a significant other over (overnight guests)?",
    options: [
      { id: "a", text: "Sure, I don't mind" },
      { id: "b", text: "I'd prefer not at all" },
      { id: "c", text: "Only if I'm not there" },
    ],
  },
  {
    id: 4,
    question: "How do you feel about shared resources (food, clothing, etc.)?",
    options: [
      { id: "a", text: "Of course! Happy to share" },
      { id: "b", text: "Clothing but not food" },
      { id: "c", text: "Food but not clothing" },
      { id: "d", text: "I prefer not to share supplies" },
    ],
  },
  {
    id: 5,
    question: "What's your approach to cleaning and taking out trash?",
    options: [
      { id: "a", text: "I need my room to be spotless, and I take out the trash when I see it's getting full" },
      {
        id: "b",
        text: "I don't mind having some laundry on the floor and I wait for the bin to overfill before taking care of it",
      },
    ],
  },
  {
    id: 6,
    question: "What temperature do you like your room?",
    options: [
      { id: "a", text: "North pole (below 66°F)" },
      { id: "b", text: "Average (68-72°F)" },
      { id: "c", text: "Warm (74°F+)" },
    ],
  },
  {
    id: 7,
    question: "How often do you eat in your room?",
    options: [
      { id: "a", text: "Absolutely never" },
      { id: "b", text: "Occasional snack" },
      { id: "c", text: "Frequently" },
    ],
  },
  {
    id: 8,
    question: "What's your relationship with noise?",
    options: [
      { id: "a", text: "I prefer a quiet environment, no music and I use headphones" },
      {
        id: "b",
        text: "As loud as my roommate wants during the day, as long as it's quiet when I'm falling asleep or studying",
      },
      { id: "c", text: "Party, loud music, talking, etc." },
    ],
  },
]

// MBTI question as a separate part
const mbtiQuestion = {
  id: 9,
  question: "What's your MBTI personality type?",
  type: "mbti",
  categories: [
    {
      name: "Analysts",
      description:
        "Intuitive (N) and Thinking (T) personality types, known for their rationality, impartiality, and intellectual excellence.",
      color: "bg-[#8e5e9f] hover:bg-[#7d4f8c] active:bg-[#6c4079]",
      metallicClass: "metallic-analysts",
      options: [
        { id: "INTJ", text: "Architect" },
        { id: "INTP", text: "Logician" },
        { id: "ENTJ", text: "Commander" },
        { id: "ENTP", text: "Debater" },
      ],
    },
    {
      name: "Diplomats",
      description:
        "Intuitive (N) and Feeling (F) personality types, known for their empathy, diplomatic skills, and passionate idealism.",
      color: "bg-[#2a9d8f] hover:bg-[#248a7e] active:bg-[#1e776d]",
      metallicClass: "metallic-diplomats",
      options: [
        { id: "INFJ", text: "Advocate" },
        { id: "INFP", text: "Mediator" },
        { id: "ENFJ", text: "Protagonist" },
        { id: "ENFP", text: "Campaigner" },
      ],
    },
    {
      name: "Sentinels",
      description:
        "Observant (S) and Judging (J) personality types, known for their practicality and focus on order, security, and stability.",
      color: "bg-[#3a86a8] hover:bg-[#327594] active:bg-[#2a6480]",
      metallicClass: "metallic-sentinels",
      options: [
        { id: "ISTJ", text: "Logistician" },
        { id: "ISFJ", text: "Defender" },
        { id: "ESTJ", text: "Executive" },
        { id: "ESFJ", text: "Consul" },
      ],
    },
    {
      name: "Explorers",
      description:
        "Observant (S) and Prospecting (P) personality types, known for their spontaneity, ingenuity, and flexibility.",
      color: "bg-[#d9a404] hover:bg-[#c29203] active:bg-[#ab8003]",
      metallicClass: "metallic-explorers",
      options: [
        { id: "ISTP", text: "Virtuoso" },
        { id: "ISFP", text: "Adventurer" },
        { id: "ESTP", text: "Entrepreneur" },
        { id: "ESFP", text: "Entertainer" },
      ],
    },
  ],
}

export default function QuestionnairePage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [showMBTI, setShowMBTI] = useState(false)
  const router = useRouter()
  // Add a new state to track whether the user has started the questionnaire
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          // Redirect to login if not authenticated
          router.push("/auth")
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
        router.push("/auth")
      }
    }

    loadUser()
  }, [router])

  const handleOptionSelect = (optionId: string) => {
    if (showMBTI) {
      setAnswers({ ...answers, [mbtiQuestion.id]: optionId })
    } else {
      setAnswers({ ...answers, [lifestyleQuestions[currentQuestion].id]: optionId })
    }
  }

  const handleNext = () => {
    if (currentQuestion < lifestyleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else if (currentQuestion === lifestyleQuestions.length - 1 && !showMBTI) {
      // Transition to MBTI section
      setShowMBTI(true)
    }
  }

  const handlePrevious = () => {
    if (showMBTI) {
      // Go back to lifestyle questions
      setShowMBTI(false)
      setCurrentQuestion(lifestyleQuestions.length - 1)
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your questionnaire.",
        variant: "destructive",
      })
      router.push("/auth")
      return
    }

    setIsLoading(true)

    try {
      await submitQuestionnaire(user.id, answers)
      router.push("/questionnaire/success")
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your questionnaire. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentQ = showMBTI ? mbtiQuestion : lifestyleQuestions[currentQuestion]
  const isLastLifestyleQuestion = currentQuestion === lifestyleQuestions.length - 1 && !showMBTI
  const canProceed = answers[currentQ.id] !== undefined

  // Modify the return statement to conditionally render either the intro or the questions
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32&text=TS" alt="Profile" />
                      <AvatarFallback className="bg-gray-100 text-gray-800">
                        {user.user_metadata?.first_name?.[0] || user.email?.[0] || "U"}
                      </AvatarFallback>
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
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/auth">Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {!hasStarted ? (
          // Intro screen
          <Card className="w-full max-w-2xl bg-white border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Before You Begin</CardTitle>
              <CardDescription className="text-gray-600">
                A few tips to help us find your perfect roommate match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-blue-800 mb-3">Be honest with your answers</h3>
                <p className="text-blue-700 mb-4">
                  The more honest you are, the better we can match you with compatible roommates. There are no right or
                  wrong answers!
                </p>

                <h3 className="font-semibold text-lg text-blue-800 mb-3">Answer for who you are now</h3>
                <p className="text-blue-700 mb-4">
                  Answer based on how you actually are today, save the new years resolutions for later. Your authentic
                  self will make for better matches.
                </p>

                <h3 className="font-semibold text-lg text-blue-800 mb-3">Take your time</h3>
                <p className="text-blue-700">
                  This questionnaire takes about 5 minutes to complete. Your answers will help us find your ideal
                  roommate options.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setHasStarted(true)} className="bg-softblack hover:bg-gray-800 text-white px-8">
                Start Questionnaire
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // Questionnaire content - keep the existing card and content
          <Card className="w-full max-w-2xl bg-white border-gray-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">
                  {showMBTI
                    ? "Part 2: Personality"
                    : `Part 1: Lifestyle (Question ${currentQuestion + 1} of ${lifestyleQuestions.length})`}
                </div>
              </div>

              <CardTitle className="text-xl mt-4 text-gray-900">
                {showMBTI ? "What's your MBTI personality type?" : currentQ.question}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {showMBTI
                  ? "Select your Myers-Briggs personality type to help us find compatible roommates"
                  : "Select the option that best describes your preference"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showMBTI ? (
                <div className="space-y-4">
                  {mbtiQuestion.categories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <h3 className="font-medium text-base">{category.name}</h3>
                      <p className="text-xs text-gray-600">{category.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {category.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            className={cn(
                              "p-2 rounded-md text-center transition-colors mbti-button",
                              category.color,
                              answers[mbtiQuestion.id] === option.id ? "ring-2 ring-offset-2 ring-black selected" : "",
                            )}
                          >
                            <div className={`font-medium text-sm metallic-text ${category.metallicClass}`}>
                              {option.text}
                            </div>
                            <div className="text-xs text-white opacity-90">{option.id}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-2 text-sm text-gray-600">
                    Don't know your personality type?{" "}Click 
                    <a
                      href="https://www.16personalities.com/free-personality-test"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      here
                    </a>{" "}
                     to take the test and come back.
                  </div>
                </div>
              ) : (
                // Rest of the code for non-MBTI questions remains the same
                <RadioGroup value={answers[currentQ.id] || ""} onValueChange={handleOptionSelect} className="space-y-3">
                  {currentQ.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors ${
                        answers[currentQ.id] === option.id
                          ? "border-black bg-black/5"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <RadioGroupItem value={option.id} id={`option-${option.id}`} className="text-black" />
                      <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer text-gray-800">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-200 pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={(currentQuestion === 0 && !showMBTI) || isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {showMBTI ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!answers[mbtiQuestion.id] || isLoading}
                  className="bg-softblack hover:bg-gray-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed || isLoading}
                  className="bg-softblack hover:bg-gray-800 text-white"
                >
                  {isLastLifestyleQuestion ? "Continue to Part 2" : "Next"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </main>

      <footer className="py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-gray-500">© {new Date().getFullYear()} Coha. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
