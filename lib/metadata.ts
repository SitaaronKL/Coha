import type { Metadata } from "next"

interface GenerateMetadataOptions {
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  path?: string
}

/**
 * Generate page-specific metadata with Open Graph and Twitter card support
 *
 * @param options Configuration options for the metadata
 * @returns Metadata object for Next.js
 *
 */
export function generateMetadata(options: GenerateMetadataOptions): Metadata {
  const {
    title = "Coha",
    description = "Coha makes finding your ideal college roommate effortless. Create a profile, set your living preferences, browse compatible matches, and chat securely—all in one place.",
    image = "/og-image.jpg", // Updated to use the new image
    imageAlt = "Coha - Find your perfect college roommate match",
    imageWidth = 1200,
    imageHeight = 630,
    path = "",
  } = options

  const url = `https://coha.club${path}`
  const fullTitle = title === "Coha" ? title : `${title} | Coha`

  return {
    title: fullTitle,
    description,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.png", type: "image/svg+xml" },
      ],
      apple: "/favicon.png",
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "Coha",
      images: [
        {
          url: image,
          width: imageWidth,
          height: imageHeight,
          alt: imageAlt,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@cohaapp",
    },
  }
}
