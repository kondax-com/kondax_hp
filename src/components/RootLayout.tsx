'use client'

import { Suspense, useEffect, useId, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, usePathname } from '@/i18n/routing'
import { Footer } from '@/components/Footer'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { Logo, Logomark } from '@/components/Logo'
import styles from '@/components/SiteChrome.module.css'

export function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('Navigation')
  const dialog = useRef<HTMLDialogElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const panelId = useId()
  const ja = locale === 'ja'
  const closeMenu = () => dialog.current?.close()
  const links = [
    { href: '/#services', label: ja ? 'できること' : 'Services' },
    { href: '/work', label: ja ? '開発プロダクト' : 'Our work' },
    { href: '/about', label: t('about') },
  ]
  const extraLinks = [
    { href: '/process', label: t('process') },
    { href: '/work/gallery', label: t('gallery') },
    { href: '/blog', label: t('blog') },
    { href: '/news', label: t('news') },
  ]

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  return (
    <div className={styles.shell}>
      <Suspense fallback={null}>
        <GoogleAnalytics />
      </Suspense>
      <a href="#main-content" className={styles.skipLink}>
        {ja ? '本文へスキップ' : 'Skip to content'}
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="/"
            aria-label={ja ? 'KONDAX ホーム' : 'KONDAX home'}
            className={styles.brand}
          >
            <Logomark className="h-8 sm:hidden" fillOnHover />
            <Logo className="hidden h-8 sm:block" fillOnHover />
          </Link>
          <nav
            className={styles.desktopNav}
            aria-label={ja ? 'メインナビゲーション' : 'Main navigation'}
          >
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <Link
              href={pathname}
              locale={ja ? 'en' : 'ja'}
              hrefLang={ja ? 'en' : 'ja'}
              className={styles.language}
              aria-label={ja ? 'Switch to English' : '日本語に切り替える'}
            >
              {ja ? 'EN' : 'JP'}
            </Link>
            <Link href="/contact" className={styles.headerContact}>
              {ja ? '相談する' : 'Let’s talk'}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className={styles.menuToggle}
              aria-label={ja ? 'メニューを開く' : 'Open menu'}
              aria-controls={panelId}
              aria-expanded={menuOpen}
              onClick={() => {
                dialog.current?.showModal()
                setMenuOpen(true)
              }}
            >
              <Menu size={23} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <dialog
        ref={dialog}
        id={panelId}
        className={styles.menu}
        aria-label={ja ? 'サイトメニュー' : 'Site menu'}
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) closeMenu()
        }}
      >
        <div className={styles.menuTop}>
          <Logomark className="h-8 sm:hidden" fillOnHover />
          <Logo className="hidden h-8 sm:block" fillOnHover />
          <button
            type="button"
            onClick={closeMenu}
            className={styles.menuClose}
            aria-label={ja ? 'メニューを閉じる' : 'Close menu'}
          >
            <X size={25} aria-hidden="true" />
          </button>
        </div>
        <nav
          aria-label={ja ? 'モバイルナビゲーション' : 'Mobile navigation'}
          className={styles.menuLinks}
        >
          {[
            { href: '/', label: t('home') },
            ...links,
            ...extraLinks,
            { href: '/contact', label: t('contact') },
          ].map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <Link
          href={pathname}
          locale={ja ? 'en' : 'ja'}
          className={styles.menuLanguage}
          onClick={closeMenu}
        >
          {ja ? 'English' : '日本語'}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </dialog>
      <main id="main-content" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
