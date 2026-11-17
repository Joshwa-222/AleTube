import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile as updateFirebaseProfile, type User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, firebaseConfigured } from '../lib/firebase'

export type UserProfile = {
  displayName: string
  email: string
  photoURL: string | null
  preferredLanguage: 'en' | 'am'
  status: 'active' | 'suspended'
}

type AuthContextValue = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  configured: boolean
  signUp: (displayName: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
  saveProfile: (changes: Pick<UserProfile, 'displayName' | 'photoURL' | 'preferredLanguage'>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const firebaseAuth = auth
    const firestore = db
    if (!firebaseConfigured || !firebaseAuth || !firestore) { setLoading(false); return }
    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser)
      if (!nextUser) { setProfile(null); setLoading(false); return }
      try {
        const profileRef = doc(firestore, 'users', nextUser.uid)
        const snapshot = await getDoc(profileRef)
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile)
        } else {
          const initial: UserProfile = {
            displayName: nextUser.displayName || nextUser.email?.split('@')[0] || 'ALE TUBE member',
            email: nextUser.email || '', photoURL: nextUser.photoURL,
            preferredLanguage: 'en', status: 'active',
          }
          await setDoc(profileRef, { ...initial, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
          setProfile(initial)
        }
      } catch (error) {
        console.error('Could not load the account profile:', error)
        setProfile(null)
      } finally { setLoading(false) }
    })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user, profile, loading, configured: firebaseConfigured,
    signUp: async (displayName, email, password) => {
      if (!auth || !db) throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.')
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateFirebaseProfile(credential.user, { displayName: displayName.trim() })
      const initial: UserProfile = { displayName: displayName.trim(), email: credential.user.email || email.trim(), photoURL: null, preferredLanguage: 'en', status: 'active' }
      await setDoc(doc(db, 'users', credential.user.uid), { ...initial, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      setProfile(initial)
    },
    signIn: async (email, password) => {
      if (!auth) throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to your .env file.')
      await signInWithEmailAndPassword(auth, email.trim(), password)
    },
    signOutUser: async () => { if (auth) await signOut(auth) },
    saveProfile: async (changes) => {
      if (!user || !db) throw new Error('You must be signed in to update your profile.')
      await updateDoc(doc(db, 'users', user.uid), { ...changes, updatedAt: serverTimestamp() })
      await updateFirebaseProfile(user, { displayName: changes.displayName, photoURL: changes.photoURL })
      setProfile(current => current ? { ...current, ...changes } : current)
    },
  }), [user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
