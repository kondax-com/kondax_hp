'use client'

import { useEffect, useRef, type RefObject } from 'react'

interface RevealOptions {
  enabled?: boolean
  itemAttribute?: string
  groupAttribute?: string
  stagger?: number
  delay?: number
  startOnMount?: boolean
}

export function useNativeReveal(
  ref: RefObject<HTMLElement | null>,
  {
    enabled = true,
    itemAttribute,
    groupAttribute,
    stagger = 0,
    delay = 0,
    startOnMount = false,
  }: RevealOptions = {},
) {
  const revealed = useRef(false)

  useEffect(() => {
    const root = ref.current
    if (!enabled || !root || revealed.current) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Keep server-rendered content visible when it has already entered the screen.
    if (
      motionPreference.matches ||
      root.getBoundingClientRect().top < window.innerHeight
    ) {
      revealed.current = true
      return
    }

    if (!startOnMount && !('IntersectionObserver' in window)) return

    const items = itemAttribute
      ? Array.from(root.querySelectorAll<HTMLElement>(`[${itemAttribute}]`)).filter(
          (item) => !groupAttribute || item.closest(`[${groupAttribute}]`) === root,
        )
      : [root]
    let observer: IntersectionObserver | undefined

    function clear() {
      for (const item of items) {
        item.removeAttribute('data-reveal-state')
        item.style.removeProperty('--reveal-delay')
      }
    }

    function reveal() {
      revealed.current = true
      observer?.disconnect()
      for (const item of items) item.setAttribute('data-reveal-state', 'visible')
    }

    function onPreferenceChange() {
      if (!motionPreference.matches) return
      revealed.current = true
      observer?.disconnect()
      clear()
    }

    items.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${delay + index * stagger}s`)
      item.setAttribute('data-reveal-state', 'pending')
    })

    motionPreference.addEventListener('change', onPreferenceChange)

    if (startOnMount) {
      reveal()
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) reveal()
        },
        { rootMargin: '0px 0px -200px' },
      )
      observer.observe(root)
    }

    return () => {
      observer?.disconnect()
      motionPreference.removeEventListener('change', onPreferenceChange)
      clear()
    }
  }, [ref, enabled, itemAttribute, groupAttribute, stagger, delay, startOnMount])
}
