import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSitemapArticles } from '@/lib/sanity'
import sitemap, { dynamic } from '@/app/sitemap'

vi.mock('@/lib/sanity', () => ({ getSitemapArticles: vi.fn() }))
vi.mock('@/i18n/routing', () => ({ routing: { locales: ['ja', 'en'] } }))

const articles = vi.mocked(getSitemapArticles)
beforeEach(() => vi.clearAllMocks())

describe('runtime sitemap', () => {
  it('covers each real static page and article in both locales, with reciprocal alternates', async () => {
    articles.mockResolvedValue([
      { _type: 'blog', slug: '記事', publishedAt: '2026-01-01T00:00:00Z', _updatedAt: '2026-10-18T00:00:00Z' },
      { _type: 'news', slug: 'release', publishedAt: '2026-02-01T00:00:00Z' },
    ])
    const result = await sitemap()
    const urls = result.map(entry => entry.url)
    const expectedPaths = [
      '', '/about', '/blog', '/contact', '/news', '/process',
      '/work', '/work/bocker', '/work/gallery', '/work/yadora',
      '/blog/%E8%A8%98%E4%BA%8B', '/news/release',
    ]
    expect(new Set(urls).size).toBe(24)
    expect(urls).toHaveLength(24)
    for (const locale of ['ja', 'en']) {
      for (const path of expectedPaths) expect(urls).toContain(`https://kondax.com/${locale}${path}`)
    }
    for (const entry of result) {
      expect(Object.values(entry.alternates!.languages!)).toContain(entry.url)
      expect(Object.keys(entry.alternates!.languages!)).toEqual(['ja', 'en'])
    }
    expect(urls.some(url => /icon|api|_not-found|sitemap-0/.test(url))).toBe(false)
    expect(result.find(entry => entry.url.endsWith('/blog/%E8%A8%98%E4%BA%8B'))?.lastModified)
      .toEqual(new Date('2026-10-18T00:00:00Z'))
    expect(result.find(entry => entry.url.endsWith('/about'))).not.toHaveProperty('lastModified')
  })

  it('reads newly published articles on subsequent requests and deduplicates URLs', async () => {
    expect(dynamic).toBe('force-dynamic')
    articles.mockResolvedValueOnce([])
    expect(await sitemap()).toHaveLength(20)
    const article = { _type: 'news' as const, slug: 'new', publishedAt: '2026-10-18T00:00:00Z' }
    articles.mockResolvedValueOnce([article, article])
    expect(await sitemap()).toHaveLength(22)
    expect(articles).toHaveBeenCalledTimes(2)
  })

  it('does not return a partial success when the CMS cannot be read', async () => {
    articles.mockRejectedValueOnce(new Error('CMS unavailable'))
    await expect(sitemap()).rejects.toThrow('CMS unavailable')
  })
})
