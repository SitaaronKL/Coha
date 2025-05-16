import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get the authenticated user from the cookie
    const cookieStore = cookies()
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    // Get the authenticated user
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    )

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const validTypes = ["jpg", "jpeg", "png", "gif", "webp"]

    if (!fileExt || !validTypes.includes(fileExt)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Please upload a JPG, PNG, GIF, or WebP image." },
        { status: 400 },
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File is too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Create a unique file name
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 10)
    const fileName = `${userId}/${timestamp}-${randomString}.${fileExt}`
    const bucketName = "avatar-urls"

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload the file using the admin client to bypass RLS
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ success: false, error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucketName).getPublicUrl(fileName)

    // Update the user profile with the avatar URL
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json(
        { success: false, error: `Failed to update profile: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      publicUrl,
      message: "Avatar uploaded successfully",
    })
  } catch (error) {
    console.error("Error in upload-avatar route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
}
