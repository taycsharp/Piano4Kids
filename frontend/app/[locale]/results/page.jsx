import MarketingLayout, { CTA, PageHero } from '../../components/MarketingLayout'
import { getPublicSite } from '../../lib/publicContent'
import { getDictionary, normalizeLocale } from '../../i18n'

export default async function ResultsPage({ params }) {
  const locale = normalizeLocale(params.locale)
  const t = getDictionary(locale)
  const { testimonials } = await getPublicSite(locale)
  const measures = locale === 'vi'
    ? [['Nhịp', 'Giữ nhịp ổn định', 'Học viên học cách chơi chậm và đều với hỗ trợ về nhịp.'], ['Kỹ thuật', 'Bàn tay thả lỏng', 'Giáo viên theo dõi tư thế, ngón tay, dáng tay và kiểm soát lực.'], ['Tự tin', 'Luyện tập tích cực', 'Phụ huynh khuyến khích thay vì tạo áp lực.'], ['Liên tục', 'Ghi nhận hằng tuần', 'Phản hồi đã lưu giúp nhìn thấy tiến bộ theo thời gian.']]
    : [['Rhythm', 'Steady timing', 'Students learn to play slowly and consistently with rhythm support.'], ['Technique', 'Relaxed hands', 'Teachers monitor posture, fingering, hand shape, and control.'], ['Confidence', 'Positive practice', 'Parent guidance supports encouragement rather than pressure.'], ['Continuity', 'Weekly records', 'Saved feedback makes progress visible over time.']]
  return (
    <MarketingLayout locale={locale}>
      <PageHero {...t.pages.results} />
      <section className="resultsGrid">
        {testimonials.map((item) => (
          <article className="resultCard" key={item.student}>
            {item.image_url && <img className="cardImage" src={item.image_url} alt={item.image_alt || item.student} />}
            <h2>{item.student}</h2>
            <p className="resultText">{item.result}</p>
            <blockquote>“{item.parent}”</blockquote>
          </article>
        ))}
      </section>
      <section className="sectionBand light">
        <p className="eyebrow">{locale === 'vi' ? 'Chúng tôi theo dõi gì' : 'What we measure'}</p>
        <h2>{locale === 'vi' ? 'Tiến bộ không chỉ là chơi nhanh hơn.' : 'Progress is not only about playing faster.'}</h2>
        <div className="featureGrid">
          {measures.map(([k, h, p]) => <article key={k}><span>{k}</span><h3>{h}</h3><p>{p}</p></article>)}
        </div>
      </section>
      <CTA locale={locale} />
    </MarketingLayout>
  )
}
