import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { ShieldCheck, Check, X, AlertTriangle } from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthProvider'

type PendingComment = { id: string; body: string; authorName: string; videoId: string }
type ReportItem = { id: string; reason: string; targetId: string; targetType: string; status: string }

export default function AdminDashboard() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checked, setChecked] = useState(false)
  const [comments, setComments] = useState<PendingComment[]>([])
  const [reports, setReports] = useState<ReportItem[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => { let live = true; user?.getIdTokenResult().then(result => { if (live) { setIsAdmin(result.claims.admin === true); setChecked(true) } }).catch(() => { if (live) setChecked(true) }); if (!user) setChecked(true); return () => { live = false } }, [user])
  useEffect(() => {
    if (!isAdmin || !db) return
    const stopComments = onSnapshot(query(collection(db, 'comments'), where('status', '==', 'pending'), orderBy('createdAt', 'asc'), limit(50)), s => setComments(s.docs.map(d => ({ id: d.id, ...d.data() } as PendingComment))))
    const stopReports = onSnapshot(query(collection(db, 'reports'), where('status', '==', 'open'), orderBy('createdAt', 'asc'), limit(50)), s => setReports(s.docs.map(d => ({ id: d.id, ...d.data() } as ReportItem))))
    return () => { stopComments(); stopReports() }
  }, [isAdmin])

  async function moderate(commentId: string, status: 'visible' | 'removed') {
    try { await httpsCallable(getFunctions(undefined, 'europe-west1'), 'moderateComment')({ commentId, status }); setMessage('Comment moderation saved.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Moderation failed.') }
  }
  async function resolve(reportId: string, status: 'reviewed' | 'dismissed') {
    try { await httpsCallable(getFunctions(undefined, 'europe-west1'), 'resolveReport')({ reportId, status }); setMessage('Report updated.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Report update failed.') }
  }
  if (!checked) return <div className="admin-panel">Checking administrator access…</div>
  if (!isAdmin) return null
  return <section className="admin-panel"><div className="eyebrow"><span /> ADMINISTRATION</div><h2><ShieldCheck size={22} /> Moderation dashboard</h2><p>Review member comments and community reports. Admin access is granted only through Firebase custom claims.</p>{message && <p className="community-notice">{message}</p>}
    <h3>Pending comments ({comments.length})</h3>{comments.map(item => <article className="admin-item" key={item.id}><div><strong>{item.authorName}</strong><p>{item.body}</p><small>Video: {item.videoId}</small></div><div className="admin-buttons"><button onClick={() => void moderate(item.id, 'visible')} aria-label="Approve comment"><Check /></button><button onClick={() => void moderate(item.id, 'removed')} aria-label="Remove comment"><X /></button></div></article>)}{comments.length === 0 && <p className="community-empty">No comments waiting for review.</p>}
    <h3>Open reports ({reports.length})</h3>{reports.map(item => <article className="admin-item" key={item.id}><div><strong><AlertTriangle size={14} /> {item.targetType} report</strong><p>{item.reason}</p><small>Target: {item.targetId}</small></div><div className="admin-buttons"><button onClick={() => void resolve(item.id, 'reviewed')} aria-label="Mark reviewed"><Check /></button><button onClick={() => void resolve(item.id, 'dismissed')} aria-label="Dismiss report"><X /></button></div></article>)}{reports.length === 0 && <p className="community-empty">No open reports.</p>}
  </section>
}
