'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const Toaster = dynamic(
  () => import('sonner').then(({ Toaster: SonnerToaster, toast }) => {
    return function LoadedToaster() {
      useEffect(() => {
        // Sonner subscribes in its child effect; replay any earlier form results.
        for (const notification of toast.getToasts()) {
          if ('dismiss' in notification) {
            continue
          }
          if (notification.type === 'success') {
            toast.success(notification.title, notification)
          } else if (notification.type === 'error') {
            toast.error(notification.title, notification)
          } else {
            toast.message(notification.title, notification)
          }
        }
      }, [])

      return <SonnerToaster richColors position="top-right" />
    }
  }),
  { ssr: false },
)

export function ContactToaster() {
  const pathname = usePathname()
  const [hasVisitedContact, setHasVisitedContact] = useState(false)

  useEffect(() => {
    if (pathname.endsWith('/contact')) {
      setHasVisitedContact(true)
    }
  }, [pathname])

  // Keep notifications available if a pending submission finishes after leaving.
  return hasVisitedContact ? <Toaster /> : null
}
