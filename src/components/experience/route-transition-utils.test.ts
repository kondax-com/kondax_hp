import { describe, expect, it } from 'vitest'
import {
  coverRadius,
  getTransitionTarget,
  isCommittedRouteReady,
  type NavigationIntent,
  ScrollPositions,
  scrollEntryKey,
  withScrollEntry,
  TRANSITION_OPAQUE_PROGRESS,
  transitionCoverage,
  easeTransition,
} from './route-transition-utils'

const current = 'https://kondax.com/ja/about?ref=site'
const intent: NavigationIntent = { href: '/ja/work?view=products', button: 0 }

describe('連続した遷移のenvelope', () => {
  it('commit閾値で全域を覆い、範囲外へ外挿しない', () => {
    expect(transitionCoverage(0)).toBe(0)
    expect(transitionCoverage(TRANSITION_OPAQUE_PROGRESS)).toBe(1)
    expect(transitionCoverage(1)).toBe(1)
    expect(transitionCoverage(-1)).toBe(0)
  })
  it('端点の速度と加速度をともに0へ近づけ、単調に進む', () => {
    expect(easeTransition(0)).toBe(0)
    expect(easeTransition(1)).toBe(1)
    const h = 0.001
    expect(easeTransition(h) / h).toBeLessThan(0.0001)
    expect((1 - easeTransition(1 - h)) / h).toBeLessThan(0.0001)
    expect(
      Math.abs((easeTransition(2 * h) - 2 * easeTransition(h)) / (h * h)),
    ).toBeLessThan(0.1)
    expect(
      Math.abs(
        (1 - 2 * easeTransition(1 - h) + easeTransition(1 - 2 * h)) / (h * h),
      ),
    ).toBeLessThan(0.1)
    for (let i = 1; i <= 100; i++)
      expect(easeTransition(i / 100)).toBeGreaterThanOrEqual(
        easeTransition((i - 1) / 100),
      )
  })
})

describe('履歴entryごとのscroll保存', () => {
  it('公開history.stateの既存値を保持し、独自namespaceだけ追加する', () => {
    const routerState = Object.freeze({ route: '/ja', nested: { keep: true } })
    const next = withScrollEntry(routerState, 'entry-1')
    expect(next.route).toBe('/ja')
    expect(next.nested).toBe(routerState.nested)
    expect(scrollEntryKey(next)).toBe('entry-1')
    expect(scrollEntryKey(routerState)).toBeNull()
  })
  it('同じURLでも異なるentry keyの位置を混同しない', () => {
    const cache = new ScrollPositions()
    cache.remember('home-first', { x: 0, y: 1300 })
    cache.remember('home-second', { x: 0, y: 400 })
    expect(cache.get('home-first')).toEqual({ x: 0, y: 1300 })
    expect(cache.get('home-second')).toEqual({ x: 0, y: 400 })
    expect(cache.get('unknown')).toBeNull()
  })
  it('履歴cacheの件数を制限し、最近更新したentryは保持する', () => {
    const cache = new ScrollPositions(2)
    cache.remember('a', { x: 0, y: 10 })
    cache.remember('b', { x: 0, y: 20 })
    cache.remember('a', { x: 0, y: 15 })
    cache.remember('c', { x: 0, y: 30 })
    expect(cache.get('a')).toEqual({ x: 0, y: 15 })
    expect(cache.get('b')).toBeNull()
    expect(cache.get('c')).toEqual({ x: 0, y: 30 })
  })
})

describe('ルーターへ渡すリンクの境界', () => {
  it('同一origin・localeの別ページだけを扱い、queryを保持する', () => {
    expect(getTransitionTarget(intent, current)).toEqual({
      href: '/ja/work?view=products',
      pathname: '/ja/work',
    })
  })

  it.each<Partial<NavigationIntent>>([
    { href: 'https://example.com/ja/work' },
    { href: 'javascript:alert(1)' },
    { href: '/en/work' },
    { href: '/ja/about?ref=other' },
    { href: '/ja/about/' },
    { href: '/ja/#services' },
    { href: '/ja/work#' },
    { href: '/api/file' },
    { target: '_blank' },
    { download: true },
    { button: 1 },
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
    { defaultPrevented: true },
  ])('通常のブラウザ操作に残す: %j', (change) => {
    expect(getTransitionTarget({ ...intent, ...change }, current)).toBeNull()
  })
})

describe('新DOMのcommit通知', () => {
  it('元ページからの遅いready通知でcoverを解除しない', () => {
    expect(
      isCommittedRouteReady({
        expected: '/ja/work',
        source: '/ja/about',
        reported: '/ja/about',
        location: '/ja/about',
      }),
    ).toBe(false)
  })
  it('URLと新DOMがそろったときだけ表示する', () => {
    expect(
      isCommittedRouteReady({
        expected: '/ja/work',
        source: '/ja/about',
        reported: '/ja/work',
        location: '/ja/about',
      }),
    ).toBe(false)
    expect(
      isCommittedRouteReady({
        expected: '/ja/work',
        source: '/ja/about',
        reported: '/ja/work/',
        location: '/ja/work',
      }),
    ).toBe(true)
  })
  it('正式なルーターによるredirect先のDOMも受け付ける', () => {
    expect(
      isCommittedRouteReady({
        expected: '/ja/work',
        source: '/ja/about',
        reported: '/ja/contact',
        location: '/ja/contact',
      }),
    ).toBe(true)
  })
  it('戻る操作は同じURLへのpushを要求せず、現在のDOMを受け付ける', () => {
    expect(
      isCommittedRouteReady({
        expected: '/ja/about',
        source: '/ja/about',
        reported: '/ja/about',
        location: '/ja/about',
      }),
    ).toBe(true)
  })
})

it('端・四隅を起点にしてもopaque coverが画面全体を覆う', () => {
  const width = 1440,
    height = 900
  for (const x of [0, 0.2, 0.5, 1])
    for (const y of [0, 0.7, 1]) {
      const radius = coverRadius(width, height, x, y)
      for (const cx of [0, width])
        for (const cy of [0, height]) {
          expect(radius).toBeGreaterThan(
            Math.hypot(cx - x * width, cy - y * height),
          )
        }
    }
})
