import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getTranslations } from 'next-intl/server'
import { client, getBlogPost } from '@/lib/sanity'
import { Link } from '@/i18n/routing'
import CodeBlock from '@/components/CodeBlock'
import InlineCode from '@/components/InlineCode'
import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import styles from './article.module.css'
import {
  articleHeadings, blockText, comparisonCells, editorialImage, getSeriesNumber,
  headingId, imageDimensions, localizedImageAlt, publicationDate, readingMinutes,
} from './article'

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

interface PostPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getBlogPost(slug, locale)
  const t = await getTranslations({ locale, namespace: 'BlogPage' })
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://kondax.com').replace(/\/$/, '')
  const description = post?.description ? post.description.slice(0, 160) : t('og_fallback_description')
  const image = post?.image ? urlFor(post.image)?.width(1200).height(630).fit('crop').url() : null
  const title = post?.title || t('og_title')
  return {
    title: `${title} | KONDAX`,
    description,
    alternates: {
      canonical: `https://kondax.com/${locale}/blog/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      title: `${title} | KONDAX`,
      description,
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}/blog/${encodeURIComponent(slug)}`,
      images: [
        {
          url: image || `${baseUrl}/apple-touch-icon.png`,
          width: image ? 1200 : 180,
          height: image ? 630 : 180,
          alt: localizedImageAlt(post?.image?.alt, locale, title),
        },
      ],
    },
  }
}

