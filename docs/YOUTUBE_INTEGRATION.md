# Phase 3 — YouTube Integration

## Data flow
1. A scheduled Firebase Function resolves the configured channel handle and reads its uploads playlist.
2. It fetches video details in batches and normalizes metadata into `videos/{youtubeId}`.
3. Public catalogue and related-content HTTPS endpoints read only documents marked `visibility: public`.
4. The frontend API helper provides typed catalogue access and privacy-enhanced YouTube embed URLs.

## Configure
1. Create/select a Firebase project and enable Cloud Firestore.
2. Enable **YouTube Data API v3** in Google Cloud and create an API key restricted to that API.
3. Install the Firebase CLI and run `firebase login`.
4. Copy `.firebaserc.example` to `.firebaserc` and replace the project ID.
5. Set the server-only secret: `firebase functions:secrets:set YOUTUBE_DATA_API_KEY`.
6. The default channel handle is `@Aletubereactions`. Change the default in `functions/src/youtube.ts` if required.
7. Build and deploy:
   - `cd functions && npm install && npm run build`
   - `cd .. && firebase deploy --only functions,firestore:rules`
8. Set `VITE_PUBLIC_API_BASE_URL` to the deployed Functions base URL in your frontend environment.

## Endpoints
- `GET /publicVideos?type=videos|shorts&limit=12&cursor=...`
- Optional filters: `search` and `category`
- `GET /relatedVideos?videoId=YOUTUBE_VIDEO_ID`

## Data notes and limitations
- YouTube video IDs are Firestore document IDs, making synchronization idempotent.
- Metadata includes original YouTube title/description, thumbnails, publish time, duration and public counts.
- Shorts are initially classified as videos of 180 seconds or less. This is an approximation, not a definitive Shorts signal; review edge cases.
- Category filtering uses `categoryIds`, which may be assigned during the admin phase.
- Search currently filters within a bounded fetched page. It is not complete catalogue-wide full-text search; add a search index before scaling.
- The scheduler runs once every 24 hours. A first sync occurs when the scheduled function runs after deployment.
- Firestore client access is denied by default. Public catalogue reads go through HTTPS functions.

## API key security
Never use a `VITE_` prefix for the YouTube API key. It is a Firebase Functions secret, not browser configuration. Restrict the key to YouTube Data API v3 and monitor quota usage.
