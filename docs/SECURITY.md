# Security Baseline

## Authentication and authorization
- Use Firebase Authentication for identity.
- Verify Firebase ID tokens in every privileged Cloud Function.
- Assign `admin` and `moderator` custom claims only through a trusted administrative process.
- Never allow users to set their own role or moderation status.
- Deny access by default; grant only the minimum required operations.

## Firestore rules — policy requirements
- Public users may read only published/public video and active category documents.
- Users may read and update only their own profile fields; role/status fields are immutable from clients.
- Users may create comments as themselves, with bounded body length and validated video references.
- Users may edit/delete only their own comments, subject to moderation policy.
- Favorites are private to their owner.
- Reports, contact messages, newsletter subscriber records, and activity logs must not be publicly readable.
- Admin/moderator writes must be checked using trusted claims.
- Do not deploy permissive development rules to production.

## Storage
- Restrict uploads by authenticated UID, allowed MIME types, and file-size limits.
- Prefer image-only uploads if profile images are the only user-upload feature.
- Prevent public listing of private uploads.
- Validate file content server-side where practical.

## Secrets
- Keep `.env.local` out of Git.
- Commit only `.env.example` with placeholder values.
- Store production secrets in the hosting provider's secret manager / Firebase Functions configuration.
- YouTube API keys must be restricted by API and application where possible.
- Never expose service-account private keys in the frontend.

## Abuse prevention
- Validate and normalize all inputs on the server.
- Apply rate limits to comments, reports, contact, and newsletter endpoints.
- Add spam controls and moderation queues.
- Use App Check where appropriate.
- Log security-relevant admin actions without logging credentials or unnecessary personal data.

## Release gate
Before production, write and test explicit Firestore and Storage rules, run emulator tests, verify role escalation is impossible, and review all public data exposure.
