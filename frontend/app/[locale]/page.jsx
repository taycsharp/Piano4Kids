import Link from 'next/link'
import MarketingLayout, { CTA } from '../components/MarketingLayout'
import { getPublicSite } from '../lib/publicContent'
import { getDictionary, localizedPath, normalizeLocale } from '../i18n'

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale)
  return {
    title: locale === 'vi' ? 'Piano Academy AI | Học piano cho trẻ em và phản hồi phụ huynh' : 'Piano Academy AI | Piano Lessons for Kids with Parent Feedback',
    description: locale === 'vi'
      ? 'Nền tảng học viện piano cho trẻ em với phản hồi giáo viên, phụ huynh, tiến bộ học viên và lời khuyên AI.'
      : 'A modern piano academy platform for children, teacher feedback, parent communication, student progress, and AI-assisted practice advice.',
  }
}

export default async function HomePage({ params }) {
  const locale = normalizeLocale(params.locale)
  const t = getDictionary(locale)
  const { hero, courses, posts, teachers, testimonials } = await getPublicSite(locale)
  const heroImage = hero?.image_url || courses.find((item) => item.image_url)?.image_url || teachers.find((item) => item.image_url)?.image_url || testimonials.find((item) => item.image_url)?.image_url
  const heroPrimaryHref = localizedPath(locale, hero?.primary_button_href || '/courses')
  const heroSecondaryHref = localizedPath(locale, hero?.secondary_button_href || '/dashboard')
  return (
    <MarketingLayout locale={locale}>
      <section className="homeHero">
        <div className="heroCopy">
          <p className="eyebrow">{hero?.eyebrow || t.home.eyebrow}</p>
          <h1>{hero?.title || t.home.title}</h1>
          <p className="heroSubtitle">{hero?.subtitle || t.home.subtitle}</p>
          <div className="heroActions">
            <Link href={heroPrimaryHref} className="primaryCta">{hero?.primary_button_text || t.home.exploreCourses}</Link>
            <Link href={heroSecondaryHref} className="secondaryCta">{hero?.secondary_button_text || t.home.loginDashboard}</Link>
          </div>
          <div className="trustRow">
            <span>{t.home.trust1}</span>
            <span>{t.home.trust2}</span>
            <span>{t.home.trust3}</span>
          </div>
        </div>
        <div className={`heroVisual ${heroImage ? 'withImage' : ''}`} aria-label="Piano education preview">
          {heroImage && <img className="heroPhoto" src={heroImage} alt={hero?.image_alt || 'Piano academy lesson'} />}
          <div className="heroOverlay" />
          <div className="scoreCard large">
            <span className="scoreIcon">🎹</span>
            <h3>{hero?.card_title || t.home.heroCardTitle}</h3>
            <p>{hero?.card_text || t.home.heroCardText}</p>
          </div>
          <div className="floatingNote noteOne">♪</div>
          <div className="floatingNote noteTwo">♬</div>
          <div className="miniCards">
            <div><strong>{hero?.stat_1_value || '10 min'}</strong><span>{hero?.stat_1_label || t.home.dailyPractice}</span></div>
            <div><strong>{hero?.stat_2_value || '1x'}</strong><span>{hero?.stat_2_label || t.home.aiAdviceSaved}</span></div>
            <div><strong>{hero?.stat_3_value || '100%'}</strong><span>{hero?.stat_3_label || t.home.teacherApproved}</span></div>
          </div>
        </div>
      </section>

      <section className="sectionBand">
        <p className="eyebrow">{t.home.why}</p>
        <h2>{t.home.fullCircle}</h2>
        <div className="featureGrid">
          {t.home.features.map(([title, text], idx) => (
            <article key={title}><span>{String(idx + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="splitSection">
        <div>
          <p className="eyebrow">{t.nav.courses}</p>
          <h2>{t.home.coursesTitle}</h2>
          <p>{t.home.coursesText}</p>
          <Link href={localizedPath(locale, '/courses')} className="textLink">{t.home.viewCourses}</Link>
        </div>
        <div className="cardGrid twoCols">
          {courses.slice(0, 2).map((course) => (
            <article className="marketingCard" key={course.title}>
              {course.image_url && <img className="cardImage" src={course.image_url} alt={course.image_alt || course.title} />}
              <span className="pill">{course.age}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionBand light">
        <p className="eyebrow">{t.nav.teachers}</p>
        <h2>{t.home.teachersTitle}</h2>
        <div className="teacherGrid">
          {teachers.map((teacher) => (
            <article className="teacherCard" key={teacher.name}>
              {teacher.image_url ? <img className="teacherPhoto" src={teacher.image_url} alt={teacher.image_alt || teacher.name} /> : <div className="teacherAvatar">{teacher.initials}</div>}
              <h3>{teacher.name}</h3>
              <strong>{teacher.role}</strong>
              <p>{teacher.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="splitSection reverse">
        <div className="testimonialStack">
          {testimonials.slice(0, 2).map((item) => (
            <article className="quoteCard" key={item.student}>
              {item.image_url && <img className="quoteImage" src={item.image_url} alt={item.image_alt || item.student} />}
              <p>“{item.parent}”</p>
              <strong>{item.student}</strong>
              <span>{item.result}</span>
            </article>
          ))}
        </div>
        <div>
          <p className="eyebrow">{t.nav.results}</p>
          <h2>{t.home.resultsTitle}</h2>
          <p>{t.home.resultsText}</p>
          <Link href={localizedPath(locale, '/results')} className="textLink">{t.home.readResults}</Link>
        </div>
      </section>

      <section className="sectionBand">
        <p className="eyebrow">{t.nav.blog}</p>
        <h2>{t.home.blogTitle}</h2>
        <div className="blogGrid">
          {posts.map((post) => (
            <article className="blogCard" key={post.slug}>
              {post.image_url && <img className="cardImage" src={post.image_url} alt={post.image_alt || post.title} />}
              <span>{post.date} · {post.readTime}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <Link href={localizedPath(locale, `/blog/${post.slug}`)}>{t.home.readArticle}</Link>
            </article>
          ))}
        </div>
      </section>

      <CTA locale={locale} />
    </MarketingLayout>
  )
}
