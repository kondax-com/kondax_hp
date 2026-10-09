import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

import { RootLayout } from '@/components/RootLayout'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
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
    <NextIntlClientProvider locale={locale} messages={clientMessages}>
      <RootLayout>{children}</RootLayout>
    </NextIntlClientProvider>
  )
}
