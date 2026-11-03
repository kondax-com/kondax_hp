// @vitest-environment happy-dom

import React from 'react'
import Link from 'next/link'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTransitionSignal } from './experience-state'
import { ROUTE_READY_EVENT } from './route-transition-utils'
import { RouteTransitions } from './RouteTransitions'

const router = vi.hoisted(() => ({ push: vi.fn(), prefetch: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/ja',
}))

function mount() {
  const signal = createTransitionSignal()
  const view = render(
    <RouteTransitions signal={signal}>
      <header>
        <Link href="/ja/about" prefetch={false}>
          About
        </Link>
        <Link href="/ja/work" prefetch={false}>
          Work
        </Link>
        <Link href="/ja/contact" prefetch={false}>
          Contact
        </Link>
      </header>
      <main id="main-content" tabIndex={-1}>
        <div id="route-marker" data-route-ready="/ja">
          <h1>Page</h1>
        </div>
      </main>
    </RouteTransitions>,
  )
  vi.spyOn(
    document.getElementById('route-marker')!,
    'getBoundingClientRect',
  ).mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
    width: 800,
    height: 600,
    toJSON: () => ({}),
  })
  return { ...view, signal, main: document.getElementById('main-content')! }
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

function committed(path: string) {
  window.history.replaceState({}, '', path)
  const element = document.getElementById('route-marker')!
  element.dataset.routeReady = path
  window.dispatchEvent(
    new CustomEvent(ROUTE_READY_EVENT, { detail: { pathname: path, element } }),
  )
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'performance',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  })
  window.history.replaceState({}, '', '/ja')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  router.push.mockClear()
  router.prefetch.mockClear()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('ルート切り替えの所有と回復', () => {
  it('準備中の連打は最後だけpushし、新DOMのready後に操作とfocusを復元する', async () => {
    const { getByText, signal, main } = mount()
    fireEvent.click(getByText('About'))
    fireEvent.click(getByText('Work'))
    await advance(400)
    expect(router.push.mock.calls).toEqual([['/ja/work', { scroll: false }]])
    expect(signal.phase).toBe('committing')
    expect(main.inert).toBe(true)
    committed('/ja/work')
    await advance(750)
    expect(signal.phase).toBe('idle')
    expect(signal.progress).toBe(0)
    expect(main.inert).toBe(false)
    expect(main.hasAttribute('aria-busy')).toBe(false)
    expect(main.style.opacity).toBe('')
    expect(main.style.overflowAnchor).toBe('')
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
    expect(document.activeElement).toBe(main)
  })

  it('commit後の連打は最後の1件だけを待たせる', async () => {
    const { getByText } = mount()
    fireEvent.click(getByText('About'))
    await advance(400)
    fireEvent.click(getByText('Work'))
    fireEvent.click(getByText('Contact'))
    expect(router.push).toHaveBeenCalledTimes(1)
    committed('/ja/about')
    await advance(1000)
    expect(router.push.mock.calls.map(([href]) => href)).toEqual([
      '/ja/about',
      '/ja/contact',
    ])
    committed('/ja/contact')
    await advance(750)
  })

  it('古いreadyを無視し、準備失敗時にもcoverとinertを残さない', async () => {
    const { getByText, main, signal } = mount()
    fireEvent.click(getByText('About'))
    await advance(400)
    committed('/ja')
    await advance(500)
    expect(signal.phase).toBe('committing')
    await advance(8000)
    expect(signal.phase).toBe('idle')
    expect(main.inert).toBe(false)
    expect(main.style.opacity).toBe('')
    expect(
      document
        .querySelector('[data-route-transition]')
        ?.getAttribute('data-active'),
    ).toBe('false')
    expect(router.push).toHaveBeenCalledTimes(1)
  })

  it('ブラウザの戻る・進むにpushを追加しない', async () => {
    const { signal, main } = mount()
    window.history.replaceState({}, '', '/ja/about')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(main.inert).toBe(true)
    committed('/ja/about')
    await advance(750)
    expect(signal.phase).toBe('idle')
    expect(router.push).not.toHaveBeenCalled()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('途中で破棄しても遅い処理が残ったDOMを書き換えない', async () => {
    const { getByText, unmount, main, signal } = mount()
    fireEvent.click(getByText('About'))
    await advance(400)
    unmount()
    await advance(10000)
    expect(signal.phase).toBe('idle')
    expect(main.inert).toBe(false)
    expect(main.hasAttribute('aria-busy')).toBe(false)
    expect(main.style.transform).toBe('')
    expect(router.push).toHaveBeenCalledTimes(1)
  })

  it('MQL change通知がなくても現在のreduced-motion値を読む', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList)
    const { getByText, signal } = mount()
    expect(signal.reducedMotion).toBe(false)
    fireEvent.click(getByText('About'))
    await advance(80)
    expect(router.push).toHaveBeenCalledTimes(1)
    committed('/ja/about')
    await advance(100)
    expect(signal.phase).toBe('idle')
  })

  it('global pathnameを受け取ったhidden cacheのreadyではgateを開かない', async () => {
    const { getByText, signal } = mount()
    fireEvent.click(getByText('About'))
    await advance(400)
    const element = document.getElementById('route-marker')!
    element.hidden = true
    committed('/ja/about')
    await advance(1000)
    expect(signal.phase).toBe('committing')
    element.hidden = false
    committed('/ja/about')
    await advance(750)
    expect(signal.phase).toBe('idle')
  })

  it('locale切替が進んだら古いlocaleのqueued要求を破棄する', async () => {
    const { getByText, signal } = mount()
    fireEvent.click(getByText('About'))
    await advance(400)
    fireEvent.click(getByText('Work'))
    committed('/en/about')
    await advance(1000)
    expect(signal.phase).toBe('idle')
    expect(router.push.mock.calls.map(([href]) => href)).toEqual(['/ja/about'])
  })

  it('timeout時にURLだけ変更されて旧DOMが残る場合は通常documentへ退避する', async () => {
    const reload = vi
      .spyOn(window.location, 'reload')
      .mockImplementation(() => {})
    const { getByText, signal, main } = mount()
    fireEvent.click(getByText('About'))
    await advance(400)
    window.history.replaceState({}, '', '/ja/about')
    await advance(8000)
    expect(signal.phase).toBe('idle')
    expect(main.inert).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledTimes(1)
  })
})
