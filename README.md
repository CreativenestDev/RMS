# White-Label Multi-Tenant Restaurant Ordering & Management Platform

A production-grade, white-label SaaS platform engineered for independent restaurants. The platform features strict tenant data isolation, dynamic theming and branding, real-time kitchen display and order tracking via Server-Sent Events (SSE), and four distinct operational experiences from a single codebase.

---

## 🌟 The Four Surfaces

1. **Customer Storefront (`/`, `/menu`, `/checkout`, `/track/[orderNumber]`)**
   - Dynamic branding, custom color scheme, logo, and cover photography.
   - Comprehensive menu browsing with real-time search, category quick-scroll, and dietary filtering (Halal, Spicy, Veg, Vegan, Gluten-Free).
   - Product customization modal with required/optional modifier constraints and live price delta.
   - Cart drawer with modifier breakdown and subtotal tracker.
   - Streamlined checkout with Delivery vs. Pickup, delivery zone fee calculator, promotional coupon validator (`WELCOME10`, `BURGER5`, `FEAST20`), and Pluggable Payment gateways (Cash on Delivery, Pay at Restaurant).
   - Real-time visual order pipeline tracker (`/track/[orderNumber]`) updated live via Server-Sent Events (SSE).

2. **Restaurant Manager Dashboard (`/admin`)**
   - KPI metrics: Today's revenue, order count, average ticket size, and status counts.
   - Live Orders Kanban Pipeline (`/admin/orders`) with Web Audio POS chimes on incoming orders.
   - Immediate order action advancement: Accept → Send to Cooking → Mark Ready → Out for Delivery → Complete.
   - Printable thermal kitchen tickets (`window.print()`).
   - Catalog management: Products, Categories, and Modifier Groups CRUD.
   - Promotional discount codes management.
   - White-Label Settings: Restaurant name, primary and secondary brand colors, currency symbol, tax rate, operating hours, and delivery zones.
   - Sales analytics and one-click Order CSV Export.

3. **Kitchen Display System (KDS) (`/kitchen`)**
   - High-contrast, large-button touchscreen board designed for kitchen environments.
   - Real-time incoming tickets with color-coded elapsed time urgency:
     - 🟢 Green: < 10 mins
     - 🟡 Amber: 10 - 20 mins
     - 🔴 Red: > 20 mins (Urgent alert)
   - Clear itemization with prominent modifier selections and special notes.
   - One-touch BUMP buttons: `START PREPARING` → `MARK READY` → `DONE`.
   - Fullscreen and audio chime toggles.

4. **Platform Super Admin (`/super-admin`)**
   - Multi-tenant overview across all independent restaurants.
   - Instant Tenant Provisioning: automatically creates isolated restaurant records, default branch, business hours, and manager user.
   - Tenant suspension and active toggle.

---

## 🔑 Demo Credentials

| Role | Email | Password | Surface URL |
| :--- | :--- | :--- | :--- |
| **Platform Super Admin** | `superadmin@platform.com` | `admin123` | `/super-admin/login` |
| **Restaurant Manager** | `admin@urbanbites.com` | `admin123` | `/admin/login` |
| **Kitchen Staff** | `kitchen@urbanbites.com` | `kitchen123` | `/admin/login` (redirects to `/kitchen`) |
| **Front Staff** | `staff@urbanbites.com` | `staff123` | `/admin/login` |

---

## 🛠 Tech Stack

- **Framework:** Next.js 15+ (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons + Dynamic CSS Variable theming
- **Database:** SQLite via Prisma ORM (schema ready for PostgreSQL)
- **Real-Time:** Server-Sent Events (SSE) + In-memory Tenant Event Bus
- **Audio Alerts:** Web Audio API synthesized POS chimes (zero external assets)
- **Authentication:** Custom JWT with HTTP-only secure cookies and RBAC

---

## 🚀 Getting Started

### 1. Installation & Setup
```bash
npm install
```

### 2. Push Database Schema & Seed
```bash
npx prisma db push
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.