# HTML App Migration TODO

## Reused In This New Root

- `backend/prisma/schema.prisma`
- `backend/lib/validators.ts`
- `backend/lib/forensic-classifier.ts`
- `backend/lib/audit.ts`
- `backend/lib/prisma.ts`
- `backend/lib/db.ts`
- `backend/lib/s3.ts`
- `backend/lib/aws-config.ts`
- `backend/scripts/seed.ts`
- `backend/scripts/safe-seed.ts`

## Remaining Work (Framework-Tied)

1. Replace Next.js route wrappers with framework-agnostic service functions.
2. Build a new HTML/CSS/JS frontend shell (`index.html`, modular JS, styles).
3. Implement new auth/session flow (cookie or JWT) replacing NextAuth glue.
4. Rebuild dashboard pages as reusable HTML components/modules.
5. Reconnect frontend actions to backend endpoints.
6. Add environment-aware config (`dev`, `test`, `prod`) for new app root.
7. Add tests and linting for new root modules.

## Recommended Build Order

1. Backend route/service extraction
2. Auth/session implementation
3. HTML app shell and router
4. Core pages (login, dashboard, cases, events)
5. Upload + intelligence + audit pages
6. Test/lint hardening
