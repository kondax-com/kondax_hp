export const SITE_URL = 'https://kondax.com'

type SearchValue = string | string[] | undefined

export function normalizePage(value: SearchValue): number {
  const input = Array.isArray(value) ? value[0] : value
  if (!input || !/^\d+$/.test(input)) return 1
  const page = Number(input)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export function listingUrl(
  locale: string,
  section: 'blog' | 'news',
  page: number,
  category?: string,
): string {
  const url = new URL(`/${locale}/${section}`, SITE_URL)
  if (page > 1) url.searchParams.set('page', String(page))
  if (category) url.searchParams.set('category', category)
  return url.href
}

export function articleUrl(locale: string, section: 'blog' | 'news', slug: string): string {
  return `${SITE_URL}/${locale}/${section}/${encodeURIComponent(slug)}`
}
