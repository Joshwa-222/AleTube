export type PublicVideo = {
  id: string
  youtubeId: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string | { _seconds: number } | null
  durationSeconds: number
  viewCount: number
  likeCount: number
  commentCount: number
  isShort: boolean
  categoryIds?: string[]
}

export type VideoPage = { items: PublicVideo[]; nextCursor: string | null }

const apiBase = (import.meta.env.VITE_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')

function endpoint(path: string, params: Record<string, string | number | undefined>): string {
  if (!apiBase) throw new Error('The public API URL is not configured. Set VITE_PUBLIC_API_BASE_URL.')
  const url = new URL(`${apiBase}/${path.replace(/^\//, '')}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })
  return url.toString()
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`)
  return response.json() as Promise<T>
}

export async function getVideos(options: { limit?: number; cursor?: string; search?: string; category?: string; type?: 'videos' | 'shorts' } = {}): Promise<VideoPage> {
  return getJson(endpoint('publicVideos', options))
}

export function getRelatedVideos(videoId: string): Promise<{ items: PublicVideo[] }> {
  return getJson(endpoint('relatedVideos', { videoId }))
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
}