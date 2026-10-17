# House of Workflow — Project Repeat (Digital Loyalty & Customer Retention SaaS)

> **"Turn One-Time Customers Into Repeat Customers."**  
> A multi-tenant, branded digital loyalty platform helping local cafes, restaurants, bakeries, salons, and gyms reward customers, encourage repeat visits, and understand customer engagement without native app downloads.

---

## 🌟 Key Features

- **📱 Mobile-First Web Loyalty Wallet**: Customers scan a table or counter QR code once and immediately access their personalized branded loyalty card in their mobile browser. No app store installs required.
- **🛡️ Anti-Fraud Visit Verification & Concurrency Protection**: High-entropy 6-digit codes via `crypto.randomInt` with 3-minute TTL. Atomic compare-and-swap claims (`updateMany`) prevent duplicate stamp awards even under concurrent races.
- **🔄 Repeatable Loyalty Cycles**: Completed cards automatically roll over into new cycles (`Cycle #2`, `Cycle #3`) with persistent `lifetimeStamps` tracking, allowing customers to keep earning stamps continuously.
- **⏳ Auditable Reward Expiry & Non-Destructive Archival**: Milestone perks enforce customizable expiration windows (`validityDays`). Card builder updates never cascade-delete customer redemptions; retired perks are preserved with `isActive: false`.
- **🔒 Database-Level Unique Redemption Guard**: Schema constraint `@@unique([enrollmentId, rewardId, cycle])` physically prevents race condition double-redemptions.
- **☕ Counter Terminal Perk Authorization**: Counter staff can view unlocked customer perks and authorize instant redemptions directly from the terminal with a single click.
- **🎨 Digital Loyalty Card Builder**: Complete visual card builder with live preview. Configure 3 to 20 stamps, select custom stamp icons (coffee cup, star, gift, tag, heart), customize brand hex colors, and define milestone perks.
- **🏢 Multi-Tenant Architecture & Strict IDOR Protection**: Strict tenant isolation scoped by `businessId` across all domain services, queries, mutations, and card configuration updates.
- **🔐 Hardened Live Role-Based Access Control (RBAC)**: `validateLiveBusinessAccess` queries the live database on all mutating operations to reject suspended accounts or staff members whose access was revoked, closing stale JWT claim windows.
- **👥 Staff Management & Revocation**: Business owners can invite team members with specific roles (`MANAGER` or `STAFF`) and immediately revoke access with audit logging.
- **📊 Real Event-Driven Analytics & Customer CSV Export**: Track verified visits, active members, repeat-customer retention rates, and export customer engagement records to CSV.
- **🔒 Privacy Compliance & Data Rights**: Full self-service data export (GDPR/DPDP JSON download), audited account deletion requests with anonymized logs, and live marketing consent toggles in `NotificationService`.
- **💳 Multi-Tier Subscription Engine**: Pre-configured plans (Starter ₹299/mo, Growth ₹499/mo, Pro ₹999/mo, Enterprise) with timing-safe Razorpay webhook verification, plan capacity limits (`maxStaff`, `maxMembers`), and sandbox mode separation.
- **🏥 Production Database Health Probe**: Live `/api/health` connectivity check measuring database latency without leaking connection strings or credentials.
- **🖨️ Printable QR Counter Signage Kit**: One-click download of high-resolution counter QR codes and ready-to-print table stand signage.

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript with strict mode (`tsc --noEmit` clean, 0 errors)
- **Styling**: Tailwind CSS with custom semantic design tokens (`#101828`, `#315EFB`, `#F7F8FC`)
- **Database & ORM**: PostgreSQL (Production) / SQLite (Dev) with Prisma ORM and version-controlled migrations
- **Authentication**: `jose` (HS256 stateless session JWTs) + `bcryptjs` password hashing + HttpOnly secure cookies
- **Validation**: Zod runtime validation
- **Testing**: Vitest unit & integration test suite (**46 passing tests across 12 test suites**)
- **Icons**: Lucide React

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/uranicPluto/project-repeat.git
cd project-repeat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Database Setup & Seeding
```bash
# Push schema to local database
npx prisma db push

# Seed demo businesses, cards, staff, and transactions (Dev environment only)
npm run prisma:seed
```

### 5. Run automated tests
```bash
npm run test
```

### 6. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Credentials (Local Development & Staging Only)

> [!NOTE]
> In production environments (`NODE_ENV=production`), these public demo accounts are disabled by default unless explicitly permitted via `ALLOW_DEMO_CREDENTIALS=true`.

