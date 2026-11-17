# ALETUBE REACTIONS

A bilingual (English / Amharic) community website for the ALETUBE REACTIONS YouTube channel.

## Phase 1 status
Architecture and technical foundation documented. This package is a project starter; Firebase credentials, YouTube API credentials, and deployment are not configured.

## Planned stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend services: Firebase Authentication, Firestore, Storage, Cloud Functions
- Video delivery: YouTube Data API v3 + YouTube IFrame Player API
- Charts: Recharts
- Hosting: Firebase Hosting (proposed)

## Project documentation
- [System architecture](docs/ARCHITECTURE.md)
- [Proposed Firestore data model](docs/DATA_MODEL.md)
- [Security baseline](docs/SECURITY.md)
- [Delivery roadmap](docs/ROADMAP.md)

## Development setup
The application scaffold will be added in Phase 2. Do not add real credentials to Git. Copy `.env.example` to a local environment file when implementation begins and replace placeholders locally.

## Important
YouTube videos are played through the official YouTube IFrame Player. The site will not download or re-host YouTube videos. Site analytics will cover first-party website activity only; it will not claim access to private YouTube Studio analytics.
