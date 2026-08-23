import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpRight,
  BedDouble,
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  CircleCheck,
  Clock3,
  Hotel,
  MessageCircleMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  Wifi,
  Workflow,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'

function DashboardMockup({
  t,
}: {
  t: Awaited<ReturnType<typeof getTranslations>>
}) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-2xl lg:mr-0"
    >
      <div className="absolute -inset-8 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10261f] p-3 shadow-2xl shadow-black/40 sm:p-4">
        <div className="flex items-center gap-2 border-b border-white/10 px-2 pb-3">
          <span className="h-2 w-2 rounded-full bg-[#c9ff7a]" />
          <span className="h-2 w-2 rounded-full bg-white/30" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <div className="ml-auto rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-white/50 uppercase">
            Yadora OS
          </div>
        </div>

        <div className="grid gap-3 pt-3 sm:grid-cols-[0.72fr_1.28fr]">
          <div className="hidden rounded-2xl bg-[#0a1914] p-4 sm:block">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#19c48a] text-[#071f18]">
                Y
              </span>
              Yadora
            </div>
            <div className="mt-6 space-y-2 text-[11px] text-white/45">
              {[
                [ChartNoAxesCombined, t('dashboard.menu.dashboard')],
                [Hotel, t('dashboard.menu.properties')],
                [CalendarDays, t('dashboard.menu.reservations')],
                [UsersRound, t('dashboard.menu.guests')],
                [Sparkles, t('dashboard.menu.marketing')],
              ].map(([Icon, label], index) => {
                const MenuIcon = Icon as LucideIcon
                return (
                  <div
                    key={String(label)}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 ${
                      index === 0 ? 'bg-white/10 text-white' : ''
                    }`}
                  >
                    <MenuIcon className="h-3.5 w-3.5" />
                    <span>{String(label)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                ['82%', t('dashboard.metrics.occupancy')],
                ['24', t('dashboard.metrics.guests')],
                ['12', t('dashboard.metrics.bookings')],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/8 bg-white/5 p-3"
                >
                  <p className="text-lg font-semibold text-white sm:text-xl">
                    {value}
                  </p>
                  <p className="mt-1 text-[9px] leading-tight text-white/40 sm:text-[10px]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">
                    {t('dashboard.chart.title')}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/35">
                    {t('dashboard.chart.period')}
                  </p>
                </div>
                <ChartNoAxesCombined className="h-4 w-4 text-[#6ee7b7]" />
              </div>
              <svg
                className="mt-4 h-24 w-full"
                viewBox="0 0 360 100"
                fill="none"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="yadora-chart" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#34d399" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 82C32 80 34 62 60 64C88 66 94 31 120 35C145 39 146 70 176 65C206 60 211 13 241 17C272 21 277 56 304 48C328 41 337 23 360 27V100H0Z"
                  fill="url(#yadora-chart)"
                />
                <path
                  d="M0 82C32 80 34 62 60 64C88 66 94 31 120 35C145 39 146 70 176 65C206 60 211 13 241 17C272 21 277 56 304 48C328 41 337 23 360 27"
                  stroke="#6ee7b7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#dffbed] p-4 text-[#10382b]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#19c48a]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold">
                  {t('dashboard.ai.title')}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#2f5f4e]">
                  {t('dashboard.ai.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-3 -bottom-5 hidden items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 text-xs font-semibold text-[#123b2e] shadow-xl sm:flex">
        <Bot className="h-4 w-4 text-[#0f9f70]" />
        {t('dashboard.ai.badge')}
      </div>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string
  title: string
  description: string
  light?: boolean
}) {
  return (
    <FadeIn className="max-w-3xl">
      <p
        className={`text-xs font-semibold tracking-[0.24em] uppercase ${
          light ? 'text-emerald-300' : 'text-emerald-700'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-5 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl lg:text-5xl ${
          light ? 'text-white' : 'text-neutral-950'
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-6 text-base leading-8 ${
          light ? 'text-white/60' : 'text-neutral-600'
        }`}
      >
        {description}
      </p>
    </FadeIn>
  )
}

export async function YadoraShowcase({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'YadoraPage' })

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
      icon: WalletCards,
      title: t('challenge.item1.title'),
      description: t('challenge.item1.description'),
    },
    {
      icon: UsersRound,
      title: t('challenge.item2.title'),
      description: t('challenge.item2.description'),
    },
    {
      icon: Clock3,
      title: t('challenge.item3.title'),
      description: t('challenge.item3.description'),
    },
  ]

  const steps = [
    {
      icon: QrCode,
      title: t('flow.step1.title'),
      description: t('flow.step1.description'),
    },
    {
      icon: UsersRound,
      title: t('flow.step2.title'),
      description: t('flow.step2.description'),
    },
    {
      icon: Sparkles,
      title: t('flow.step3.title'),
      description: t('flow.step3.description'),
    },
  ]

  const features = [
    {
      icon: Wifi,
      title: t('features.item1.title'),
      description: t('features.item1.description'),
    },
    {
      icon: Sparkles,
      title: t('features.item2.title'),
      description: t('features.item2.description'),
    },
    {
      icon: BedDouble,
      title: t('features.item3.title'),
      description: t('features.item3.description'),
    },
    {
      icon: CalendarDays,
      title: t('features.item4.title'),
      description: t('features.item4.description'),
    },
    {
      icon: ShieldCheck,
      title: t('features.item5.title'),
      description: t('features.item5.description'),
    },
    {
      icon: Workflow,
      title: t('features.item6.title'),
      description: t('features.item6.description'),
    },
  ]

  const operations = [
    {
      icon: CalendarDays,
      title: t('operations.item1.title'),
      description: t('operations.item1.description'),
    },
    {
      icon: CircleCheck,
      title: t('operations.item2.title'),
      description: t('operations.item2.description'),
    },
    {
      icon: MessageCircleMore,
      title: t('operations.item3.title'),
      description: t('operations.item3.description'),
    },
    {
      icon: UsersRound,
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
      <section className="mt-24 sm:mt-32 lg:mt-40">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-[#071f18] px-6 py-16 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_5%,rgba(52,211,153,0.22),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(201,255,122,0.12),transparent_28%)]" />
            <div className="absolute top-0 right-0 -z-10 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full border border-white/10" />
            <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 xl:gap-16">
              <FadeIn>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-emerald-200 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c9ff7a]" />
                  {t('intro.eyebrow')}
                </div>
                <p className="mt-8 text-sm font-semibold tracking-[0.28em] text-white/50 uppercase">
                  Yadora
                </p>
                <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  {t('intro.titleLead')}
                  <span className="mt-2 block text-[#c9ff7a]">
                    {t('intro.titleAccent')}
                  </span>
                </h1>
                <p className="mt-7 max-w-xl text-base leading-8 text-white/65">
                  {t('intro.description')}
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button
                    href="https://yadora-stay.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    invert
                    className="gap-2 px-5 py-2.5"
                  >
                    {t('intro.buttons.officialSite')}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button
                    href="/contact?topic=estimate"
                    className="border border-white/20 bg-white/5 px-5 py-2.5 hover:bg-white/10"
                  >
                    {t('intro.buttons.contact')}
                  </Button>
                </div>
              </FadeIn>

              <FadeIn>
                <DashboardMockup t={t} />
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      <Container className="mt-20 sm:mt-24">
        <FadeIn>
          <dl className="grid overflow-hidden rounded-3xl border border-neutral-200 bg-white/70 text-sm text-neutral-950 sm:grid-cols-3">
            {projectInfo.map((column, index) => (
              <div
                key={column.title}
                className={`px-6 py-7 ${
                  index > 0
                    ? 'border-t border-neutral-200 sm:border-t-0 sm:border-l'
                    : ''
                }`}
              >
                <dt className="font-semibold text-emerald-800">
                  {column.title}
                </dt>
                <dd className="mt-3 space-y-1 text-neutral-600">
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

      <section className="mt-24 bg-[#f4ede1] py-24 sm:mt-32 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow={t('challenge.eyebrow')}
            title={t('challenge.title')}
            description={t('challenge.description')}
          />
          <FadeInStagger className="mt-14 grid gap-5 lg:grid-cols-3" faster>
            {challenges.map(({ icon: Icon, title, description }, index) => (
              <FadeIn key={title}>
                <article className="group h-full rounded-[2rem] border border-[#ded2bf] bg-[#fffaf1] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#715f3d]/10 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#153e31] text-[#c9ff7a]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-[#96876f]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-xl font-semibold text-neutral-950">
                    {title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">
                    {description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow={t('flow.eyebrow')}
            title={t('flow.title')}
            description={t('flow.description')}
          />
          <div className="relative mt-16 grid gap-10 lg:grid-cols-3 lg:gap-6">
            <div className="absolute top-10 right-[16%] left-[16%] hidden h-px bg-emerald-900/15 lg:block" />
            {steps.map(({ icon: Icon, title, description }, index) => (
              <FadeIn key={title}>
                <article className="relative text-center lg:px-5">
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-8 border-white bg-[#dffbed] text-emerald-900 shadow-sm">
                    <Icon className="h-7 w-7" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#113c2e] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-7 font-display text-xl font-semibold text-neutral-950">
                    {title}
                  </h3>
                  <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-neutral-600">
                    {description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#071f18] py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow={t('features.eyebrow')}
            title={t('features.title')}
            description={t('features.description')}
            light
          />
          <FadeInStagger
            className="mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-3"
            faster
          >
            {features.map(({ icon: Icon, title, description }) => (
              <FadeIn key={title}>
                <article className="h-full bg-[#0b2a20] p-7 transition-colors hover:bg-[#103529] sm:p-8">
                  <Icon className="h-6 w-6 text-[#8af0c7]" />
                  <h3 className="mt-8 font-display text-xl font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/55">
                    {description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading
              eyebrow={t('operations.eyebrow')}
              title={t('operations.title')}
              description={t('operations.description')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {operations.map(({ icon: Icon, title, description }) => (
                <FadeIn key={title}>
                  <article className="h-full rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 font-display text-lg font-semibold text-neutral-950">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">
                      {description}
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <FadeIn>
            <div className="overflow-hidden rounded-[2.5rem] bg-[#dffbed] px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
              <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
                <div>
                  <p className="text-xs font-semibold tracking-[0.24em] text-emerald-800 uppercase">
                    {t('results.eyebrow')}
                  </p>
                  <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-[#0a3427] sm:text-4xl">
                    {t('results.title')}
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-[#376253]">
                    {t('results.description')}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {stats.map(([value, label]) => (
                    <div key={label}>
                      <dt className="font-display text-3xl font-semibold text-[#0a3427]">
                        {value}
                      </dt>
                      <dd className="mt-2 text-xs leading-5 text-[#4f7467]">
                        {label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <Container>
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(52,211,153,0.35),transparent_45%)]" />
            <div className="relative mx-auto max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.24em] text-emerald-300 uppercase">
                {t('cta.eyebrow')}
              </p>
              <h2 className="mt-5 font-display text-3xl font-medium sm:text-4xl">
                {t('cta.title')}
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/60">
                {t('cta.description')}
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button
                  href="https://yadora-stay.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  invert
                  className="gap-2 px-5 py-2.5"
                >
                  {t('cta.buttons.officialSite')}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  href="/contact?topic=estimate"
                  className="border border-white/20 bg-white/5 px-5 py-2.5 hover:bg-white/10"
                >
                  {t('cta.buttons.contact')}
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>

      <ContactSection />
    </>
  )
}
