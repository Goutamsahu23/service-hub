# Unified Operations Platform

One system for service businesses: workspace setup, leads, bookings, forms, inventory, and a single dashboard. Customers interact via public links (no login).

## Tech stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Integrations**: Email (Resend or mock), SMS (Twilio or mock)

## Project structure

```
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # Routes: landing, login, signup, dashboard, public forms/booking
│       ├── contexts/  # Auth context
│       └── lib/       # API client
├── backend/           # Express API
│   └── src/
│       ├── config/
│       ├── db/        # PostgreSQL client + schema
│       ├── integrations/  # Email/SMS (abstracted)
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── types/
└── README.md
```

## Setup

### 1. Database

Create a PostgreSQL database and set:

```bash
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/ops_platform
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:3000
```

### 2. Backend

```bash
cd backend
npm install
npm run db:migrate   # Creates tables from src/db/schema.sql
npm run dev           # Runs on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
# Optional: echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
npm run dev           # Runs on http://localhost:3000
```

## Features

- **Onboarding**: Create workspace → connect Email/SMS (or mock) → contact form → booking types & availability → post-booking forms → inventory (optional) → staff (optional) → activate.
- **Dashboard**: Today’s bookings, upcoming, open conversations, form status, low-stock alerts, key alerts with links.
- **Inbox**: One conversation per contact; reply by email or SMS; automation pauses when staff replies.
- **Bookings**: List/filter; mark completed or no-show; public booking page with type → date → time → details.
- **Forms**: Form templates and submission list; public form submit by link.
- **Inventory**: Items with quantity and low-stock threshold; owner can adjust; alerts on dashboard.
- **Public (no login)**: Contact form at `/f/[workspaceId]/contact`, booking at `/f/[workspaceId]/book`.

## Roles

- **Owner**: Full setup, integrations, activate workspace, settings.
- **Staff**: Inbox, bookings, forms, inventory visibility; cannot change config or automation.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|PATCH /api/workspaces/:id`, `GET /api/workspaces/:id/onboarding`, `POST /api/workspaces/:id/integrations/email|sms`, `PUT /api/workspaces/:id/contact-form`, `POST /api/workspaces/:id/activate`
- `GET /api/contacts/:workspaceId/contacts`, `GET /api/contacts/:workspaceId/contacts/:contactId`
- `GET /api/inbox/:workspaceId/conversations`, `GET /api/inbox/:workspaceId/conversations/:id`, `GET .../messages`, `POST .../reply`
- `GET|POST /api/bookings/:workspaceId/booking-types`, `GET|PUT .../availability`, `GET /api/bookings/:workspaceId/bookings`, `PATCH .../bookings/:id/status`
- `GET|POST /api/forms/:workspaceId/templates`, `GET /api/forms/:workspaceId/submissions`, `GET .../submissions/:id`
- `GET|POST|PATCH /api/inventory/:workspaceId/items`, `PATCH .../items/:id`
- `GET /api/dashboard/:workspaceId`
- `GET /api/public/contact-form/:workspaceId`, `POST .../submit`, `GET /api/public/booking/:workspaceId`, `GET .../slots`, `POST .../booking`, `GET/POST /api/public/form/:submissionId`

## Integrations

- **Email**: Set `provider: "resend"` and `apiKey` (and optional `fromEmail`) in workspace integration. Use `provider: "mock"` for testing.
- **SMS**: Set `provider: "twilio"` with `accountSid`, `authToken`, `phoneNumber`. Use `provider: "mock"` for testing.

Failures are logged in `integration_logs` and surfaced without breaking core flows.
