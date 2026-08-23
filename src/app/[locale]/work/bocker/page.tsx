import { notFound, permanentRedirect } from 'next/navigation'

const WHITELISTED_LOCALES = ['ja', 'en'] as const

export function generateStaticParams() {
  return WHITELISTED_LOCALES.map((locale) => ({ locale }))
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function BockerRedirect({ params }: Props) {
  const { locale } = await params

  if (
    !WHITELISTED_LOCALES.includes(
      locale as (typeof WHITELISTED_LOCALES)[number],
    )
  ) {
    notFound()
  }

  permanentRedirect(`/${locale}/work/yadora`)
}
