'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  notifyTransition,
  type TransitionPhase,
  type TransitionSignal,
} from './experience-state'
import {
  ROUTE_READY_EVENT,
  coverRadius,
  getTransitionTarget,
  isCommittedRouteReady,
  isVisibleRoute,
  isSameLocale,
  normalizePathname,
  scrollEntryKey,
  withScrollEntry,
  ScrollPositions,
  waitForVisibleImages,
  type ScrollPosition,
  type RouteReadyDetail,
  type TransitionTarget,
} from './route-transition-utils'
import styles from './RouteTransitions.module.css'

type Intent = TransitionTarget & { x: number; y: number }
type Request = Intent & {
  id: number
  source: string
  committed: boolean
  readyStarted: boolean
  kind: 'push' | 'observed'
  entryKey: string | null
  restorePosition: ScrollPosition | null
  abort: AbortController
  watchdog?: ReturnType<typeof setTimeout>
}
type Controller = { observe: (pathname: string) => void; dispose: () => void }
type MainSnapshot = {
  opacity: string
  transform: string
  willChange: string
  overflowAnchor: string
  inert: boolean
  busy: string | null
}

export function RouteTransitions({
  signal,
  children,
}: {
  signal: TransitionSignal
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const coverRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<Controller | null>(null)

  useEffect(() => {
    const cover = coverRef.current
    if (!cover) return
    let disposed = false
    let active: Request | null = null
    let queued: Intent | null = null
    let lastPath = window.location.pathname
    let entryHref = window.location.href
    let currentEntry: string | null = null
    let popstateHref: string | null = null
    const positions = new ScrollPositions(100)
    const snapshots = new Map<HTMLElement, MainSnapshot>()
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reduced = () =>
      signal.paused || signal.reducedMotion || motionQuery.matches
    const current = (request: Request) =>
      !disposed && active === request && !request.abort.signal.aborted
    const main = () => document.getElementById('main-content')
    const announce = (text: string) => {
      if (statusRef.current) statusRef.current.textContent = text
    }

    function syncEntry(forceNew = false, fromPopState = false) {
      const state = window.history.state as unknown
      const existing = scrollEntryKey(state)
      const copiedFromPrevious =
        !fromPopState &&
        entryHref !== window.location.href &&
        existing === currentEntry
      let key = !forceNew && !copiedFromPrevious ? existing : null
      if (!key) {
        key = `kondax-${crypto.randomUUID()}`
        try {
          window.history.replaceState(
            withScrollEntry(state, key),
            '',
            window.location.href,
          )
        } catch {
          // If history metadata is unavailable, leave restoration to the browser.
          key = null
        }
      }
      currentEntry = key
      entryHref = window.location.href
      return key
    }

    function rememberScroll() {
      positions.remember(syncEntry(), { x: window.scrollX, y: window.scrollY })
    }

    function restoreScroll(request: Request) {
      const position =
        request.kind === 'push' ? { x: 0, y: 0 } : request.restorePosition
      if (position)
        window.scrollTo({
          left: position.x,
          top: position.y,
          behavior: 'instant',
        })
    }

    syncEntry()
    rememberScroll()

    function phase(value: TransitionPhase) {
      signal.phase = value
      cover!.dataset.phase = value
      notifyTransition(signal)
    }

    function remember(element: HTMLElement) {
      if (!snapshots.has(element))
        snapshots.set(element, {
          opacity: element.style.opacity,
          transform: element.style.transform,
          willChange: element.style.willChange,
          overflowAnchor: element.style.overflowAnchor,
          inert: element.inert,
          busy: element.getAttribute('aria-busy'),
        })
      return snapshots.get(element)!
    }

    function busy(inert: boolean) {
      const element = main()
      if (!element) return
      remember(element)
      element.setAttribute('aria-busy', 'true')
      element.inert = inert
      element.style.willChange = 'opacity, transform'
      element.style.overflowAnchor = 'none'
    }

    function progress(value: number, entering = false) {
      signal.progress = Math.min(1, Math.max(0, value))
      const radius = coverRadius(
        window.innerWidth,
        window.innerHeight,
        signal.originX,
        signal.originY,
      )
      const shortMotion = reduced()
      cover!.dataset.active = signal.progress > 0 ? 'true' : 'false'
      cover!.style.clipPath = shortMotion
        ? 'none'
        : `circle(${radius * signal.progress}px at ${signal.originX * 100}% ${signal.originY * 100}%)`
      cover!.style.opacity = shortMotion ? String(signal.progress) : ''
      cover!.style.setProperty('--flow-offset', `${signal.progress * 44}px`)
      const element = main()
      if (element) {
        const snapshot = remember(element)
        element.style.opacity = String(1 - signal.progress)
        const offset = shortMotion ? 0 : signal.progress * (entering ? 14 : -12)
        element.style.transform = `${snapshot.transform} translate3d(0, ${offset}px, 0)`
      }
      notifyTransition(signal)
    }

    function restore() {
      for (const [element, snapshot] of snapshots) {
        element.style.opacity = snapshot.opacity
        element.style.transform = snapshot.transform
        element.style.willChange = snapshot.willChange
        element.style.overflowAnchor = snapshot.overflowAnchor
        element.inert = snapshot.inert
        if (snapshot.busy === null) element.removeAttribute('aria-busy')
        else element.setAttribute('aria-busy', snapshot.busy)
      }
      snapshots.clear()
      cover!.dataset.active = 'false'
      cover!.style.opacity = ''
      cover!.style.clipPath = ''
      signal.progress = 0
    }

    function finish(request: Request, failed = false) {
      if (active !== request || disposed) return
      const visibleRoute = Array.from(
        main()?.querySelectorAll<HTMLElement>('[data-route-ready]') || [],
      ).find(isVisibleRoute)?.dataset.routeReady
      const needsDocumentRecovery =
        failed &&
        visibleRoute &&
        normalizePathname(visibleRoute) !==
          normalizePathname(window.location.pathname)
      clearTimeout(request.watchdog)
      request.abort.abort()
      if (failed) phase('recovering')
      restore()
      active = null
      lastPath = window.location.pathname
      if (!failed) restoreScroll(request)
      if (!needsDocumentRecovery) rememberScroll()
      phase('idle')
      if (!failed) {
        main()?.focus({ preventScroll: true })
        announce('')
      } else
        announce(
          document.documentElement.lang === 'ja'
            ? 'ページの切り替えを完了できませんでした。リンクをもう一度お試しください。'
            : 'The page transition could not finish. Please try the link again.',
        )
      const next = queued
      queued = null
      if (needsDocumentRecovery) {
        // An interrupted router commit must not leave old content under a new URL.
        // Let the browser load that URL normally; do not push a duplicate history entry.
        window.location.reload()
        return
      }
      if (
        next &&
        normalizePathname(next.pathname) !== normalizePathname(lastPath)
      )
        start(next)
    }

    function animate(
      request: Request,
      to: number,
      duration: number,
      entering = false,
    ) {
      return new Promise<boolean>((resolve) => {
        if (!current(request)) return resolve(false)
        const from = signal.progress
        const started = performance.now()
        let frame = 0
        const abort = () => {
          cancelAnimationFrame(frame)
          resolve(false)
        }
        request.abort.signal.addEventListener('abort', abort, { once: true })
        const tick = (time: number) => {
          if (!current(request)) return abort()
          const t = reduced()
            ? 1
            : Math.min(1, Math.max(0, (time - started) / duration))
          const eased = t * t * (3 - 2 * t)
          progress(from + (to - from) * eased, entering)
          if (t < 1) frame = requestAnimationFrame(tick)
          else {
            request.abort.signal.removeEventListener('abort', abort)
            resolve(true)
          }
        }
        frame = requestAnimationFrame(tick)
      })
    }

    function frame(request: Request) {
      return new Promise<boolean>((resolve) => {
        if (!current(request)) return resolve(false)
        const abort = () => {
          cancelAnimationFrame(id)
          resolve(false)
        }
        const id = requestAnimationFrame(() => {
          request.abort.signal.removeEventListener('abort', abort)
          resolve(current(request))
        })
        request.abort.signal.addEventListener('abort', abort, { once: true })
      })
    }

    async function ready(request: Request, reported: string) {
      if (!current(request) || !request.committed || request.readyStarted)
        return
      if (
        !isCommittedRouteReady({
          expected: request.pathname,
          source: request.source,
          reported,
          location: window.location.pathname,
        })
      )
        return
      request.readyStarted = true
      if (request.kind === 'push') request.entryKey = syncEntry(true)
      restoreScroll(request)
      const element = main()
      if (element) await waitForVisibleImages(element, request.abort.signal)
      if (
        !current(request) ||
        !(await frame(request)) ||
        !(await frame(request))
      )
        return
      clearTimeout(request.watchdog)
      // Reapply the requested position after the committed DOM, image decode
      // and paint have settled: new pages start at the top, history restores its entry.
      restoreScroll(request)
      phase('revealing')
      if (await animate(request, 0, 440, true)) finish(request)
    }

    function readyElement(path: string) {
      return Array.from(
        document.querySelectorAll<HTMLElement>('[data-route-ready]'),
      ).find(
        (element) =>
          isVisibleRoute(element) &&
          normalizePathname(element.dataset.routeReady || '') ===
            normalizePathname(path),
      )
    }

    function watch(request: Request) {
      request.watchdog = setTimeout(() => finish(request, true), 8000)
    }

    async function coverAndCommit(request: Request) {
      if (!(await frame(request))) return
      phase('covering')
      busy(true)
      if (!(await animate(request, 1, 280))) return
      if (!current(request)) return
      request.committed = true
      phase('committing')
      watch(request)
      try {
        router.push(request.href, { scroll: false })
        // push returns void. Only a new template's committed DOM can open the gate.
        if (
          readyElement(request.pathname) &&
          normalizePathname(window.location.pathname) ===
            normalizePathname(request.pathname)
        ) {
          void ready(request, request.pathname)
        }
      } catch {
        finish(request, true)
      }
    }

    function start(intent: Intent) {
      if (disposed) return
      if (active?.committed) {
        queued = intent
        return
      }
      if (!active) rememberScroll()
      const previous = active
      if (previous) {
        previous.abort.abort()
        clearTimeout(previous.watchdog)
      }
      const request: Request = {
        ...intent,
        id: ++signal.requestId,
        source: window.location.pathname,
        committed: false,
        readyStarted: false,
        kind: 'push',
        entryKey: null,
        restorePosition: null,
        abort: new AbortController(),
      }
      active = request
      cover!.dataset.routeTarget = request.pathname
      cover!.dataset.routeSource = request.source
      cover!.dataset.routeRequest = String(request.id)
      if (!previous || signal.progress === 0) {
        signal.originX = intent.x
        signal.originY = intent.y
      }
      phase('preparing')
      busy(false)
      announce(
        document.documentElement.lang === 'ja'
          ? 'ページを切り替えています…'
          : 'Changing page…',
      )
      try {
        router.prefetch(intent.href)
      } catch {
        /* Prefetch is an optional optimization. */
      }
      void coverAndCommit(request)
    }

    function observed(path: string) {
      if (disposed) return
      if (!isSameLocale(lastPath, path)) {
        queued = null
        if (active) finish(active)
        lastPath = path
        return
      }
      if (active) {
        active.abort.abort()
        clearTimeout(active.watchdog)
      }
      queued = null
      const entryKey = syncEntry()
      const request: Request = {
        id: ++signal.requestId,
        href: window.location.pathname + window.location.search,
        pathname: path,
        source: lastPath,
        x: 0.5,
        y: 0.5,
        committed: true,
        readyStarted: false,
        kind: 'observed',
        entryKey,
        restorePosition: positions.get(entryKey),
        abort: new AbortController(),
      }
      active = request
      cover!.dataset.routeTarget = request.pathname
      cover!.dataset.routeSource = request.source
      cover!.dataset.routeRequest = String(request.id)
      signal.originX = 0.5
      signal.originY = 0.5
      phase('committing')
      busy(true)
      progress(1)
      watch(request)
      if (readyElement(path)) void ready(request, path)
    }

    function observe(path: string) {
      if (!isSameLocale(lastPath, path)) {
        observed(path)
        return
      }
      if (active?.committed) {
        if (readyElement(path)) void ready(active, path)
      } else if (normalizePathname(path) !== normalizePathname(lastPath))
        observed(path)
    }

    function onClick(event: MouseEvent) {
      const node = event.target
      const anchor =
        node instanceof Element
          ? node.closest<HTMLAnchorElement>('a[href]')
          : null
      if (!anchor || anchor.hasAttribute('data-no-transition')) return
      const target = getTransitionTarget(
        {
          href: anchor.href,
          target: anchor.target,
          download: anchor.hasAttribute('download'),
          defaultPrevented: event.defaultPrevented,
          button: event.button,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
        },
        window.location.href,
      )
      if (!active) rememberScroll()
      if (!target) return
      // Leave propagation intact: Next Link's onClick (including menu close) still runs.
      event.preventDefault()
      const rect = event.detail === 0 ? anchor.getBoundingClientRect() : null
      const x = rect ? rect.left + rect.width / 2 : event.clientX
      const y = rect ? rect.top + rect.height / 2 : event.clientY
      start({
        ...target,
        x: Math.min(1, Math.max(0, x / window.innerWidth)),
        y: Math.min(1, Math.max(0, y / window.innerHeight)),
      })
    }

    function onReady(event: Event) {
      const detail = (event as CustomEvent<RouteReadyDetail>).detail
      if (
        !detail?.pathname ||
        !detail.element ||
        !isVisibleRoute(detail.element)
      )
        return
      observe(detail.pathname)
    }
    function onPopState() {
      popstateHref = window.location.href
      syncEntry(false, true)
      const path = window.location.pathname
      if (active || normalizePathname(path) !== normalizePathname(lastPath))
        observed(path)
    }
    function onResize() {
      if (active) progress(signal.progress, signal.phase === 'revealing')
    }
    function onScroll() {
      if (!active) rememberScroll()
    }
    function onHashChange() {
      // Fragment navigation may inherit the source entry's state. Split only
      // new entries; popstate has already selected its own existing key.
      syncEntry(popstateHref !== window.location.href, true)
      popstateHref = null
      if (!active) rememberScroll()
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener(ROUTE_READY_EVENT, onReady)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('hashchange', onHashChange)
    const controller: Controller = {
      observe,
      dispose: () => {
        disposed = true
        if (active) {
          active.abort.abort()
          clearTimeout(active.watchdog)
        }
        active = null
        queued = null
        restore()
        phase('idle')
        document.removeEventListener('click', onClick, true)
        window.removeEventListener(ROUTE_READY_EVENT, onReady)
        window.removeEventListener('popstate', onPopState)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('hashchange', onHashChange)
      },
    }
    controllerRef.current = controller
    return () => {
      controller.dispose()
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [router, signal])

  useEffect(() => {
    if (pathname) controllerRef.current?.observe(pathname)
  }, [pathname])

  return (
    <>
      {children}
      <div
        ref={coverRef}
        className={styles.cover}
        data-route-transition
        data-phase="idle"
        aria-hidden="true"
      />
      <div
        ref={statusRef}
        className={styles.announcement}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  )
}
