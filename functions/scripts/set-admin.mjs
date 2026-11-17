import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const uid = process.env.ADMIN_UID
if (!uid) {
  console.error('Set ADMIN_UID to the Firebase Authentication UID to grant admin access.')
  process.exit(1)
}

initializeApp({ credential: applicationDefault() })
await getAuth().setCustomUserClaims(uid, { admin: true })
console.log('Admin custom claim assigned. The user must sign out and sign in again to refresh their ID token.')
