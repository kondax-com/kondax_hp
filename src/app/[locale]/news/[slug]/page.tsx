import { PortableText } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getTranslations } from 'next-intl/server'
import { client, getNewsItem } from '@/lib/sanity'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { articleUrl, SITE_URL } from '@/lib/seo'
import { imageBuilderFor } from '@/lib/sanity-image'

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  imageBuilderFor(source, { projectId, dataset });

interface NewsPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  if (!slug) notFound()
  const [news, t] = await Promise.all([
    getNewsItem(slug, locale),
    getTranslations({ locale, namespace: 'NewsPage' }),
  ])
  if (!news) notFound()
  const title = `${news.title || t('og_title')} | KONDAX`
  const description = news.description ? news.description.slice(0, 160) : t('og_description')
  const image = news.image ? urlFor(news.image)?.width(1200).height(630).fit('crop').url() : null
  const canonical = articleUrl(locale, 'news', slug)
  
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: locale,
      url: canonical,
      images: [
        {
          url: image || `${SITE_URL}/apple-touch-icon.png`,
          width: image ? 1200 : 180,
          height: image ? 630 : 180,
          alt: news.title || t('og_title'),
        },
      ],
    },
  }
}

export default async function NewsPage({
  params,
}: NewsPageProps) {
  const { slug, locale } = await params;
  if (!slug) notFound()
  const [news, t] = await Promise.all([
    getNewsItem(slug, locale),
    getTranslations({ locale, namespace: 'NewsPage' }),
  ])
  if (!news) notFound()

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto max-w-3xl p-8 flex flex-col gap-4">
        <Link href="/news" className="text-blue-600 hover:underline text-sm">
          ← {t('backToNews')}
        </Link>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">{news.title}</h1>
        <div className="prose prose-gray max-w-none">
          {news.publishedAt && (
            <p className="text-gray-600 mb-4 text-sm w-full text-right">
              <span className="font-bold">{t('published')}:</span> {format(new Date(news.publishedAt), 'yyyy年MM月dd日')}
            </p>
          )}
          {Array.isArray(news.body) && <PortableText value={news.body} />}
        </div>
      </div>
    </main>
  );
}
