import { initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import { fetchChannelVideos, youtubeApiKey, youtubeChannelHandle } from './youtube.js'

initializeApp()
const db = getFirestore()

export const syncYouTubeChannel = onSchedule({
  schedule: 'every 24 hours',
  timeZone: 'Africa/Addis_Ababa',
  region: 'europe-west1',
  secrets: [youtubeApiKey],
  timeoutSeconds: 300,
  memory: '512MiB',
}, async () => {
  const videos = await fetchChannelVideos(youtubeApiKey.value(), youtubeChannelHandle.value())
  const batchSize = 400
  for (let offset = 0; offset < videos.length; offset += batchSize) {
    const batch = db.batch()
    for (const video of videos.slice(offset, offset + batchSize)) {
      const ref = db.collection('videos').doc(video.youtubeId)
      batch.set(ref, {
        ...video,
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null,
        syncedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    }
    await batch.commit()
  }
  logger.info('YouTube channel synchronization completed', { count: videos.length, handle: youtubeChannelHandle.value() })
})

function encodeCursor(publishedAt: unknown, id: string): string {
  const date = publishedAt instanceof Date ? publishedAt.toISOString() : new Date().toISOString()
  return Buffer.from(JSON.stringify({ date, id })).toString('base64url')
}

function decodeCursor(value: string): { date: Date; id: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as { date: string; id: string }
    const date = new Date(parsed.date)
    if (!parsed.id || Number.isNaN(date.getTime())) return null
    return { date, id: parsed.id }
  } catch { return null }
}

export const publicVideos = onRequest({
  region: 'europe-west1',
  cors: true,
  timeoutSeconds: 30,
  memory: '256MiB',
}, async (request, response) => {
  if (request.method !== 'GET') {
    response.set('Allow', 'GET').status(405).json({ error: 'method_not_allowed' })
    return
  }

  const rawLimit = Number(request.query.limit || 12)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 30) : 12
  const type = request.query.type === 'shorts' ? 'shorts' : 'videos'
  const category = typeof request.query.category === 'string' ? request.query.category.slice(0, 80) : ''
  const search = typeof request.query.search === 'string' ? request.query.search.trim().slice(0, 100) : ''
  const cursor = typeof request.query.cursor === 'string' ? decodeCursor(request.query.cursor) : null

  try {
    let query = db.collection('videos').where('visibility', '==', 'public')
      .where('isShort', '==', type === 'shorts')
      .orderBy('publishedAt', 'desc').orderBy(FieldPath.documentId(), 'desc')
    if (cursor) query = query.startAfter(cursor.date, cursor.id) as typeof query
    // Fetch a bounded page. Search/category filtering is applied before returning
    // results; the cursor is based on the last scanned document to avoid repeats.
    const snapshot = await query.limit(Math.min(limit * 5, 100)).get()
    const matched = snapshot.docs.filter(doc => {
      const data = doc.data()
      const categoryIds = Array.isArray(data.categoryIds) ? data.categoryIds as string[] : []
      const text = `${data.title || ''} ${data.description || ''}`.toLowerCase()
      return (!category || categoryIds.includes(category)) && (!search || text.includes(search.toLowerCase()))
    }).slice(0, limit)
    const lastScanned = snapshot.docs[snapshot.docs.length - 1]
    const nextCursor = snapshot.size === Math.min(limit * 5, 100) && lastScanned
      ? encodeCursor(lastScanned.get('publishedAt')?.toDate?.() || lastScanned.get('publishedAt'), lastScanned.id)
      : null
    response.set('Cache-Control', 'public, max-age=60, s-maxage=120').json({
      items: matched.map(doc => ({ id: doc.id, ...doc.data() })),
      nextCursor,
    })
  } catch (error) {
    logger.error('Public video catalogue request failed', error)
    response.status(500).json({ error: 'catalogue_unavailable' })
  }
})

export const relatedVideos = onRequest({
  region: 'europe-west1',
  cors: true,
  timeoutSeconds: 20,
  memory: '256MiB',
}, async (request, response) => {
  if (request.method !== 'GET') {
    response.set('Allow', 'GET').status(405).json({ error: 'method_not_allowed' })
    return
  }
  const videoId = typeof request.query.videoId === 'string' ? request.query.videoId.slice(0, 100) : ''
  if (!videoId) { response.status(400).json({ error: 'video_id_required' }); return }
  try {
    const current = await db.collection('videos').doc(videoId).get()
    if (!current.exists || current.get('visibility') !== 'public') {
      response.status(404).json({ error: 'video_not_found' }); return
    }
    const categoryIds = current.get('categoryIds')
    const categoryId = Array.isArray(categoryIds) ? categoryIds[0] : null
    let query = db.collection('videos').where('visibility', '==', 'public').where('isShort', '==', false)
    if (categoryId) query = query.where('categoryIds', 'array-contains', categoryId)
    const related = await query.limit(9).get()
    response.set('Cache-Control', 'public, max-age=60, s-maxage=120').json({
      items: related.docs.filter(doc => doc.id !== videoId).slice(0, 8).map(doc => ({ id: doc.id, ...doc.data() })),
    })
  } catch (error) {
    logger.error('Related videos request failed', error)
    response.status(500).json({ error: 'related_videos_unavailable' })
  }
})