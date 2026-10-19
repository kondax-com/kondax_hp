import { type Metadata } from 'next'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import { Border } from '@/components/Border'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { Link } from '@/i18n/routing'
import { getNews, getNewsTotal } from '@/lib/sanity'
import { listingUrl, normalizePage, SITE_URL } from '@/lib/seo'

type Props = {
  params: Promise<{locale: string}>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params
  const { page } = await searchParams
  const canonical = listingUrl(locale, 'news', normalizePage(page))
  const t = await getTranslations({ locale, namespace: 'NewsPage' })
  
  return {
    title: t('og_title'),
    description: t('og_description'),
    alternates: {
      canonical,
    },
    openGraph: {
      title: t('og_title'),
      description: t('og_description'),
      type: 'website',
      locale: locale,
      url: canonical,
      images: [
        {
          url: `${SITE_URL}/apple-touch-icon.png`,
          width: 180,
          height: 180,
          alt: t('og_title'),
        },
      ],
    },
  }
}

export default async function News({ params, searchParams }: Props) {
  const { locale } = await params
  const { page = '1' } = await searchParams
  const t = await getTranslations({ locale, namespace: 'NewsPage' })
  const tPagination = await getTranslations({ locale, namespace: 'Pagination' })
  
  const currentPage = normalizePage(page)
  const limit = 5
  
  const [posts, totalPosts] = await Promise.all([
    getNews(locale, currentPage, limit),
    getNewsTotal()
  ])

  const totalPages = Math.ceil(totalPosts / limit)
  const hasPrevPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

  return (
    <>
      <PageIntro eyebrow={t('eyebrow')} title={t('pageTitle')}>
        <p className="text-sm md:text-base">{t('pageDescription')}</p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <div className="space-y-24 lg:space-y-32">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <FadeIn key={post._id}>
                <article>
                  <Border className="pt-16">
                    <div className="relative lg:-mx-4 lg:flex lg:justify-end">
                      <div className="pt-10 lg:w-2/3 lg:flex-none lg:px-4 lg:pt-0">
                        <h2 className="font-display text-2xl font-semibold text-neutral-950">
                          <Link href={`/news/${post.slug.current}`}>
                            {post.title}
                          </Link>
                        </h2>
                        <dl className="lg:absolute lg:top-0 lg:left-0 lg:w-1/3 lg:px-4">
                          <dt className="sr-only">Published</dt>
                          <dd className="absolute top-0 left-0 text-sm text-neutral-950 lg:static">
                            <time dateTime={post.publishedAt?.toString()}>
                              {format(
                                new Date(post.publishedAt ?? 0),
                                'yyyy/MM/dd',
                              )}
                            </time>
                          </dd>
                          <dt className="sr-only">Author</dt>
                          <dd className="mt-6 flex gap-x-4">
                            <div className="text-sm text-neutral-950">
                              <div className="font-semibold">
                                {post.author?.name}
                              </div>
                              <div>{post.author?.role}</div>
                            </div>
                          </dd>
                        </dl>
                        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-neutral-600">
                          {post.description}
                        </p>
                        <Button
                          href={`/news/${post.slug.current}`}
                          aria-label={`${t('readMore')}: ${post.title}`}
                          className="mt-8"
                        >
                          {t('readMore')}
                        </Button>
                      </div>
                    </div>
                  </Border>
                </article>
              </FadeIn>
            ))
          ) : (
            <p>{t('noPosts')}</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-24 flex items-center justify-center gap-4">
            {hasPrevPage && (
              <Link
                href={`?page=${currentPage - 1}`}
                className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                ← {tPagination('previous')}
              </Link>
            )}

            <span className="text-sm text-neutral-600">
              {tPagination('page')} {currentPage} {tPagination('of')}{' '}
              {totalPages}
            </span>

            {hasNextPage && (
              <Link
                href={`?page=${currentPage + 1}`}
                className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {tPagination('next')} →
              </Link>
            )}
          </div>
        )}
      </Container>

      <ContactSection />
    </>
  )
}
