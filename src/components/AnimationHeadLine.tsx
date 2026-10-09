import { getTranslations } from 'next-intl/server'

export async function AnimationHeadLine() {
  const t = await getTranslations('AnimationHeadLine')
  const lines = [t('lines.0'), t('lines.1')]

  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-10 font-display text-5xl font-bold tracking-tight text-neutral-950 md:text-6xl lg:text-7xl">
          {lines.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <div className="inline-block">
                {line}
                {i === 1 && (
                  <span className="mt-2 block h-1 bg-gradient-to-r from-indigo-700 to-purple-500" />
                )}
              </div>
            </div>
          ))}
        </h1>
        <div className="max-w-3xl leading-relaxed text-neutral-600">
          <p className="mb-4">
            {t.rich('subtitle.p1', {
              strong: (chunks) => (
                <strong className="font-semibold text-neutral-900">
                  {chunks}
                </strong>
              ),
            })}
          </p>
          <p>{t('subtitle.p2')}</p>
        </div>
      </div>
    </div>
  )
}
