import { generateMetadata } from "@/lib/metadata"
import DashboardClientPage from "./DashboardClientPage"

// Define metadata for this page
export const metadata = generateMetadata({
  title: "Dashboard",
  description: "View your roommate matches and housing deadlines",
  image: "/images/dashboard-preview.png", // Custom image for dashboard page
  path: "/dashboard",
})

export default function DashboardPage() {
  return <DashboardClientPage />
}
