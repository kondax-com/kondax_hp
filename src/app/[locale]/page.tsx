import { type Metadata } from 'next'
import { getLocale, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Marquee from 'react-fast-marquee'
import { AnimationHeadLine } from '@/components/AnimationHeadLine'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { List, ListItem } from '@/components/List'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { StaggerContainer, StaggerItem } from '@/components/StaggerContainer'
import logo1 from '@/images/clients/1.webp'
import logo2 from '@/images/clients/2.webp'
import logo3 from '@/images/clients/3.webp'
import logo4 from '@/images/clients/4.webp'
import logo5 from '@/images/clients/5.webp'
import logo6 from '@/images/clients/6.webp'
import logo7 from '@/images/clients/7.webp'
import logo8 from '@/images/clients/8.webp'
import logo9 from '@/images/clients/9.webp'
import logo10 from '@/images/clients/10.webp'
import imageLaptop from '@/images/laptop.webp'
import { type CaseStudy, type MDXEntry, loadCaseStudies } from '@/lib/mdx'

const clients = [
  ['1', logo1],
  ['2', logo2],
  ['3', logo3],
  ['4', logo4],
  ['5', logo5],
  ['6', logo6],
  ['7', logo7],
  ['8', logo8],
  ['9', logo9],
  ['10', logo10],
]

async function Clients({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale, namespace: 'HomePage' })
  return (
    <div className="mt-24 py-20 sm:mt-32 sm:py-32">
      <Container>
        <FadeIn className="mb-10 flex items-center gap-x-8">
          <h2 className="text-s, max-w-2/3 text-center font-display text-sm font-semibold tracking-wider text-balance sm:text-left">
            {t('clients_heading')}
          </h2>
          <svg
            className="h-1 flex-auto"
            viewBox="0 0 100 1"
            preserveAspectRatio="none"
          >
            <path d="M0 0.5h100v0.5H0z" fill="currentColor" />
          </svg>
        </FadeIn>

        <div className="relative">
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-16 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="pointer-events-none absolute top-0 -right-1 z-10 h-full w-16 bg-gradient-to-l from-white via-white/80 to-transparent" />

          <Marquee
            speed={50}
            gradient={false}
            pauseOnHover={true}
            direction="right"
          >
            {clients.map(([client, logo]) => (
              <div key={client as string} className="mx-4 md:mx-12">
                <div className="flex h-[60px] w-[120px] items-center justify-center">
                  <Image
                    src={logo}
                    alt={client as string}
                    sizes="120px"
                    className="rounded-3xl object-contain"
                    width={120}
                    height={60}
                  />
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </Container>
    </div>
  )
}

async function CaseStudies({
  caseStudies,
  locale,
}: {
  caseStudies: Array<MDXEntry<CaseStudy>>
  locale: string
}) {
  const t = await getTranslations({ locale: locale, namespace: 'HomePage' })
  return (
    <>
      <SectionIntro
        eyebrow="System"
        title={t('system.title')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p className="text-sm md:text-base">
          {t.rich('system.description', {
            strong: (chunks) => <strong>{chunks}</strong>,
            br: () => <br />,
          })}
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {caseStudies.map((caseStudy) => (
            <FadeIn key={caseStudy.href} className="flex">
              <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
                <h3>
                  <Link href={caseStudy.href}>
                    <span className="absolute inset-0 rounded-3xl" />
                    <Image
                      src={caseStudy.logo}
                      alt={caseStudy.client}
                      className="h-16 w-16 object-contain"
                      sizes="64px"
                    />
                  </Link>
                </h3>
                <p className="mt-6 flex gap-x-2 text-sm text-neutral-950">
                  <time
                    dateTime={caseStudy.date.split('-')[0]}
                    className="font-semibold"
                  >
                    {caseStudy.date.split('-')[0]}
                  </time>
                  <span className="text-neutral-300" aria-hidden="true">
                    /
                  </span>
                  <span>Case study</span>
                </p>
                <p className="mt-6 font-display text-2xl font-semibold text-neutral-950">
                  {caseStudy.title}
                </p>
                <p className="mt-4 text-base text-neutral-600">
                  {caseStudy.description}
                </p>
              </article>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </>
  )
}

async function Services() {
  const locale = await getLocale()
  const t = await getTranslations({ locale: locale, namespace: 'HomePage' })
  return (
    <>
      <SectionIntro
        eyebrow="Speed"
        title={t('speed.title')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p className="text-sm md:text-base">
          {t.rich('speed.description', {
            strong: (chunks) => <strong>{chunks}</strong>,
            br: () => <br />,
          })}
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <div className="lg:flex lg:items-center lg:justify-end">
          <div className="flex justify-center lg:w-1/2 lg:justify-end lg:pr-12">
            <FadeIn className="w-135 flex-none lg:w-180">
              <StylizedImage
                src={imageLaptop}
                sizes="(min-width: 1024px) 41rem, 31rem"
                className="justify-center lg:justify-end"
              />
            </FadeIn>
          </div>
          <List className="mt-16 lg:mt-0 lg:w-1/2 lg:min-w-132 lg:pl-4">
            {/* マーケティング・営業支援 */}
            <ListItem
              title={t('services.marketing.title')}
              titleCover={'Marketing'}
            >
              {t.rich('services.marketing.body', {
                strong: (c) => <strong>{c}</strong>,
                br: () => <br />,
              })}
            </ListItem>

            {/* AIコンテンツ・業務効率化 */}
            <ListItem title={t('services.ai.title')} titleCover={'AI'}>
              {t.rich('services.ai.body', {
                strong: (c) => <strong>{c}</strong>,
                br: () => <br />,
              })}
            </ListItem>

            {/* 業務自動化・システム開発 */}
            <ListItem
              title={t('services.automation.title')}
              titleCover={'Automation'}
            >
              {t.rich('services.automation.body', {
                strong: (c) => <strong>{c}</strong>,
                br: () => <br />,
              })}
            </ListItem>

            {/* ECサイト・売上最大化 */}
            <ListItem
              title={t('services.ecommerce.title')}
              titleCover={'E-commerce'}
            >
              {t.rich('services.ecommerce.body', {
                strong: (c) => <strong>{c}</strong>,
                br: () => <br />,
              })}
            </ListItem>

            {/* データ分析・継続成長支援 */}
            <ListItem
              title={t('services.data.title')}
              titleCover={'DataAnalysis'}
            >
              {t.rich('services.data.body', {
                strong: (c) => <strong>{c}</strong>,
                br: () => <br />,
              })}
            </ListItem>
          </List>
        </div>
      </Container>
    </>
  )
}

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://kondax.com/' + locale,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}`,
      images: [
        {
          url: `${baseUrl}/apple-touch-icon.png`, // OGP画像への絶対パス
          width: 180,
          height: 180,
          alt: t('title'),
        },
      ],
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale: locale, namespace: 'HomePage' })
  let caseStudies = (await loadCaseStudies()).slice(0, 3)
  return (
    <>
      <Container className="mt-24 sm:mt-32 md:mt-56">
        <div className="max-w-5xl">
          <AnimationHeadLine />
        </div>
      </Container>
      <StaggerContainer>
        <StaggerItem>
          <Clients locale={locale} />
        </StaggerItem>

        <StaggerItem>
          <CaseStudies caseStudies={caseStudies} locale={locale} />
        </StaggerItem>

        <StaggerItem>
          <div className="mt-24 sm:mt-32 lg:mt-40">
            <Container>
              <div className="mx-auto max-w-4xl">
                <div className="relative rounded-4xl bg-neutral-950 px-6 py-20 sm:px-10 sm:py-32 md:px-12">
                  <div className="absolute inset-0 rounded-4xl bg-gradient-to-r from-neutral-800/50 to-neutral-900/50" />
                  <div className="relative">
                    <div className="flex">
                      <div className="ml-6 flex-1">
                        <h3 className="font-display text-3xl font-bold text-white sm:text-5xl">
                          {t('cta.title')}
                        </h3>
                        <p className="mt-12 text-base text-neutral-300">
                          {t.rich('cta.description', {
                            strong: (c) => (
                              <strong className="text-white">{c}</strong>
                            ),
                            br: () => <br />,
                          })}
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {t('cta.stats.stat1.value')}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {t('cta.stats.stat1.label')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {t('cta.stats.stat2.value')}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {t('cta.stats.stat2.label')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {t('cta.stats.stat3.value')}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {t('cta.stats.stat3.label')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {t('cta.stats.stat4.value')}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {t('cta.stats.stat4.label')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Services />
        </StaggerItem>

        <StaggerItem>
          <ContactSection />
        </StaggerItem>
      </StaggerContainer>
    </>
  )
}
