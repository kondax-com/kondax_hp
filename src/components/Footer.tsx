import { Link } from '@/i18n/routing'

import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Logo } from '@/components/Logo'
import { useTranslations } from 'next-intl'
import { socialMediaProfiles } from '@/components/SocialMedia'

const navigation = [
  {
    title: 'Services',
    links: [
      { title: 'Yadora', href: '/work/yadora' },
      { title: 'Gallery', href: '/work/gallery' },
      {
        title: (
          <>
            See all <span aria-hidden="true">&rarr;</span>
          </>
        ),
        href: '/work',
      },
    ],
  },
  {
    title: 'Company',
    links: [
      { title: 'About', href: '/about' },
      { title: 'Process', href: '/process' },
      { title: 'Blog', href: '/blog' },
      { title: 'News', href: '/news' },
      { title: 'Contact us', href: '/contact' },
    ],
  },
  {
    title: 'Connect',
    links: socialMediaProfiles,
  },
]

function Navigation() {
  return (
    <nav>
      <ul role="list" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {navigation.map((section, sectionIndex) => (
          <li key={sectionIndex}>
            <div className="font-display text-sm font-semibold tracking-wider text-neutral-950">
              {section.title}
            </div>
            <ul role="list" className="mt-4 text-sm text-neutral-700">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex} className="mt-4">
                  <Link
                    href={link.href}
                    className="transition hover:text-neutral-950"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FooterContent() {
  const t = useTranslations('Footer')
  return (
    <div className="max-w-sm">
      <Logo className="h-8" fillOnHover />
      <div className="mt-4 text-xs leading-relaxed text-neutral-700 md:text-sm">
        {t('messages')}
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <Container as="footer" className="mt-24 w-full sm:mt-32 lg:mt-40">
      <FadeIn>
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          <Navigation />
          <div className="flex w-full lg:justify-end">
            <FooterContent />
          </div>
        </div>
        <div className="mt-12 mb-10 flex flex-wrap items-end justify-end gap-x-6 gap-y-4 border-t border-neutral-950/10 pt-12">
          <p className="text-xs text-neutral-700">
            © KONDAX {new Date().getFullYear()}
          </p>
        </div>
      </FadeIn>
    </Container>
  )
}
