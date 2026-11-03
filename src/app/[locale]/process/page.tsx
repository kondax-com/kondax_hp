import { type Metadata } from 'next'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { GridPattern } from '@/components/GridPattern'
import { List, ListItem } from '@/components/List'
import { PageIntro } from '@/components/PageIntro'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { TagList, TagListItem } from '@/components/TagList'
import imageLaptop from '@/images/laptop.webp'
import imageMeeting from '@/images/meeting.webp'
import imageWhiteboard from '@/images/whiteboard.webp'
import { getTranslations } from 'next-intl/server'

function Section({
  title,
  image,
  children,
}: {
  title: string
  image: React.ComponentPropsWithoutRef<typeof StylizedImage>
  children: React.ReactNode
}) {
  return (
    <Container className="group/section [counter-increment:section]">
      <div className="lg:flex lg:items-center lg:justify-end lg:gap-x-8 lg:group-even/section:justify-start xl:gap-x-20">
        <div className="flex min-w-0 justify-center lg:flex-1">
          <FadeIn className="w-full max-w-135 flex-none">
            <StylizedImage
              {...image}
              sizes="(min-width: 1024px) 42vw, (min-width: 640px) 540px, calc(100vw - 48px)"
              className="justify-center lg:justify-end lg:group-even/section:justify-start"
            />
          </FadeIn>
        </div>
        <div className="mt-12 lg:mt-0 lg:w-148 lg:flex-none lg:group-even/section:order-first">
          <FadeIn>
            <div
              className="font-display text-base font-semibold before:text-neutral-300 before:content-['/_'] after:text-neutral-950 after:content-[counter(section,decimal-leading-zero)]"
              aria-hidden="true"
            />
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              {title}
            </h2>
            <div className="mt-6">{children}</div>
          </FadeIn>
        </div>
      </div>
    </Container>
  )
}

