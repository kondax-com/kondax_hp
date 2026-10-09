import { type Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from 'sonner'
import { routing } from '@/i18n/routing'

import { RootLayout } from '@/components/RootLayout'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import '@/styles/tailwind.css'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'HomePage' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://kondax.com/' + locale,
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages({ locale })
  // Only interactive components need translations in the browser.
  const clientMessages = {
    Navigation: messages.Navigation,
    Footer: messages.Footer,
    Offices: messages.Offices,
    ContactPage: messages.ContactPage,
    ContactSection: messages.ContactSection,
  }

  return (
    <html className="h-full bg-neutral-950 text-base antialiased" lang={locale}>
      <head>
        <AnalyticsScripts />
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <RootLayout>{children}</RootLayout>
        </NextIntlClientProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
