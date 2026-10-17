# House of Workflow — Project Repeat (Digital Loyalty & Customer Retention SaaS)

> **"Turn One-Time Customers Into Repeat Customers."**  
> A simple, branded digital loyalty platform helping local cafes, restaurants, bakeries, salons, and gyms reward customers, encourage repeat visits, and understand customer engagement without native app downloads.

---

## 🌟 Key Features

- **📱 Mobile-First Web Loyalty Wallet**: Customers scan a table or counter QR code once and immediately access their personalized branded loyalty card in their mobile browser. No app store installs required.
- **🛡️ Anti-Fraud Visit Verification**: Static QR codes only point to storefronts and never grant stamps. Stamps are awarded when counter staff verify an expiring, single-use 6-digit code or dynamic QR presented by the customer.
- **🎨 Digital Loyalty Card Builder**: Complete visual card builder with live preview. Configure 3 to 20 stamps, select custom stamp icons (coffee cup, star, gift, tag, heart), customize brand hex colors, and define milestone perks.
- **🏢 Multi-Tenant Architecture**: Strict tenant isolation scoped by `businessId` across all domain services, queries, and mutations.
- **🔐 Role-Based Access Control (RBAC)**: Enforced server-side for `PLATFORM_ADMIN`, `BUSINESS_OWNER`, `BUSINESS_MANAGER`, `BUSINESS_STAFF`, and `CUSTOMER`.
- **📊 Real Event-Driven Analytics**: Track verified visits, total active members, repeat-customer retention rates, and redemption velocities derived directly from the immutable transaction ledger.
- **🖨️ Printable QR Counter Signage Kit**: One-click download of high-resolution counter QR codes and ready-to-print table stand signage.
- **💳 Multi-Tier Subscription Engine**: Pre-configured plans (Starter ₹299/mo, Growth ₹499/mo, Pro ₹999/mo, Enterprise) with timing-safe Razorpay webhook verification and sandbox testing indicators.
- **🛡️ Platform Administration**: Multi-tenant operational health monitoring, business directory, and security audit log.

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom semantic design tokens (`#101828`, `#315EFB`, `#F7F8FC`)
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM and version-controlled migrations
- **Authentication**: `jose` (HS256 stateless session JWTs) + `bcryptjs` password hashing + HttpOnly secure cookies
- **Validation**: Zod runtime validation
- **Testing**: Vitest unit & integration test suite (19 passing tests)
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

# Seed demo businesses, cards, staff, and transactions
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

## 👥 Demo Credentials

| Role | Email | Password | What You Can Explore |
| :--- | :--- | :--- | :--- |
| **Business Owner** | `owner@thecoffeehouse.com` | `Password123!` | The Coffee House dashboard, Card Builder, Staff roster, Analytics |
| **Counter Staff** | `barista@thecoffeehouse.com` | `Password123!` | Counter verification terminal & reward redemption |
| **Customer (Active)** | `priya.sharma@example.com` | `Password123!` | Customer wallet with 3 stamps at The Coffee House |
| **Customer (Complete)** | `rahul.verma@example.com` | `Password123!` | Card with 5 stamps & unlocked complimentary coffee |
| **Platform Admin** | `admin@projectrepeat.com` | `AdminPass123!` | System-wide tenant directory & audit log at `/platform-admin` |

---

## 🧪 Counter Verification Walkthrough

1. Open `http://localhost:3000/login` in an incognito window and sign in as `priya.sharma@example.com` (`Password123!`).
2. Go to `/wallet` and click **"Claim Stamp at Counter"** &rarr; a 3-minute 6-digit code appears.
3. In your main browser, sign in as `barista@thecoffeehouse.com` (`Password123!`) and open `/dashboard/the-coffee-house/verify`.
4. Enter the 6 digits and click **"Verify & Award Stamp"** &rarr; the counter ledger records the event and Priya's card updates to 4/5 stamps in real time.

---

## 📂 Project Architecture

```text
src/
  app/
    page.tsx                     # Public marketing homepage
    (marketing)/                 # Features, How it Works, Pricing, FAQ, Contact, Privacy, Terms
    (auth)/                      # Login, Customer Register, Business Guided Onboarding
    (customer)/                  # /wallet, /explore, /account, /b/[slug]
    (business)/                  # /dashboard/[slug] (Overview, Verify, Builder, Staff, Billing, etc.)
    (platform-admin)/            # /platform-admin (Tenant oversight & audit events)
    api/                         # REST Route Handlers (auth, visits, loyalty, staff, webhooks)
  components/
    ui/                          # Button, Input, Card, Badge, Dialog, Table, Tabs
    layout/                      # Navbar, Footer, BusinessSidebar, CustomerNav
    loyalty/                     # LoyaltyCard, StampGrid, StampIcon, VerificationModal
  lib/
    auth/session.ts              # JWT session management & password hashing
    permissions/rbac.ts          # Server-side authorization & tenant isolation
    validation/schemas.ts        # Zod validation schemas
    qr/qrcode.ts                 # High-resolution QR code generator
    db/prisma.ts                 # Prisma Client singleton
  server/services/
    loyalty.ts                   # Loyalty progress & atomic reward redemption
    verification.ts              # Expiring code generation & single-use counter verification
    billing.ts                   # Plan catalog & timing-safe webhook verification
prisma/
  schema.prisma                  # SQLite / PostgreSQL schema
  schema.postgresql.prisma       # Dedicated PostgreSQL production schema
  migrations/                    # Version-controlled migrations
  seed.js                        # Demo seed data script
tests/
  unit/                          # Vitest automated test suite
docs/                            # Architecture, Database, Security, Environment, PRD, Deployment
```

---

## 📄 Documentation

- [Product Requirements Document (PRD)](docs/PRODUCT_REQUIREMENTS.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema & Entity Design](docs/DATABASE.md)
- [Security & Anti-Fraud Guidelines](docs/SECURITY.md)
- [Environment Configuration](docs/ENVIRONMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Strategy](docs/TESTING.md)
- [Implementation Status & Audit](docs/IMPLEMENTATION_STATUS.md)

---

## 📜 License

© House of Workflow. All rights reserved.
