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

    // Check if the bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketName = "avatar-urls"
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    if (bucketExists) {
      return NextResponse.json({
        success: true,
        message: `Bucket "${bucketName}" already exists`,
        bucketName,
      })
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })

    if (error) {
      console.error("Error creating bucket:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Bucket "${bucketName}" created successfully`,
      bucketName,
    })
  } catch (error) {
    console.error("Error in create-storage-bucket route:", error)
    return NextResponse.json({ success: false, error: error.message || "An unknown error occurred" }, { status: 500 })
  }
}
