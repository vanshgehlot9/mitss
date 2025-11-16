"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view on mount and route change
    trackPageView()
  }, [pathname])

  const trackPageView = async () => {
    try {
      const referrer = document.referrer || 'direct'
      const userAgent = navigator.userAgent
      
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pathname,
          event: 'pageview',
          referrer,
          userAgent,
        }),
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  // Function to track custom events
  const trackEvent = async (event: string, data?: any) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pathname,
          event,
          ...data,
        }),
      })
    } catch (error) {
      console.error('Analytics event tracking error:', error)
    }
  }

  // Expose trackEvent globally for use in other components
  useEffect(() => {
    (window as any).trackAnalytics = trackEvent
  }, [pathname])

  return null // This component doesn't render anything
}

// Helper function to track phone number submissions
export function trackPhoneNumber(phoneNumber: string) {
  if (typeof window !== 'undefined' && (window as any).trackAnalytics) {
    (window as any).trackAnalytics('phone_submit', { phoneNumber })
  }
}

// Helper function to track custom events
export function trackCustomEvent(event: string, data?: any) {
  if (typeof window !== 'undefined' && (window as any).trackAnalytics) {
    (window as any).trackAnalytics(event, data)
  }
}
