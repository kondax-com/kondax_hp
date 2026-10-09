import { type Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { Toaster } from 'sonner'
import { getTranslations } from 'next-intl/server'

import '@/styles/tailwind.css'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://kondax.com/' + locale,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html className="h-full bg-neutral-950 text-base antialiased" lang={locale}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
