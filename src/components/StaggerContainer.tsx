'use client'

import { useRef, type ReactNode } from 'react'
import { useNativeReveal } from '@/components/useNativeReveal'

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function StaggerContainer({
  children,
  className = '',
  delay = 0,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  useNativeReveal(ref, {
    itemAttribute: 'data-stagger-item',
    groupAttribute: 'data-stagger-container',
    stagger: 0.06,
    delay: 0.1 + delay,
    startOnMount: true,
  })

  return (
    <div ref={ref} data-stagger-container="" className={className}>
      {children}
    </div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div data-stagger-item="" className={className}>
      {children}
    </div>
  )
}
