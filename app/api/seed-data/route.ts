import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a new Supabase client for this API route
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      persistSession: false,
    },
  },
)

export async function GET() {
  try {
    // First check if Rutgers already exists
    const { data: existingUniversities, error: checkError } = await supabaseAdmin.from("universities").select("name")

    if (checkError) throw checkError

    const existingNames = existingUniversities.map((uni) => uni.name)

    // Filter out universities that already exist
    const universitiesToAdd = [
      { name: "Stanford University", domain: "stanford.edu", location: "Stanford, CA" },
      { name: "Harvard University", domain: "harvard.edu", location: "Cambridge, MA" },
      { name: "MIT", domain: "mit.edu", location: "Cambridge, MA" },
      { name: "UC Berkeley", domain: "berkeley.edu", location: "Berkeley, CA" },
      { name: "UCLA", domain: "ucla.edu", location: "Los Angeles, CA" },
      { name: "Rutgers University", domain: "rutgers.edu", location: "New Brunswick, NJ" },
    ].filter((uni) => !existingNames.includes(uni.name))

    // Only insert if there are new universities to add
    let universities = existingUniversities

    if (universitiesToAdd.length > 0) {
      const { data: newUniversities, error: uniError } = await supabaseAdmin
        .from("universities")
        .insert(universitiesToAdd)
        .select()

      if (uniError) throw uniError

      if (newUniversities) {
        universities = [...existingUniversities, ...newUniversities]
      }
    }

    // Get Stanford ID for reference (for housing deadlines)
    const stanfordUni = universities.find((u) => u.name === "Stanford University")

    if (stanfordUni) {
      // Check if housing deadlines already exist
      const { data: existingDeadlines, error: checkDeadlinesError } = await supabaseAdmin
        .from("housing_deadlines")
        .select("title")
        .eq("university_id", stanfordUni.id)

      if (checkDeadlinesError) throw checkDeadlinesError

      // Only add deadlines if none exist
      if (!existingDeadlines || existingDeadlines.length === 0) {
        const { error: deadlineError } = await supabaseAdmin.from("housing_deadlines").insert([
          {
            university_id: stanfordUni.id,
            title: "Housing Application Deadline",
            description: "Deadline to submit housing application for next academic year",
            deadline_date: "2023-04-15",
          },
          {
            university_id: stanfordUni.id,
            title: "Roommate Selection Period",
            description: "Period to select roommates for next academic year",
            deadline_date: "2023-05-15",
          },
        ])

        if (deadlineError) throw deadlineError
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      added: universitiesToAdd.length,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
