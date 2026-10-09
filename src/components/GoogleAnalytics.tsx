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

    // Initialize the queue before the analytics library loads.
    if (!analyticsWindow.gtag) {
      analyticsWindow.gtag = function () {
        analyticsWindow.dataLayer!.push(arguments)
      }
      analyticsWindow.gtag('js', new Date())
      analyticsWindow.gtag('config', GA_TRACKING_ID, { send_page_view: false })
    }

    const query = searchParams.toString()
    const pagePath = pathname + (query ? `?${query}` : '')
    const pageLocation = window.location.href
    let recorded = false
    let titleObserver: MutationObserver | undefined
    let titleTimeout: number | undefined

    function recordPageView(title: string) {
      if (recorded) return
      recorded = true
      titleObserver?.disconnect()
      window.clearTimeout(titleTimeout)
      window.removeEventListener('pagehide', onPageHide)
      analyticsWindow.gtag!('event', 'page_view', {
        page_path: pagePath,
        page_location: pageLocation,
        page_title: window.location.href === pageLocation ? title : pagePath,
      })
    }

    function onPageHide() {
      recordPageView(document.title || pagePath)
    }

    // App Router can temporarily clear the title while metadata is updating.
    if (document.title) {
      recordPageView(document.title)
    } else {
      titleObserver = new MutationObserver(() => {
        if (document.title) recordPageView(document.title)
      })
      titleObserver.observe(document.head, {
        childList: true,
        subtree: true,
        characterData: true,
      })
      titleTimeout = window.setTimeout(onPageHide, 1000)
      window.addEventListener('pagehide', onPageHide)
    }
    setMounted(true)

    // Preserve the visit if another navigation happens before its title arrives.
    return () => recordPageView(pagePath)
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
