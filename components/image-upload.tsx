"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { createClientSideSupabaseClient } from "@/lib/supabase"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  onError: (error: string) => void
  size?: "small" | "medium" | "large"
}

export function ImageUpload({ onImageUploaded, onError, size = "small" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set dimensions based on size prop
  const dimensions = {
    small: {
      container: "max-w-[200px]",
      preview: "max-w-[150px]",
      dropzone: "p-3",
      icon: "h-8 w-8",
      text: "text-xs",
      subtext: "text-xs",
    },
    medium: {
      container: "max-w-[250px]",
      preview: "max-w-[200px]",
      dropzone: "p-4",
      icon: "h-10 w-10",
      text: "text-sm",
      subtext: "text-xs",
    },
    large: {
      container: "max-w-[300px]",
      preview: "max-w-[250px]",
      dropzone: "p-6",
      icon: "h-12 w-12",
      text: "text-sm",
      subtext: "text-xs",
    },
  }[size]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Check file type
    const fileType = file.type
    if (!fileType.startsWith("image/")) {
      onError("Please select an image file (JPG, PNG, GIF, etc.)")
      return
    }

    // Check file size (max 2MB for base64)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      onError("File is too large. Maximum size is 2MB for direct uploads.")
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearSelection = () => {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !preview) return

    try {
      setIsUploading(true)
      console.log("Starting direct profile update with image data URL")

      // Get the current user ID
      const supabase = createClientSideSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to upload an image")
      }

      const userId = session.user.id

      // Use the data URL directly from the preview
      const imageDataUrl = preview

      // Update the user profile with the image data URL
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: imageDataUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("Profile update error:", error)
        throw new Error(`Failed to update profile: ${error.message}`)
      }

      console.log("Profile updated successfully with image data URL")

      // Call the callback with the URL
      onImageUploaded(imageDataUrl)

      // Clear the selection
      handleClearSelection()
    } catch (error) {
      console.error("Error updating profile with image:", error)

      // Provide more helpful error messages
      let errorMessage = "Failed to update profile with image"

      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
      }

      onError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`space-y-3 ${dimensions.container}`}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      {!preview ? (
        <Card
          className={`border-2 border-dashed text-center ${dimensions.dropzone} ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } transition-colors duration-200 cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center justify-center space-y-1 py-2">
            <ImageIcon className={`text-gray-400 ${dimensions.icon}`} />
            <p className={`text-gray-600 ${dimensions.text}`}>Upload image</p>
            <p className={`text-gray-500 ${dimensions.subtext}`}>Max 2MB</p>
          </div>
        </Card>
      ) : (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <div className={`relative aspect-square mx-auto ${dimensions.preview}`}>
            <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
          </div>
          <button
            onClick={handleClearSelection}
            className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100 transition-opacity"
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {preview && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleClearSelection} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-softblack hover:bg-gray-800 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="mr-1 h-3 w-3" />
                Save
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
