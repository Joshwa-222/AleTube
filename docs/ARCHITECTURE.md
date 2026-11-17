# ALETUBE REACTIONS — System Architecture

## 1. Product goals
- Present channel videos and Shorts in a polished, responsive experience.
- Provide searchable video discovery, categories, video detail pages, and related content.
- Support optional user accounts, favorites, comments, and community moderation.
- Provide an authenticated administration area for editorial and moderation tasks.
- Support English and Amharic UI text while preserving original YouTube titles and descriptions.

## 2. High-level architecture

```text
Browser (React + TypeScript)
  ├── Public pages and responsive UI
  ├── Localization (en / am)
  ├── YouTube IFrame Player
  └── Firebase client SDK
        ├── Firebase Authentication
        ├── Cloud Firestore
        └── Cloud Storage

Cloud Functions / trusted server layer
  ├── YouTube Data API integration
  ├── Scheduled channel synchronization
  ├── Privileged moderation/admin operations
  ├── Input validation and rate limiting
  └── Newsletter/contact processing
```

## 3. Frontend route map
- `/` — Home
- `/videos` — Video catalogue
- `/videos/:videoId` — Video detail and embedded player
- `/shorts` — Shorts catalogue
- `/categories` and `/categories/:slug` — Category discovery
- `/about` — About the channel
- `/contact` — Contact form
- `/search?q=` — Search results
- `/login`, `/register`, `/forgot-password` — Authentication
- `/profile` — User profile
- `/favorites` — Saved videos
- `/admin` — Protected administration dashboard
- `/privacy`, `/terms` — Legal pages

## 4. Trust boundaries
- The browser is untrusted. Never trust role values, user IDs, or moderation decisions supplied by the client.
- Firebase Authentication establishes identity; custom claims and Firestore rules enforce authorization.
- YouTube API keys and privileged Firebase credentials must never be shipped in browser code.
- Cloud Functions validate and authorize privileged writes.
- Public video metadata is read-only to ordinary visitors.

## 5. Data flow
1. A trusted synchronization function queries the configured YouTube channel.
2. Normalized video metadata is written to Firestore.
3. The React app reads public catalogue data from Firestore.
4. Playback is handled by the YouTube IFrame Player; the site does not re-host YouTube videos.
5. Signed-in users can create favorites and comments subject to Firestore rules.
6. Admin actions pass through verified role checks and are recorded in activity logs.

## 6. Key technical decisions
- Use YouTube video IDs as stable external identifiers; keep Firestore document IDs stable and validated.
- Store timestamps as Firestore timestamps.
- Use cursor-based pagination for large video and comment lists.
- Keep UI translations separate from YouTube-originated metadata.
- Treat site analytics as first-party site events; do not imply access to private YouTube Studio analytics.
- Use server-side synchronization to avoid exposing privileged API operations.

## 7. Non-functional requirements
- Mobile-first responsive layouts and keyboard-accessible controls.
- Loading, empty, error, and offline states for data-driven views.
- SEO metadata for public pages and shareable video detail pages.
- Pagination and lazy loading for long catalogues.
- Automated tests for authorization-sensitive behavior.
