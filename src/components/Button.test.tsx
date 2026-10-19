import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
    <a {...props}>{children}</a>
  ),
}))

describe.each([
  { variant: 'button', props: {}, tag: 'button' },
  { variant: 'link', props: { href: '/contact' }, tag: 'a' },
])('Button accessibility ($variant)', ({ props, tag }) => {
  it('preserves the standard accessible label', () => {
    const html = renderToStaticMarkup(
      <Button {...props} aria-label="お問い合わせを送信">
        送信する
      </Button>,
    )

    expect(html).toMatch(new RegExp(`^<${tag}\\b`))
    expect(html).toContain('aria-label="お問い合わせを送信"')
  })

  it('uses the visible text when no accessible label is supplied', () => {
    const html = renderToStaticMarkup(<Button {...props}>送信する</Button>)

    expect(html).not.toContain('aria-label')
    expect(html).toContain('>送信する</span>')
  })

  it('supports the existing ariaLabel prop', () => {
    const html = renderToStaticMarkup(
      <Button {...props} ariaLabel="お問い合わせを送信">
        送信する
      </Button>,
    )

    expect(html).toContain('aria-label="お問い合わせを送信"')
    expect(html).not.toContain('ariaLabel=')
  })

  it('prefers the standard prop when both label props are supplied', () => {
    const html = renderToStaticMarkup(
      <Button {...props} aria-label="標準の名前" ariaLabel="互換用の名前">
        送信する
      </Button>,
    )

    expect(html).toContain('aria-label="標準の名前"')
    expect(html).not.toContain('互換用の名前')
  })
})
