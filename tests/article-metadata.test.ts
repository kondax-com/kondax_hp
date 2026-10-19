import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBlogPost, getNewsItem } from '@/lib/sanity'
import BlogPost, { generateMetadata as blogMetadata } from '@/app/[locale]/blog/[slug]/page'
import NewsPost, { generateMetadata as newsMetadata } from '@/app/[locale]/news/[slug]/page'
import { generateMetadata as blogListMetadata } from '@/app/[locale]/blog/page'
import { generateMetadata as newsListMetadata } from '@/app/[locale]/news/page'

vi.mock('@/lib/sanity', () => ({
  client: { config: () => ({ projectId: 't62e3xha', dataset: 'production' }) },
  getBlogPost: vi.fn(), getNewsItem: vi.fn(),
  getBlogPosts: vi.fn(), getBlogPostsTotal: vi.fn(), getBlogCategories: vi.fn(),
  getNews: vi.fn(), getNewsTotal: vi.fn(),
}))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (key: string) => key }))
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_HTTP_ERROR_FALLBACK;404') } }))
vi.mock('next/image', () => ({ default: () => null }))
vi.mock('@portabletext/react', () => ({ PortableText: () => null }))
vi.mock('@/i18n/routing', () => ({ Link: () => null }))
vi.mock('@/components/CodeBlock', () => ({ default: () => null }))
vi.mock('@/components/InlineCode', () => ({ default: () => null }))
vi.mock('@/components/Border', () => ({ Border: () => null }))
vi.mock('@/components/Button', () => ({ Button: () => null }))
vi.mock('@/components/ContactSection', () => ({ ContactSection: () => null }))
vi.mock('@/components/Container', () => ({ Container: () => null }))
vi.mock('@/components/FadeIn', () => ({ FadeIn: () => null }))
vi.mock('@/components/PageIntro', () => ({ PageIntro: () => null }))

beforeEach(() => vi.clearAllMocks())

describe.each([
  ['blog', blogMetadata, BlogPost, vi.mocked(getBlogPost)],
  ['news', newsMetadata, NewsPost, vi.mocked(getNewsItem)],
] as const)('%s article metadata and missing articles', (section, metadata, page, getArticle) => {
  it('uses the article title, summary, image and encoded canonical URL', async () => {
    getArticle.mockResolvedValue({
      title: '個別の記事', description: '本文要約',
      image: { asset: { _ref: `image-${'a'.repeat(40)}-1200x630-png` } },
    })
    const result = await metadata({ params: Promise.resolve({ slug: '記事', locale: 'ja' }) })
    expect(result.title).toBe('個別の記事 | KONDAX')
    expect(result.description).toBe('本文要約')
    expect(result.alternates?.canonical).toBe(`https://kondax.com/ja/${section}/%E8%A8%98%E4%BA%8B`)
    expect(result.openGraph).toMatchObject({
      title: '個別の記事 | KONDAX', description: '本文要約',
      url: `https://kondax.com/ja/${section}/%E8%A8%98%E4%BA%8B`,
      images: [expect.objectContaining({ url: expect.stringContaining('https://cdn.sanity.io/images/'), width: 1200, height: 630 })],
    })
  })

  it('uses the public fallback image when the article has no image', async () => {
    getArticle.mockResolvedValue({ title: 'No image', description: '' })
    const result = await metadata({ params: Promise.resolve({ slug: 'no-image', locale: 'en' }) })
    expect(result.openGraph?.images).toEqual([
      expect.objectContaining({ url: 'https://kondax.com/apple-touch-icon.png', width: 180, height: 180 }),
    ])
  })

  it.each([
    { _type: 'image' },
    { asset: undefined },
    { asset: null },
    { asset: {} },
    { asset: { _ref: 'missing' } },
    { asset: { _ref: 123 } },
    { asset: { _ref: 'image-hash-not-dimensions-png' } },
  ])('falls back for incomplete or malformed image source %j', async image => {
    getArticle.mockResolvedValue({ title: 'Incomplete image', description: '', image })
    const result = await metadata({ params: Promise.resolve({ slug: 'incomplete-image', locale: 'en' }) })
    expect(result.openGraph?.images).toEqual([
      expect.objectContaining({ url: 'https://kondax.com/apple-touch-icon.png', width: 180, height: 180 }),
    ])
  })

  const reference = `image-${'a'.repeat(40)}-1200x630-png`
  const imageUrl = `https://cdn.sanity.io/images/t62e3xha/production/${'a'.repeat(40)}-1200x630.png`
  it.each([
    reference,
    { _ref: reference },
    { _id: reference },
    { asset: { _id: reference } },
    imageUrl,
    { asset: { url: imageUrl } },
  ])('preserves a supported valid image source %j', async image => {
    getArticle.mockResolvedValue({ title: 'Valid image', description: '', image })
    const result = await metadata({ params: Promise.resolve({ slug: 'valid-image', locale: 'en' }) })
    expect(result.openGraph?.images).toEqual([
      expect.objectContaining({ url: expect.stringContaining('https://cdn.sanity.io/images/'), width: 1200, height: 630 }),
    ])
  })

  it('propagates CMS failures instead of treating them as image fallback', async () => {
    getArticle.mockRejectedValue(new Error('CMS unavailable'))
    await expect(metadata({ params: Promise.resolve({ slug: 'article', locale: 'en' }) }))
      .rejects.toThrow('CMS unavailable')
  })

  it('signals notFound from both metadata and the page when the article is missing', async () => {
    getArticle.mockResolvedValue(null)
    for (const handler of [metadata, page]) {
      await expect(handler({ params: Promise.resolve({ slug: 'missing', locale: 'ja' }) }))
        .rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404')
    }
  })

  it('rejects an empty slug before fetching', async () => {
    await expect(metadata({ params: Promise.resolve({ slug: '', locale: 'ja' }) }))
      .rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404')
    expect(getArticle).not.toHaveBeenCalled()
  })
})

describe('list page metadata', () => {
  it('uses page two as the canonical and OGP URL for each listing', async () => {
    for (const [section, metadata] of [['blog', blogListMetadata], ['news', newsListMetadata]] as const) {
      const result = await metadata({ params: Promise.resolve({ locale: 'en' }), searchParams: Promise.resolve({ page: '2' }) })
      expect(result.alternates?.canonical).toBe(`https://kondax.com/en/${section}?page=2`)
      expect(result.openGraph).toMatchObject({ url: `https://kondax.com/en/${section}?page=2` })
    }
  })

  it('normalizes invalid page numbers consistently and keeps blog categories', async () => {
    const result = await blogListMetadata({
      params: Promise.resolve({ locale: 'ja' }),
      searchParams: Promise.resolve({ page: '-2', category: ['AI', 'ignored'] }),
    })
    expect(result.alternates?.canonical).toBe('https://kondax.com/ja/blog?category=AI')
  })
})
