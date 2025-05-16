import { createClientSideSupabaseClient } from "./supabase"

export async function getUserProfile(userId: string) {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      universities (
        name,
        location
      )
    `)
    .eq("id", userId)
    .single()

  if (error) throw error

  return data
}

export async function updateUserProfile(
  userId: string,
  profileData: {
    firstName?: string
    lastName?: string
    major?: string
    year?: string
    bio?: string
    phone?: string
    instagram?: string
  },
) {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      major: profileData.major,
      year: profileData.year,
      bio: profileData.bio,
      phone: profileData.phone,
      instagram: profileData.instagram,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()

  if (error) throw error

  return data
}

export async function updatePrivacySettings(
  userId: string,
  settings: {
    showEmail?: boolean
    showPhone?: boolean
    showSocialMedia?: boolean
  },
) {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("privacy_settings")
    .update({
      show_email: settings.showEmail,
      show_phone: settings.showPhone,
      show_social_media: settings.showSocialMedia,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()

  if (error) throw error

  return data
}

// Update the uploadAvatar function to work with a public bucket

// Replace the entire uploadAvatar function with this updated version:
export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClientSideSupabaseClient()
  const bucketName = "avatar-urls" // Using the existing bucket

  try {
    // Validate file type
    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const validTypes = ["jpg", "jpeg", "png", "gif", "webp"]

    if (!fileExt || !validTypes.includes(fileExt)) {
      throw new Error("Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.")
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error("File is too large. Maximum size is 5MB.")
    }

    // Create a unique file name with user ID prefix for better organization and security
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 10)
    const fileName = `${userId}/${timestamp}-${randomString}.${fileExt}`

    console.log(`Attempting to upload to bucket: ${bucketName}, path: ${fileName}`)

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Allow overwriting files with the same name
    })

    if (uploadError) {
      console.error("Upload error details:", uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log("Upload successful, getting public URL")

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    console.log("Public URL obtained:", publicUrl)

    // Update the user profile with the avatar URL
    const { data, error } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()

    if (error) {
      console.error("Profile update error:", error)
      throw new Error(`Failed to update profile with new avatar: ${error.message}`)
    }

    return { data, publicUrl }
  } catch (error) {
    console.error("Error in uploadAvatar:", error)
    throw error
  }
}
