// @vitest-environment happy-dom

import React from 'react'
import Link from 'next/link'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTransitionSignal } from './experience-state'
import {
  ROUTE_READY_EVENT,
  scrollEntryKey,
  TRANSITION_OPAQUE_PROGRESS,
  coverRadius,
} from './route-transition-utils'
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
        <Link href="/ja" prefetch={false}>
          Home
        </Link>
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

function committed(path: string, state: unknown = {}) {
  window.history.replaceState(state, '', path)
  const element = document.getElementById('route-marker')!
  element.dataset.routeReady = path
  window.dispatchEvent(
    new CustomEvent(ROUTE_READY_EVENT, { detail: { pathname: path, element } }),
  )
}

function scrollFixture() {
  let y = 0
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y)
  vi.mocked(window.scrollTo).mockImplementation(
    (optionsOrX?: ScrollToOptions | number, top?: number) => {
      y = typeof optionsOrX === 'object' ? (optionsOrX.top ?? y) : (top ?? y)
    },
  )
  return {
    set(value: number) {
      y = value
      window.dispatchEvent(new Event('scroll'))
    },
    get: () => y,
  }
}

async function popTo(
  path: string,
  state: unknown,
  nativeClamp: number,
  scroll: ReturnType<typeof scrollFixture>,
) {
  window.history.replaceState(state, '', path)
  window.dispatchEvent(new PopStateEvent('popstate', { state }))
  committed(path, state)
  scroll.set(nativeClamp)
  await advance(750)
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
  router.push.mockReset()
  router.prefetch.mockReset()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('ルート切り替えの所有と回復', () => {
  it('完全opaqueを先に確保し、coverの残りと新画面準備を重ねる', async () => {
    const { getByText, signal, main } = mount()
    const captures: { progress: number; opacity: string; clip: string }[] = []
    router.push.mockImplementation(() => {
      captures.push({
        progress: signal.progress,
        opacity: main.style.opacity,
        clip: (document.querySelector('[data-route-transition]') as HTMLElement)
          .style.clipPath,
      })
    })
    fireEvent.click(getByText('About'))
    await advance(240)
    expect(captures).toHaveLength(1)
    expect(captures[0].progress).toBeGreaterThanOrEqual(
      TRANSITION_OPAQUE_PROGRESS,
    )
    expect(captures[0].progress).toBeLessThan(1)
    expect(captures[0].opacity).toBe('0')
    const radius = Number(/circle\(([\d.]+)px/.exec(captures[0].clip)?.[1])
    expect(radius).toBeGreaterThanOrEqual(
      coverRadius(
        window.innerWidth,
        window.innerHeight,
        signal.originX,
        signal.originY,
      ),
    )
    committed('/ja/about')
    await advance(32)
    // DOM readiness alone cannot reverse the still-running cover writer.
    expect(signal.phase).toBe('committing')
    expect(signal.progress).toBeLessThan(1)
    await advance(64)
    expect(signal.phase).toBe('revealing')
    await advance(650)
    expect(signal.phase).toBe('idle')
  })

  it('coverが先に終わっても、遅い新DOMが準備できるまで現さない', async () => {
    const { getByText, signal, main } = mount()
    fireEvent.click(getByText('About'))
    await advance(500)
    expect(signal.progress).toBe(1)
    expect(signal.phase).toBe('committing')
    expect(main.style.opacity).toBe('0')
    await advance(250)
    expect(signal.phase).toBe('committing')
    committed('/ja/about')
    await advance(80)
    expect(signal.phase).toBe('revealing')
    await advance(600)
    expect(signal.phase).toBe('idle')
  })

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

  it('短い旧DOMにclampされた履歴位置を、対象DOMの描画後に復元する', async () => {
    const scroll = scrollFixture()
    const { getByText, signal } = mount()
    scroll.set(1300)
    const home = window.history.state
    fireEvent.click(getByText('About'))
    await advance(400)
    committed('/ja/about')
    await advance(750)
    const about = window.history.state
    expect(scrollEntryKey(home)).not.toBe(scrollEntryKey(about))
    scroll.set(500)
    const length = window.history.length
    await popTo('/ja', home, 794, scroll)
    expect(scroll.get()).toBe(1300)
    await popTo('/ja/about', about, 100, scroll)
    expect(scroll.get()).toBe(500)
    expect(window.history.length).toBe(length)
    expect(signal.phase).toBe('idle')
    expect(router.push).toHaveBeenCalledTimes(1)
  })

  it('同じURLへの別push entryを別々に保存する', async () => {
    const scroll = scrollFixture()
    const { getByText } = mount()
    scroll.set(1300)
    const firstHome = window.history.state
    fireEvent.click(getByText('About'))
    await advance(400)
    committed('/ja/about')
    await advance(750)
    scroll.set(100)
    const firstAbout = window.history.state
    fireEvent.click(getByText('Home'))
    await advance(400)
    committed('/ja')
    await advance(750)
    scroll.set(400)
    const secondHome = window.history.state
    expect(scrollEntryKey(firstHome)).not.toBe(scrollEntryKey(secondHome))
    fireEvent.click(getByText('About'))
    await advance(400)
    committed('/ja/about')
    await advance(750)
    await popTo('/ja', secondHome, 250, scroll)
    expect(scroll.get()).toBe(400)
    await popTo('/ja/about', firstAbout, 0, scroll)
    expect(scroll.get()).toBe(100)
    await popTo('/ja', firstHome, 794, scroll)
    expect(scroll.get()).toBe(1300)
  })

  it('新hash entryがsourceのkeyを継承しても、以前の位置を上書きしない', async () => {
    const scroll = scrollFixture()
    const { getByText } = mount()
    scroll.set(1300)
    const home = window.history.state
    window.history.pushState({ ...home }, '', '/ja#services')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    const fragment = window.history.state
    expect(scrollEntryKey(fragment)).not.toBe(scrollEntryKey(home))
    scroll.set(900)
    fireEvent.click(getByText('About'))
    await advance(400)
    committed('/ja/about')
    await advance(750)
    await popTo('/ja', home, 794, scroll)
    expect(scroll.get()).toBe(1300)
    expect(window.history.scrollRestoration).not.toBe('manual')
  })
})
