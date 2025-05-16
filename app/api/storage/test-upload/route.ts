import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Create a regular client for the current user
    const cookieStore = cookies()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        auth: {
          cookieStore,
        },
      },
    )

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const userId = session.user.id
    const bucketName = "avatar-urls"
    const testContent = new Blob(["test"], { type: "text/plain" })
    const testFileName = `user-test-${userId}-${Date.now()}.txt`

    // Try to upload a test file as the authenticated user
    const { data, error } = await supabase.storage.from(bucketName).upload(testFileName, testContent, { upsert: true })

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Upload failed: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    // Clean up the test file
    await supabase.storage.from(bucketName).remove([testFileName])

    return NextResponse.json({
      success: true,
      message: "Upload test successful. Your user can upload files to the bucket.",
      userId,
      bucketName,
    })
  } catch (error) {
    console.error("Error in test-upload route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
