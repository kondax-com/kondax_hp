import { type Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowDown, ArrowUpRight, Check, Plus } from 'lucide-react'
import { Link, routing } from '@/i18n/routing'
import { FlowScene } from '@/components/home/FlowScene'
import styles from '@/components/home/Home.module.css'

type Props = { params: Promise<{ locale: string }> }
type Service = {
  id: string
  title: string
  description: string
  examples: string[]
}
type Product = {
  id: string
  name: string
  category: string
  title: string
  description: string
  cta: string
  imageAlt: string
  tags: string[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://kondax.com/${locale}`,
      languages: { ja: 'https://kondax.com/ja', en: 'https://kondax.com/en' },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'ja' ? 'ja_JP' : 'en_US',
      url: `https://kondax.com/${locale}`,
      images: [
        {
          url: 'https://kondax.com/apple-touch-icon.png',
          width: 180,
          height: 180,
          alt: 'KONDAX',
        },
      ],
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

function ServiceVisual({ kind }: { kind: string }) {
  return (
    <svg
      viewBox="0 0 360 172"
      fill="none"
      aria-hidden="true"
      className={styles.serviceVisual}
    >
      {kind === 'ai' ? (
        <>
          <path
            d="M57 85H132M228 85H303M180 34V136M92 40L143 66M218 105L269 133M91 133L142 105M219 64L269 37"
            stroke="currentColor"
            strokeOpacity=".2"
          />
          <circle cx="180" cy="85" r="43" fill="#eef0ff" stroke="#7d86e4" />
          <circle cx="180" cy="85" r="31" stroke="#7d86e4" strokeOpacity=".4" />
          <path
            d="m180 61 6 18 18 6-18 6-6 18-6-18-18-6 18-6 6-18Z"
            fill="#5a63d4"
          />
          {[
            [57, 85],
            [92, 40],
            [91, 133],
            [180, 24],
            [180, 146],
            [269, 37],
            [269, 133],
            [303, 85],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i % 3 === 0 ? 6 : 4}
              fill={i % 3 === 0 ? '#9ba3ef' : '#d8dcf5'}
            />
          ))}
        </>
      ) : kind === 'automation' ? (
        <>
          <path
            d="M47 54H133C181 54 179 117 226 117H313M47 117H131C177 117 181 54 227 54H313"
            stroke="#a3abd9"
            strokeWidth="2"
          />
          <path
            d="m307 48 7 6-7 6m0 51 7 6-7 6"
            stroke="#737ed4"
            strokeWidth="2"
          />
          <rect
            x="43"
            y="36"
            width="55"
            height="36"
            rx="9"
            fill="#e7eaf8"
            stroke="#adb6e1"
          />
          <rect
            x="43"
            y="99"
            width="55"
            height="36"
            rx="9"
            fill="#f5f6fc"
            stroke="#c9cfe8"
          />
          <rect x="154" y="65" width="51" height="41" rx="11" fill="#5a63d4" />
          <path d="m177 75-7 11h8l-2 10 12-14h-9l4-7" fill="white" />
          <circle cx="264" cy="54" r="17" fill="#e7eaf8" stroke="#adb6e1" />
          <path d="m257 54 5 5 8-10" stroke="#6a75cd" strokeWidth="2" />
          <circle cx="264" cy="117" r="17" fill="#f5f6fc" stroke="#c9cfe8" />
          <path d="M257 117h14m-7-7v14" stroke="#929dcc" strokeWidth="2" />
          <path
            d="M58 49h24m-24 9h16M58 112h24m-24 9h16"
            stroke="#9ba6d8"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <rect
            x="79"
            y="26"
            width="199"
            height="122"
            rx="10"
            fill="#fff"
            stroke="#acb5dc"
          />
          <path d="M79 48h199" stroke="#d9deef" />
          <circle cx="93" cy="37" r="2" fill="#abb4d7" />
          <circle cx="102" cy="37" r="2" fill="#abb4d7" />
          <circle cx="111" cy="37" r="2" fill="#abb4d7" />
          <rect x="93" y="61" width="39" height="72" rx="4" fill="#edf0fa" />
          <rect x="144" y="61" width="118" height="33" rx="4" fill="#e3e7ff" />
          <path
            d="m183 71-7 7 7 7m13-14 7 7-7 7m-7-16-3 18"
            stroke="#6c77cf"
            strokeWidth="1.8"
          />
          <rect x="144" y="105" width="53" height="28" rx="4" fill="#f1f3fb" />
          <rect x="208" y="105" width="54" height="28" rx="4" fill="#f1f3fb" />
          <rect
            x="250"
            y="86"
            width="42"
            height="66"
            rx="6"
            fill="#f8f9ff"
            stroke="#8c98d0"
          />
          <path
            d="M259 100h24m-24 8h16m-16 8h24m-24 8h20"
            stroke="#bdc5e8"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  )
}

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'HomeExperience' })
  const services = t.raw('services.items') as Service[]
  const products = t.raw('work.items') as Product[]
  const steps = t.raw('approach.steps') as {
    title: string
    description: string
  }[]
  const questions = t.raw('faq.items') as { question: string; answer: string }[]
  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.heroLabel}>
            <span aria-hidden="true" />
            {t('hero.label')}
          </p>
          <h1 id="hero-title" className={styles.heroTitle}>
            {(t.raw('hero.titleLines') as string[]).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className={styles.heroDescription}>{t('hero.description')}</p>
          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.primaryLink}>
              {t('hero.primaryCta')}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <a href="#services" className={styles.secondaryLink}>
              {t('hero.secondaryCta')}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <p className={styles.heroNote}>{t('hero.note')}</p>
        </div>
        <div className={styles.heroArt}>
          <FlowScene
            pauseLabel={t('hero.pauseLabel')}
            playLabel={t('hero.playLabel')}
            sceneLabel={t('hero.visualLabel')}
          />
        </div>
        <div className={styles.heroBaseline} aria-hidden="true">
          <span>Technology, shaped around people.</span>
          <span>KONDAX / Design & Engineering</span>
        </div>
      </section>
      <section
        id="services"
        className={styles.services}
        aria-labelledby="services-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.sectionLabel}>{t('services.label')}</p>
          <div>
            <h2 id="services-title">{t('services.title')}</h2>
            <p className={styles.sectionDescription}>
              {t('services.description')}
            </p>
          </div>
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <article key={service.id} className={styles.service}>
              <div className={styles.visualFrame}>
                <ServiceVisual kind={service.id} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.examples.map((example) => (
                  <li key={example}>
                    <Check size={13} aria-hidden="true" />
                    {example}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <Link href="/contact" className={styles.textLink}>
          {t('services.cta')}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>
      <section id="work" className={styles.work} aria-labelledby="work-title">
        <div className={styles.sectionHeading}>
          <p className={styles.sectionLabel}>{t('work.label')}</p>
          <div>
            <h2 id="work-title">{t('work.title')}</h2>
            <p className={styles.sectionDescription}>{t('work.description')}</p>
          </div>
        </div>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <article key={product.id} className={styles.product}>
              <Link
                href={`/work/${product.id}`}
                className={`${styles.productImageLink} ${product.id === 'yadora' ? styles.yadora : styles.bocker}`}
                aria-label={product.cta}
              >
                <span className={styles.productName} translate="no">
                  {product.name}
                  <ArrowUpRight size={24} aria-hidden="true" />
                </span>
                <Image
                  src={`/images/${product.id}/${product.id}-hero.png`}
                  alt={product.imageAlt}
                  width={1440}
                  height={1000}
                  sizes="(min-width: 900px) 44vw, 90vw"
                  className={styles.productImage}
                />
              </Link>
              <div className={styles.productMeta}>
                <span>{product.category}</span>
                <div className={styles.productTags}>
                  {product.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <h3>
                <Link href={`/work/${product.id}`}>{product.title}</Link>
              </h3>
              <p>{product.description}</p>
              <Link href={`/work/${product.id}`} className={styles.productCta}>
                {product.cta}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <div className={styles.workMore}>
          <Link href="/work/gallery" className={styles.textLink}>
            {t('work.allCta')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section
        id="approach"
        className={styles.approach}
        aria-labelledby="approach-title"
      >
        <div className={styles.approachIntro}>
          <p className={styles.sectionLabel}>{t('approach.label')}</p>
          <h2 id="approach-title">{t('approach.title')}</h2>
          <p>{t('approach.description')}</p>
          <Link href="/process" className={styles.textLink}>
            {t('approach.cta')}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNumber} aria-hidden="true">
                0{index + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.faqIntro}>
          <p className={styles.sectionLabel}>{t('faq.label')}</p>
          <h2 id="faq-title">{t('faq.title')}</h2>
        </div>
        <div className={styles.questions}>
          {questions.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <Plus size={19} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className={styles.contact} aria-labelledby="contact-title">
        <div className={styles.contactOrb} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={styles.contactContent}>
          <p className={styles.sectionLabel}>{t('contact.label')}</p>
          <h2 id="contact-title">{t('contact.title')}</h2>
          <p className={styles.contactDescription}>
            {t('contact.description')}
          </p>
          <Link href="/contact" className={styles.contactLink}>
            {t('contact.cta')}
            <ArrowUpRight size={21} aria-hidden="true" />
          </Link>
          <p className={styles.contactNote}>{t('contact.note')}</p>
        </div>
      </section>
    </div>
  )
}
