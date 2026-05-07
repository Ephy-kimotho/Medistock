# MediStock

A web-based medical inventory management system designed for clinics, pharmacies, and community health workers operating at the village level. MediStock streamlines medicine tracking, stock control, dispensing, and audit-ready report generation — helping healthcare facilities reduce wastage, prevent stockouts, and maintain regulatory compliance.

## Problem

Small-scale healthcare facilities in rural and underserved areas often rely on manual or fragmented inventory systems. This leads to untracked medicine expiry and preventable wastage, stockouts of critical medications, inaccurate records that complicate health office audits, and poor visibility into usage patterns for informed restocking decisions. MediStock addresses these challenges with a modern, accessible, and role-aware inventory platform.

## Key Features

### Inventory Management
- **Medicine Catalog** — Register medicines with generic names, categories, dosage details, manufacturers, and configurable reorder levels. Supports soft-delete (archive/restore) for data integrity.
- **Stock Entries** — Record incoming stock with batch numbers, quantities, purchase/expiry dates, pricing, and supplier information.
- **Category Organization** — Group medicines into user-defined categories for structured browsing and reporting.

### Dispensing & Wastage
- **FEFO Dispensing** — First-Expiry, First-Out enforcement ensures the earliest-expiring batches are dispensed first. Expired batches are automatically hidden from selection.
- **Batch-Level Tracking** — Select specific batches when dispensing, with real-time available quantity hints and batch info cards.
- **Wastage Recording** — Log wastage by reason (expired, damaged, other) with server-side validation that prevents marking unexpired batches as expired.

### Alerts & Notifications
- **Expiry Warnings** — Configurable warning thresholds (days before expiry) with critical and standard alert levels.
- **Low Stock Alerts** — Automatic detection when stock drops below the defined reorder level.
- **Email Notifications** — Powered by Resend for timely email alerts to administrators and inventory managers.
- **In-App Alerts** — Dashboard and dedicated alerts page with read/unread status tracking.

### Reporting
- **PDF Reports** — Generated server-side with PDFKit covering dispensing activity, stock levels, low stock, and sales/cash-in data.
- **Configurable Periods** — Generate reports on daily, weekly, and monthly intervals with custom date ranges.
- **Audit-Ready** — Reports are structured for health office compliance audits with facility branding and metadata.

### Dashboard
- **Role-Aware Views** — Administrators see recent alerts and system-wide transaction summaries; staff see personal transaction history with patient details.
- **Stat Cards** — At-a-glance metrics including total medicines, low stock count, expiring soon, and expired items.
- **Quick Actions** — Contextual shortcuts for common tasks based on the user's role.

### User Management & Authentication
- **Role-Based Access Control** — Five distinct roles with granular permissions:

  | Role | Scope |
  |------|-------|
  | **Administrator** | Full system access — users, settings, inventory, reports, alerts |
  | **HR Manager** | User onboarding, invitation management |
  | **Inventory Manager** | Medicines, stock, dispensing, wastage, transactions, reports, alerts |
  | **Pharmacist** | Dispensing, wastage recording, personal transaction history |
  | **Auditor** | Read-only access to reports and transaction history |

- **Invitation-Based Onboarding** — Administrators and HR managers send email invitations with role pre-assignment. New users register through a tokenized invitation link.
- **Session Management** — Secure session handling via Better Auth with email verification support.

### Settings
- **Facility Configuration** — Facility name, address, and branding for report headers.
- **Alert Thresholds** — Configurable expiry warning days, critical expiry days, and low stock multipliers.
- **Email Preferences** — Toggle email alerts at the system and individual user level.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Authentication | [Better Auth](https://www.better-auth.com/) |
| Database | [Neon PostgreSQL](https://neon.tech/) (Serverless) |
| ORM | [Prisma](https://www.prisma.io/)  |
| State Management | [TanStack React Query](https://tanstack.com/query) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| Form Handling | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Email | [Resend](https://resend.com/) |
| PDF Generation | [PDFKit](https://pdfkit.org/) |
| Date Utilities | [date-fns](https://date-fns.org/) |

## Project Structure

```
medistock/
├── app/
│   ├── (auth)/              # Login, register, 
│   ├── (dashboard)/         # Protected routes
│   │   ├── dashboard/       # Home dashboard
│   │   ├── inventory/
│   │   │   ├── medicines/   # Medicine catalog CRUD
│   │   │   ├── categories/  # Category management
│   │   │   └── stock/       # Stock entries & management
│   │   ├── transactions/
│   │   │   ├── dispense/    # Medicine dispensing (FEFO)
│   │   │   ├── wastage/     # Wastage recording
│   │   │   └── history/     # Transaction history & search
│   │   ├── reports/         # PDF report generation
│   │   ├── alerts/          # Alert management
│   │   ├── users/           # User management
│   │   ├── invitations/     # Invitation tracking
│   │   ├── onboarding/      # New user invitation requests
│   │   └── settings/        # Facility & system settings
│   ├── api/                 # API routes
│   └── setup/               # First-time facility setup
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   └── ...                  # Feature-specific components
├── lib/
│   ├── actions/             # Server actions (inventory, auth, reports, etc.)
│   ├── hooks/               # React Query hooks & custom hooks (useFilter, useSort, usePermissions)
│   ├── schemas/             # Zod validation schemas
│   └── utils.ts             # Shared utilities & constants
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration history
└── public/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) PostgreSQL database (or any PostgreSQL instance)
- A [Resend](https://resend.com/) API key (for email functionality)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/medistock.git
   cd medistock
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   BETTER_AUTH_SECRET=your-auth-secret
   BETTER_AUTH_URL=http://localhost:3000
   RESEND_API_KEY=your-resend-api-key
   ```

4. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Initial setup**

   Navigate to `/setup` in your browser to create the first administrator account and configure your facility details.

## Database Schema

The core data model consists of the following entities:

- **User** — Authenticated users with role assignments and email preferences.
- **Invitation** — Tokenized invitation records for onboarding new staff.
- **Category** — Logical groupings for medicines.
- **Medicine** — The medicine catalog with dosage, reorder levels, and manufacturer details.
- **StockEntry** — Individual stock batches with quantities, pricing, batch numbers, and expiry dates.
- **Transaction** — An immutable audit log of all dispensing, wastage, and stock adjustment operations.
- **Alert** — System-generated notifications for expiry warnings and low stock conditions.
- **Report** — Metadata for generated PDF reports with file paths and date ranges.
- **Settings** — Facility-wide configuration (alert thresholds, branding, email preferences).

## Development Phases

The project was built across four incremental phases:

1. **Foundation & Authentication** — Project scaffolding, Better Auth integration, role-based middleware, setup flow, and invitation system.
2. **Core Inventory CRUD** — Medicine catalog, category management, stock entry forms with batch tracking, and the Apply/Clear filter pattern across all listing pages.
3. **Dispensing, Wastage & Transactions** — FEFO dispensing logic, wastage recording with reason validation, and a searchable transaction history with role-based visibility.
4. **Alerts, Reports & Polish** — Configurable alert thresholds, email notifications via Resend, PDFKit report generation, dashboard stat cards, and loading skeletons throughout.

## License

This project was developed as a university project at Egerton University.

---

Built by **Ephy** · Egerton University · 2026