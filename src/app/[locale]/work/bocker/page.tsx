import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { BockerShowcase } from '@/components/BockerShowcase'

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

  const t = await getTranslations({ locale, namespace: 'BockerPage' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kondax.com'
  const canonicalUrl = `https://kondax.com/${locale}/work/bocker`

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ja: 'https://kondax.com/ja/work/bocker',
        en: 'https://kondax.com/en/work/bocker',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale,
      url: `${baseUrl}/${locale}/work/bocker`,
      images: [
        {
          url: `${baseUrl}/images/bocker/bocker-hero.png`,
          width: 1308,
          height: 783,
          alt: t('intro.imageAlt'),
        },
      ],
    },
  }
}

export default async function Bocker({ params }: Props) {
  const { locale } = await params

  if (
    !WHITELISTED_LOCALES.includes(
      locale as (typeof WHITELISTED_LOCALES)[number],
    )
  ) {
    notFound()
  }

  return <BockerShowcase locale={locale} />
}
