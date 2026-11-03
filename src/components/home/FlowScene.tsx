'use client'

import { useId } from 'react'
import { useExperience } from '@/components/experience/ExperienceContext'
import styles from './FlowScene.module.css'

type FlowSceneProps = {
  sceneLabel?: string
  chapter?: number
  morph?: number
  variant?: 'hero' | 'services' | 'contact'
}

function RibbonFallback() {
  const id = useId()
  const points = Array.from({ length: 241 }, (_, index) => {
    const t = (index / 240) * Math.PI * 2
    const x = (Math.sin(t) + 2 * Math.sin(2 * t)) * 50
    const y = (Math.cos(t) - 2 * Math.cos(2 * t)) * 50
    // Quantize coordinates so server/browser trigonometric rounding cannot differ at hydration.
    const px = (250 + x * 0.94 - y * 0.2).toFixed(3)
    const py = (228 + y * 0.94 + x * 0.2).toFixed(3)
    return `${index ? 'L' : 'M'}${px},${py}`
  }).join(' ')

  return (
    <svg viewBox="0 0 500 480" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id={`${id}-ribbon`}
          x1="110"
          y1="80"
          x2="380"
          y2="390"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e7e8ff" />
          <stop offset=".19" stopColor="#858be3" />
          <stop offset=".38" stopColor="#f5f5ff" />
          <stop offset=".53" stopColor="#5057be" />
          <stop offset=".7" stopColor="#a9aef1" />
          <stop offset=".85" stopColor="#e6e8fb" />
          <stop offset="1" stopColor="#5960ba" />
        </linearGradient>
      </defs>
      <path
        d={`${points} Z`}
        stroke="#cbd0e7"
        strokeWidth="42"
        strokeLinejoin="round"
      />
      <path
        d={`${points} Z`}
        stroke={`url(#${id}-ribbon)`}
        strokeWidth="39"
        strokeLinejoin="round"
      />
      <path
        d={`${points} Z`}
        stroke="#fff"
        strokeOpacity=".32"
        strokeWidth="1"
      />
    </svg>
  )
}

export function FlowScene({
  sceneLabel,
  chapter = 0,
  morph = 0,
  variant = 'hero',
}: FlowSceneProps) {
  const experience = useExperience()
  return (
    <div
      className={`${styles.scene} ${styles[variant]}`}
      data-flow-anchor={variant}
      data-flow-chapter={chapter}
      data-flow-morph={morph}
      data-ready={experience?.ready ?? false}
    >
      <div className={styles.halo} aria-hidden="true" />
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.fallback} aria-hidden="true">
        <RibbonFallback />
      </div>
      {sceneLabel && (
        <div className={styles.caption}>
          <span className={styles.captionMark} aria-hidden="true" />
          <span>{sceneLabel}</span>
        </div>
      )}
    </div>
  )
}
