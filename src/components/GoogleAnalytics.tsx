'use client'

import { useEffect } from 'react'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  kondaxAnalyticsInitialized?: boolean
}

export const GoogleAnalytics = () => {
  useEffect(() => {
    if (!GA_TRACKING_ID) return

    const analyticsWindow = window as AnalyticsWindow
    analyticsWindow.dataLayer ||= []

    // Initialize the queue before the analytics library loads.
    if (!analyticsWindow.kondaxAnalyticsInitialized) {
      analyticsWindow.gtag ||= function () {
        if (arguments[0] === 'js' && typeof arguments[1] === 'number') {
          arguments[1] = new Date(arguments[1])
        }
        analyticsWindow.dataLayer!.push(arguments)
      }
      analyticsWindow.kondaxAnalyticsInitialized = true
      analyticsWindow.gtag('js', Date.now())
      // GA4 sends the initial page view and tracks subsequent history changes
      // through enhanced measurement. Manual events would count each visit twice.
      analyticsWindow.gtag('config', GA_TRACKING_ID)
    }
  }, [])

  return null
}
