'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExperienceContext } from './ExperienceContext'
import { PersistentScene } from './PersistentScene'
import { RouteTransitions } from './RouteTransitions'
import { createTransitionSignal, notifyTransition } from './experience-state'
import styles from './Experience.module.css'

export function Experience({ children }: { children: React.ReactNode }) {
  const [signal] = useState(createTransitionSignal)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onUnavailable = useCallback(() => setReady(false), [])

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
      reducedMotion,
    }),
    [ready, reducedMotion],
  )

  return (
    <ExperienceContext.Provider value={context}>
      <RouteTransitions signal={signal}>
        <div
          className={styles.root}
          data-motion={reducedMotion ? 'reduced' : 'running'}
        >
          {children}
          <PersistentScene
            signal={signal}
            onReady={onReady}
            onUnavailable={onUnavailable}
          />
        </div>
      </RouteTransitions>
    </ExperienceContext.Provider>
  )
}
