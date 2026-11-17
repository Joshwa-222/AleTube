# Delivery Roadmap

## Phase 1 — Architecture and foundation
- [x] Define product scope and route map
- [x] Select frontend/backend architecture
- [x] Define Firestore collection contracts
- [x] Define security boundaries and release gates
- [x] Document delivery phases
- [ ] Confirm final channel branding assets and content categories

## Phase 2 — Frontend foundation and design system
- [ ] Initialize React + TypeScript + Vite
- [ ] Configure Tailwind and typography (including Noto Sans Ethiopic)
- [ ] Build responsive navigation, footer, buttons, cards, and layout primitives
- [ ] Implement home, catalogue, detail, Shorts, About, and Contact page shells
- [ ] Add loading, empty, and error states

## Phase 3 — YouTube integration
- [x] Implement server-side YouTube Data API channel lookup and uploads sync
- [x] Normalize video metadata and initial Shorts classification
- [x] Add public catalogue and related-video HTTPS endpoints with cursor pagination
- [x] Add typed frontend API client and YouTube IFrame playback
- [ ] Configure Firebase project, API secret, deploy functions, and verify live channel data
- [ ] Improve catalogue-wide search and verify Shorts classification

## Phase 4 — Firebase identity and profiles
- [ ] Configure Firebase Authentication
- [ ] Implement email/password and Google sign-in
- [ ] Add password reset and email verification
- [ ] Add profile and favorites

## Phase 5 — Community
- [ ] Add comments, replies, likes, and reports
- [ ] Add moderation queue and abuse controls
- [ ] Test ownership and role boundaries

## Phase 6 — Administration
- [ ] Add protected admin shell and dashboard
- [ ] Manage videos, categories, users, comments, and reports
- [ ] Add settings, contact inbox, and newsletter management
- [ ] Record administrative activity

## Phase 7 — Analytics, SEO, and release
- [ ] Add privacy-conscious first-party site analytics
- [ ] Add page metadata, sitemap, and social previews
- [ ] Test accessibility, responsive behavior, performance, and security
- [ ] Deploy staging, verify, then deploy production


## Phase 5 — Community features
- [x] Add authenticated favorites
- [x] Add comments and threaded replies with moderation-first publishing
- [x] Add transactional comment likes through trusted Cloud Functions
- [x] Add user reports and admin review queue
- [x] Restrict writes by owner and admin custom claims

## Phase 6 — Administration
- [x] Add custom-claim protected moderation dashboard
- [x] Add comment approval/removal and report resolution
- [x] Add video visibility callable and audit log
- [ ] Build full user, category, settings, contact inbox, and newsletter management UI
- [ ] Provision the first admin custom claim using a trusted Firebase Admin SDK process

## Phase 7 — Discovery
- [x] Add bounded server-side search and category filtering API
- [x] Add client search and category chips
- [ ] Build dedicated catalogue and category pages with full pagination

## Phase 8 — SEO and analytics
- [x] Add page title, description, Open Graph, and Twitter metadata
- [ ] Add generated sitemap and robots policy for the production domain
- [ ] Add consent-based first-party analytics dashboard

## Phase 9 — Quality and deployment
- [ ] Run typecheck/build and fix all CI failures
- [ ] Add Firestore rules tests and callable-function tests
- [ ] Configure Firebase project, App Check, secrets, indexes, and production domain
- [ ] Deploy staging and verify real sign-up, community, moderation, and YouTube sync
- [ ] Production deployment and post-deploy smoke tests