| Role | Email | Password | What You Can Explore |
| :--- | :--- | :--- | :--- |
| **Business Owner** | `owner@thecoffeehouse.com` | `Password123!` | The Coffee House dashboard, Card Builder, Staff roster & revocation, Billing, Analytics, Customer CSV export |
| **Counter Staff** | `barista@thecoffeehouse.com` | `Password123!` | Counter verification terminal, visit verification & direct perk authorization |
| **Customer (Active)** | `priya.sharma@example.com` | `Password123!` | Customer wallet with 3 stamps at The Coffee House, privacy data export & consent management |
| **Customer (Complete)** | `rahul.verma@example.com` | `Password123!` | Card with 5 stamps & unlocked complimentary coffee reward |
| **Platform Admin** | `admin@projectrepeat.com` | `AdminPass123!` | System-wide tenant directory & audit log at `/platform-admin` |

---

## 🧪 Counter Verification & Perk Redemption Walkthrough

1. Open `http://localhost:3000/login` in an incognito window and sign in as `priya.sharma@example.com` (`Password123!`).
2. Go to `/wallet` and click **"Claim Stamp at Counter"** &rarr; a 3-minute 6-digit code appears.
3. In your main browser, sign in as `barista@thecoffeehouse.com` (`Password123!`) and open `/dashboard/the-coffee-house/verify`.
4. Enter the 6 digits and click **"Verify & Award Stamp"** &rarr; the counter ledger records the event and Priya's card updates to 4/5 stamps in real time.
5. Sign in as `rahul.verma@example.com` (`Password123!`) on `/wallet` &rarr; observe **Cycle #1** with reward unlocked. On `/dashboard/the-coffee-house/verify`, enter Rahul's visit code &rarr; view eligible perk and click **"Authorize Perk"** to redeem it.

---

## 📂 Project Architecture

```text
src/
  app/
    page.tsx                     # Public marketing homepage
    (marketing)/                 # Features, How it Works, Pricing, FAQ, Contact, Privacy, Terms
    (auth)/                      # Login, Customer Register, Business Guided Onboarding
    (customer)/                  # /wallet, /explore, /account (Privacy & Data Export), /b/[slug]
    (business)/                  # /dashboard/[slug] (Overview, Verify terminal, Builder, Staff, Customers, Billing)
    (platform-admin)/            # /platform-admin (Tenant oversight & audit events)
    api/                         # REST Route Handlers (auth, visits, loyalty, staff, privacy, subscription, health, webhooks)
  components/
    ui/                          # Button, Input, Card, Badge, Dialog, Table, Tabs
    layout/                      # Navbar, Footer, BusinessSidebar, CustomerNav
    loyalty/                     # LoyaltyCard, StampGrid, StampIcon, VerificationModal
  lib/
    auth/session.ts              # JWT session management & hardened production secret validation
    permissions/rbac.ts          # Server-side authorization, live DB checks & cross-tenant isolation
    validation/schemas.ts        # Zod validation schemas
    qr/qrcode.ts                 # High-resolution QR code generator
    db/prisma.ts                 # Prisma Client singleton with persistence guards
  server/services/
    loyalty.ts                   # Repeatable loyalty cycles, reward expiry & non-destructive archival
    verification.ts              # Crypto random codes, concurrency race protection & counter verification
    billing.ts                   # Plan catalog, plan limits & timing-safe webhook verification
    notifications.ts             # Consent-aware transactional and marketing notification dispatcher
prisma/
  schema.prisma                  # SQLite (dev) / PostgreSQL schema
  schema.postgresql.prisma       # Dedicated PostgreSQL production schema
  migrations/                    # Version-controlled migrations
  seed.js                        # Demo seed data script with production guards
tests/
  unit/                          # Vitest automated test suite (46 tests across 12 test suites)
docs/                            # Architecture, Database, Security, Audit, Limitations, PRD, Deployment, Testing
```

---

## 📄 Documentation

- [Product Requirements Document (PRD)](docs/PRODUCT_REQUIREMENTS.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Security & Anti-Fraud Guidelines](docs/SECURITY.md)
- [Repository Audit & Hardening Report](docs/AUDIT.md)
- [Database Schema & PostgreSQL Strategy](docs/DATABASE.md)
- [Environment Configuration](docs/ENVIRONMENT.md)
- [Deployment & Operations Guide](docs/DEPLOYMENT.md)
- [Testing Strategy & Test Suite](docs/TESTING.md)
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md)
- [Known Limitations & Production Considerations](docs/LIMITATIONS.md)

---

## 📜 License

© House of Workflow. All rights reserved.
