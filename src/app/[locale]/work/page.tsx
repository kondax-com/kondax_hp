import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Blockquote } from '@/components/Blockquote'
import { Border } from '@/components/Border'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { Link } from '@/i18n/routing'
import { formatDate } from '@/lib/formatDate'
import { type CaseStudy, type MDXEntry, loadCaseStudies } from '@/lib/mdx'

async function FeaturedYadora({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'WorkPage' })
  const tags = [
    t('featured.tags.tag1'),
    t('featured.tags.tag2'),
    t('featured.tags.tag3'),
  ]

  return (
    <Container className="mt-20 sm:mt-24">
      <FadeIn>
        <article className="border-y border-neutral-950 py-7 sm:py-9">
          <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div className="lg:py-5">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#996d2d] uppercase">
                {t('featured.eyebrow')}
              </p>
              <h2 className="mt-6 font-display text-3xl font-medium tracking-tight text-balance text-[#171917] sm:text-4xl lg:text-5xl">
                <Link href="/work/yadora">{t('featured.title')}</Link>
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {t('featured.description')}
              </p>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#136f55]">
                {tags.map((tag, index) => (
                  <li key={tag} className="flex items-center gap-5">
                    {index > 0 && (
                      <span
                        className="h-px w-5 bg-neutral-300"
                        aria-hidden="true"
                      />
                    )}
                    {tag}
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Button href="/work/yadora" className="gap-2 px-5 py-2.5">
                  {t('featured.button')}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Link
              href="/work/yadora"
              aria-label={t('featured.button')}
              className="relative isolate block rounded-[1.75rem] border border-neutral-800 bg-[#111311] p-1.5 shadow-[0_28px_70px_rgba(17,19,17,0.18),0_10px_24px_rgba(17,19,17,0.1)] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4 focus-visible:outline-none motion-safe:animate-yadora-float motion-safe:will-change-transform sm:rounded-[2rem] sm:p-2"
            >
              <span
                aria-hidden="true"
                className="absolute right-[8%] -bottom-5 left-[8%] -z-10 h-8 rounded-full bg-neutral-950/25 blur-2xl motion-safe:animate-yadora-shadow"
              />
              <div className="relative aspect-[1306/777] overflow-hidden rounded-[1.35rem] bg-[#151816] sm:rounded-[1.55rem]">
                <Image
                  src="/images/yadora/yadora-hero.png"
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 680px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
            </Link>
          </div>
        </article>
      </FadeIn>
    </Container>
  )
}

async function FeaturedBocker({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'WorkPage' })
  const tags = [
    t('bockerFeatured.tags.tag1'),
    t('bockerFeatured.tags.tag2'),
    t('bockerFeatured.tags.tag3'),
  ]

  return (
    <Container className="mt-12 sm:mt-16">
      <FadeIn>
        <article className="border-b border-neutral-950 pb-7 sm:pb-9">
          <div className="grid items-center gap-12 lg:grid-cols-[1.18fr_0.82fr] lg:gap-16">
            <Link
              href="/work/bocker"
              aria-label={t('bockerFeatured.button')}
              className="relative isolate block rounded-[1.75rem] border border-[#a8d7e9] bg-[#d8f1fa] p-1.5 shadow-[0_28px_70px_rgba(20,57,74,0.14),0_10px_24px_rgba(20,57,74,0.08)] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4 focus-visible:outline-none motion-safe:animate-yadora-float motion-safe:will-change-transform sm:rounded-[2rem] sm:p-2"
            >
              <span
                aria-hidden="true"
                className="absolute right-[8%] -bottom-5 left-[8%] -z-10 h-8 rounded-full bg-[#14394a]/20 blur-2xl motion-safe:animate-yadora-shadow"
              />
              <div className="relative aspect-[1308/783] overflow-hidden rounded-[1.35rem] bg-white sm:rounded-[1.55rem]">
                <Image
                  src="/images/bocker/bocker-hero.png"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 680px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="lg:py-5">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#367f9a] uppercase">
                {t('bockerFeatured.eyebrow')}
              </p>
              <h2 className="mt-6 font-display text-3xl font-medium tracking-tight text-balance text-[#101827] sm:text-4xl lg:text-5xl">
                <Link href="/work/bocker">{t('bockerFeatured.title')}</Link>
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {t('bockerFeatured.description')}
              </p>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#367f9a]">
                {tags.map((tag, index) => (
                  <li key={tag} className="flex items-center gap-5">
                    {index > 0 && (
                      <span
                        className="h-px w-5 bg-neutral-300"
                        aria-hidden="true"
                      />
                    )}
                    {tag}
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Button href="/work/bocker" className="gap-2 px-5 py-2.5">
                  {t('bockerFeatured.button')}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </article>
      </FadeIn>
    </Container>
  )
}

async function CaseStudies({
  caseStudies,
  locale,
}: {
  caseStudies: Array<MDXEntry<CaseStudy>>
  locale: string
}) {
  const t = await getTranslations({ locale, namespace: 'WorkPage' })

  return (
    <Container className="mt-32">
      <FadeIn>
        <h2 className="font-display text-2xl font-semibold text-neutral-950">
          {t('case.heading')}
        </h2>
      </FadeIn>
      <div className="mt-10 space-y-20 sm:space-y-24 lg:space-y-32">
        {caseStudies.map((caseStudy) => (
          <FadeIn key={caseStudy.client}>
            <article>
              <Border className="grid grid-cols-3 gap-x-8 gap-y-8 pt-16">
                <div className="col-span-full sm:flex sm:items-center sm:justify-between sm:gap-x-8 lg:col-span-1 lg:block">
                  <div className="sm:flex sm:items-center sm:gap-x-6 lg:block">
                    <Image
                      src={caseStudy.logo}
                      alt={caseStudy.client}
                      width={64}
                      height={64}
                      sizes="64px"
                      className="h-16 w-16 object-contain"
                    />
                    <h3 className="mt-6 text-sm font-semibold text-neutral-950 sm:mt-0 lg:mt-8">
                      {caseStudy.client}
                    </h3>
                  </div>
                  <div className="mt-1 flex gap-x-4 sm:mt-0 lg:block">
                    <p className="text-sm tracking-tight text-neutral-950 after:ml-4 after:font-semibold after:text-neutral-300 after:content-['/'] lg:mt-2 lg:after:hidden">
                      {caseStudy.service}
                    </p>
                    <p className="text-sm text-neutral-950 lg:mt-2">
                      <time dateTime={caseStudy.date}>
                        {formatDate(caseStudy.date)}
                      </time>
                    </p>
                  </div>
                </div>
                <div className="col-span-full lg:col-span-2 lg:max-w-2xl">
                  <p className="font-display text-4xl font-medium text-neutral-950">
                    <Link href={caseStudy.href}>{caseStudy.title}</Link>
                  </p>
                  <div className="mt-6 space-y-6 text-base text-neutral-600">
                    {caseStudy.summary.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-8 flex">
                    <Button
                      href={caseStudy.href}
                      aria-label={`Read case study: ${caseStudy.client}`}
                    >
                      {t('case.button')}
                    </Button>
                  </div>
                  {caseStudy.testimonial && (
                    <Blockquote
                      author={caseStudy.testimonial.author}
                      className="mt-12"
                    >
                      {caseStudy.testimonial.content}
                    </Blockquote>
                  )}
                </div>
              </Border>
            </article>
          </FadeIn>
        ))}
      </div>
    </Container>
  )
}

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'WorkPage' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kondax.com'

  return {
    title: t('og_title'),
    description: t('og_description'),
    alternates: {
      canonical: `https://kondax.com/${locale}/work`,
    },
    openGraph: {
      title: t('og_title'),
      description: t('og_description'),
      type: 'website',
      locale,
      url: `${baseUrl}/${locale}/work`,
      images: [
        {
          url: `${baseUrl}/apple-touch-icon.png`,
          width: 180,
          height: 180,
          alt: t('og_title'),
        },
      ],
    },
  }
}

export default async function Work({ params }: Props) {
  const { locale } = await params
  const caseStudies = await loadCaseStudies()
  const t = await getTranslations({ locale, namespace: 'WorkPage' })

  return (
    <>
      <PageIntro eyebrow={t('intro.eyebrow')} title={t('intro.hasCases.title')}>
        <p className="text-sm text-neutral-600 md:text-base">
          {t('intro.hasCases.description')}
        </p>
      </PageIntro>

      <FeaturedYadora locale={locale} />
      <FeaturedBocker locale={locale} />

      {caseStudies.length > 0 && (
        <CaseStudies caseStudies={caseStudies} locale={locale} />
      )}

      <ContactSection />
    </>
  )
}
