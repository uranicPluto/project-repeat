# Product Requirements Document (PRD)

## Project Overview
- **Parent Company**: House of Workflow
- **Product Name**: Project Repeat (Digital Loyalty & Customer Retention SaaS Platform)
- **Positioning**: "Turn One-Time Customers Into Repeat Customers."
- **Core Value Proposition**: A simple, modern digital loyalty platform helping local businesses (cafes, restaurants, salons, bakeries, gyms, hotels, retail) reward customers, encourage repeat visits, and understand customer engagement without expensive proprietary hardware or native mobile app downloads.

---

## Target Audience & Personas
1. **Local Business Owner**: Needs a turnkey, branded digital stamp card and loyalty program that drives repeat visits and tracks basic retention metrics.
2. **Business Manager / Staff**: Needs an ultra-fast, friction-free way to verify customer visits, award stamps, and redeem rewards during peak counter service.
3. **Customer / Patron**: Wants a clean, web-based digital loyalty card wallet on mobile with instant access via QR scan, clear reward milestones, and zero hassle.
4. **Platform Administrator**: Monitors multi-tenant health, subscription statuses, audit events, and platform configuration.

---

## Core Feature Specifications

### 1. Multi-Tenant Architecture & Tenant Isolation
- Each business operates in an isolated tenant environment with its own business profile, custom slug (`/b/:slug`), branding, loyalty rules, staff roster, customer enrollments, stamp ledger, and analytics.
- Server-side tenant scoping on every data access query.
- Strict authorization checks preventing cross-business data leakage.

### 2. Digital Loyalty Card Builder
- Configurable stamp milestones (e.g., 5-stamp, 8-stamp, 10-stamp cards).
- Configurable branding: primary & secondary colors, business logo, card title, stamp icons (cup, star, tag, gift), and custom redemption terms.
- Preset templates for Coffee Shops, Bakeries, Salons, and Restaurants.
- Version-controlled loyalty programs ensuring existing customer progress remains valid when program definitions evolve.

### 3. Customer Mobile Experience & Wallet
- 100% responsive mobile web application (no mandatory app store downloads).
- Multi-business loyalty wallet displaying all joined programs, real-time stamp progress, next milestone reward, and visit history.
- Dynamic verification code presentation for fast in-person counter verification.

### 4. Visit Verification & Stamp Engine (Anti-Fraud)
- Staff-assisted verification using short-lived, expiring one-time verification tokens.
- Server-authoritative calculation: balances are derived from an immutable transaction ledger (`LoyaltyTransaction`), not client-side counters.
- Atomic database operations and duplicate request prevention.
- Rate limits on stamp claims per customer/business.

### 5. Configurable Rewards & Atomic Redemption
- Milestone rewards (e.g. Free Coffee, 20% Discount, Free Pastry).
- Strict atomic redemption workflow: prevents double redemption or race conditions.
- Distinct states: `AVAILABLE`, `REDEEMED`, `EXPIRED`, `CANCELLED`.
- Full audit trail recording customer, business, staff member, and timestamp.

### 6. Business Operations Dashboard
- Executive Overview: Active members, verified visits, rewards redeemed, repeat visit rate.
- Customer Management: Masked contact details, enrollment date, total visits, current stamp progress, reward eligibility filters.
- Staff Management: Role-based invitations (Owner, Manager, Staff) with granular permissions.
- Public QR Code generation: High-resolution downloadable PNG & printable signage with business URL.
- Basic Campaigns & Communication Preferences: Opt-in based notifications with strict consent tracking.

### 7. Subscription & Billing Tier Catalog
- **Starter Plan**: INR 299/mo (1 location, up to 200 members, 1 staff account).
- **Growth Plan**: INR 499/mo (1 location, up to 1,000 members, 3 staff accounts, campaigns).
- **Pro Plan**: INR 999/mo (Multi-location ready, unlimited members, unlimited staff, advanced analytics).
- **Enterprise Plan**: Custom configuration.
- Payment provider abstraction (Razorpay adapter for India / international adapter fallback) with signed webhook validation.

### 8. Platform Admin Dashboard
- System-wide metrics, tenant directory, subscription state overrides, operational audit event logs, and least-privilege support tools.
