import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { Heart, Bookmark, Flag, MessageCircle, Send } from 'lucide-react'
import { db, firebaseConfigured } from '../lib/firebase'
import { useAuth } from '../auth/AuthProvider'

type CommentItem = { id: string; authorUid: string; authorName: string; body: string; likeCount: number; parentId: string | null }

export default function CommunityPanel({ videoId }: { videoId: string }) {
  const { user, profile } = useAuth()
  const [favorite, setFavorite] = useState(false)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'comments'), where('videoId', '==', videoId), where('status', '==', 'visible'), orderBy('createdAt', 'desc'), limit(30))
    return onSnapshot(q, snapshot => setComments(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as CommentItem))), error => setNotice(error.message))
  }, [videoId])

  useEffect(() => {
    if (!user || !db) { setFavorite(false); return }
    getDoc(doc(db, 'favorites', user.uid, 'items', videoId)).then(s => setFavorite(s.exists())).catch(() => setFavorite(false))
  }, [user, videoId])

  async function toggleFavorite() {
    if (!user || !db) { setNotice('Sign in to save favorites.'); return }
    const ref = doc(db, 'favorites', user.uid, 'items', videoId)
    setBusy(true)
    try {
      if (favorite) await deleteDoc(ref)
      else await setDoc(ref, { videoId, createdAt: serverTimestamp() })
      setFavorite(!favorite); setNotice(favorite ? 'Removed from favorites.' : 'Saved to favorites.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not update favorites.') }
    finally { setBusy(false) }
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault()
    if (!user || !db) { setNotice('Sign in to comment.'); return }
    const text = body.trim()
    if (!text || text.length > 1000) return
    setBusy(true)
    try {
      await addDoc(collection(db, 'comments'), { videoId, authorUid: user.uid, authorName: profile?.displayName || user.displayName || 'Member', body: text, parentId: replyTo, createdAt: serverTimestamp(), updatedAt: null, status: 'pending', likeCount: 0 })
      setBody(''); setReplyTo(null); setNotice('Comment submitted for moderation.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not submit comment.') }
    finally { setBusy(false) }
  }

  async function likeComment(commentId: string) {
    if (!user) { setNotice('Sign in to like comments.'); return }
    try {
      const fn = httpsCallable(getFunctions(undefined, 'europe-west1'), 'toggleCommentLike')
      await fn({ commentId }); setNotice('Your reaction was saved.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not like comment.') }
  }

  async function reportComment(commentId: string) {
    if (!user || !db) { setNotice('Sign in to report a comment.'); return }
    const reason = window.prompt('Briefly explain why you are reporting this comment:')
    if (!reason?.trim()) return
    try {
      await addDoc(collection(db, 'reports'), { reporterUid: user.uid, targetType: 'comment', targetId: commentId, reason: reason.trim().slice(0, 500), createdAt: serverTimestamp(), status: 'open' })
      setNotice('Report submitted for review.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not submit report.') }
  }

  const replies = (parentId: string) => comments.filter(item => item.parentId === parentId)
  return <section className="community-panel"><div className="community-head"><div><div className="eyebrow"><span /> COMMUNITY</div><h3>Join the conversation</h3></div><button className={favorite ? 'community-action active' : 'community-action'} onClick={() => void toggleFavorite()} disabled={busy || !firebaseConfigured}><Bookmark size={16} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved' : 'Save video'}</button></div>
    <form className="comment-form" onSubmit={submitComment}><label htmlFor="community-comment">{replyTo ? 'Write a reply' : 'Leave a comment'}</label><textarea id="community-comment" value={body} onChange={e => setBody(e.target.value)} maxLength={1000} placeholder={user ? 'Share your thoughts respectfully…' : 'Sign in to join the conversation'} disabled={!user || busy} /><div className="comment-form-bottom"><small>{body.length}/1000 characters · Comments are reviewed before appearing.</small><button className="btn-primary" type="submit" disabled={!user || busy || !body.trim()}><Send size={14} /> Submit</button></div></form>
    {notice && <p className="community-notice" role="status">{notice}</p>}
    <div className="comment-list">{comments.filter(item => !item.parentId).map(item => <article className="comment-item" key={item.id}><div className="comment-avatar">{(item.authorName || 'M').slice(0,1).toUpperCase()}</div><div className="comment-content"><strong>{item.authorName}</strong><p>{item.body}</p><div className="comment-tools"><button onClick={() => void likeComment(item.id)}><Heart size={14} /> {item.likeCount || 0}</button><button onClick={() => { setReplyTo(item.id); document.getElementById('community-comment')?.focus() }}><MessageCircle size={14} /> Reply</button><button onClick={() => void reportComment(item.id)}><Flag size={14} /> Report</button></div>{replies(item.id).map(reply => <div className="comment-reply" key={reply.id}><strong>{reply.authorName}</strong><p>{reply.body}</p></div>)}</div></article>)}{comments.length === 0 && <p className="community-empty">No approved comments yet. Be the first to join in.</p>}</div>
  </section>
}