export default async function PostPage({
  params,
}: PostPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  const seriesNumber = getSeriesNumber(slug)
  const editorialFigures = new Map<string, { image: NonNullable<ReturnType<typeof editorialImage>>; caption?: string }>()
  const embeddedCaptions = new Set<string>()

  // 連続するXML風の段落（空行含む）を1つの code ブロックへマージ
  function toPlainText(block: any): string {
    if (!block || block._type !== 'block' || !Array.isArray(block.children)) return ''
    return block.children.map((c: any) => (typeof c?.text === 'string' ? c.text : '')).join('')
  }

  function isXmlLikeLine(line: string): boolean {
    const l = line.trim()
    if (!l) return false
    if (l.startsWith('<!--') || l.endsWith('-->')) return true
    if (/^<\/?[\w:-]/.test(l) && /(\/?>)$/.test(l)) return true
    return /<\/?[\w:-]+(?:\s+[\w:-]+=(?:"[^"]*"|'[^']*'|[^\s>]+))*\s*\/?>(?![^<]*>)/.test(l)
  }

  function isMostlyXml(text: string): boolean {
    const lines = text.split(/\r?\n/)
    const nonEmpty = lines.map((l) => l.trim()).filter((l) => l.length > 0)
    if (nonEmpty.length === 0) return false
    const count = nonEmpty.filter(isXmlLikeLine).length
    const ratio = count / nonEmpty.length
    return ratio >= 0.6 || (nonEmpty.length > 1 && count >= 1)
  }

  function mergeXmlParagraphs(body: any[]): any[] {
    const out: any[] = []
    let buffer: string[] = []
    let inCode = false

    const flush = () => {
      if (buffer.length) {
        const code = buffer.join('\n')
        out.push({ _type: 'code', language: 'xml', code })
      }
      buffer = []
      inCode = false
    }

    for (const node of body ?? []) {
      if (node?._type === 'block' && (node.style === 'normal' || !node.style)) {
        const text = toPlainText(node)
        const isBlank = text.trim().length === 0
        const xmlish = isMostlyXml(text)

        if (inCode) {
          if (xmlish || isBlank) {
            // 連続コードの一部（空行も含めて保持）
            buffer.push(text)
            continue
          }
          // コードの連続が途切れたので出力
          flush()
          out.push(node)
          continue
        }

        if (xmlish) {
          inCode = true
          buffer.push(text)
          continue
        }

        out.push(node)
      } else {
        if (inCode) flush()
        out.push(node)
      }
    }

    if (inCode) flush()
    return out
  }
  
  // Portable Text custom renderers for Sanity blocks (e.g., code, image)
  const components: any = {
    block: {
      normal: ({ children, value }: { children: React.ReactNode; value: any }) => {
        if (seriesNumber && embeddedCaptions.has(value?._key)) return null
        const figure = seriesNumber ? editorialFigures.get(value?._key) : null
        if (figure) {
          const expand = locale === 'en' ? 'Open full-size diagram' : '図を大きく表示'
          return (
            <figure className={styles.figure}>
              <a href={figure.image.src} target="_blank" rel="noopener noreferrer" className={styles.figureLink} aria-label={`${expand}: ${figure.image.alt}`}>
                <Image src={figure.image.src} alt={figure.image.alt} width={figure.image.width} height={figure.image.height} sizes="(max-width: 800px) calc(100vw - 40px), 760px" />
                <span className={styles.zoomLabel}>{expand}</span>
              </a>
              {figure.caption && <figcaption>{figure.caption}</figcaption>}
            </figure>
          )
        }
        const raw = Array.isArray(value?.children)
          ? value.children.map((c: any) => (typeof c?.text === 'string' ? c.text : '')).join('')
          : (typeof children === 'string' ? (children as string) : '')

        const lines = raw.split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0)
        const xmlLine = (l: string) => (/^<\/?[\w:-]/.test(l) && /(\/?>)$/.test(l)) || /^<!--/.test(l) || /-->$/.test(l)
        const xmlLikeCount = lines.filter(xmlLine).length
        const ratio = lines.length ? xmlLikeCount / lines.length : 0

        const looksLikeXml = /<\/?[\w:-]+(?:\s+[\w:-]+=(?:"[^"]*"|'[^']*'|[^\s>]+))*\s*\/?>(?![^<]*>)/.test(raw)
        const isMultiline = lines.length > 1

        if ((looksLikeXml && isMultiline) || ratio >= 0.6 || (looksLikeXml && lines.length === 1)) {
          return <CodeBlock code={raw} language="xml" />
        }

        const editorialClass = seriesNumber && typeof value?._key === 'string'
          ? value._key.startsWith('editorial-caption-') ? styles.caption : value._key.startsWith('editorial-lead-') ? styles.lead : undefined
          : undefined
        return <p className={['whitespace-pre-wrap', editorialClass].filter(Boolean).join(' ')}>{children}</p>
      },
      ...(seriesNumber ? {
        h2: ({ children, value }: { children: React.ReactNode; value: any }) => <h2 id={headingId(value)}>{children}</h2>,
      } : {}),
    },
    types: {
      code: ({ value }: { value: { language?: string; code?: string } }) => (
        <CodeBlock code={value?.code} language={value?.language} />
      ),
      image: ({ value }: { value: SanityImageSource & { alt?: string } }) => {
        const src = value ? urlFor(value)?.width(1200).url() : null
        if (!src) return null
        if (seriesNumber) {
          const dimensions = imageDimensions((value as any)?.asset?._ref) || { width: 1200, height: 600 }
          return (
            <figure className={styles.figure}>
              <Image src={src} alt={localizedImageAlt((value as any)?.alt, locale, locale === 'en' ? 'Article illustration' : '本文の図')} {...dimensions} sizes="(max-width: 800px) calc(100vw - 40px), 760px" />
            </figure>
          )
        }
        return (
          <Image
            src={src}
            alt={typeof (value as any)?.alt === 'string' ? (value as any).alt : 'Image'}
            className="my-6 rounded-lg"
            width={1200}
            height={600}
          />
        )
      },
    },
    marks: {
      code: ({ children }: { children: React.ReactNode }) => {
        const text = React.Children.toArray(children)
          .map((c) => (typeof c === 'string' ? c : '\n'))
          .join('')
        return <InlineCode text={text} />
      },
    },
    ...(seriesNumber ? {
      listItem: {
        number: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
        bullet: ({ children, value }: { children: React.ReactNode; value: any }) => {
          const cells = comparisonCells(value)
          if (!cells) return <li>{children}</li>
          return (
            <li className={styles.comparisonRow}>
              <div className={styles.comparisonGrid}>
                {cells.map((spans, index) => (
                  <div key={`${value._key}-${index}`} className={styles.comparisonCell}>
                    <PortableText value={[{ ...value, listItem: undefined, children: spans }]} components={components} />
                  </div>
                ))}
              </div>
            </li>
          )
        },
      },
    } : {}),
  };
  
  if (!slug) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="container mx-auto max-w-3xl p-8 flex flex-col gap-4">
          <Link href="/blog" className="text-blue-600 hover:underline text-sm">
            ← {t('backToBlog')}
          </Link>
          <h1 className="text-4xl font-bold mb-8 text-gray-900">{t('invalidSlug')}</h1>
          <p className="text-gray-700">{t('invalidSlugDescription')}</p>
        </div>
      </main>
    );
  }
  
  const post = await getBlogPost(slug, locale);
  
  if (!post) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="container mx-auto max-w-3xl p-8 flex flex-col gap-4">
          <Link href="/blog" className="text-blue-600 hover:underline text-sm">
            ← {t('backToBlog')}
          </Link>
          <h1 className="text-4xl font-bold mb-8 text-gray-900">{t('postNotFound')}</h1>
          <p className="text-gray-700">{t('postNotFoundDescription')}</p>
        </div>
      </main>
    );
  }

  // 投稿画像のURLを生成
  const postImageUrl = post.image
    ? seriesNumber ? urlFor(post.image)?.width(1600).height(900).fit('crop').url() : urlFor(post.image)?.width(550).height(310).url()
    : null;

  // PortableText 本文を前処理（XML風段落の連結）
  const processedBody = Array.isArray(post.body) ? mergeXmlParagraphs(post.body) : []
  const date = post.publishedAt ? publicationDate(post.publishedAt, locale) : null

  if (seriesNumber) {
    processedBody.forEach((block, index) => {
      const image = editorialImage(block)
      if (!image) return
      const next = processedBody[index + 1]
      const hasCaption = next?._type === 'block' && next.style === 'normal' && next._key === image.captionKey
      editorialFigures.set(block._key, { image, ...(hasCaption ? { caption: blockText(next) } : {}) })
      if (hasCaption) embeddedCaptions.add(next._key)
    })
    const headings = articleHeadings(processedBody)
    const minutes = readingMinutes(processedBody, locale)
    return (
      <main className={styles.page}>
        <article className={styles.article} lang={locale}>
          <Link href="/blog" className={styles.backLink}>{t('backToBlog')}</Link>
          <header className={styles.header}>
            <p className={styles.seriesLabel}>
              {locale === 'en' ? 'Automating SME work and infrastructure with ADK' : 'ADKで進める中小企業の業務・インフラ自動化'}
              <span>{locale === 'en' ? `Part ${seriesNumber} of 11` : `第${seriesNumber}回 / 全11回`}</span>
            </p>
            <h1 className={styles.title}>{post.title}</h1>
            {post.description && <p className={styles.description}>{post.description}</p>}
            <dl className={styles.metadata}>
              {date && <div><dt>{t('published')}</dt><dd><time dateTime={post.publishedAt}>{date}</time></dd></div>}
              {post.author?.name && <div><dt>{locale === 'en' ? 'Author' : '著者'}</dt><dd>{post.author.name}</dd></div>}
              <div><dt>{locale === 'en' ? 'Reading time' : '読む時間の目安'}</dt><dd>{locale === 'en' ? `About ${minutes} minutes` : `約${minutes}分`}</dd></div>
            </dl>
          </header>
          {postImageUrl && (
            <figure className={styles.hero}>
              <Image src={postImageUrl} alt={localizedImageAlt(post.image?.alt, locale, post.title)} width={1600} height={900} sizes="(max-width: 1100px) calc(100vw - 40px), 1052px" />
            </figure>
          )}
          <div className={styles.reading}>
            {headings.length > 0 && (
              <details className={styles.contents}>
                <summary>{locale === 'en' ? 'In this article' : 'この記事の内容'}</summary>
                <nav aria-label={locale === 'en' ? 'Table of contents' : '目次'}>
                  <ul>{headings.map(heading => <li key={heading.id}><a href={`#${encodeURIComponent(heading.id)}`}>{heading.text}</a></li>)}</ul>
                </nav>
              </details>
            )}
            <div className={styles.body}>
              <PortableText value={processedBody} components={components} />
            </div>
          </div>
        </article>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto max-w-3xl p-8 flex flex-col gap-4">
        <Link href="/blog" className="text-blue-600 hover:underline text-sm">
          ← {t('backToBlog')}
        </Link>
        {postImageUrl && (
          <Image
            src={postImageUrl}
            alt={post.title || 'Post image'}
            className="aspect-video rounded-xl"
            width={550}
            height={310}
          />
        )}
        <h1 className="text-4xl font-bold mb-8 text-gray-900">{post.title}</h1>
        <div className="typography">
          {date && (
            <p className="text-gray-600 mb-4 text-sm w-full text-right">
              <span className="font-bold">{t('published')}:</span> {date}
            </p>
          )}
          {Array.isArray(processedBody) && (
            <PortableText value={processedBody} components={components} />
          )}
        </div>
      </div>
    </main>
  );
}
