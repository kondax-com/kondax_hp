'use client'

import { useReducedMotion } from 'framer-motion'
import * as m from 'framer-motion/m'
import { ReactNode } from 'react'

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

const containerVariants = {
  initial: {},
  in: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
}

export function StaggerContainer({ children, className = '', delay = 0 }: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      variants={containerVariants}
      initial="initial"
      animate="in"
      className={className}
      style={{ 
        transition: `all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s`
      }}
    >
      {children}
    </m.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </m.div>
  )
}
