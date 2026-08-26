import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Link } from '@/i18n/routing'

const productImage = '/images/bocker/bocker-hero.png'

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
  inverted = false,
}: {
  number: string
  eyebrow: string
  title: string
  description: string
  inverted?: boolean
}) {
  return (
    <FadeIn className="grid gap-10 lg:grid-cols-[0.36fr_1fr] lg:gap-16">
      <div className="flex items-start gap-4">
        <span
          className={`font-mono text-xs ${
            inverted ? 'text-[#91d3eb]' : 'text-[#367f9a]'
          }`}
        >
          {number}
        </span>
        <p
          className={`text-xs font-semibold tracking-[0.22em] uppercase ${
            inverted ? 'text-white/45' : 'text-neutral-500'
          }`}
        >
          {eyebrow}
        </p>
      </div>
      <div className="max-w-4xl">
        <h2
          className={`font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl lg:text-5xl ${
            inverted ? 'text-white' : 'text-[#101827]'
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-6 max-w-3xl text-base leading-8 ${
            inverted ? 'text-white/60' : 'text-neutral-600'
          }`}
        >
          {description}
        </p>
      </div>
    </FadeIn>
  )
}

export async function BockerShowcase({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'BockerPage' })
  const officialUrl = `https://bocker.jp/${locale}`

  const projectInfo = [
    {
      title: t('projectInfo.audience.title'),
      items: [
        t('projectInfo.audience.item1'),
        t('projectInfo.audience.item2'),
        t('projectInfo.audience.item3'),
      ],
    },
    {
      title: t('projectInfo.scope.title'),
      items: [
        t('projectInfo.scope.item1'),
        t('projectInfo.scope.item2'),
        t('projectInfo.scope.item3'),
        t('projectInfo.scope.item4'),
      ],
    },
    {
      title: t('projectInfo.delivery.title'),
      items: [t('projectInfo.delivery.item1'), t('projectInfo.delivery.item2')],
    },
  ]

  const challenges = [
    {
      title: t('challenge.item1.title'),
      description: t('challenge.item1.description'),
    },
    {
      title: t('challenge.item2.title'),
      description: t('challenge.item2.description'),
    },
    {
      title: t('challenge.item3.title'),
      description: t('challenge.item3.description'),
    },
  ]

  const steps = [
    {
      title: t('flow.step1.title'),
      description: t('flow.step1.description'),
    },
    {
      title: t('flow.step2.title'),
      description: t('flow.step2.description'),
    },
    {
      title: t('flow.step3.title'),
      description: t('flow.step3.description'),
    },
  ]

  const features = [
    {
      title: t('features.item1.title'),
      description: t('features.item1.description'),
    },
    {
      title: t('features.item2.title'),
      description: t('features.item2.description'),
    },
    {
      title: t('features.item3.title'),
      description: t('features.item3.description'),
    },
    {
      title: t('features.item4.title'),
      description: t('features.item4.description'),
    },
    {
      title: t('features.item5.title'),
      description: t('features.item5.description'),
    },
    {
      title: t('features.item6.title'),
      description: t('features.item6.description'),
    },
  ]

  const operations = [
    {
      title: t('operations.item1.title'),
      description: t('operations.item1.description'),
    },
    {
      title: t('operations.item2.title'),
      description: t('operations.item2.description'),
    },
    {
      title: t('operations.item3.title'),
      description: t('operations.item3.description'),
    },
    {
      title: t('operations.item4.title'),
      description: t('operations.item4.description'),
    },
  ]

  const stats = [
    [t('results.stat1.value'), t('results.stat1.label')],
    [t('results.stat2.value'), t('results.stat2.label')],
    [t('results.stat3.value'), t('results.stat3.label')],
    [t('results.stat4.value'), t('results.stat4.label')],
  ]

  return (
    <>
      <section className="mt-16 sm:mt-20 lg:mt-24">
        <Container>
          <FadeIn>
            <figure className="relative">
              <div
                aria-hidden="true"
                className="absolute right-[8%] -bottom-1 left-[8%] h-8 rounded-full bg-[#14394a]/20 blur-2xl motion-safe:animate-yadora-shadow"
              />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[#a8d7e9] bg-[#d8f1fa] p-1.5 shadow-[0_36px_90px_rgba(20,57,74,0.16),0_12px_30px_rgba(20,57,74,0.1)] motion-safe:animate-yadora-float motion-safe:will-change-transform sm:rounded-[2.25rem] sm:p-2.5">
                <div className="relative aspect-[1308/783] overflow-hidden rounded-[1.35rem] bg-white sm:rounded-[1.75rem]">
                  <Image
                    src={productImage}
                    alt={t('intro.imageAlt')}
                    fill
                    priority
                    sizes="(min-width: 1280px) 1200px, calc(100vw - 48px)"
                    className="object-contain"
                  />
                </div>
              </div>
              <figcaption className="mt-6 flex items-center justify-between gap-4 text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase sm:mt-7 sm:text-xs">
                <span>{t('intro.imageCaption')}</span>
                <span aria-hidden="true">KONDAX × Bocker</span>
              </figcaption>
            </figure>
          </FadeIn>

          <div className="mt-20 border-t border-neutral-950 pt-7 sm:mt-24">
            <FadeIn className="grid gap-10 lg:grid-cols-[0.34fr_1fr] lg:gap-16">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500 uppercase">
                  {t('intro.eyebrow')}
                </p>
                <p className="mt-4 font-display text-2xl font-medium text-[#367f9a]">
                  Bocker
                </p>
              </div>

              <div>
                <h1 className="max-w-5xl font-display text-5xl font-medium tracking-[-0.035em] text-balance text-[#101827] sm:text-6xl lg:text-7xl">
                  {t('intro.titleLead')}
                  <span className="block text-[#367f9a]">
                    {t('intro.titleAccent')}
                  </span>
                </h1>
                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                  <p className="max-w-2xl text-base leading-8 text-neutral-600">
                    {t('intro.description')}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      href={officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2 px-5 py-2.5 whitespace-nowrap"
                    >
                      {t('intro.buttons.officialSite')}
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    <Link
                      href="/contact?topic=estimate"
                      className="inline-flex items-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {t('intro.buttons.contact')}
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      <Container className="mt-20 sm:mt-28">
        <FadeIn>
          <dl className="grid border-y border-neutral-300 text-sm text-neutral-950 sm:grid-cols-3">
            {projectInfo.map((column, index) => (
              <div
                key={column.title}
                className={`py-7 sm:px-7 ${
                  index > 0
                    ? 'border-t border-neutral-300 sm:border-t-0 sm:border-l'
                    : 'sm:pl-0'
                }`}
              >
                <dt className="text-xs font-semibold tracking-[0.18em] text-[#367f9a] uppercase">
                  {column.title}
                </dt>
                <dd className="mt-4 space-y-1.5 leading-6 text-neutral-600">
                  {column.items.map((item) => (
                    <span key={item} className="block">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </Container>

      <section className="mt-28 bg-[#eaf6fa] py-24 sm:mt-36 sm:py-32">
        <Container>
          <SectionHeading
            number="01"
            eyebrow={t('challenge.eyebrow')}
            title={t('challenge.title')}
            description={t('challenge.description')}
          />
          <div className="mt-16 grid border-y border-[#b8d7e2] lg:grid-cols-3">
            {challenges.map(({ title, description }, index) => (
              <FadeIn key={title}>
                <article
                  className={`h-full py-9 lg:px-8 lg:py-11 ${
                    index > 0
                      ? 'border-t border-[#b8d7e2] lg:border-t-0 lg:border-l'
                      : 'lg:pl-0'
                  }`}
                >
                  <span className="font-mono text-xs text-[#367f9a]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-10 max-w-xs font-display text-2xl font-medium text-[#101827]">
                    {title}
                  </h3>
                  <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-600">
                    {description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#101827] py-24 sm:py-32">
        <Container>
          <SectionHeading
            number="02"
            eyebrow={t('flow.eyebrow')}
            title={t('flow.title')}
            description={t('flow.description')}
            inverted
          />
          <div className="mt-16 border-t border-white/20">
            {steps.map(({ title, description }, index) => (
              <FadeIn key={title}>
                <article className="grid gap-7 border-b border-white/20 py-9 sm:grid-cols-[0.24fr_0.76fr_1fr] sm:items-start sm:gap-10 sm:py-11">
                  <span className="font-display text-5xl font-medium text-[#91d3eb] sm:text-6xl">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-2xl font-medium text-white">
                    {title}
                  </h3>
                  <p className="max-w-xl text-sm leading-7 text-white/60">
                    {description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            number="03"
            eyebrow={t('features.eyebrow')}
            title={t('features.title')}
            description={t('features.description')}
          />
          <div className="mt-16 grid border-t border-neutral-300 md:grid-cols-2">
            {features.map(({ title, description }, index) => (
              <FadeIn key={title}>
                <article
                  className={`grid h-full gap-8 border-b border-neutral-300 py-9 md:grid-cols-[auto_1fr] md:px-8 ${
                    index % 2 === 1 ? 'md:border-l' : 'md:pl-0'
                  }`}
                >
                  <span className="font-mono text-xs text-[#367f9a]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#101827]">
                      {title}
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-7 text-neutral-600">
                      {description}
                    </p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#2f7893] py-24 sm:py-32">
        <Container>
          <SectionHeading
            number="04"
            eyebrow={t('operations.eyebrow')}
            title={t('operations.title')}
            description={t('operations.description')}
            inverted
          />
          <div className="mt-16 grid gap-px bg-white/25 sm:grid-cols-2">
            {operations.map(({ title, description }, index) => (
              <FadeIn key={title}>
                <article className="h-full bg-[#2f7893] px-0 py-9 sm:p-9">
                  <div className="flex items-baseline justify-between gap-5">
                    <h3 className="font-display text-xl font-medium text-white">
                      {title}
                    </h3>
                    <span className="font-mono text-xs text-[#c7ebf7]">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">
                    {description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            number="05"
            eyebrow={t('results.eyebrow')}
            title={t('results.title')}
            description={t('results.description')}
          />
          <FadeIn>
            <dl className="mt-16 grid border-y border-neutral-950 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(([value, label], index) => (
                <div
                  key={label}
                  className={`border-neutral-300 py-8 sm:px-7 ${
                    index > 0 ? 'border-t' : 'sm:pl-0'
                  } ${index % 2 === 1 ? 'sm:border-l' : 'sm:border-l-0'} ${
                    index === 1 ? 'sm:border-t-0' : ''
                  } ${index >= 2 ? 'sm:border-t' : ''} ${
                    index > 0 ? 'lg:border-t-0 lg:border-l' : ''
                  }`}
                >
                  <dt className="font-display text-4xl font-medium tracking-tight text-[#367f9a] sm:text-5xl">
                    {value}
                  </dt>
                  <dd className="mt-4 text-xs leading-5 text-neutral-500">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </Container>
      </section>

      <Container>
        <FadeIn>
          <div className="grid overflow-hidden border border-[#101827] bg-[#101827] lg:grid-cols-[1fr_auto]">
            <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#91d3eb] uppercase">
                {t('cta.eyebrow')}
              </p>
              <h2 className="mt-6 max-w-3xl font-display text-3xl font-medium tracking-tight text-balance text-white sm:text-4xl">
                {t('cta.title')}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">
                {t('cta.description')}
              </p>
            </div>
            <div className="flex flex-col justify-end gap-3 border-t border-white/15 p-6 sm:flex-row sm:p-10 lg:w-72 lg:flex-col lg:border-t-0 lg:border-l">
              <Button
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                invert
                className="justify-center gap-2 px-5 py-2.5 whitespace-nowrap"
              >
                {t('cta.buttons.officialSite')}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Link
                href="/contact?topic=estimate"
                className="inline-flex justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101827] focus-visible:outline-none"
              >
                {t('cta.buttons.contact')}
              </Link>
            </div>
          </div>
        </FadeIn>
      </Container>

      <ContactSection />
    </>
  )
}
