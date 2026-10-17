# Known Limitations and Production Considerations

This document details known limitations, architectural boundaries, and operational considerations for **Project Repeat** (House of Workflow) to provide full transparency into what is implemented in production vs. what is designed with extensible adapters.

---

## 1. Payment Gateway & Subscriptions

### Current Implementation & Production Isolation
- **Adapter & Sandbox Architecture**: Project Repeat implements a modular billing abstraction (`src/server/services/billing.ts` and `src/app/api/business/subscription/route.ts`).
- **Production Guard against Plan Spoofing**: In production (`NODE_ENV === "production"`), directly switching plans without payment is strictly blocked with `503 Service Unavailable` unless live Razorpay credentials are configured or `ALLOW_SANDBOX_BILLING=true` is explicitly provided for isolated staging.
- **Server-Side Plan Limit Enforcement**:
  - `LoyaltyService.enrollCustomer` enforces `plan.maxMembers` (e.g. 200 for Starter, 1,000 for Growth).
  - `POST /api/business/staff` enforces `plan.maxStaff` (e.g. 1 for Starter, 3 for Growth).
- **Full Webhook Lifecycle Support**:
  - Timing-safe HMAC SHA-256 signature verification (`crypto.timingSafeEqual`).
  - Supports `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`, `subscription.paused`, and `payment.failed`.
  - Idempotent deduplication using event ID tracking to prevent duplicate billing processing.

### Production Requirement for Live Payments
- Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in production environment settings.
- Register the live webhook endpoint: `https://your-domain.com/api/webhooks/razorpay` in the Razorpay Dashboard.

---

## 2. Public Demo Credentials & Production Security

### Current Implementation
- `prisma/seed.js` includes a strict guard that terminates immediately if executed in production without `ALLOW_PRODUCTION_SEED=true`.
- In production (`NODE_ENV === "production"`), default demo accounts (`admin@projectrepeat.com`, `owner@thecoffeehouse.com`, etc.) are blocked from authenticating unless `ALLOW_DEMO_CREDENTIALS=true` is set.
- `prisma/dev.db` has been untracked from Git and added to `.gitignore` to prevent bundling development database artifacts into production builds.

---

## 3. Database Persistence & Serverless Environments

### Dual-Schema Strategy
- **Local Development**: Uses SQLite via `prisma/schema.prisma` for frictionless local development without requiring local PostgreSQL daemon management.
- **Production Persistence**: Production **must** use managed PostgreSQL (e.g., Neon, Supabase, Amazon RDS) via `prisma/schema.postgresql.prisma` or setting `provider = "postgresql"` in `prisma/schema.prisma`.
- **Runtime Guard**: `src/lib/db/prisma.ts` throws a fatal error on startup in production if `DATABASE_URL` is missing or uses SQLite without `ALLOW_SQLITE_IN_PRODUCTION=true`.
- **Serverless Connections**: Serverless platforms (e.g., Vercel) create short-lived lambdas. In production, utilize connection pooling (e.g., Neon connection pooling, Supabase Transaction pooler, or Prisma Accelerate) with `?pgbouncer=true&connection_limit=10`.
- **Live Health Check**: `GET /api/health` probes the database and measures query latency without exposing credentials.

---

## 4. Media & File Storage

### Current Implementation
- Business logos and signage branding currently support external HTTPS image URLs (e.g., Cloudinary, Unsplash, or CDN-hosted assets) stored as text URLs in the `Business.logoUrl` schema field.
- High-resolution SVG and PNG counter QR codes are generated dynamically on-the-fly in vector format using `qrcode` with data URI generation, requiring zero disk writes or external storage.

### Production Consideration for Binary File Uploads
- Direct file uploads via multipart form data in serverless environments require an object storage adapter (e.g., AWS S3, Cloudflare R2, or Vercel Blob). The application architecture isolates asset URLs so introducing an S3 upload pre-signed URL handler does not break existing schema contracts.

---

## 5. Notifications & Communications

### Current Implementation
- `NotificationService` in `src/server/services/notifications.ts` checks customer privacy preferences (`CustomerConsent`) and suppresses promotional messages if the user has opted out, while allowing critical transactional visit confirmations.
- Development and preview environments log outgoing transactional notifications to structured logs.

### Production Consideration
- Connect transactional email services (e.g., Resend, SendGrid, or AWS SES) by providing `RESEND_API_KEY` and setting up verified domain DKIM/SPF records.
- For WhatsApp or SMS visit alerts, configure a Twilio or Gupshup webhook provider adapter.

---

## 6. Offline & PWA Capabilities

### Current Implementation
- Customer wallet (`/wallet`) and business counter verification terminal (`/dashboard/[slug]/verify`) are built as mobile-first, responsive web applications requiring an active internet connection.
- Single-use 6-digit verification codes expire after 180 seconds and require active server validation to prevent replay attacks and double-stamping.

### Production Roadmap
- Service worker caching for offline card viewing.
- Background sync for queuing counter verification when staff connectivity briefly drops.
