import { ArrowUpRight, BedDouble, Sparkles, UsersRound } from 'lucide-react'
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
        <article className="relative isolate overflow-hidden rounded-[2.5rem] bg-[#071f18] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_90%_10%,rgba(52,211,153,0.24),transparent_34%),radial-gradient(circle_at_10%_100%,rgba(201,255,122,0.10),transparent_30%)]" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-emerald-300 uppercase">
                {t('featured.eyebrow')}
              </p>
              <h2 className="mt-5 font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
                <Link href="/work/yadora">{t('featured.title')}</Link>
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                {t('featured.description')}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-9">
                <Button
                  href="/work/yadora"
                  invert
                  className="gap-2 px-5 py-2.5"
                >
                  {t('featured.button')}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute inset-8 rounded-full bg-emerald-300/20 blur-3xl" />
              <div className="relative rotate-1 rounded-[2rem] border border-white/10 bg-[#10261f] p-4 shadow-2xl shadow-black/30 transition-transform duration-500 hover:rotate-0">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#19c48a] text-[#071f18]">
                      Y
                    </span>
                    Yadora
                  </div>
                  <Sparkles className="h-4 w-4 text-[#c9ff7a]" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <BedDouble className="h-5 w-5 text-emerald-300" />
                    <p className="mt-5 text-2xl font-semibold">82%</p>
                    <p className="mt-1 text-[10px] text-white/40">
                      {t('featured.mockup.occupancy')}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <UsersRound className="h-5 w-5 text-emerald-300" />
                    <p className="mt-5 text-2xl font-semibold">24</p>
                    <p className="mt-1 text-[10px] text-white/40">
                      {t('featured.mockup.guests')}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-start gap-3 rounded-2xl bg-[#dffbed] p-4 text-[#10382b]">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-xs leading-5">
                      {t('featured.mockup.suggestion')}
                    </p>
                  </div>
                </div>
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

      {caseStudies.length > 0 && (
        <CaseStudies caseStudies={caseStudies} locale={locale} />
      )}

      <ContactSection />
    </>
  )
}
