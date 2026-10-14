type Span = {
  _type?: string
  _key?: string
  text?: string
  marks?: string[]
}

export type ArticleBlock = {
  _type?: string
  _key?: string
  style?: string
  listItem?: string
  children?: Span[]
  markDefs?: Array<{ _type?: string; _key?: string; href?: string }>
}

const seriesSlugs = [
  'adk-sme-01-start-with-one-workflow',
  'adk-sme-02-sales-quotations',
  'adk-sme-03-invoice-reconciliation',
  'adk-sme-04-internal-knowledge-support',
  'adk-sme-05-infrastructure-monitoring',
  'adk-sme-06-incident-response',
  'adk-sme-07-cost-and-change-control',
  'adk-sme-08-rollout-and-evaluation',
  'adk-sme-09-access-lifecycle',
  'adk-sme-10-backup-recovery',
  'adk-sme-11-year-end-improvement',
]

export function getSeriesNumber(slug: string): number | null {
  const index = seriesSlugs.indexOf(slug)
  return index < 0 ? null : index + 1
}

export function blockText(block: ArticleBlock): string {
  return Array.isArray(block?.children)
    ? block.children.map(span => typeof span?.text === 'string' ? span.text : '').join('')
    : ''
}

export function headingId(block: ArticleBlock): string | undefined {
  return typeof block?._key === 'string' && block._key ? `section-${block._key}` : undefined
}

export function articleHeadings(body: ArticleBlock[]) {
  return body
    .filter(block => block._type === 'block' && block.style === 'h2' && headingId(block) && blockText(block).trim())
    .map(block => ({ id: headingId(block)!, text: blockText(block) }))
}

export function readingMinutes(body: ArticleBlock[], locale: string): number {
  const text = body.map(blockText).join(' ')
  const units = locale === 'en' ? text.trim().split(/\s+/).filter(Boolean).length : Array.from(text.replace(/\s/g, '')).length
  return Math.max(1, Math.ceil(units / (locale === 'en' ? 200 : 500)))
}

export function publicationDate(value: string, locale: string): string | null {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric',
  }).format(date)
}

export function localizedImageAlt(value: unknown, locale: string, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value
  if (value && typeof value === 'object') {
    const localized = (value as Record<string, unknown>)[locale]
    if (typeof localized === 'string' && localized.trim()) return localized
  }
  return fallback
}

export function imageDimensions(reference: unknown): { width: number; height: number } | null {
  if (typeof reference !== 'string') return null
  const match = /^image-[a-f0-9]+-(\d+)x(\d+)-(?:png|jpg|webp|gif)$/.exec(reference)
  if (!match) return null
  const width = Number(match[1]), height = Number(match[2])
  return width > 0 && height > 0 && width <= 20000 && height <= 20000 ? { width, height } : null
}

export function editorialImage(block: ArticleBlock) {
  if (block._type !== 'block' || (block.style && block.style !== 'normal') ||
      !/^editorial-image-(?:0?[1-9]|1[01])-[a-zA-Z0-9_-]+-(?:ja|en)$/.test(block._key || '') ||
      block.children?.length !== 1) return null
  const span = block.children[0]
  if (span._type !== 'span' || !span.text?.trim() || !Array.isArray(span.marks)) return null
  const link = block.markDefs?.find(mark => mark._type === 'link' && span.marks?.includes(mark._key || ''))
  if (typeof link?.href !== 'string') return null
  try {
    const url = new URL(link.href)
    if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io' || url.port ||
        url.username || url.password || url.search || url.hash) return null
    const match = /^\/images\/t62e3xha\/production\/([a-f0-9]{40})-(\d+)x(\d+)\.(png|jpg|webp|gif)$/.exec(url.pathname)
    if (!match) return null
    const dimensions = imageDimensions(`image-${match[1]}-${match[2]}x${match[3]}-${match[4]}`)
    return dimensions ? {
      src: url.href, alt: span.text, ...dimensions,
      captionKey: block._key!.replace(/^editorial-image-/, 'editorial-caption-'),
    } : null
  } catch {
    return null
  }
}

export function comparisonCells(block: ArticleBlock): Span[][] | null {
  if (block._type !== 'block' || block.listItem !== 'bullet' || !Array.isArray(block.children)) return null
  const labels = block.children.filter(span => span.marks?.includes('strong') && /:\s*$/.test(span.text || ''))
  if (labels.length < 2 || !blockText(block).includes('\n')) return null
  const cells: Span[][] = [[]]
  for (const span of block.children) {
    const lines = (span.text || '').split('\n')
    lines.forEach((text, index) => {
      if (index) cells.push([])
      if (text) cells[cells.length - 1].push({ ...span, text })
    })
  }
  return cells.length >= 2 && cells.every(cell => cell[0]?.marks?.includes('strong') && /:\s*$/.test(cell[0].text || '')) ? cells : null
}
