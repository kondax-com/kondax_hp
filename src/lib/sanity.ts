import { createClient } from '@sanity/client'
import { cache } from 'react'

export const client = createClient({
  projectId: 't62e3xha',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
})

// Helper function to get localized value from internationalized array
export function getLocalizedValue(
  field: Array<{ _key: string; value: any }> | undefined,
  locale: string,
  fallback: string = 'ja'
): any {
  if (!field || !Array.isArray(field)) return ''
  
  const localizedValue = field.find(item => item._key === locale)?.value
  if (localizedValue !== undefined) return localizedValue
  
  const fallbackValue = field.find(item => item._key === fallback)?.value
  return fallbackValue || ''
}

// Helper function to get localized body content
export function getLocalizedBody(
  body: { [locale: string]: any } | undefined,
  locale: string,
  fallback: string = 'ja'
): any {
  if (!body || typeof body !== 'object') return []
  
  const localizedBody = body[locale]
  if (localizedBody) return localizedBody
  
  const fallbackBody = body[fallback]
  return fallbackBody || []
}

// Blog queries
export async function getBlogPosts(locale: string = 'ja', page: number = 1, limit: number = 5, category?: string) {
  const offset = (page - 1) * limit
  const categoryFilter = category ? ` && $category in categories` : ''
  const query = `
    *[_type == "blog"${categoryFilter}] | order(publishedAt desc) [$offset...$end] {
      _id,
      title,
      slug,
      description,
      publishedAt,
      author,
      image,
      body,
      categories
    }
  `
  
  const posts = await client.fetch(query, { 
    offset, 
    end: offset + limit,
    ...(category && { category })
  })
  
  return posts.map((post: any) => ({
    ...post,
    title: getLocalizedValue(post.title, locale),
    description: getLocalizedValue(post.description, locale),
    body: getLocalizedBody(post.body, locale)
  }))
}

export async function getBlogPostsTotal(category?: string) {
  const categoryFilter = category ? ` && $category in categories` : ''
  const query = `count(*[_type == "blog"${categoryFilter}])`
  return await client.fetch(query, category ? { category } : {})
}

export async function getBlogCategories() {
  const query = `
    array::unique(*[_type == "blog" && defined(categories)].categories[])
  `
  return await client.fetch(query)
}

export const getBlogPost = cache(async (slug: string, locale: string = 'ja') => {
  const query = `
    *[_type == "blog" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      publishedAt,
      author,
      image,
      body
    }
  `
  
  const post = await client.fetch(query, { slug })
  
  if (!post) return null
  
  return {
    ...post,
    title: getLocalizedValue(post.title, locale),
    description: getLocalizedValue(post.description, locale),
    body: getLocalizedBody(post.body, locale)
  }
})

// News queries
export async function getNews(locale: string = 'ja', page: number = 1, limit: number = 5) {
  const offset = (page - 1) * limit
  const query = `
    *[_type == "news"] | order(publishedAt desc) [$offset...$end] {
      _id,
      title,
      slug,
      description,
      publishedAt,
      author,
      body
    }
  `
  
  const news = await client.fetch(query, { 
    offset, 
    end: offset + limit
  })
  
  return news.map((item: any) => ({
    ...item,
    title: getLocalizedValue(item.title, locale),
    description: getLocalizedValue(item.description, locale),
    body: getLocalizedBody(item.body, locale)
  }))
}

export async function getNewsTotal() {
  const query = `count(*[_type == "news"])`
  return await client.fetch(query)
}

export const getNewsItem = cache(async (slug: string, locale: string = 'ja') => {
  const query = `
    *[_type == "news" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      publishedAt,
      image,
      body
    }
  `
  
  const newsItem = await client.fetch(query, { slug })
  
  if (!newsItem) return null
  
  return {
    ...newsItem,
    title: getLocalizedValue(newsItem.title, locale),
    description: getLocalizedValue(newsItem.description, locale),
    body: getLocalizedBody(newsItem.body, locale)
  }
})

export type SitemapArticle = {
  _type: 'blog' | 'news'
  slug: string
  publishedAt: string
  _updatedAt?: string
}

export async function getSitemapArticles(): Promise<SitemapArticle[]> {
  const query = `
    *[_type in ["blog", "news"]
      && !(_id in path("drafts.**"))
      && defined(slug.current) && slug.current != ""
      && defined(publishedAt) && dateTime(publishedAt) <= dateTime(now())
    ] | order(_type asc, slug.current asc) {
      _type,
      "slug": slug.current,
      publishedAt,
      _updatedAt
    }
  `
  return client.fetch<SitemapArticle[]>(query, {}, { cache: 'no-store' })
}
