'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  clamp,
  damp,
  smoothProgress,
  resolveScenePose,
  resolveTransitionPose,
  type SceneAnchor,
  type SceneVisualPose,
} from './scene-timeline'
import type {
  ExperienceRenderer,
  SceneFrame,
  TransitionSignal,
} from './experience-state'
import styles from './Experience.module.css'

type Props = {
  signal: TransitionSignal
  onReady: () => void
  onUnavailable: () => void
}

export function PersistentScene({ signal, onReady, onUnavailable }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const refreshRef = useRef<() => void>(() => {})
  const pathname = usePathname()

  useEffect(() => {
    refreshRef.current()
  }, [pathname])

  useEffect(() => {
    const element = hostRef.current
    if (!element) return
    const host: HTMLDivElement = element
    let renderer: ExperienceRenderer | null = null
    let renderHealthy = false
    let disposed = false
    let raf = 0
    let lastTime = 0
    let lastScroll = window.scrollY
    let time = 0
    let width = window.innerWidth
    let height = window.innerHeight
    let needsMeasure = true
    let needsResize = true
    let initialized = false
    let anchors: SceneAnchor[] = []
    let items: HTMLElement[] = []
    let itemProgress: number[] = []
    let readingAreas: {
      left: number
      right: number
      top: number
      bottom: number
    }[] = []
    let previousMotionDisabled: boolean | undefined
    let previousPhase = signal.phase
    let flightSource: SceneVisualPose | null = null
    let flightStarted = 0
    let flightRequest = signal.requestId
    let revealRotation: SceneVisualPose | undefined
    let pointerX = 0
    let pointerY = 0
    let pointerTarget: Element | null = null
    let focusTarget: Element | null = null
    let lastDiagnostic = 0
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = matchMedia('(pointer: fine)')
    let pose: SceneAnchor = {
      x: width * 0.75,
      y: height * 0.45,
      size: 400,
      chapter: 0,
      morph: 0,
      opacity: 0,
    }
    const frame: SceneFrame = {
      time: 0,
      delta: 0,
      width,
      height,
      centerX: pose.x,
      centerY: pose.y,
      size: pose.size,
      rotationX: 0.22,
      rotationY: -0.32,
      rotationZ: -0.18,
      morph: 0,
      chapter: 0,
      velocity: 0,
      pointerX: 0,
      pointerY: 0,
      focus: 0,
      opacity: 0,
      transition: 0,
      originX: 0.5,
      originY: 0.5,
      compact: width <= 760,
      reducedMotion: reduced.matches,
    }

    function schedule() {
      if (!raf && !disposed && !document.hidden)
        raf = requestAnimationFrame(tick)
    }

    function refresh() {
      needsMeasure = true
      schedule()
    }
    refreshRef.current = refresh

    function measure(scroll: number) {
      const compact = width <= 760
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-flow-anchor]'),
      )
      anchors = elements
        .flatMap((element) => {
          const rect = element.getBoundingClientRect()
          if (rect.width <= 0 || rect.height <= 0) return []
          const chapter = Number(element.dataset.flowChapter || 0)
          const kind = element.dataset.flowAnchor
          const defaults = kind === 'work' || kind === 'approach'
          const section =
            kind === 'services'
              ? element.closest('section')?.getBoundingClientRect()
              : null
          return [
            {
              kind,
              x: defaults
                ? width * (compact ? 0.94 : 0.9)
                : rect.left +
                  rect.width * (kind === 'services' && !compact ? 0.48 : 0.5),
              y:
                rect.top +
                scroll +
                (defaults
                  ? Math.min(rect.height * 0.24, height * 0.5)
                  : rect.height / 2),
              size: defaults
                ? compact
                  ? 125
                  : 215
                : Math.min(
                    rect.width * (kind === 'services' ? 0.8 : 0.92),
                    rect.height *
                      (kind === 'hero'
                        ? 0.82
                        : kind === 'services'
                          ? 0.84
                          : 0.94),
                  ),
              chapter,
              morph: Number(element.dataset.flowMorph || 0),
              opacity: defaults ? 0.13 : 1,
              holdUntil:
                section && !compact
                  ? section.bottom + scroll - height * 0.08
                  : undefined,
            },
          ]
        })
        .filter((anchor) => anchor.size > 0)
        .sort((a, b) => a.y - b.y)
      items = Array.from(
        document.querySelectorAll<HTMLElement>('[data-motion-item]'),
      )
      // All layout reads happen before the CSS-variable writes below.
      itemProgress = items.map((element) => {
        const rect = element.getBoundingClientRect()
        return clamp((height * 0.94 - rect.top) / Math.max(1, height * 0.65))
      })
      readingAreas = Array.from(
        document.querySelectorAll<HTMLElement>('[data-scene-avoid]'),
      ).flatMap((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
          ? [
              {
                left: rect.left,
                right: rect.right,
                top: rect.top + scroll,
                bottom: rect.bottom + scroll,
              },
            ]
          : []
      })
      needsMeasure = false
    }

    function tick(timestamp: number) {
      raf = 0
      if (disposed || document.hidden) {
        lastTime = 0
        return
      }
      const delta = lastTime
        ? clamp((timestamp - lastTime) / 1000, 0, 0.05)
        : 1 / 60
      lastTime = timestamp
      const scroll = window.scrollY
      const motionDisabled = signal.paused || reduced.matches
      if (signal.phase !== previousPhase) {
        needsMeasure = true
        if (signal.phase === 'revealing')
          revealRotation = {
            x: frame.centerX,
            y: frame.centerY,
            size: frame.size,
            rotationX: frame.rotationX,
            rotationY: frame.rotationY,
            rotationZ: frame.rotationZ,
            morph: frame.morph,
            chapter: frame.chapter,
            opacity: frame.opacity,
          }
        previousPhase = signal.phase
      }
      if (needsResize && renderer) {
        renderer.resize(
          width,
          height,
          Math.min(devicePixelRatio || 1, width <= 760 ? 1.25 : 1.5),
        )
        needsResize = false
      }
      const layoutChanged = needsMeasure
      if (layoutChanged) measure(scroll)
      const target = resolveScenePose(anchors, scroll, height) || {
        x: width * 0.9,
        y: Math.min(height * 0.32, 300),
        size: width <= 760 ? 165 : 280,
        chapter: 2.4,
        morph: 0.7,
        opacity: 0.06 * clamp(1 - scroll / Math.max(1, height * 0.7)),
      }
      if (!initialized || motionDisabled) {
        pose = { ...target }
        initialized = true
      } else {
        pose.x = damp(pose.x, target.x, 9, delta)
        pose.y = damp(pose.y, target.y, 9, delta)
        pose.size = damp(pose.size, target.size, 8, delta)
        pose.morph = damp(pose.morph, target.morph, 7, delta)
        pose.chapter = damp(pose.chapter, target.chapter, 8, delta)
        pose.opacity = damp(pose.opacity, target.opacity, 7, delta)
      }
      const visibility =
        clamp((pose.y + pose.size * 0.55) / Math.max(1, pose.size * 0.4)) *
        clamp(
          (height - pose.y + pose.size * 0.55) / Math.max(1, pose.size * 0.4),
        )
      const radius = pose.size * 0.52
      const readingOverlap = readingAreas.reduce((overlap, area) => {
        const dx = Math.max(area.left - pose.x, pose.x - area.right, 0)
        const documentY = pose.y + scroll
        const dy = Math.max(area.top - documentY, documentY - area.bottom, 0)
        const softEdge = radius * 0.65 + 24
        return Math.max(
          overlap,
          smoothProgress((radius + 24 - dx) / softEdge) *
            smoothProgress((radius + 24 - dy) / softEdge),
        )
      }, 0)
      const readingOpacity = 1 - readingOverlap * 0.98
      if (
        !motionDisabled &&
        (pose.opacity * visibility > 0.005 || signal.phase !== 'idle')
      )
        time += delta
      const velocity =
        signal.phase === 'idle' && !motionDisabled
          ? clamp((scroll - lastScroll) / Math.max(1, height * delta), -3, 3)
          : 0
      lastScroll = scroll
      frame.velocity = damp(frame.velocity, velocity, 7, delta)
      frame.pointerX = motionDisabled
        ? 0
        : damp(frame.pointerX, pointerX, 8, delta)
      frame.pointerY = motionDisabled
        ? 0
        : damp(frame.pointerY, pointerY, 8, delta)
      const hovered = (focusTarget || pointerTarget)?.closest<HTMLElement>(
        '[data-scene-focus]',
      )
      const focus = hovered ? Number(hovered.dataset.sceneFocus || 0) : 0
      frame.focus = damp(frame.focus, focus, 8, delta)
      const transition = clamp(signal.progress)
      const baseVisual: SceneVisualPose = {
        x: pose.x,
        y: pose.y,
        size: pose.size,
        rotationX:
          0.22 + Math.sin(pose.chapter * 1.1) * 0.24 + frame.pointerY * 0.16,
        rotationY: -0.32 + pose.chapter * 0.65 + frame.pointerX * 0.24,
        rotationZ: -0.18 + Math.sin(pose.chapter * 1.8) * 0.16,
        morph: pose.morph,
        chapter: pose.chapter,
        opacity: pose.opacity * visibility * readingOpacity,
      }
      if (
        signal.phase !== 'idle' &&
        (!flightSource ||
          (flightRequest !== signal.requestId && transition === 0))
      ) {
        flightSource = {
          x: frame.centerX,
          y: frame.centerY,
          size: frame.size,
          rotationX: frame.rotationX,
          rotationY: frame.rotationY,
          rotationZ: frame.rotationZ,
          morph: frame.morph,
          chapter: frame.chapter,
          opacity: frame.opacity,
        }
        flightStarted = time
        revealRotation = undefined
      }
      flightRequest = signal.requestId
      const visual =
        flightSource && signal.phase !== 'idle' && !motionDisabled
          ? resolveTransitionPose(
              signal.phase === 'revealing' ? baseVisual : flightSource,
              flightSource,
              time - flightStarted,
              transition,
              width,
              height,
              revealRotation,
            )
          : baseVisual
      if (signal.phase === 'idle') {
        flightSource = null
        revealRotation = undefined
      }
      frame.width = width
      frame.height = height
      frame.delta = delta
      frame.time = time
      frame.centerX = visual.x
      frame.centerY = visual.y
      frame.size = visual.size
      frame.rotationX = visual.rotationX
      frame.rotationY = visual.rotationY
      frame.rotationZ = visual.rotationZ
      frame.morph = visual.morph
      frame.chapter = visual.chapter
      frame.opacity = visual.opacity
      frame.transition = transition
      frame.originX = signal.originX
      frame.originY = signal.originY
      frame.compact = width <= 760
      frame.reducedMotion = reduced.matches
      const transitioning = signal.phase !== 'idle' ? 'true' : 'false'
      if (host.dataset.transition !== transitioning)
        host.dataset.transition = transitioning
      const visibilityStyle = reduced.matches ? 'hidden' : ''
      if (host.style.visibility !== visibilityStyle)
        host.style.visibility = visibilityStyle
      if (timestamp - lastDiagnostic > 180) {
        host.dataset.time = time.toFixed(2)
        host.dataset.chapter = pose.chapter.toFixed(3)
        host.dataset.morph = pose.morph.toFixed(3)
        lastDiagnostic = timestamp
      }
      if (layoutChanged || previousMotionDisabled !== motionDisabled) {
        for (let i = 0; i < items.length; i++) {
          items[i].style.setProperty(
            '--motion-progress',
            motionDisabled ? '1' : itemProgress[i].toFixed(4),
          )
        }
        previousMotionDisabled = motionDisabled
      }
      renderer?.render(frame)
      const unsettled =
        Math.abs(pose.x - target.x) +
          Math.abs(pose.y - target.y) +
          Math.abs(pose.size - target.size) +
          Math.abs(pose.morph - target.morph) * 100 >
        0.15
      if (
        (renderer &&
          renderHealthy &&
          !motionDisabled &&
          frame.opacity > 0.005) ||
        signal.phase !== 'idle' ||
        (renderHealthy && !motionDisabled && unsettled)
      )
        schedule()
      else lastTime = 0
    }

    function onScroll() {
      refresh()
    }
    function onResize() {
      width = window.innerWidth
      height = window.innerHeight
      needsResize = true
      refresh()
    }
    function onPointer(event: PointerEvent) {
      if (signal.paused || reduced.matches) return
      const weight = finePointer.matches ? 1 : 0.22
      pointerX =
        clamp((event.clientX / Math.max(1, width)) * 2 - 1, -1, 1) * weight
      pointerY =
        clamp(1 - (event.clientY / Math.max(1, height)) * 2, -1, 1) * weight
      pointerTarget = event.target instanceof Element ? event.target : null
      schedule()
    }
    function onLeave() {
      pointerX = 0
      pointerY = 0
      pointerTarget = null
      schedule()
    }
    function onFocus(event: FocusEvent) {
      focusTarget = event.target instanceof Element ? event.target : null
      schedule()
    }
    function onBlur() {
      focusTarget = null
      onLeave()
    }
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        lastTime = 0
      } else refresh()
    }

    const resizeObserver = new ResizeObserver(refresh)
    const main = document.getElementById('main-content')
    if (main) resizeObserver.observe(main)
    const mutationObserver = new MutationObserver(refresh)
    if (main) mutationObserver.observe(main, { childList: true, subtree: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointercancel', onLeave, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    reduced.addEventListener('change', refresh)
    // Context events do not bubble; capture restarts the one owner after recovery.
    host.addEventListener('webglcontextrestored', refresh, true)
    signal.listeners.add(refresh)
    void document.fonts.ready.then(() => {
      if (!disposed) refresh()
    })
    void import('./scene-renderer')
      .then(({ createExperienceRenderer }) => {
        if (disposed) return
        renderer = createExperienceRenderer(host, {
          onReady: () => {
            if (!disposed) {
              renderHealthy = true
              host.dataset.ready = 'true'
              onReady()
            }
          },
          onError: () => {
            if (!disposed) {
              renderHealthy = false
              host.dataset.ready = 'false'
              onUnavailable()
            }
          },
        })
        if (!renderer) onUnavailable()
        refresh()
      })
      .catch((error: unknown) => {
        if (!disposed) {
          console.warn('KONDAX: scene enhancement unavailable.', error)
          onUnavailable()
        }
      })
    schedule()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      refreshRef.current = () => {}
      signal.listeners.delete(refresh)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointercancel', onLeave)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', refresh)
      host.removeEventListener('webglcontextrestored', refresh, true)
      renderer?.dispose()
    }
  }, [signal, onReady, onUnavailable])

  return (
    <div
      ref={hostRef}
      className={styles.layer}
      data-experience-scene
      data-ready="false"
      aria-hidden="true"
    />
  )
}