async function Discover({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ProcessPage' })
  return (
    <Section title={t('discover.title')} image={{ src: imageWhiteboard }}>
      <div className="space-y-6 text-sm text-neutral-600">
        <p>{t.rich('discover.p1', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
        <p>{t.rich('discover.p2', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
        <p>{t.rich('discover.p3', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
      </div>

      <h3 className="mt-12 font-display text-base font-bold text-neutral-950">
        {t('discover.tasks.title')}
      </h3>
      <TagList className="mt-4">
        <TagListItem>{t('discover.tasks.i1')}</TagListItem>
        <TagListItem>{t('discover.tasks.i2')}</TagListItem>
        <TagListItem>{t('discover.tasks.i3')}</TagListItem>
        <TagListItem>{t('discover.tasks.i4')}</TagListItem>
        <TagListItem>{t('discover.tasks.i5')}</TagListItem>
        <TagListItem>{t('discover.tasks.i6')}</TagListItem>
      </TagList>
    </Section>
  )
}

async function Build({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ProcessPage' })
  return (
    <Section title={t('build.title')} image={{ src: imageLaptop, shape: 1 }}>
      <div className="space-y-6 text-sm text-neutral-600">
        <p>{t.rich('build.p1', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
        <p>{t.rich('build.p2', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
        <p>{t.rich('build.p3', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
      </div>

      <h3 className="mt-12 font-display text-lg font-bold text-neutral-950">{t('build.values.title')}</h3>
      <div className="mt-6 space-y-4 text-sm text-neutral-600">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-neutral-950 mt-2"></div>
          <div>
            <strong className="text-neutral-950">{t('build.values.i1.label')}：</strong>
            {t('build.values.i1.body')}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-neutral-950 mt-2"></div>
          <div>
            <strong className="text-neutral-950">{t('build.values.i2.label')}：</strong>
            {t('build.values.i2.body')}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-neutral-950 mt-2"></div>
          <div>
            <strong className="text-neutral-950">{t('build.values.i3.label')}：</strong>
            {t('build.values.i3.body')}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-neutral-950 mt-2"></div>
          <div>
            <strong className="text-neutral-950">{t('build.values.i4.label')}：</strong>
            {t('build.values.i4.body')}
          </div>
        </div>
      </div>
    {/* 
      <Blockquote
        author={{ name: 'TAKANO', role: 'CEO of KONDAX' }}
        className="mt-12"
      >
        途中で「やっぱりこうしたい」という要望があっても、
        嫌な顔一つせず対応してくれて、最終的に期待以上の成果になりました！
      </Blockquote> */}
    </Section>
  )
}

async function Deliver({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ProcessPage' })
  return (
    <Section title={t('deliver.title')} image={{ src: imageMeeting, shape: 2 }}>
      <div className="space-y-6 text-sm text-neutral-600">
        <p>{t.rich('deliver.p1', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
        <p>{t.rich('deliver.p2', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
        <p>{t.rich('deliver.p3', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}</p>
      </div>

      <h3 className="mt-12 font-display text-lg font-bold text-neutral-950">
        {t('deliver.tasks.title')}
      </h3>
      <List className="mt-8">
        <ListItem title={t('deliver.tasks.i1.title')}>
          {t.rich('deliver.tasks.i1.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
        </ListItem>
        <ListItem title={t('deliver.tasks.i2.title')}>
          {t.rich('deliver.tasks.i2.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
        </ListItem>
        <ListItem title={t('deliver.tasks.i3.title')}>
          {t.rich('deliver.tasks.i3.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
        </ListItem>
      </List>
    </Section>
  )
}

async function Values({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ProcessPage' })
  return (
    <div className="relative mt-24 pt-24 sm:mt-32 sm:pt-32 lg:mt-40 lg:pt-40">
      <div className="absolute inset-x-0 top-0 -z-10 h-[884px] overflow-hidden rounded-t-4xl bg-linear-to-b from-neutral-50">
        <GridPattern
          className="absolute inset-0 h-full w-full mask-[linear-gradient(to_bottom_left,white_40%,transparent_50%)] fill-neutral-100 stroke-neutral-950/5"
          yOffset={-270}
        />
      </div>

      <SectionIntro
        eyebrow={t('values.eyebrow')}
        title={t('values.title')}
      >
        <p className='text-sm md:text-base text-neutral-600'>
          {t.rich('values.description', { strong: (c) => <strong>{c}</strong> })}
        </p>
      </SectionIntro>

      <Container className="mt-24">
        <GridList>
          <GridListItem title={t('values.items.i1.title')}>
            {t.rich('values.items.i1.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
          </GridListItem>
          <GridListItem title={t('values.items.i2.title')}>
            {t.rich('values.items.i2.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
          </GridListItem>
          <GridListItem title={t('values.items.i3.title')}>
            {t.rich('values.items.i3.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
          </GridListItem>
          <GridListItem title={t('values.items.i4.title')}>
            {t.rich('values.items.i4.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
          </GridListItem>
          <GridListItem title={t('values.items.i5.title')}>
            {t.rich('values.items.i5.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
          </GridListItem>
          <GridListItem title={t('values.items.i6.title')}>
            {t.rich('values.items.i6.body', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong>, br: () => <br /> })}
          </GridListItem>
        </GridList>
      </Container>
    </div>
  )
}

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ProcessPage' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  return {
    title: t('og_title'),
    description: t('og_description'),
    alternates: {
      canonical: 'https://kondax.com/' + locale + '/process',
    },
    openGraph: {
      title: t('og_title'),
      description: t('og_description'),
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}/process`,
      images: [
        {
          url: `${baseUrl}/apple-touch-icon.png`, // OGP画像への絶対パス
          width: 180,
          height: 180,
          alt: t('og_title'),
        },
      ],
    },
  }
}

export default async function Process({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ProcessPage' })
  return (
    <>
      <PageIntro eyebrow="Process" title={t('intro.title')}>
        <p className='text-sm md:text-base text-neutral-600'>
          {t.rich('intro.description', { strong: (c) => <strong className="font-semibold text-neutral-950">{c}</strong> })}
        </p>
      </PageIntro>

      <div className="mt-24 space-y-24 [counter-reset:section] sm:mt-32 sm:space-y-32 lg:mt-40 lg:space-y-40">
        <Discover locale={locale} />
        <Build locale={locale} />
        <Deliver locale={locale} />
      </div>

      <Values locale={locale} />

      <ContactSection />
    </>
  )
}
