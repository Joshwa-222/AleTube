# ALE TUBE REACTIONS

Bilingual (Amharic / English) entertainment website for the ALE TUBE REACTIONS YouTube channel.

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS foundation with responsive custom styling
- Motion animations and Lucide icons
- Firebase Cloud Functions + Firestore for server-side YouTube synchronization
- YouTube Data API v3 and privacy-enhanced YouTube embeds

## Run the frontend
Requires Node.js 20.19+ or 22.12+.

```bash
npm install
cp .env.example .env
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Phase 4: Authentication and profiles

1. Create a Firebase project and add a Web App.
2. Enable **Authentication → Sign-in method → Email/Password** in Firebase Console.
3. Copy the public Firebase web configuration into your local `.env` file using `.env.example` as the template.
4. Deploy Firestore rules with `firebase deploy --only firestore:rules`.
5. Run `npm install` and `npm run build`.

Email/password registration, sign-in, sign-out, auth-state persistence, and private user profiles are implemented. The profile document is stored at `users/{uid}`. Admin privileges are intentionally not assignable from the browser. To grant the first administrator, use a trusted machine with Google Application Default Credentials for the correct Firebase project. From `functions/`, set `ADMIN_UID` to the intended account UID and run `npm run set-admin`. Never commit a service-account key. The administrator must sign out and sign in again to refresh the ID token.

## YouTube integration setup
See [Phase 3 setup guide](docs/YOUTUBE_INTEGRATION.md). The YouTube Data API key must be stored as a Firebase Functions secret; never place it in a `VITE_*` variable or commit it.

The frontend live catalogue needs `VITE_PUBLIC_API_BASE_URL` set to the deployed Firebase Functions base URL. Until Firebase is configured and deployed, the homepage displays sample preview cards and a connection notice.

## Current limitations
- The channel sync function is scheduled every 24 hours; it runs after deployment on its schedule.
- Shorts are initially approximated as videos of 60 seconds or less and need editorial verification.
- Search currently filters a bounded result page, not the complete catalogue.
- Firebase project setup, API key configuration, deployment, live channel verification and browser testing are not yet completed.
- Favorites, comments, moderation, admin dashboard and production hosting are later phases.

Channel: https://www.youtube.com/@Aletubereactions
