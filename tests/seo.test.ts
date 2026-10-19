import { describe, expect, it } from 'vitest'
import { articleUrl, listingUrl, normalizePage } from '@/lib/seo'

describe('SEO URL normalization', () => {
  it.each([
    [undefined, 1], ['', 1], ['0', 1], ['-2', 1], ['2.5', 1], ['2abc', 1],
    ['9007199254740992', 1], ['0002', 2], [['3', '4'], 3], ['12', 12],
  ] as const)('normalizes page %j to %i', (value, expected) => {
    expect(normalizePage(value as string | string[] | undefined)).toBe(expected)
  })

  it('uses a self-canonical URL for each list page in both languages', () => {
    expect(listingUrl('ja', 'blog', 1)).toBe('https://kondax.com/ja/blog')
    expect(listingUrl('en', 'news', 2)).toBe('https://kondax.com/en/news?page=2')
  })

  it('preserves the selected category with safe query encoding', () => {
    expect(listingUrl('ja', 'blog', 2, '業務 & AI'))
      .toBe('https://kondax.com/ja/blog?page=2&category=%E6%A5%AD%E5%8B%99+%26+AI')
  })

  it('encodes article slugs as one path segment', () => {
    expect(articleUrl('ja', 'news', '新着/?#'))
      .toBe('https://kondax.com/ja/news/%E6%96%B0%E7%9D%80%2F%3F%23')
  })
})
