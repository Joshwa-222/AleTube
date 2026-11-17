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

## YouTube integration setup
See [Phase 3 setup guide](docs/YOUTUBE_INTEGRATION.md). The YouTube Data API key must be stored as a Firebase Functions secret; never place it in a `VITE_*` variable or commit it.

The frontend live catalogue needs `VITE_PUBLIC_API_BASE_URL` set to the deployed Firebase Functions base URL. Until Firebase is configured and deployed, the homepage displays sample preview cards and a connection notice.

## Current limitations
- The channel sync function is scheduled every 24 hours; it runs after deployment on its schedule.
- Shorts are initially approximated as videos of 60 seconds or less and need editorial verification.
- Search currently filters a bounded result page, not the complete catalogue.
- Firebase project setup, API key configuration, deployment, live channel verification and browser testing are not yet completed.
- Authentication, favorites, comments, moderation, admin dashboard and production hosting are later phases.

Channel: https://www.youtube.com/@Aletubereactions
