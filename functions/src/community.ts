import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'

const db = getFirestore()
function requireUser(request: CallableRequest<unknown>) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.')
  return request.auth.uid
}
function requireAdmin(request: Parameters<Parameters<typeof onCall>[1]>[0]) {
  const uid = requireUser(request)
  if (request.auth?.token.admin !== true) throw new HttpsError('permission-denied', 'Administrator access is required.')
  return uid
}

export const toggleCommentLike = onCall({ region: 'europe-west1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request)
  const commentId = typeof request.data?.commentId === 'string' ? request.data.commentId.slice(0, 128) : ''
  if (!commentId) throw new HttpsError('invalid-argument', 'A comment ID is required.')
  const commentRef = db.collection('comments').doc(commentId)
  const likeRef = commentRef.collection('likes').doc(uid)
  return db.runTransaction(async (transaction) => {
    const [comment, like] = await Promise.all([transaction.get(commentRef), transaction.get(likeRef)])
    if (!comment.exists || comment.get('status') !== 'visible') throw new HttpsError('not-found', 'Comment is not available.')
    if (like.exists) {
      transaction.delete(likeRef)
      transaction.update(commentRef, { likeCount: FieldValue.increment(-1) })
      return { liked: false }
    }
    transaction.create(likeRef, { uid, createdAt: FieldValue.serverTimestamp() })
    transaction.update(commentRef, { likeCount: FieldValue.increment(1) })
    return { liked: true }
  })
})

export const moderateComment = onCall({ region: 'europe-west1', maxInstances: 5 }, async (request) => {
  const adminUid = requireAdmin(request)
  const commentId = typeof request.data?.commentId === 'string' ? request.data.commentId.slice(0, 128) : ''
  const status = request.data?.status
  if (!commentId || !['visible', 'removed'].includes(status)) throw new HttpsError('invalid-argument', 'Valid comment ID and moderation status are required.')
  const commentRef = db.collection('comments').doc(commentId)
  await db.runTransaction(async (transaction) => {
    const comment = await transaction.get(commentRef)
    if (!comment.exists) throw new HttpsError('not-found', 'Comment not found.')
    transaction.update(commentRef, { status, moderatedAt: FieldValue.serverTimestamp(), moderatedBy: adminUid })
    const logRef = db.collection('activityLogs').doc()
    transaction.set(logRef, { actorUid: adminUid, action: 'comment.moderate', targetType: 'comment', targetId: commentId, createdAt: FieldValue.serverTimestamp(), metadata: { status } })
  })
  logger.info('Comment moderated', { commentId, status, adminUid })
  return { success: true }
})

export const setVideoVisibility = onCall({ region: 'europe-west1', maxInstances: 5 }, async (request) => {
  const adminUid = requireAdmin(request)
  const videoId = typeof request.data?.videoId === 'string' ? request.data.videoId.slice(0, 128) : ''
  const visibility = request.data?.visibility
  if (!videoId || !['public', 'unlisted', 'hidden'].includes(visibility)) throw new HttpsError('invalid-argument', 'Valid video ID and visibility are required.')
  const ref = db.collection('videos').doc(videoId)
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) throw new HttpsError('not-found', 'Video not found.')
    transaction.update(ref, { visibility, updatedAt: FieldValue.serverTimestamp() })
    const logRef = db.collection('activityLogs').doc()
    transaction.set(logRef, { actorUid: adminUid, action: 'video.visibility', targetType: 'video', targetId: videoId, createdAt: FieldValue.serverTimestamp(), metadata: { visibility } })
  })
  return { success: true }
})

export const resolveReport = onCall({ region: 'europe-west1', maxInstances: 5 }, async (request) => {
  const adminUid = requireAdmin(request)
  const reportId = typeof request.data?.reportId === 'string' ? request.data.reportId.slice(0, 128) : ''
  const status = request.data?.status
  if (!reportId || !['reviewed', 'dismissed'].includes(status)) throw new HttpsError('invalid-argument', 'Valid report ID and status are required.')
  const ref = db.collection('reports').doc(reportId)
  await db.runTransaction(async transaction => {
    const report = await transaction.get(ref)
    if (!report.exists) throw new HttpsError('not-found', 'Report not found.')
    transaction.update(ref, { status, reviewedAt: FieldValue.serverTimestamp(), reviewedBy: adminUid })
    const logRef = db.collection('activityLogs').doc()
    transaction.set(logRef, { actorUid: adminUid, action: 'report.resolve', targetType: 'report', targetId: reportId, createdAt: FieldValue.serverTimestamp(), metadata: { status } })
  })
  return { success: true }
})

export const listAdminVideos = onCall({ region: 'europe-west1', maxInstances: 5 }, async (request) => {
  requireAdmin(request)
  const snapshot = await db.collection('videos').orderBy('publishedAt', 'desc').limit(60).get()
  return { items: snapshot.docs.map(doc => ({ id: doc.id, title: doc.get('title') || doc.id, visibility: doc.get('visibility') || 'hidden', isShort: doc.get('isShort') === true, thumbnailUrl: doc.get('thumbnailUrl') || '' })) }
})
