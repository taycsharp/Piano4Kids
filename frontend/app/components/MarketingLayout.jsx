import Link from 'next/link'
import { site } from '../marketingData'
import { getDictionary, languageNames, locales, localizedPath, normalizeLocale } from '../i18n'

export function LanguageSwitcher({ locale }) {
  const activeLocale = normalizeLocale(locale)
  return (
    <div className="languageSwitcher" aria-label="Language switcher">
      {locales.map((item) => (
        <Link key={item} href={`/${item}`} className={item === activeLocale ? 'active' : ''}>
          {languageNames[item]}
        </Link>
      ))}
    </div>
  )
}

export function MarketingNav({ locale = 'en' }) {
  const l = normalizeLocale(locale)
  const t = getDictionary(l)
  return (
    <header className="marketingNav">
      <Link href={`/${l}`} className="brandLink" aria-label="Piano Academy AI home">
        <span className="brandMark">♪</span>
        <span>{site.name}</span>
      </Link>
      <nav className="navLinks" aria-label="Public website navigation">
        <Link href={localizedPath(l, '/courses')}>{t.nav.courses}</Link>
        <Link href={localizedPath(l, '/teachers')}>{t.nav.teachers}</Link>
        <Link href={localizedPath(l, '/results')}>{t.nav.results}</Link>
        <Link href={localizedPath(l, '/blog')}>{t.nav.blog}</Link>
        <LanguageSwitcher locale={l} />
        <Link href={localizedPath(l, '/dashboard')} className="loginBtn">{t.nav.login}</Link>
      </nav>
    </header>
  )
}

export function MarketingFooter({ locale = 'en' }) {
  const l = normalizeLocale(locale)
  const t = getDictionary(l)
  return (
    <footer className="marketingFooter">
      <div>
        <h3>{site.name}</h3>
        <p>{site.tagline}</p>
      </div>
      <div className="footerGrid">
        <div>
          <strong>{t.footer.programs}</strong>
          <Link href={localizedPath(l, '/courses')}>{t.nav.courses}</Link>
          <Link href={localizedPath(l, '/teachers')}>{t.nav.teachers}</Link>
        </div>
        <div>
          <strong>{t.footer.resources}</strong>
          <Link href={localizedPath(l, '/results')}>{t.footer.studentResults}</Link>
          <Link href={localizedPath(l, '/blog')}>{t.footer.learningArticles}</Link>
        </div>
        <div>
          <strong>{t.footer.contact}</strong>
          <span>{site.email}</span>
          <span>{site.phone}</span>
        </div>
      </div>
    </footer>
  )
}

export default function MarketingLayout({ children, locale = 'en' }) {
  return (
    <div className="marketingShell">
      <MarketingNav locale={locale} />
      <main>{children}</main>
      <MarketingFooter locale={locale} />
    </div>
  )
}

export function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section className="pageHero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="heroSubtitle">{subtitle}</p>
      {children}
    </section>
  )
}

export function CTA({ locale = 'en' }) {
  const l = normalizeLocale(locale)
  const t = getDictionary(l)
  return (
    <section className="ctaPanel">
      <div>
        <p className="eyebrow">{t.cta.eyebrow}</p>
        <h2>{t.cta.title}</h2>
        <p>{t.cta.text}</p>
      </div>
      <Link href={localizedPath(l, '/dashboard')} className="primaryCta">{t.cta.button}</Link>
    </section>
  )
}
