import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json(
        {
          success: false,
          error: `Error listing buckets: ${bucketsError.message}`,
          details: bucketsError,
        },
        { status: 500 },
      )
    }

    const bucketName = "avatar-urls"
    const bucket = buckets?.find((b) => b.name === bucketName)

    if (!bucket) {
      return NextResponse.json(
        {
          success: false,
          error: `Bucket "${bucketName}" not found`,
          availableBuckets: buckets?.map((b) => b.name) || [],
        },
        { status: 404 },
      )
    }

    // Try to list files in the bucket to check permissions
    const { data: files, error: filesError } = await supabase.storage.from(bucketName).list()

    if (filesError) {
      return NextResponse.json(
        {
          success: false,
          error: `Error listing files: ${filesError.message}`,
          details: filesError,
          bucket: bucket,
        },
        { status: 500 },
      )
    }

    // Try to create a test file to check upload permissions
    const testContent = new Blob(["test"], { type: "text/plain" })
    const testFileName = `permission-test-${Date.now()}.txt`

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, testContent, { upsert: true })

    let uploadPermission = true
    let uploadErrorDetails = null

    if (uploadError) {
      uploadPermission = false
      uploadErrorDetails = uploadError
    } else {
      // Clean up the test file
      await supabase.storage.from(bucketName).remove([testFileName])
    }

    return NextResponse.json({
      success: true,
      bucket: {
        name: bucket.name,
        id: bucket.id,
        public: bucket.public,
      },
      permissions: {
        canList: true,
        canUpload: uploadPermission,
        uploadError: uploadErrorDetails,
      },
      fileCount: files?.length || 0,
    })
  } catch (error) {
    console.error("Error in check-permissions route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
