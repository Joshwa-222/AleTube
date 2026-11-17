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
- [x] Configure Firebase client integration and email/password sign-in and registration
- [ ] Add Google sign-in, password reset, and email verification
- [x] Add editable private profiles
- [x] Add favorites

## Phase 5 — Community
- [x] Add comments, replies, likes, and reports
- [x] Add moderation queue and basic abuse controls
- [x] Enforce owner and admin custom-claim boundaries in Firestore rules

## Phase 6 — Administration
- [x] Add custom-claim protected moderation dashboard
- [x] Manage video visibility, comments, and reports
- [ ] Add full category, user, settings, contact inbox, and newsletter management
- [x] Record administrative activity for moderation actions

## Phase 7 — Analytics, SEO, and release
- [ ] Add privacy-conscious first-party site analytics
- [x] Add page title, description, and social preview metadata
- [ ] Add sitemap and robots policy for the production domain
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
