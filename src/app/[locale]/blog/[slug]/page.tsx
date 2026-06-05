import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getTranslations } from 'next-intl/server'
import { client, getBlogPost } from '@/lib/sanity'
import { Link } from '@/i18n/routing'
import CodeBlock from '@/components/CodeBlock'
import InlineCode from '@/components/InlineCode'
import React from 'react'
import { format } from 'date-fns'
import { Metadata } from 'next'
import Image from 'next/image'

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return {
    title: `${post?.title} | KONDAX`,
    description:
      post?.description.slice(0, 120) + '...' || t('og_fallback_description'),
    alternates: {
      canonical: 'https://kondax.com/' + locale + '/blog/' + post?.slug,
    },
    openGraph: {
      title: `${post?.title} | KONDAX`,
      description:
        post?.description.slice(0, 120) + '...' || t('og_fallback_description'),
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}/blog/${post?.slug}`,
      images: [
        {
          url: `${baseUrl}/apple-touch-icon.png`, // OGP画像への絶対パス
          width: 180,
          height: 180,
          alt: `${post?.title} | KONDAX`,
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

        return <p className="whitespace-pre-wrap">{children}</p>
      },
    },
    types: {
      code: ({ value }: { value: { language?: string; code?: string } }) => (
        <CodeBlock code={value?.code} language={value?.language} />
      ),
      image: ({ value }: { value: SanityImageSource & { alt?: string } }) => {
        const src = value ? urlFor(value)?.width(1200).url() : null
        if (!src) return null
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
    ? urlFor(post.image)?.width(550).height(310).url()
    : null;

  // PortableText 本文を前処理（XML風段落の連結）
  const processedBody = Array.isArray(post.body) ? mergeXmlParagraphs(post.body) : []

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
          {post.publishedAt && (
            <p className="text-gray-600 mb-4 text-sm w-full text-right">
              <span className="font-bold">{t('published')}:</span> {format(new Date(post.publishedAt), 'yyyy年MM月dd日')}
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
