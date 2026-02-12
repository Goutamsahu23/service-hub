# Testing Guide – Unified Operations Platform

End-to-end flow to test every feature from signup to public pages.

---

## Prerequisites

1. **Backend running** (from `backend/`):
   ```bash
   npm run dev
   ```
   Server: `http://localhost:4000`

2. **Frontend running** (from `frontend/`):
   ```bash
   npm run dev
   ```
   App: `http://localhost:3000`

3. **PostgreSQL** with migrations applied (`npm run db:migrate` in backend).

---

## 1. Create account (Business Owner)

1. Open **http://localhost:3000**
2. Click **Get started** or **Sign up**
3. Fill the form:
   - **Your name:** e.g. Jane Owner
   - **Email:** e.g. owner@test.com
   - **Password:** e.g. password123 (min 6 chars)
   - **Business name:** e.g. My Salon
   - **Address:** (optional)
   - **Time zone:** e.g. America/New_York
4. Click **Create workspace**
5. You are logged in and redirected to the **Dashboard**

**Result:** You are the **Owner** of a new workspace in **draft** status.

---

## 2. Complete onboarding (activate workspace)

Until you finish onboarding, the workspace is **draft** and public links won’t work for bookings.

1. On the Dashboard, click **Complete setup to activate your workspace →**  
   Or go to **http://localhost:3000/dashboard/onboarding**

2. **Step: Email or SMS**
   - Choose **Email** or **SMS**
   - Check **Use mock** (no real emails/SMS)
   - Click **Save and continue**

3. **Step: Contact form**
   - Click **Create contact form and continue**  
   (Default fields: name, email, message)

4. **Step: Booking types & availability**
   - Add a service: e.g. **Haircut** – **60** min → **Add**
   - Under **Availability**: pick a day (e.g. Mon), start **09:00**, end **17:00** → **Add slot**
   - Click **Continue**

5. **Step: Post-booking forms** (optional)
   - Optionally add a form name and click **Add form**, then **Continue**  
   Or just **Continue**

6. **Step: Inventory** (optional)
   - Optionally add an item (name, quantity, threshold), then **Continue**  
   Or just **Continue**

7. **Step: Staff** (optional)
   - Click **Continue** (invite staff later from Settings)

8. **Step: Activate**
   - Click **Activate workspace**

**Result:** Workspace status becomes **active**. Contact form and booking page go live.

---

## What happens after activation

Right after you click **Activate workspace**:

1. **You are redirected to the Dashboard**  
   The “Complete setup” banner goes away because the workspace is no longer in draft.

2. **These go live (customers can use them without logging in):**
   - **Contact form** – Anyone with the link can submit name, email, message. Each submission creates a **Contact** and a **Conversation** in your **Inbox**; a welcome message is sent (via your connected Email or SMS, or mock).
   - **Booking page** – Anyone with the link can pick a service, date, time, and book. Each booking creates a **Contact** (if new), a **Booking**, and optionally **Form submissions** (if you added post-booking forms). A confirmation is sent (Email/SMS or mock).

3. **What you do next (as Owner):**
   - **Dashboard** – See today’s bookings, upcoming, open conversations, form status, low-stock alerts.
   - **Inbox** – Reply to contact form submissions and any messages (one thread per contact).
   - **Bookings** – See all bookings; mark them **Completed** or **No-show**.
   - **Forms** – See pending/completed post-booking form submissions.
   - **Inventory** – Add or update items; low stock shows on the dashboard.
   - **Settings** – Copy the **public links** (contact form and booking page) to share with customers.

4. **Customer flow (no login):**
   - **Contact first:** Customer uses contact form → you see them in Inbox → you reply and can share the booking link → they book.
   - **Book first:** Customer uses booking page → they get a confirmation → post-booking forms are sent if you set them up → you see the booking and forms in Dashboard / Bookings / Forms.

So after activation, your workspace is **live**: you operate everything from the dashboard, and customers only use the public contact form and booking page links.

---

## 3. Roles (what you can do)

| Role   | Can do                                                                 | Cannot do                                      |
|--------|------------------------------------------------------------------------|-----------------------------------------------|
| **Owner** | Everything: onboarding, integrations, contact form, booking types, forms, inventory, staff, activate, dashboard, inbox, bookings, forms, inventory, settings | — |
| **Staff** | Inbox (reply), Bookings (view/update status), Forms (view), Inventory (view/update qty) | Change settings, integrations, automation, add booking types, activate workspace |

**How to use Staff:** As owner, add staff in Settings → Staff. Otherwise: **Owner** is implemented (signup creates owner). Staff would be added later via “invite staff” To add staff: **Dashboard → Settings → Staff** — enter email, password, optional name, then **Add staff**. Share the login URL and credentials; staff sign in at /login. Staff can use Inbox, Bookings, Forms, Inventory; Settings shows only "Your account" for them.

---

## 4. Dashboard (after login)

**URL:** http://localhost:3000/dashboard

