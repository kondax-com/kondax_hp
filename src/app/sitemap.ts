import type { MetadataRoute } from 'next'
import { getSitemapArticles } from '@/lib/sanity'
import { articleUrl, SITE_URL } from '@/lib/seo'
import { routing } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

const pagePaths = [
  '', '/about', '/blog', '/contact', '/news', '/process',
  '/work', '/work/bocker', '/work/gallery', '/work/yadora',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getSitemapArticles()
  const entries = new Map<string, MetadataRoute.Sitemap[number]>()

  for (const path of pagePaths) {
    const languages = Object.fromEntries(
      routing.locales.map(locale => [locale, `${SITE_URL}/${locale}${path}`]),
    )
    for (const url of Object.values(languages)) {
      entries.set(url, { url, alternates: { languages } })
    }
  }

  for (const article of articles) {
    const languages = Object.fromEntries(
      routing.locales.map(locale => [locale, articleUrl(locale, article._type, article.slug)]),
    )
    const modified = new Date(article._updatedAt || article.publishedAt)
    const lastModified = Number.isFinite(modified.getTime()) ? modified : undefined
    for (const url of Object.values(languages)) {
      entries.set(url, { url, lastModified, alternates: { languages } })
    }
  }

  return [...entries.values()]
}
