'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Script from 'next/script'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

export const GoogleAnalytics = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!GA_TRACKING_ID) return

    const analyticsWindow = window as AnalyticsWindow
    analyticsWindow.dataLayer ||= []

    // Queue page views immediately, even before the analytics library loads.
    if (!analyticsWindow.gtag) {
      analyticsWindow.gtag = function () {
        analyticsWindow.dataLayer!.push(arguments)
      }
      analyticsWindow.gtag('js', new Date())
      analyticsWindow.gtag('config', GA_TRACKING_ID, { send_page_view: false })
    }

    const query = searchParams.toString()
    analyticsWindow.gtag('event', 'page_view', {
      page_path: pathname + (query ? `?${query}` : ''),
      page_location: window.location.href,
      page_title: document.title,
    })
    setMounted(true)
  }, [pathname, searchParams])

  // Start after hydration without a server-side preload competing with content.
  if (!GA_TRACKING_ID || !mounted) return null

  return (
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
    />
  )
}
