import Link from 'next/link'
import MarketingLayout, { PageHero } from '../../components/MarketingLayout'
import { getPublicSite } from '../../lib/publicContent'
import { getDictionary, localizedPath, normalizeLocale } from '../../i18n'

export default async function BlogPage({ params }) {
  const locale = normalizeLocale(params.locale)
  const t = getDictionary(locale)
  const { posts } = await getPublicSite(locale)
  return (
    <MarketingLayout locale={locale}>
      <PageHero {...t.pages.blog} />
      <section className="blogList">
        {posts.map((post) => (
          <article className="blogListItem" key={post.slug}>
            {post.image_url && <img className="rowImage" src={post.image_url} alt={post.image_alt || post.title} />}
            <span>{post.date} · {post.readTime}</span>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <Link href={localizedPath(locale, `/blog/${post.slug}`)} className="textLink">{t.home.readArticle}</Link>
          </article>
        ))}
      </section>
    </MarketingLayout>
  )
}
