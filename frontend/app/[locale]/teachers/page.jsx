import MarketingLayout, { CTA, PageHero } from '../../components/MarketingLayout'
import { getPublicSite } from '../../lib/publicContent'
import { getDictionary, normalizeLocale } from '../../i18n'

export default async function TeachersPage({ params }) {
  const locale = normalizeLocale(params.locale)
  const t = getDictionary(locale)
  const { teachers } = await getPublicSite(locale)
  return (
    <MarketingLayout locale={locale}>
      <PageHero {...t.pages.teachers} />
      <section className="teacherGrid wide">
        {teachers.map((teacher) => (
          <article className="teacherCard detail" key={teacher.name}>
            {teacher.image_url ? <img className="teacherPhoto bigPhoto" src={teacher.image_url} alt={teacher.image_alt || teacher.name} /> : <div className="teacherAvatar big">{teacher.initials}</div>}
            <h2>{teacher.name}</h2>
            <strong>{teacher.role}</strong>
            <p>{teacher.bio}</p>
            <ul>
              <li>{locale === 'vi' ? 'Phản hồi buổi học có cấu trúc' : 'Structured lesson feedback'}</li>
              <li>{locale === 'vi' ? 'Mục tiêu luyện tập hằng tuần rõ ràng' : 'Clear weekly practice focus'}</li>
              <li>{locale === 'vi' ? 'Giao tiếp dễ hiểu cho phụ huynh' : 'Parent-friendly communication'}</li>
            </ul>
          </article>
        ))}
      </section>
      <CTA locale={locale} />
    </MarketingLayout>
  )
}
