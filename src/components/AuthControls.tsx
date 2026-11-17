import { useState, type FormEvent } from 'react'
import { LogIn, LogOut, UserRound, X } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

export default function AuthControls() {
  const { user, profile, loading, configured, signIn, signUp, signOutUser, saveProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      if (mode === 'signup') await signUp(name, email, password)
      else if (mode === 'signin') await signIn(email, password)
      else if (profile) await saveProfile({ displayName: name.trim() || profile.displayName, photoURL: profile.photoURL, preferredLanguage: profile.preferredLanguage })
      setOpen(false); setPassword('')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Something went wrong.'
      setError(message.replace('Firebase: ', '').replace(/\\s*\\(auth\\/[a-z-]+\\)\\.?/i, ''))
    } finally { setBusy(false) }
  }

  return <>
    {user ? <div className="auth-user"><button className="account-button" onClick={() => { setMode('profile'); setName(profile?.displayName || user.displayName || ''); setOpen(true) }}><UserRound size={16} /> <span>{profile?.displayName || user.email}</span></button><button className="icon-btn auth-signout" aria-label="Sign out" title="Sign out" onClick={() => void signOutUser()}><LogOut size={17} /></button></div> : <button className="auth-open-btn" onClick={() => { setMode('signin'); setOpen(true) }} disabled={loading}><LogIn size={16} /> Sign in</button>}
    {open && <div className="auth-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false) }}><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-close icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X /></button><div className="eyebrow"><span /> ALE TUBE ACCOUNT</div><h2 id="auth-title">{mode === 'signup' ? 'Create your account' : mode === 'profile' ? 'Your profile' : 'Welcome back'}</h2><p className="auth-description">{mode === 'profile' ? 'Update the name shown on your account.' : 'Sign in to access your personal ALE TUBE features.'}</p>
      {!configured && <p className="auth-warning">Firebase is not configured yet. Add your Firebase web app values to the local .env file and enable Email/Password sign-in.</p>}
      <form onSubmit={submit}>{mode === 'signup' && <label>Display name<input value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={80} required autoComplete="name" /></label>}{mode !== 'profile' && <><label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label></>}{mode === 'profile' && <label>Display name<input value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={80} required /></label>}{error && <p className="auth-error" role="alert">{error}</p>}<button className="btn-primary auth-submit" disabled={busy || !configured}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'profile' ? 'Save profile' : 'Sign in'}</button></form>
      {mode !== 'profile' && <p className="auth-switch">{mode === 'signup' ? 'Already registered?' : 'New to ALE TUBE?'} <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></p>}
    </section></div>}
  </>
}
