const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'piano_academy_token'

export { API_URL, TOKEN_KEY }

export function extractError(data, fallback) {
  if (!data) return fallback
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) return data.detail.map((e) => e.msg || JSON.stringify(e)).join('; ')
  if (data.detail) return JSON.stringify(data.detail)
  return fallback
}

export async function api(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(extractError(data, `Request failed: ${response.status}`))
  return data
}

export async function uploadCmsImage(file) {
  if (!file) return null
  const token = localStorage.getItem(TOKEN_KEY)
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/cms/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(extractError(data, `Upload failed: ${response.status}`))
  return data
}
