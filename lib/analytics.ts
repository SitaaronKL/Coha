// Check if we're in the browser environment
const isBrowser = typeof window !== "undefined"

// Initialize dataLayer
export const initGA = () => {
  if (isBrowser) {
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag("js", new Date())
    gtag("config", "G-R2SMXVHM1T", {
      page_path: window.location.pathname,
    })

    console.log("Google Analytics initialized")
  }
}

// Track page views
export const pageview = (url: string) => {
  if (isBrowser && (window as any).gtag) {
    ;(window as any).gtag("config", "G-R2SMXVHM1T", {
      page_path: url,
    })
    console.log("Pageview tracked:", url)
  } else {
    console.warn("Google Analytics not loaded yet")
  }
}

// Track events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (isBrowser && (window as any).gtag) {
    ;(window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
    console.log("Event tracked:", { action, category, label, value })
  } else {
    console.warn("Google Analytics not loaded yet")
  }
}
