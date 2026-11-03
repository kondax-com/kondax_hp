'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { FlowController } from './flow-renderer'
import styles from './FlowScene.module.css'

type FlowSceneProps = {
  pauseLabel: string
  playLabel: string
  sceneLabel: string
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
  pauseLabel,
  playLabel,
  sceneLabel,
}: FlowSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<FlowController | null>(null)
  const pausedRef = useRef(false)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    let started = false
    async function start() {
      if (started || cancelled) return
      started = true
      try {
        const { createFlowRenderer } = await import('./flow-renderer')
        if (cancelled) return
        controllerRef.current = createFlowRenderer(host!, {
          paused: pausedRef.current,
          onReady: () => {
            if (!cancelled) setReady(true)
          },
          onError: () => {
            if (!cancelled) setReady(false)
          },
        })
      } catch (error) {
        // A decorative enhancement must not prevent access to the page.
        console.warn(
          'KONDAX: the decorative 3D scene could not be loaded.',
          error,
        )
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          void start()
        }
      },
      { rootMargin: '180px' },
    )
    observer.observe(host)

    return () => {
      cancelled = true
      observer.disconnect()
      controllerRef.current?.dispose()
      controllerRef.current = null
    }
  }, [])

  function togglePaused() {
    const next = !pausedRef.current
    pausedRef.current = next
    setPaused(next)
    controllerRef.current?.setPaused(next)
  }

  return (
    <div
      className={styles.scene}
      data-ready={ready}
      data-motion={paused ? 'paused' : 'running'}
    >
      <div className={styles.halo} aria-hidden="true" />
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.fallback} aria-hidden="true">
        <RibbonFallback />
      </div>
      <div ref={hostRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.caption}>
        <span className={styles.captionMark} aria-hidden="true" />
        <span>{sceneLabel}</span>
      </div>
      {ready && (
        <button
          type="button"
          className={styles.control}
          onClick={togglePaused}
          aria-label={paused ? playLabel : pauseLabel}
          aria-pressed={paused}
        >
          {paused ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m5 3 8 5-8 5Z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M5 3v10M11 3v10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          )}
          <span>{paused ? playLabel : pauseLabel}</span>
        </button>
      )}
    </div>
  )
}
