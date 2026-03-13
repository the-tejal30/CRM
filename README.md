# SalesPilot — Multi-Tenant Sales CRM

A production-quality, multi-tenant CRM application built with the MERN stack. Supports multiple organizations, role-based access, AI lead insights, email OTP authentication, WhatsApp outreach, and full profile photo management.

---

## Features

### Authentication & Security
- **JWT-based auth** — tokens stored in localStorage, attached via Axios interceptor
- **Email OTP verification** — required on registration (via Google Apps Script + Gmail)
- **Forgot password via OTP** — 6-digit OTP sent to email, expires in 10 minutes
- **Admin password reset** — admins can reset any team member's password from the Team page
- **Role-based access control** — Admin vs Employee with server-side enforcement
- **Account deactivation** — admins can deactivate/reactivate users (blocked on login)

### Multi-Tenancy
- Every document (Lead, Task, Note, User) carries `organizationId`
- All queries scoped to `req.user.organizationId` — cross-tenant access is impossible
- Each organization gets a unique **invite code** for team members to join
- Org profile: name, logo, industry, website

### Leads Management
- Create, edit, delete leads (Admin only for delete)
- Fields: name, email, phone, company, status, source, deal value, assigned to
- Status pipeline: `New → Contacted → Qualified → Won → Lost`
- **Search** by name/email/company, **filter** by status
- **Pagination** (20 per page)
- **CSV export** of all leads
- Employees only see leads assigned to them

### Lead Details
- Full lead info with color-coded status bar
- **WhatsApp outreach** — one-click opens WhatsApp with pre-filled message
- **Email outreach** — one-click opens mail client with pre-filled subject/body
- **Notes** — timestamped notes per lead with author photo
- **AI Lead Insight** — scores lead (0–100), predicts closing probability, suggests next action

### Tasks
- Create tasks with title, due date, priority, assigned user
- Mark complete/incomplete
- Filter by status and priority
- Role-based: employees see only their tasks

### Team Management (Admin only)
- View all organization members with role, status, join date, profile photo
- **Edit member** — name, email, role, password reset
- **Activate / Deactivate** members
- **Remove** members from org
- Read-only view for Employee role

### Profile & Organization
- **Profile photo upload** — base64 stored in MongoDB, shown everywhere
- **Update name, email, password** from profile modal
- **Organization logo upload** — shown in sidebar (overlapping with SalesPilot icon), org card, company modal
- **Organization settings** — name, industry, website, logo (Admin only)

### Dashboard
- **Admin**: KPI cards (total leads, won deals, revenue, conversion rate), revenue bar chart, status breakdown, recent leads table
- **Employee**: Personal welcome card with profile photo, quick links to My Leads and My Tasks

### UI / UX
- Fully **responsive** — mobile card layouts, desktop tables
- Dark sidebar with SalesPilot branding + org logo overlapping
- Profile photos shown throughout: sidebar, navbar, team list, notes, leads table
- **WhatsApp** button in leads table (hover on desktop, always visible on mobile)
- Mobile-friendly lead details with wrapping outreach buttons

---

## Project Structure

```
CRM/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, OTP, profile
│   │   ├── leadController.js      # CRUD + analytics + AI insight
│   │   ├── taskController.js      # Task CRUD
│   │   ├── noteController.js      # Notes CRUD
│   │   ├── userController.js      # User management (admin)
│   │   └── organizationController.js
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verify + user load
│   ├── models/
│   │   ├── User.js
│   │   ├── Organization.js
│   │   ├── Lead.js
│   │   ├── Task.js
│   │   ├── Note.js
│   │   └── PendingOtp.js          # TTL-indexed OTP store (10 min)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── userRoutes.js
│   │   └── organizationRoutes.js
│   ├── utils/
│   │   └── aiInsight.js           # AI scoring (OpenAI or mock)
│   └── server.js                  # Express app, 5mb body limit
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js           # Axios instance + JWT interceptor + 401 redirect
        ├── components/
        │   ├── Sidebar.jsx        # Dark sidebar, org+app logo overlap
        │   ├── Navbar.jsx         # Profile modal, company modal, mobile menu
        │   ├── LeadsTable.jsx     # Mobile cards + desktop table
        │   ├── LeadForm.jsx       # Create/edit lead form
        │   ├── DashboardCards.jsx # KPI stat cards
        │   ├── AnalyticsCharts.jsx# Revenue bar chart + status pie
        │   └── TasksList.jsx      # Tasks list component
        ├── context/
        │   ├── AuthContext.jsx    # User state, login/logout/register
        │   └── SidebarContext.jsx # Mobile sidebar open/close
        ├── icons/                 # SVG icon components
        └── pages/
            ├── Login.jsx
            ├── ForgotPassword.jsx
            ├── OrganizationSetup.jsx  # Register with email OTP flow
            ├── Dashboard.jsx
            ├── Leads.jsx
            ├── LeadDetails.jsx
            ├── Tasks.jsx
            └── Users.jsx
```

---

## Quick Start

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables

**`backend/.env`**
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
APPS_SCRIPT_SECRET=your_shared_secret
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Run

```bash
# Terminal 1
cd backend && node server.js

# Terminal 2
cd frontend && npm run dev
```

App runs at **http://localhost:5173**

