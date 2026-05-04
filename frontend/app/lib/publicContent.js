import { courses as fallbackCourses, posts as fallbackPosts, teachers as fallbackTeachers, testimonials as fallbackTestimonials } from '../marketingData'

const INTERNAL_API_URL = process.env.NEXT_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function normalizeImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${PUBLIC_API_URL}${url}`
  return url
}

function normalizeHero(item) {
  if (!item) return null
  return {
    ...item,
    image_url: normalizeImageUrl(item.image_url),
  }
}

function normalizeCourse(item) {
  return {
    ...item,
    image_url: normalizeImageUrl(item.image_url),
    outcomes: typeof item.outcomes === 'string'
      ? item.outcomes.split('\n').map((x) => x.trim()).filter(Boolean)
      : (item.outcomes || []),
  }
}

function normalizePost(item) {
  return {
    ...item,
    image_url: normalizeImageUrl(item.image_url),
    readTime: item.read_time || item.readTime || '5 min read',
    date: item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : (item.date || ''),
    content: typeof item.content === 'string'
      ? item.content.split('\n\n').map((x) => x.trim()).filter(Boolean)
      : (item.content || []),
  }
}

function normalizeTestimonial(item) {
  return {
    ...item,
    image_url: normalizeImageUrl(item.image_url),
    parent: item.parent_quote || item.parent || '',
  }
}

export async function getPublicSite(locale = 'en') {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/public/site?locale=${locale}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Public CMS fetch failed: ${res.status}`)
    const data = await res.json()
    return {
      hero: normalizeHero(data.hero),
      courses: (data.courses || []).map(normalizeCourse),
      teachers: (data.teachers || []).map((item) => ({ ...item, image_url: normalizeImageUrl(item.image_url) })),
      testimonials: (data.testimonials || []).map(normalizeTestimonial),
      posts: (data.posts || []).map(normalizePost),
    }
  } catch (err) {
    return {
      hero: null,
      courses: fallbackCourses,
      teachers: fallbackTeachers,
      testimonials: fallbackTestimonials,
      posts: fallbackPosts,
    }
  }
}

export async function getPublicPost(slug, locale = 'en') {
  const site = await getPublicSite(locale)
  return site.posts.find((post) => post.slug === slug) || null
}
