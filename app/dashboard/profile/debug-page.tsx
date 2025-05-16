"use client"

import { useState } from "react"
import DebugStorage from "@/components/debug-storage"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [showDebug, setShowDebug] = useState(false)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Storage Debug Tools</h1>

      <Button onClick={() => setShowDebug(!showDebug)} variant="outline" className="mb-4">
        {showDebug ? "Hide Debug Tools" : "Show Debug Tools"}
      </Button>

      {showDebug && (
        <div className="space-y-6">
          <DebugStorage />

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Manual Fix Instructions:</strong> If the automatic fixes don't work, you can manually fix the
                  RLS policies in the Supabase dashboard:
                </p>
                <ol className="list-decimal ml-5 mt-2 text-sm text-yellow-700">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Navigate to Storage → Policies</li>
                  <li>
                    For the "avatar-urls" bucket, add these policies:
                    <ul className="list-disc ml-5 mt-1">
                      <li>
                        <strong>SELECT:</strong> Allow public access (true)
                      </li>
                      <li>
                        <strong>INSERT:</strong> Allow authenticated users (auth.role() = 'authenticated')
                      </li>
                      <li>
                        <strong>UPDATE:</strong> Allow users to update their own files (auth.uid()::text = owner)
                      </li>
                      <li>
                        <strong>DELETE:</strong> Allow users to delete their own files (auth.uid()::text = owner)
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
