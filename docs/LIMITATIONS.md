# Known Limitations and Production Considerations

This document details known limitations, architectural boundaries, and operational considerations for **Project Repeat** (House of Workflow) to provide full transparency into what is implemented in production vs. what is designed with extensible adapters.

---

## 1. Payment Gateway & Subscriptions

### Current Implementation
- **Adapter & Sandbox Architecture**: Project Repeat implements a modular billing abstraction (`src/server/services/billing.ts` and `src/app/api/business/subscription/route.ts`).
- **Sandbox Fallback**: When `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are not set in the environment, the platform operates in **Sandbox Mode**. In Sandbox Mode:
  - Business owners can preview and switch between all subscription tiers (Starter ₹299/mo, Growth ₹499/mo, Pro ₹999/mo, Enterprise ₹2499/mo).
  - Test billing cycles, tier upgrades, and downgrades are simulated and persisted directly to the business record with audit logs.
  - A clear visual badge indicates when the environment is in Sandbox Mode.
- **Webhook Signature Verification**: Webhook verification is fully implemented with timing-safe HMAC SHA-256 signatures (`crypto.timingSafeEqual`) to prevent timing attacks.

### Production Requirement for Live Payments
- Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in production environment settings.
- Register the live webhook endpoint: `https://your-domain.com/api/webhooks/razorpay` in the Razorpay Dashboard.

---

## 2. Database Persistence & Serverless Environments

### Dual-Schema Strategy
- **Local Development**: Uses SQLite via `prisma/schema.prisma` for frictionless local development without requiring local PostgreSQL daemon management.
- **Production Persistence**: Production **must** use managed PostgreSQL (e.g., Neon, Supabase, Amazon RDS) via `prisma/schema.postgresql.prisma` or setting `provider = "postgresql"` in `prisma/schema.prisma`.
- **Runtime Guard**: `src/lib/db/prisma.ts` enforces a runtime warning/error check in production if `DATABASE_URL` is missing or uses SQLite.
- **Serverless Connections**: Serverless platforms (e.g., Vercel) create short-lived lambdas. In production, utilize connection pooling (e.g., Neon connection pooling, Supabase Transaction pooler, or Prisma Accelerate) with `?pgbouncer=true&connection_limit=10`.

---

## 3. Media & File Storage

### Current Implementation
- Business logos and signage branding currently support external HTTPS image URLs (e.g., Cloudinary, Unsplash, or CDN-hosted assets) stored as text URLs in the `Business.logoUrl` schema field.
- High-resolution SVG and PNG counter QR codes are generated dynamically on-the-fly in vector format using `qrcode` with data URI generation, requiring zero disk writes or external storage.

### Production Consideration for Binary File Uploads
- Direct file uploads via multipart form data in serverless environments require an object storage adapter (e.g., AWS S3, Cloudflare R2, or Vercel Blob). The application architecture isolates asset URLs so introducing an S3 upload pre-signed URL handler does not break existing schema contracts.

---

## 4. Notifications & Communications

### Current Implementation
- An email and SMS notification interface is structured in the server services layer.
- Development and preview environments log outgoing transactional notifications (welcome messages, visit confirmations, perk unlock alerts) to structured logs without external delivery failures.

### Production Consideration
- Connect transactional email services (e.g., Resend, SendGrid, or AWS SES) by providing `RESEND_API_KEY` and setting up verified domain DKIM/SPF records.
- For WhatsApp or SMS visit alerts, configure a Twilio or Gupshup webhook provider adapter.

---

## 5. Offline & PWA Capabilities

### Current Implementation
- Customer wallet (`/wallet`) and business counter verification terminal (`/dashboard/[slug]/verify`) are built as mobile-first, responsive web applications requiring an active internet connection.
- Single-use 6-digit verification codes expire after 180 seconds and require active server validation to prevent replay attacks and double-stamping.

### Production Roadmap
- Service worker caching for offline card viewing.
- Background sync for queuing counter verification when staff connectivity briefly drops.
