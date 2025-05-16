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
  const [testResult, setTestResult] = useState<any>(null)
  const [isDirectFixing, setIsDirectFixing] = useState(false)
  const [directFixResult, setDirectFixResult] = useState<any>(null)

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

  const testUpload = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/storage/test-upload")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ success: false, error: error.message || "Failed to test upload" })
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

  const directFixRLS = async () => {
    setIsDirectFixing(true)
    setDirectFixResult(null)

    try {
      const response = await fetch("/api/storage/direct-fix-rls", {
        method: "POST",
      })
      const data = await response.json()
      setDirectFixResult(data)

      // If fix was successful, test upload
      if (data.success) {
        await testUpload()
      }
    } catch (error) {
      setDirectFixResult({ success: false, error: error.message || "Failed to fix RLS policies" })
    } finally {
      setIsDirectFixing(false)
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
          <div className="flex flex-wrap gap-2">
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

            <Button onClick={testUpload} disabled={isLoading} variant="outline">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Upload"
              )}
            </Button>

            <Button
              onClick={directFixRLS}
              disabled={isDirectFixing || isLoading}
              variant="default"
              className="bg-softblack hover:bg-gray-800 text-white"
            >
              {isDirectFixing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing RLS...
                </>
              ) : (
                "Fix RLS Policies"
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

          {testResult && (
            <div className={`p-4 rounded-md ${testResult.success ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                    {testResult.success ? "Upload test successful" : "Upload test failed"}
                  </h3>
                  <p className="text-sm mt-1">{testResult.message || testResult.error}</p>
                </div>
              </div>
            </div>
          )}

          {directFixResult && (
            <div className={`p-4 rounded-md ${directFixResult.success ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {directFixResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-medium ${directFixResult.success ? "text-green-800" : "text-red-800"}`}>
                    {directFixResult.success ? "RLS policies fixed" : "Failed to fix RLS policies"}
                  </h3>
                  <p className="text-sm mt-1">{directFixResult.message || directFixResult.error}</p>

                  {directFixResult.logs && (
                    <div className="mt-2">
                      <details>
                        <summary className="cursor-pointer text-sm font-medium">View logs</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {directFixResult.logs.map((log: string, i: number) => (
                            <div key={i}>{log}</div>
                          ))}
                        </pre>
                      </details>
                    </div>
                  )}
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
