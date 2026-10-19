import { beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluate, parse } from 'groq-js'
import { client, getBlogPosts, getNews, getNewsItem, getSitemapArticles } from '@/lib/sanity'

vi.mock('@sanity/client', () => ({
  createClient: () => ({ fetch: vi.fn() }),
}))

const fetch = vi.mocked(client.fetch)
let dataset: Record<string, unknown>[] = []

beforeEach(() => {
  vi.clearAllMocks()
  dataset = []
  fetch.mockImplementation(async (query, params) => {
    const result = await evaluate(parse(query, { params }), {
      dataset,
      params,
      timestamp: new Date('2026-10-19T00:00:00Z'),
    })
    return result.get()
  })
})

function posts(type: 'blog' | 'news', count: number) {
  return Array.from({ length: count }, (_, index) => ({
    _id: `${type}-${index}`,
    _type: type,
    title: [{ _key: 'ja', value: `記事${index}` }],
    slug: { current: `post-${index}` },
    publishedAt: new Date(Date.UTC(2026, 0, 31 - index)).toISOString(),
  }))
}

describe.each([
  ['blog', getBlogPosts],
  ['news', getNews],
] as const)('%s pagination with actual GROQ evaluation', (type, getPosts) => {
  it.each([0, 1, 5, 6, 10, 11])('does not skip or repeat any of %i posts', async count => {
    dataset = posts(type, count)
    const seen: string[] = []
    for (let page = 1; page <= Math.max(1, Math.ceil(count / 5)); page++) {
      const result = await getPosts('ja', page, 5)
      expect(result).toHaveLength(Math.min(5, Math.max(0, count - (page - 1) * 5)))
      seen.push(...result.map((post: { _id: string }) => post._id))
    }
    expect(seen).toEqual(dataset.map(post => post._id))
  })
})

it('keeps pagination boundaries correct with a category filter', async () => {
  dataset = posts('blog', 11).map((post, index) => ({
    ...post, categories: index < 6 ? ['operations'] : ['other'],
  }))
  const first = await getBlogPosts('ja', 1, 5, 'operations')
  const second = await getBlogPosts('ja', 2, 5, 'operations')
  expect([...first, ...second].map(post => post._id))
    .toEqual(dataset.slice(0, 6).map(post => post._id))
})

it('selects each news article image and localized metadata fields', async () => {
  dataset = [{
    ...posts('news', 1)[0],
    title: [{ _key: 'ja', value: '日本語' }, { _key: 'en', value: 'English' }],
    description: [{ _key: 'en', value: 'Article description' }],
    image: { asset: { _ref: 'image-asset' } },
  }]
  expect(await getNewsItem('post-0', 'en')).toMatchObject({
    title: 'English', description: 'Article description', image: { asset: { _ref: 'image-asset' } },
  })
})

describe('sitemap publication filtering', () => {
  it('excludes drafts, future posts, missing dates and empty or missing slugs', async () => {
    const published = { ...posts('blog', 1)[0], _updatedAt: '2026-10-18T00:00:00Z' }
    dataset = [
      published,
      { ...published, _id: 'drafts.post', slug: { current: 'draft' } },
      { ...published, _id: 'future', publishedAt: '2026-10-20T00:00:00Z' },
      { ...published, _id: 'undated', publishedAt: undefined },
      { ...published, _id: 'invalid-date', publishedAt: 'not-a-date' },
      { ...published, _id: 'empty-slug', slug: { current: '' } },
      { ...published, _id: 'missing-slug', slug: undefined },
      { ...published, _id: 'unrelated', _type: 'page' },
      { ...published, _id: 'news', _type: 'news', slug: { current: 'announcement' } },
    ]
    expect(await getSitemapArticles()).toEqual([
      { _type: 'blog', slug: 'post-0', publishedAt: published.publishedAt, _updatedAt: published._updatedAt },
      { _type: 'news', slug: 'announcement', publishedAt: published.publishedAt, _updatedAt: published._updatedAt },
    ])
    expect(fetch.mock.calls[0][2]).toMatchObject({ cache: 'no-store' })
  })

  it('propagates CMS failures instead of publishing an incomplete sitemap', async () => {
    fetch.mockRejectedValueOnce(new Error('CMS unavailable'))
    await expect(getSitemapArticles()).rejects.toThrow('CMS unavailable')
  })
})
