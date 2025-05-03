"use client"

import Image from "next/image"

export function TraditionalMatchingVisualization() {
  return (
    <div className="w-full max-w-md">
      <div className="relative aspect-square">
        <Image
          src="/images/group-2.png"
          alt="Traditional matching visualization showing multiple connections between a large circle and five dots"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
      </div>
    </div>
  )
}

export function CohaMatchingVisualization() {
  return (
    <div className="w-full max-w-md">
      <div className="relative aspect-square">
        <Image
          src="/images/group-1.png"
          alt="Coha matching visualization showing a single connection between a large circle and a small dot"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
      </div>
    </div>
  )
}
