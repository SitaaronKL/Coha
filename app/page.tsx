"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Inter } from "next/font/google"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { TraditionalMatchingVisualization, CohaMatchingVisualization } from "@/components/comparison-visualization"

const inter = Inter({ subsets: ["latin"] })

// SVG path for the letter "C"
const C_PATH = "M60,20 C30,20 10,40 10,70 C10,100 30,120 60,120 C80,120 95,110 105,95"
// SVG path for the letter "o" - improved to ensure no gap
const O_PATH =
  "M150,40 C120,40 100,50 100,70 C100,90 120,100 150,100 C180,100 200,90 200,70 C200,50 180,40 150,40 C150,40 150,40 150,40"
// SVG path for the letter "h" - moved closer to the "o"
const H_PATH = "M220,10 L220,120 M220,65 C220,50 240,40 260,40 C280,40 300,50 300,65 L300,120"
// SVG path for the letter "a" - adjusted position to match new "h" position
const A_PATH =
  "M360,40 C330,40 310,50 310,70 C310,90 330,100 360,100 C390,100 410,90 410,70 L410,40 L410,120 M410,50 C410,45 390,40 360,40"

// Component for typing animation - speed increased by 30%
const TypedText = ({ text, className, delay = 0 }) => {
  const controls = useAnimation()
  const textRef = useRef(null)
  const isInView = useInView(textRef, { once: true, margin: "-100px" })
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    if (isInView) {
      let i = 0
      // Speed increased by 30% (from 30ms to 21ms)
      const typingInterval = setInterval(() => {
        if (i <= text.length) {
          setDisplayedText(text.slice(0, i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 21) // Typing speed increased by 30%

      return () => clearInterval(typingInterval)
    }
  }, [isInView, text])

  return (
    <div ref={textRef} className={className}>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="inline-block w-1 h-5 bg-black animate-pulse ml-1">|</span>
      )}
    </div>
  )
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const processRef = useRef(null)
  const getStartedRef = useRef(null)
  const isInView = useInView(heroRef, { once: true })
  const controls = useAnimation()

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className={`min-h-screen bg-white text-gray-900 ${inter.className}`}>
      {/* Keep the existing header section */}
      <header className="border-b border-gray-200/40 backdrop-blur-md bg-white/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-softblack text-white flex items-center justify-center font-semibold">
              CH
            </div>
            <span className="font-medium">Coha</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection(statsRef)}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Why?
            </button>
            <button
              onClick={() => scrollToSection(processRef)}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              How?
            </button>
            <button
              onClick={() => scrollToSection(getStartedRef)}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Get started
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex text-gray-700 hover:text-black hover:bg-gray-100"
              asChild
            >
              <Link href="/auth?tab=login">Log in</Link>
            </Button>
            <Button size="sm" className="bg-softblack hover:bg-gray-800 text-white" asChild>
              <Link href="/auth?tab=signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Minimalist with animated text */}
        <section ref={heroRef} className="min-h-[90vh] flex flex-col items-center justify-center relative px-2">
          {" "}
          {/* Add horizontal padding */}
          <div className="text-center px-4 w-full">
            {" "}
            {/* Add padding and full width */}
            {/* SVG for drawing animation */}
            <motion.svg
              width="100%" // Change from fixed width to 100%
              height="auto" // Auto height to maintain aspect ratio
              viewBox="0 0 420 130"
              initial="hidden"
              animate={controls}
              className="mx-auto max-w-[420px]" // Add max-width to prevent it from getting too large
            >
              {/* C */}
              <motion.path
                d={C_PATH}
                stroke="black"
                strokeWidth="10"
                fill="transparent"
                variants={{
                  hidden: { pathLength: 0, opacity: 0 },
                  visible: {
                    pathLength: 1,
                    opacity: 1,
                    transition: {
                      pathLength: { duration: 0.7, ease: "easeInOut" }, // 30% faster (from 1s to 0.7s)
                      opacity: { duration: 0.21 }, // 30% faster (from 0.3s to 0.21s)
                    },
                  },
                }}
              />

              {/* o - improved path to ensure no gap */}
              <motion.path
                d={O_PATH}
                stroke="black"
                strokeWidth="10"
                fill="transparent"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{
                  hidden: { pathLength: 0, opacity: 0 },
                  visible: {
                    pathLength: 1,
                    opacity: 1,
                    transition: {
                      pathLength: { duration: 0.7, ease: "easeInOut", delay: 0.35 }, // 30% faster
                      opacity: { duration: 0.21, delay: 0.35 }, // 30% faster
                    },
                  },
                }}
              />

              {/* h - moved closer to the "o" */}
              <motion.path
                d={H_PATH}
                stroke="black"
                strokeWidth="10"
                fill="transparent"
                variants={{
                  hidden: { pathLength: 0, opacity: 0 },
                  visible: {
                    pathLength: 1,
                    opacity: 1,
                    transition: {
                      pathLength: { duration: 0.7, ease: "easeInOut", delay: 0.7 }, // 30% faster
                      opacity: { duration: 0.21, delay: 0.7 }, // 30% faster
                    },
                  },
                }}
              />

              {/* a - adjusted position */}
              <motion.path
                d={A_PATH}
                stroke="black"
                strokeWidth="10"
                fill="transparent"
                variants={{
                  hidden: { pathLength: 0, opacity: 0 },
                  visible: {
                    pathLength: 1,
                    opacity: 1,
                    transition: {
                      pathLength: { duration: 0.7, ease: "easeInOut", delay: 1.05 }, // 30% faster
                      opacity: { duration: 0.21, delay: 1.05 }, // 30% faster
                    },
                  },
                }}
              />
            </motion.svg>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.56, delay: 1.75 }} // 30% faster (from 0.8s to 0.56s, delay from 2.5s to 1.75s)
            >
              <p className="text-xl md:text-2xl text-gray-600 mt-6 max-w-md mx-auto">
                Find your perfect college roommate match
              </p>
            </motion.div>
          </div>
        </section>

        {/* Statistics Section - with typing animation and white background */}
        {/* Statistics Section - Quadrant Layout */}
        <section ref={statsRef} className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-6">
              {/* First Quadrant - Statistic 1 */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-8 shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <TypedText
                    text="Compatible roommates show 37% lower rates of depression symptoms"
                    className="text-lg md:text-xl font-bold leading-relaxed"
                  />
                  <p className="text-sm text-gray-500 mt-2">Journal of College Student Psychotherapy, 2020</p>
                </div>
              </div>

              {/* Second Quadrant - Statistic 2 */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-8 shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <TypedText
                    text="Compatible roommates expand each other's social networks by an average of 40%"
                    className="text-lg md:text-xl font-bold leading-relaxed"
                  />
                  <p className="text-sm text-gray-500 mt-2">Social Psychology of Education, 2020</p>
                </div>
              </div>

              {/* Third Quadrant - Statistic 3 */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-8 shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <TypedText
                    text="50.1% of women and 44.1% of men reported 'frequent' or 'occasional' conflict with roommates"
                    className="text-lg md:text-xl font-bold leading-relaxed"
                  />
                  <p className="text-sm text-gray-500 mt-2">Nationwide survey of 31,500 students</p>
                </div>
              </div>

              {/* Fourth Quadrant - Down Arrow */}
              <div
                className="bg-softblack rounded-xl p-4 md:p-8 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:translate-y-1"
                onClick={() => scrollToSection(processRef)}
              >
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <p className="text-white font-medium mb-4">See Our Process</p>
                    <ChevronDown className="h-12 w-12 text-white animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Comparison Section - Different layouts for mobile and desktop */}
        <section id="process-section" ref={processRef} className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">A Better Way to Match</h2>

            {/* Mobile Layout (stacked) */}
            <div className="md:hidden">
              {/* Traditional Process Text */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Traditional Process
                  <br />4 parameters max
                </h3>

                <div className="mt-2 mb-3 text-center">
                  <p className="text-lg mb-2">Universities typically ask:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Do you smoke?</li>
                    <li>• Are you a night owl or early bird?</li>
                    <li>• Do you study with music?</li>
                    <li>• How clean is your room?</li>
                  </ul>
                </div>
              </motion.div>

              {/* Traditional Process Image */}
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <TraditionalMatchingVisualization />
              </motion.div>

              {/* Our Process Text */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-2 text-center">
                  Our Process
                  <br />
                  256+ parameters
                </h3>

                <div className="mt-1 text-center">
                  <p className="text-lg mb-2">Our algorithm considers:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Detailed lifestyle preferences</li>
                    <li>• Study habits and academic goals</li>
                    <li>• Social patterns and personality traits</li>
                    <li>• Conflict resolution styles</li>
                    <li>• And 250+ more parameters</li>
                  </ul>
                </div>
              </motion.div>

              {/* Our Process Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CohaMatchingVisualization />
              </motion.div>
            </div>

            {/* Desktop Layout (side by side with offset) */}
            <div className="hidden md:grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Old Process - Text above image */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Traditional Process
                  <br />4 parameters max
                </h3>

                <div className="mt-2 mb-3 text-center">
                  <p className="text-lg mb-2">Universities typically ask:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Do you smoke?</li>
                    <li>• Are you a night owl or early bird?</li>
                    <li>• Do you study with music?</li>
                    <li>• How clean is your room?</li>
                  </ul>
                </div>

                <TraditionalMatchingVisualization />
              </motion.div>

              {/* Our Process - Image above text */}
              <motion.div
                className="flex flex-col items-center -mt-[100px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CohaMatchingVisualization />

                <h3 className="text-2xl font-bold mt-2 mb-2 text-center">
                  Our Process
                  <br />
                  256+ parameters
                </h3>

                <div className="mt-1 text-center">
                  <p className="text-lg mb-2">Our algorithm considers:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Detailed lifestyle preferences</li>
                    <li>• Study habits and academic goals</li>
                    <li>• Social patterns and personality traits</li>
                    <li>• Conflict resolution styles</li>
                    <li>• And 250+ more parameters</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Get Started Section - Modified as requested */}
        <section ref={getStartedRef} className="py-24 bg-white relative z-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.56 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6">
                  Find Your Ideal College Roommate Easily
                </h2>
                <p className="text-lg text-gray-700 mb-8">Have a say in your roommate with Coha</p>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-gray-200 shadow-lg max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Get started with your university email</h3>
                  <form className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="your.name@university.edu"
                        className="w-full bg-white/90 border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        We only accept .edu email addresses to ensure a safe community
                      </p>
                    </div>
                    <Button className="w-full bg-softblack hover:bg-gray-800 text-white" asChild>
                      <Link href="/auth?tab=signup">
                        Create Your Profile <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-12 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-softblack flex items-center justify-center text-white font-semibold">
                  CH
                </div>
                <span className="font-medium text-gray-900">Coha</span>
              </div>
              <p className="text-sm text-gray-600">
                Helping university students find their ideal roommates since 2023.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection(statsRef)}
                    className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Why?
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection(processRef)}
                    className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    How?
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection(getStartedRef)}
                    className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Get started
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Safety Tips
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-sm text-gray-600 text-center">
            © {new Date().getFullYear()} Coha. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
