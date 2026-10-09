'use client'

import { createContext, useContext, useRef } from 'react'
import { useNativeReveal } from '@/components/useNativeReveal'

const FadeInStaggerContext = createContext(false)

export function FadeIn(props: React.ComponentPropsWithoutRef<'div'>) {
  const ref = useRef<HTMLDivElement>(null)
  const isInStaggerGroup = useContext(FadeInStaggerContext)
  useNativeReveal(ref, { enabled: !isInStaggerGroup })

  return <div ref={ref} data-native-reveal="" {...props} />
}

export function FadeInStagger({
  faster = false,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { faster?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useNativeReveal(ref, {
    itemAttribute: 'data-native-reveal',
    groupAttribute: 'data-fade-group',
    stagger: faster ? 0.12 : 0.2,
  })

  return (
    <FadeInStaggerContext.Provider value={true}>
      <div ref={ref} data-fade-group="" {...props} />
    </FadeInStaggerContext.Provider>
  )
}
