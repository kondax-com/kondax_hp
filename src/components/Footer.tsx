import { useLocale, useTranslations } from 'next-intl'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Logo } from '@/components/Logo'
import styles from '@/components/SiteChrome.module.css'

export function Footer() {
  const locale = useLocale()
  const t = useTranslations('Navigation')
  const ja = locale === 'ja'
  const groups = [
    {
      title: ja ? 'サービス・プロダクト' : 'Services & products',
      links: [
        { href: '/#services', label: ja ? 'できること' : 'Services' },
        { href: '/work/yadora', label: 'Yadora' },
        { href: '/work/bocker', label: 'Bocker' },
        { href: '/work/gallery', label: t('gallery') },
      ],
    },
    {
      title: ja ? 'KONDAXについて' : 'About KONDAX',
      links: [
        { href: '/about', label: t('about') },
        { href: '/process', label: t('process') },
        { href: '/blog', label: t('blog') },
        { href: '/news', label: t('news') },
      ],
    },
  ]
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" aria-label={ja ? 'KONDAX ホーム' : 'KONDAX home'}>
              <Logo className="h-8" fillOnHover invert />
            </Link>
            <p>
              {ja
                ? '現場の困りごとから、\n使い続けられる仕組みを。'
                : 'Connected workflows.\nBuilt around your people.'}
            </p>
            <Link href="/contact" className={styles.footerContact}>
              {ja ? '業務・開発の相談をする' : 'Discuss your project'}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <nav
            className={styles.footerNav}
            aria-label={ja ? 'フッターナビゲーション' : 'Footer navigation'}
          >
            {groups.map((group) => (
              <div key={group.title}>
                <h2>{group.title}</h2>
                <ul>
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} KONDAX</p>
          <p>
            {ja
              ? '兵庫県丹波篠山市から、全国の現場へ。'
              : 'Based in Hyogo, Japan. Building for your business.'}
          </p>
          <Link href="/contact">
            {t('contact')}
            <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
