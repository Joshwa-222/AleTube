# Firestore Data Model (Proposed)

All collections and fields below are a starting contract. Validate and version schemas before production use.

## `users/{uid}`
- `displayName: string`
- `email: string` (minimize exposure; do not make public)
- `photoURL: string | null`
- `preferredLanguage: "en" | "am"`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `status: "active" | "suspended"`
- Role authority comes from Firebase custom claims, not a client-editable field.

## Profile security
- Users may read only their own `users/{uid}` document.
- Users may create a profile with a constrained field allowlist and update only display name, photo URL, preferred language, and update timestamp.
- Role, admin, suspension authority, and custom claims are controlled by trusted server-side code only.

## `videos/{videoId}`
- `youtubeId: string` (unique)
- `title: string`
- `description: string`
- `thumbnailUrl: string`
- `publishedAt: Timestamp | null`
- `durationSeconds: number | null`
- `categoryIds: string[]`
- `isShort: boolean`
- `visibility: "public" | "unlisted" | "hidden"`
- `source: "youtube"`
- `syncedAt: Timestamp`

## `categories/{categoryId}`
- `name: { en: string, am: string }`
- `slug: string`
- `description: { en: string, am: string }`
- `sortOrder: number`
- `isActive: boolean`

## `comments/{commentId}`
- `videoId: string`
- `authorUid: string`
- `body: string`
- `createdAt: Timestamp`
- `updatedAt: Timestamp | null`
- `status: "visible" | "pending" | "removed"`
- `likeCount: number` (maintained by trusted logic)

## `favorites/{uid}/items/{videoId}`
- `videoId: string`
- `createdAt: Timestamp`

## `reports/{reportId}`
- `reporterUid: string`
- `targetType: "comment" | "user"`
- `targetId: string`
- `reason: string`
- `createdAt: Timestamp`
- `status: "open" | "reviewed" | "dismissed"`

## `newsletterSubscribers/{subscriberId}`
- `email: string`
- `createdAt: Timestamp`
- `status: "subscribed" | "unsubscribed"`
- Store only necessary information; restrict reads to trusted server/admin workflows.

## `contactMessages/{messageId}`
- `name: string`
- `email: string`
- `message: string`
- `createdAt: Timestamp`
- `status: "new" | "in_progress" | "closed"`

## `siteSettings/{documentId}`
- Public-safe configuration only. Never store secrets or private credentials here.

## `activityLogs/{logId}`
- `actorUid: string`
- `action: string`
- `targetType: string`
- `targetId: string`
- `createdAt: Timestamp`
- `metadata: map` (strictly bounded; do not log secrets or sensitive personal data)

## Indexing and query notes
- Add composite indexes only when actual queries require them.
- Catalogue queries should filter by `visibility` and order by `publishedAt`.
- Comments should query by `videoId`, `status`, and `createdAt`.
- Use cursor pagination (`startAfter`) rather than unbounded reads.
- Enforce uniqueness of `youtubeId` in trusted synchronization code; Firestore does not provide relational unique constraints.
