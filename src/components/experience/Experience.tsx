'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { Pause, Play } from 'lucide-react'
import { ExperienceContext } from './ExperienceContext'
import { PersistentScene } from './PersistentScene'
import { RouteTransitions } from './RouteTransitions'
import { createTransitionSignal, notifyTransition } from './experience-state'
import styles from './Experience.module.css'

export function Experience({ children }: { children: React.ReactNode }) {
  const [signal] = useState(createTransitionSignal)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const pausedRef = useRef(false)
  const ja = useLocale() === 'ja'
  const onReady = useCallback(() => setReady(true), [])
  const onUnavailable = useCallback(() => setReady(false), [])
  const togglePaused = useCallback(() => {
    pausedRef.current = !pausedRef.current
    signal.paused = pausedRef.current
    setPaused(pausedRef.current)
    notifyTransition(signal)
  }, [signal])

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      signal.reducedMotion = media.matches
      setReducedMotion(media.matches)
      notifyTransition(signal)
    }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [signal])

  const context = useMemo(
    () => ({
      ready: ready && !reducedMotion,
      paused,
      reducedMotion,
      togglePaused,
    }),
    [ready, paused, reducedMotion, togglePaused],
  )
  const label = paused
    ? ja
      ? 'アニメーションを再生'
      : 'Play animation'
    : ja
      ? 'アニメーションを停止'
      : 'Pause animation'

  return (
    <ExperienceContext.Provider value={context}>
      <RouteTransitions signal={signal}>
        <div
          className={styles.root}
          data-motion={
            reducedMotion ? 'reduced' : paused ? 'paused' : 'running'
          }
        >
          {children}
          <PersistentScene
            signal={signal}
            onReady={onReady}
            onUnavailable={onUnavailable}
          />
          {ready && !reducedMotion && (
            <button
              className={styles.control}
              type="button"
              onClick={togglePaused}
              aria-label={label}
              aria-pressed={paused}
              data-experience-control
            >
              {paused ? (
                <Play size={13} aria-hidden="true" />
              ) : (
                <Pause size={13} aria-hidden="true" />
              )}
              <span>{label}</span>
            </button>
          )}
        </div>
      </RouteTransitions>
    </ExperienceContext.Provider>
  )
}
