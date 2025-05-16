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

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClientSideSupabaseClient()

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `avatars/${fileName}`

  // Upload the file
  const { error: uploadError } = await supabase.storage.from("user-avatars").upload(filePath, file)

  if (uploadError) throw uploadError

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("user-avatars").getPublicUrl(filePath)

  // Update the user profile with the avatar URL
  const { data, error } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()

  if (error) throw error

  return data
}
