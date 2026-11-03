'use client'

import { createContext, useContext } from 'react'

export const ExperienceContext = createContext<{
  ready: boolean
  reducedMotion: boolean
} | null>(null)

export function useExperience() {
  return useContext(ExperienceContext)
}
