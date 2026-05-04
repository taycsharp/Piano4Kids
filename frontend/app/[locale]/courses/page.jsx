import MarketingLayout, { CTA, PageHero } from '../../components/MarketingLayout'
import { getPublicSite } from '../../lib/publicContent'
import { getDictionary, normalizeLocale } from '../../i18n'

export async function generateMetadata({ params }) {
  const locale = normalizeLocale(params.locale)
  return { title: locale === 'vi' ? 'Khóa học Piano cho trẻ em | Piano Academy AI' : 'Piano Courses for Kids | Piano Academy AI' }
}

export default async function CoursesPage({ params }) {
  const locale = normalizeLocale(params.locale)
  const t = getDictionary(locale)
  const { courses } = await getPublicSite(locale)
  return (
    <MarketingLayout locale={locale}>
      <PageHero {...t.pages.courses} />
      <section className="courseList">
        {courses.map((course, index) => (
          <article className="courseRow" key={course.title}>
            <div className="courseNumber">{String(index + 1).padStart(2, '0')}</div>
            <div>
              {course.image_url && <img className="rowImage" src={course.image_url} alt={course.image_alt || course.title} />}
              <span className="pill">{course.age} · {course.level}</span>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <div className="outcomeList">
                {course.outcomes.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
          </article>
        ))}
      </section>
      <CTA locale={locale} />
    </MarketingLayout>
  )
}
