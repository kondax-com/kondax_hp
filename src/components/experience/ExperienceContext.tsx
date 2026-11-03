'use client'

import { createContext, useContext } from 'react'

export const ExperienceContext = createContext<{
  ready: boolean
  paused: boolean
  reducedMotion: boolean
  togglePaused: () => void
} | null>(null)

export function useExperience() {
  return useContext(ExperienceContext)
}
