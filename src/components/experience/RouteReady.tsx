'use client'

import { useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  ROUTE_READY_EVENT,
  isVisibleRoute,
  type RouteReadyDetail,
} from './route-transition-utils'

/** Templates remount on navigation; this effect runs after the new DOM is committed. */
export function RouteReady({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element || !pathname) return
    // Hidden cached trees can already see the next pathname. Only a displayed
    // template may open the gate; resize also detects a cached tree reappearing.
    let reported = false
    const report = () => {
      if (reported || !isVisibleRoute(element)) return
      reported = true
      element.dataset.routeReady = pathname
      window.dispatchEvent(
        new CustomEvent<RouteReadyDetail>(ROUTE_READY_EVENT, {
          detail: { pathname, element },
        }),
      )
    }
    delete element.dataset.routeReady
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(report) : null
    observer?.observe(element)
    report()
    return () => {
      observer?.disconnect()
      delete element.dataset.routeReady
    }
  }, [pathname])

  return (
    <div ref={ref} className="w-full">
      {children}
    </div>
  )
}
