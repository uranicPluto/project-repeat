# Deployment & Operations Guide

This guide describes how to deploy, configure, and maintain **Project Repeat** (House of Workflow) in production on Vercel or any containerized/Node.js host with managed PostgreSQL.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v18.x` LTS
- **Managed PostgreSQL**: Neon, Supabase, AWS RDS Aurora Serverless, or Railway PostgreSQL
- **Domain**: An HTTPS-enabled domain or Vercel production deployment URL

---

## 2. Environment Variables Checklist

Configure the following environment variables in your Vercel project settings or production container:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string with connection pooler | `postgresql://user:pass@ep-cool-pooler.us-east-1.aws.neon.tech/repeat?sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | Optional | Direct connection string for Prisma schema migrations | `postgresql://user:pass@ep-cool.us-east-1.aws.neon.tech/repeat?sslmode=require` |
| `SESSION_SECRET` | **Yes** | High-entropy secret key (at least 32 characters) for JWT session signing | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `APP_BASE_URL` | **Yes** | Public root URL of your SaaS application | `https://project-repeat.vercel.app` |
| `NODE_ENV` | **Yes** | Runtime environment mode | `production` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay API key for live subscription billing | `rzp_live_...` (Omit for Sandbox Mode) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay API secret | `secret_...` |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Secret for verifying incoming Razorpay webhooks | `whsec_...` |

> [!CAUTION]
> In production (`NODE_ENV=production`), `SESSION_SECRET` must be set and contain at least 32 characters. If omitted or under 32 characters, the application throws a fatal configuration error on startup to prevent insecure session forgery.

---

## 3. Database Migration & Provisioning

### A. Managed PostgreSQL (Neon / Supabase) Setup
1. Create a PostgreSQL project on Neon or Supabase.
2. Retrieve the pooled connection URL (e.g. PgBouncer port 6543 or Neon connection pooler).
3. If using `prisma/schema.postgresql.prisma`, copy it or ensure `prisma/schema.prisma` has:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
   ```
   Or apply the checked-in migration script:
   ```bash
   psql "$DATABASE_URL" -f prisma/migrations/20261018000000_init/migration.sql
   ```

### B. Seeding Initial Demo Data (Optional for Staging)
To populate demo businesses, cards, staff, and transactions for demonstration or testing:
```bash
npm run prisma:seed
```

---

## 4. Vercel Deployment Settings

In the Vercel Dashboard project settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**:
  ```bash
  npm run prisma:generate && next build
  ```
- **Install Command**:
  ```bash
  npm install
  ```
- **Output Directory**: `.next`

---

## 5. Deployment Verification Checklist

Post-deployment, execute these verification checks:

1. **Public Marketing Homepage**: Load `https://your-domain.com/` & verify status `200 OK`.
2. **Branded Business Storefront**: Load `https://your-domain.com/b/the-coffee-house` & verify status `200 OK`.
3. **Session Secret Security**: Inspect application server logs to verify no `SESSION_SECRET` fallback warnings exist.
4. **Counter Verification Flow**: Sign in as `barista@thecoffeehouse.com` and load `/dashboard/the-coffee-house/verify`.
5. **Customer Wallet Flow**: Sign in as customer and open `/wallet`.
6. **Billing Page**: Verify `/dashboard/the-coffee-house/billing` displays subscription plan options (with Sandbox Mode banner if live keys are unset).
7. **Privacy Compliance**: Sign in and navigate to `/account` & verify JSON data export download and consent toggles work without errors.
