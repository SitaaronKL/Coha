import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    )

    // Check if the user is authenticated with regular client
    const cookieStore = cookies()
    const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string, {
      auth: {
        cookieStore,
      },
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const bucketName = "avatar-urls"

    // Check if the bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    let bucketResult

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to create bucket: ${error.message}`,
          },
          { status: 500 },
        )
      }

      bucketResult = { created: true, name: bucketName }
    } else {
      // Update the bucket to be public
      const { error } = await supabaseAdmin.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to update bucket: ${error.message}`,
          },
          { status: 500 },
        )
      }

      bucketResult = { updated: true, name: bucketName }
    }

    // Set up public access policy for the bucket
    const { error: policyError } = await supabaseAdmin.storage.from(bucketName).createSignedUploadUrl("test.txt")

    if (policyError && !policyError.message.includes("already exists")) {
      console.warn("Warning: Could not verify upload policy:", policyError)
    }

    return NextResponse.json({
      success: true,
      message: bucketExists
        ? `Bucket "${bucketName}" updated successfully`
        : `Bucket "${bucketName}" created successfully`,
      bucket: bucketResult,
    })
  } catch (error) {
    console.error("Error in fix-bucket route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
