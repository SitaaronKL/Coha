"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { event, pageview } from "@/lib/analytics"

export function AnalyticsTest() {
  useEffect(() => {
    // Track page view on component mount
    pageview(window.location.pathname)
  }, [])

  const handleTestEvent = () => {
    event({
      action: "test_button_click",
      category: "engagement",
      label: "Test Button",
      value: 1,
    })
    alert("Test event sent to Google Analytics. Check console for details.")
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg mt-4">
      <h3 className="font-medium mb-2">Google Analytics Test</h3>
      <p className="text-sm text-gray-600 mb-4">Click the button below to send a test event to Google Analytics.</p>
      <Button onClick={handleTestEvent}>Send Test Event</Button>
    </div>
  )
}
