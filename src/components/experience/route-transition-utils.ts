export const ROUTE_READY_EVENT = 'kondax:route-ready'

export type RouteReadyDetail = { pathname: string; element: HTMLElement }

export type NavigationIntent = {
  href: string
  target?: string
  download?: boolean
  defaultPrevented?: boolean
  button: number
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

export type TransitionTarget = { href: string; pathname: string }

/** Cached/offscreen templates can still receive the global pathname context. */
export function isVisibleRoute(element: HTMLElement) {
  if (!element.isConnected || element.closest('[hidden], [aria-hidden="true"]'))
    return false
  const rect = element.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return false
  for (
    let ancestor: HTMLElement | null = element;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    const style = window.getComputedStyle(ancestor)
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.contentVisibility === 'hidden'
    )
      return false
  }
  return true
}

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/'
}

function localeOf(pathname: string) {
  return /^\/(ja|en)(?:\/|$)/.exec(pathname)?.[1]
}

export function isSameLocale(from: string, to: string) {
  const locale = localeOf(from)
  return Boolean(locale && locale === localeOf(to))
}

/** Keep ordinary browser/Next navigation for anchors, queries and locale changes. */
export function getTransitionTarget(
  intent: NavigationIntent,
  currentHref: string,
): TransitionTarget | null {
  if (
    intent.defaultPrevented ||
    intent.button !== 0 ||
    intent.download ||
    intent.metaKey ||
    intent.ctrlKey ||
    intent.shiftKey ||
    intent.altKey ||
    (intent.target && intent.target.trim().toLowerCase() !== '_self')
  )
    return null

  try {
    const current = new URL(currentHref)
    const next = new URL(intent.href, current)
    if (
      next.origin !== current.origin ||
      !/^https?:$/.test(next.protocol) ||
      intent.href.includes('#') ||
      normalizePathname(next.pathname) ===
        normalizePathname(current.pathname) ||
      !isSameLocale(current.pathname, next.pathname)
    )
      return null
    return { href: next.pathname + next.search, pathname: next.pathname }
  } catch {
    return null
  }
}

/** A stale source-page effect is not a successful commit. Redirects may commit elsewhere. */
export function isCommittedRouteReady({
  expected,
  source,
  reported,
  location,
}: {
  expected: string
  source: string
  reported: string
  location: string
}) {
  const path = normalizePathname(reported)
  return (
    path === normalizePathname(location) &&
    (path === normalizePathname(expected) || path !== normalizePathname(source))
  )
}

export function coverRadius(
  width: number,
  height: number,
  x: number,
  y: number,
) {
  const px = Math.min(1, Math.max(0, x)) * width
  const py = Math.min(1, Math.max(0, y)) * height
  return Math.hypot(Math.max(px, width - px), Math.max(py, height - py)) + 24
}

/** Wait only for visible images, with bounded latency and complete listener cleanup. */
export async function waitForVisibleImages(
  root: HTMLElement,
  signal: AbortSignal,
  budgetMs = 850,
) {
  if (signal.aborted) return
  const cleanups: (() => void)[] = []
  const pending = Array.from(root.querySelectorAll('img'))
    .filter((image) => {
      const rect = image.getBoundingClientRect()
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      )
    })
    .slice(0, 8)
    .map((image) => {
      if (typeof image.decode === 'function')
        return image.decode().catch(() => {})
      if (image.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        const done = () => resolve()
        image.addEventListener('load', done, { once: true })
        image.addEventListener('error', done, { once: true })
        cleanups.push(() => {
          image.removeEventListener('load', done)
          image.removeEventListener('error', done)
        })
      })
    })
  if (!pending.length) return
  let timer: ReturnType<typeof setTimeout> | undefined
  let abort: (() => void) | undefined
  try {
    await Promise.race([
      Promise.allSettled(pending),
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, budgetMs)
        abort = () => resolve()
        signal.addEventListener('abort', abort, { once: true })
      }),
    ])
  } finally {
    clearTimeout(timer)
    if (abort) signal.removeEventListener('abort', abort)
    for (const cleanup of cleanups) cleanup()
  }
}