- **Overview:** Today’s bookings, upcoming, open conversations, form stats (pending/overdue/completed), low-stock items, alerts.
- **Inbox:** All conversations (one per contact).
- **Bookings:** List and filter; mark **Complete** or **No-show**.
- **Forms:** List form submissions (pending/completed/overdue).
- **Inventory:** List items; Owner can add items and change quantity; low-stock highlighted.
- **Settings:** Workspace name, status, your account, and **public links** (see below).

---

## 5. Public contact form (no login – customer)

1. Get the link from **Dashboard → Settings**:
   - **Contact form:**  
     `http://localhost:3000/f/{WORKSPACE_ID}/contact`  
   - Replace `{WORKSPACE_ID}` with your workspace id (you can copy it from the Settings page or from the URL when you’re in the dashboard).

   Or open: **http://localhost:3000/f/[paste-workspace-id-here]/contact**

2. As a “customer”:
   - Enter **Name**, **Email**, **Message**
   - Click **Send message**

3. **In the app (as Owner):**
   - **Inbox** should show a new conversation for that contact.
   - Open it and **reply** (Email or SMS; with mock, nothing is really sent).
   - Replying **pauses automation** for that conversation for a while.

**Result:** Lead captured, conversation in Inbox, you can reply from the dashboard.

---

## 6. Public booking page (no login – customer)

1. Get the link from **Dashboard → Settings**:
   - **Booking page:**  
     `http://localhost:3000/f/{WORKSPACE_ID}/book`

2. As a “customer”:
   - **Select service** (e.g. Haircut).
   - **Select date** (e.g. tomorrow).
   - **Select time** from available slots.
   - Enter **Name**, **Email**, **Phone** (optional), **Notes**.
   - Click **Confirm booking**.

3. **In the app (as Owner):**
   - **Dashboard → Overview:** booking appears in “Today’s bookings” or “Upcoming”.
   - **Bookings:** new booking in the list; you can set status to **Completed** or **No-show**.
   - If you added **post-booking forms**, a form submission is created (see **Forms**).
   - With **mock** email/SMS, a “confirmation” is “sent” in logs only.

**Result:** Booking created, contact created, optional form sent; you manage everything from Dashboard and Bookings.

---

## 7. Quick test flow (summary)

| Step | Action | Where |
|------|--------|--------|
| 1 | Sign up (owner) | http://localhost:3000 → Get started |
| 2 | Complete onboarding (email/sms mock, contact form, 1 booking type + availability, activate) | Dashboard → Complete setup → go through all steps |
| 3 | Copy **workspace ID** | Dashboard → Settings (or from URL) |
| 4 | Open contact form | `/f/{WORKSPACE_ID}/contact` |
| 5 | Submit contact form as customer | Fill and send |
| 6 | Reply from Inbox | Dashboard → Inbox → open conversation → reply |
| 7 | Open booking page | `/f/{WORKSPACE_ID}/book` |
| 8 | Book as customer | Choose service → date → time → fill details → confirm |
| 9 | Check dashboard & bookings | Dashboard overview + Bookings list; mark Complete/No-show |
| 10 | (Optional) Add inventory item | Dashboard → Inventory → add item; check low-stock on dashboard |

---

## 8. Finding your workspace ID

- After login, open **Settings**: the workspace name and status are shown; the browser URL when you’re in the app often looks like `http://localhost:3000/dashboard` (workspace id may be in context from `/api/auth/me`).  
- Easiest: **Settings** page can show the public links; those URLs contain the workspace id. Copy the link and take the part between `/f/` and `/contact` or `/book` – that’s your `WORKSPACE_ID`.  
- If the app doesn’t show it yet, you can get it from the **Network** tab: after login, check the response of `GET /api/auth/me`; the body has `workspace.id`. Use that UUID in the public URLs.

---

## 9. Optional: test with a second browser/incognito

- Keep one window logged in as **Owner** (dashboard).
- Use another window (or incognito) to open the **public** contact form and booking page (no login).  
That mimics real customers and you can verify leads and bookings appear in the owner dashboard and Inbox/Bookings.

---

You’ve now tested: account creation, login, roles (owner), onboarding, dashboard, inbox, bookings, forms, inventory, settings, and the public contact form and booking page end to end.

---

## Troubleshooting common backend errors

If you see these in the backend terminal:

| Error | Cause | What to do |
|-------|--------|------------|
| **401 Invalid email or password** | Login with wrong email/password, or email not in DB. | Register first (Create workspace), then log in with that email and password. |
| **404 User not found** (on `GET /auth/me`) | JWT's `userId` is not in `workspace_users` (e.g. DB reset or old token). | Log in again to get a new token. If you reset the DB, re-register and use the new token. |
| **403 Access denied to this workspace** | Request uses a `workspaceId` the current user doesn't belong to. | Ensure the app uses the workspace ID from the login response (or from `/auth/me`). Don't use a different workspace ID in the URL or body. |

**Quick fix for a clean slate:** Run DB migrations, then register a new account and use only that token and workspace ID for testing.
