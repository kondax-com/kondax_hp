import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export function imageBuilderFor(
  source: unknown,
  { projectId, dataset }: { projectId?: string; dataset?: string },
) {
  if (!projectId || !dataset || !source) return null
  if (typeof source !== 'string') {
    if (typeof source !== 'object') return null
    const image = source as Record<string, unknown>
    const asset = 'asset' in image ? image.asset : image
    if (!asset || typeof asset !== 'object') return null
    const reference = asset as Record<string, unknown>
    if (![reference._ref, reference._id, reference.url].some(value => typeof value === 'string')) return null
  }

  const builder = imageUrlBuilder({ projectId, dataset }).image(source as SanityImageSource)
  try {
    // Let the library validate all supported asset IDs, documents and URL sources.
    builder.url()
    return builder
  } catch (error) {
    if (error instanceof Error && (
      error.message.startsWith('Unable to resolve image URL from source') ||
      error.message.startsWith('Malformed asset _ref')
    )) return null
    throw error
  }
}
