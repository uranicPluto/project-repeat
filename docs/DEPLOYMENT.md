# Deployment Guide (Project Repeat)

## Prerequisites
- Node.js 18+ or Node.js 20+
- PostgreSQL database instance (Neon, Supabase, AWS RDS, or Managed PostgreSQL)
- Vercel, Railway, or Docker host

---

## Environment Configuration
Set all required production environment variables:
- `DATABASE_URL`: Connection string with connection pooling (e.g. PgBouncer) where appropriate
- `APP_BASE_URL`: Public HTTPS domain (e.g. `https://repeat.houseofworkflow.com`)
- `SESSION_SECRET`: A high-entropy 64-character secret
- `NODE_ENV`: `production`

---

## Build & Migration Procedure
1. Install dependencies:
   ```bash
   npm ci
   ```
2. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```
3. Apply database migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Build Next.js application:
   ```bash
   npm run build
   ```
5. Start production server:
   ```bash
   npm start
   ```

---

## Vercel Deployment Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run prisma:generate && next build`
- **Output Directory**: `.next`
