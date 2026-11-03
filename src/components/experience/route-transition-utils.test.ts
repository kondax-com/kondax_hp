import { describe, expect, it } from 'vitest'
import {
  coverRadius,
  getTransitionTarget,
  isCommittedRouteReady,
  type NavigationIntent,
} from './route-transition-utils'

const current = 'https://kondax.com/ja/about?ref=site'
const intent: NavigationIntent = { href: '/ja/work?view=products', button: 0 }

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
