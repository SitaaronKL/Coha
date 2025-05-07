import { generateMetadata } from "@/lib/metadata"
import TeamPage from "./team-client"

// Define metadata for this page
export const metadata = generateMetadata({
  title: "Our Team",
  description: "Meet the founders of Coha - the first AI roommate matching platform for Rutgers",
  path: "/team",
})

export default function TeamPageWrapper() {
  return <TeamPage />
}
