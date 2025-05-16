"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function DebugStorage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isFixing, setIsFixing] = useState(false)
  const [fixResult, setFixResult] = useState<any>(null)

  const checkPermissions = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/storage/check-permissions")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message || "Failed to check permissions" })
    } finally {
      setIsLoading(false)
    }
  }

  const fixBucket = async () => {
    setIsFixing(true)
    setFixResult(null)

    try {
      const response = await fetch("/api/storage/fix-bucket", {
        method: "POST",
      })
      const data = await response.json()
      setFixResult(data)

      // If fix was successful, check permissions again
      if (data.success) {
        await checkPermissions()
      }
    } catch (error) {
      setFixResult({ success: false, error: error.message || "Failed to fix bucket" })
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Storage Bucket Diagnostics</CardTitle>
        <CardDescription>Check and fix storage bucket permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Button onClick={checkPermissions} disabled={isLoading} variant="outline">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Storage Permissions"
              )}
            </Button>

            <Button
              onClick={fixBucket}
              disabled={isFixing || isLoading}
              variant="default"
              className="bg-softblack hover:bg-gray-800 text-white"
            >
              {isFixing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing...
                </>
              ) : (
                "Fix Storage Bucket"
              )}
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded-md ${result.success ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                    {result.success ? "Storage bucket is accessible" : "Storage bucket issue detected"}
                  </h3>

                  {result.success ? (
                    <div className="text-sm text-green-700 mt-1">
                      <p>Bucket name: {result.bucket?.name}</p>
                      <p>Public access: {result.bucket?.public ? "Yes" : "No"}</p>
                      <p>Files: {result.fileCount}</p>
                      <p>Can upload: {result.permissions?.canUpload ? "Yes" : "No"}</p>
                      {!result.permissions?.canUpload && result.permissions?.uploadError && (
                        <p className="text-red-600 mt-1">Upload error: {result.permissions.uploadError.message}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-700 mt-1">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {fixResult && (
            <div className={`p-4 rounded-md ${fixResult.success ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {fixResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-medium ${fixResult.success ? "text-green-800" : "text-red-800"}`}>
                    {fixResult.success ? "Storage bucket fixed" : "Failed to fix storage bucket"}
                  </h3>
                  <p className="text-sm mt-1">{fixResult.message || fixResult.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        If issues persist, check your Supabase storage permissions in the dashboard.
      </CardFooter>
    </Card>
  )
}
