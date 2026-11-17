import { defineSecret, defineString } from 'firebase-functions/params'

export const youtubeApiKey = defineSecret('YOUTUBE_DATA_API_KEY')
export const youtubeChannelHandle = defineString('YOUTUBE_CHANNEL_HANDLE', {
  default: '@Aletubereactions',
})

type YouTubeResponse<T> = { items?: T[]; nextPageToken?: string }
type ChannelItem = { id: string; contentDetails?: { relatedPlaylists?: { uploads?: string } } }
type PlaylistItem = { snippet?: { resourceId?: { videoId?: string } } }
type VideoItem = {
  id: string
  snippet?: {
    title?: string
    description?: string
    publishedAt?: string
    thumbnails?: Record<string, { url?: string; width?: number; height?: number }>
    channelTitle?: string
    tags?: string[]
  }
  contentDetails?: { duration?: string }
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string }
}

async function youtubeGet<T>(resource: string, params: Record<string, string>, apiKey: string): Promise<YouTubeResponse<T>> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`)
  for (const [key, value] of Object.entries({ ...params, key: apiKey })) url.searchParams.set(key, value)
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`YouTube API ${response.status}: ${body.slice(0, 400)}`)
  }
  return response.json() as Promise<YouTubeResponse<T>>
}

function durationToSeconds(duration: string): number {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!match) return 0
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)
}

function bestThumbnail(thumbnails: VideoItem['snippet'] extends infer S ? S extends { thumbnails?: infer T } ? T : never : never): string {
  if (!thumbnails) return ''
  return thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || ''
}

export type NormalizedVideo = {
  youtubeId: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string | null
  durationSeconds: number
  viewCount: number
  likeCount: number
  commentCount: number
  channelTitle: string
  tags: string[]
  isShort: boolean
  visibility: 'public'
  source: 'youtube'
  syncedAt: string
}

export async function fetchChannelVideos(apiKey: string, handle: string): Promise<NormalizedVideo[]> {
  const channelResponse = await youtubeGet<ChannelItem>('channels', {
    part: 'id,contentDetails', forHandle: handle.replace(/^@/, ''), maxResults: '1',
  }, apiKey)
  const channel = channelResponse.items?.[0]
  const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads
  if (!channel?.id || !uploadsPlaylistId) throw new Error(`Could not resolve YouTube channel handle: ${handle}`)

  const playlist = await youtubeGet<PlaylistItem>('playlistItems', {
    part: 'contentDetails', playlistId: uploadsPlaylistId, maxResults: '50',
  }, apiKey)
  const ids = (playlist.items || []).map(item => item.snippet?.resourceId?.videoId).filter((id): id is string => Boolean(id))
  if (!ids.length) return []

  const details = await youtubeGet<VideoItem>('videos', {
    part: 'snippet,contentDetails,statistics', id: ids.join(','), maxResults: '50',
  }, apiKey)

  const syncedAt = new Date().toISOString()
  return (details.items || []).map(video => {
    const durationSeconds = durationToSeconds(video.contentDetails?.duration || '')
    return {
      youtubeId: video.id,
      title: video.snippet?.title || 'Untitled video',
      description: video.snippet?.description || '',
      thumbnailUrl: bestThumbnail(video.snippet?.thumbnails),
      publishedAt: video.snippet?.publishedAt || null,
      durationSeconds,
      viewCount: Number(video.statistics?.viewCount || 0),
      likeCount: Number(video.statistics?.likeCount || 0),
      commentCount: Number(video.statistics?.commentCount || 0),
      channelTitle: video.snippet?.channelTitle || '',
      tags: (video.snippet?.tags || []).slice(0, 30),
      // Duration is only a useful first-pass classifier. True Shorts classification
      // may require manual review because YouTube Shorts also depends on format.
      isShort: durationSeconds > 0 && durationSeconds <= 60,
      visibility: 'public' as const,
      source: 'youtube' as const,
      syncedAt,
    }
  })
}