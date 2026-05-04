import Link from 'next/link'
import { notFound } from 'next/navigation'
import MarketingLayout from '../../../components/MarketingLayout'
import { getPublicPost } from '../../../lib/publicContent'
import { getDictionary, localizedPath, normalizeLocale } from '../../../i18n'

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale)
  const post = await getPublicPost(params.slug, locale)
  if (!post) return { title: 'Blog article | Piano Academy AI' }
  return { title: `${post.title} | Piano Academy AI`, description: post.excerpt }
}

export default async function ArticlePage({ params }) {
  const locale = normalizeLocale(params.locale)
  const t = getDictionary(locale)
  const post = await getPublicPost(params.slug, locale)
  if (!post) notFound()
  return (
    <MarketingLayout locale={locale}>
      <article className="articlePage">
        <Link href={localizedPath(locale, '/blog')} className="textLink">{t.article.back}</Link>
        <p className="eyebrow">{post.date} · {post.readTime}</p>
        <h1>{post.title}</h1>
        {post.image_url && <img className="articleImage" src={post.image_url} alt={post.image_alt || post.title} />}
        <p className="articleLead">{post.excerpt}</p>
        {post.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <div className="articleTip">
          <strong>{t.article.tipTitle}</strong> {t.article.tipText}
        </div>
      </article>
    </MarketingLayout>
  )
}
