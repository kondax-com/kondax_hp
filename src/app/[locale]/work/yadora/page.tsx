import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { YadoraShowcase } from '@/components/YadoraShowcase'

const WHITELISTED_LOCALES = ['ja', 'en'] as const

export function generateStaticParams() {
  return WHITELISTED_LOCALES.map((locale) => ({ locale }))
}

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  if (
    !WHITELISTED_LOCALES.includes(
      locale as (typeof WHITELISTED_LOCALES)[number],
    )
  ) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'YadoraPage' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kondax.com'
  const canonicalUrl = `https://kondax.com/${locale}/work/yadora`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ja: 'https://kondax.com/ja/work/yadora',
        en: 'https://kondax.com/en/work/yadora',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale,
      url: `${baseUrl}/${locale}/work/yadora`,
      images: [
        {
          url: `${baseUrl}/apple-touch-icon.png`,
          width: 180,
          height: 180,
          alt: t('title'),
        },
      ],
    },
  }
}

export default async function Yadora({ params }: Props) {
  const { locale } = await params

  if (
    !WHITELISTED_LOCALES.includes(
      locale as (typeof WHITELISTED_LOCALES)[number],
    )
  ) {
    notFound()
  }

  return <YadoraShowcase locale={locale} />
}