---

## Email OTP Setup (Google Apps Script)

OTP emails are sent via a free Google Apps Script web app — no SMTP credentials needed.

1. Go to [script.google.com](https://script.google.com) → New Project
2. Paste this code:

```javascript
const SECRET = 'your_shared_secret'; // must match APPS_SCRIPT_SECRET

function doPost(e) {
  try {
    const { email, otp, subject, secret } = JSON.parse(e.postData.contents);
    if (secret !== SECRET) return out({ error: 'Unauthorized' });
    MailApp.sendEmail({ to: email, subject: subject || 'Your OTP', htmlBody: buildHtml(otp, subject) });
    return out({ success: true });
  } catch (err) { return out({ error: err.message }); }
}

function buildHtml(otp, subject) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
    <h2 style="text-align:center;color:#0f172a;">${subject || 'Your OTP'}</h2>
    <div style="background:#fff;border-radius:10px;padding:24px;text-align:center;border:1px solid #e2e8f0;">
      <p style="font-size:36px;font-weight:800;letter-spacing:.3em;color:#4f46e5;margin:0;">${otp}</p>
      <p style="color:#94a3b8;font-size:12px;margin:12px 0 0;">Expires in 10 minutes</p>
    </div>
  </div>`;
}

function out(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → Web app → Execute as **Me** → Access **Anyone** → Deploy
4. Copy the URL → set as `APPS_SCRIPT_URL` in `backend/.env`

If `APPS_SCRIPT_URL` is not configured, OTP is skipped gracefully on registration and password reset falls back to admin reset.

---

## API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Register + create or join org (with email OTP) |
| POST | `/api/auth/login` | Public | Login → returns JWT + user info |
| GET | `/api/auth/me` | JWT | Get current user profile |
| PUT | `/api/auth/profile` | JWT | Update name, email, password, avatar |
| POST | `/api/auth/send-registration-otp` | Public | Send OTP before registration |
| POST | `/api/auth/forgot-password` | Public | Send OTP to registered email |
| POST | `/api/auth/reset-password` | Public | Verify OTP + set new password |

### Leads
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/leads` | JWT | List leads (employees: own only). Query: `status`, `search`, `page`, `limit` |
| POST | `/api/leads` | JWT | Create lead |
| GET | `/api/leads/analytics` | JWT+Admin | Dashboard KPIs + charts |
| POST | `/api/leads/ai-insight` | JWT | AI score + analysis for a lead |
| GET | `/api/leads/:id` | JWT | Lead detail |
| PUT | `/api/leads/:id` | JWT | Update lead |
| DELETE | `/api/leads/:id` | JWT+Admin | Delete lead + cascade delete notes |

### Tasks
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/tasks` | JWT | List tasks (employees: own only) |
| POST | `/api/tasks` | JWT | Create task |
| PUT | `/api/tasks/:id` | JWT | Update task |
| DELETE | `/api/tasks/:id` | JWT | Delete task |

### Notes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/notes/lead/:leadId` | JWT | Get notes for a lead |
| POST | `/api/notes` | JWT | Add note to a lead |
| DELETE | `/api/notes/:id` | JWT | Delete note |

### Users (Admin only)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/users` | JWT+Admin | List org members |
| PUT | `/api/users/:id` | JWT+Admin | Update name, email, role, password, isActive |
| DELETE | `/api/users/:id` | JWT+Admin | Remove user from org |

### Organizations
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/organizations/me` | JWT | Get org info + invite code |
| PUT | `/api/organizations/me` | JWT+Admin | Update name, logo, industry, website |
| GET | `/api/organizations/members` | JWT | Get all org members |

---

## Role Permissions

| Feature | Admin | Employee |
|---------|-------|----------|
| View all leads | ✅ | ❌ assigned only |
| Create leads | ✅ | ✅ |
| Delete leads | ✅ | ❌ |
| Assign leads to others | ✅ | ❌ |
| View analytics dashboard | ✅ | ❌ |
| Manage team members | ✅ | ❌ |
| Edit organization profile | ✅ | ❌ |
| View team (read-only) | ✅ | ✅ |
| Add/delete notes | ✅ | ✅ |
| Create/manage own tasks | ✅ | ✅ |
| AI lead insight | ✅ | ✅ |

---

## Deployment

### MongoDB Atlas
1. Create free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Network Access → Add `0.0.0.0/0`
3. Copy URI → use as `MONGO_URI`

### Backend on Render
1. New Web Service → connect GitHub repo
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Environment variables:
   ```
   MONGO_URI, JWT_SECRET, NODE_ENV=production,
   CLIENT_URL=https://your-app.vercel.app,
   APPS_SCRIPT_URL, APPS_SCRIPT_SECRET
   ```

### Frontend on Vercel
1. New Project → import repo
2. Root directory: `frontend`
3. Framework preset: Vite
4. Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6, Axios, Recharts |
| Backend | Node.js 22, Express.js, Mongoose, JWT, bcryptjs |
| Database | MongoDB (local or Atlas) |
| Email OTP | Google Apps Script + Gmail (MailApp) |
| AI Insight | OpenAI GPT-3.5 (with deterministic mock fallback) |
| Image Storage | Base64 in MongoDB (avatarUrl, logoUrl) — max 500KB |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |
