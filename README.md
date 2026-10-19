# CareerPilot AI — Your AI-Powered Career Companion

> **University AI Integration Capstone Project**  
> A production-grade, full-stack career acceleration platform built with Next.js 16, TypeScript, MongoDB, Mongoose, and Google Gemini AI.

---

## 🚀 Overview

**CareerPilot AI** bridges the gap between university graduates, entry-level engineers, and modern hiring bars. It provides end-to-end career guidance: from parsing and scoring resumes against modern Applicant Tracking Systems (ATS) to detecting critical technical skill gaps, organizing application pipelines, and conducting AI-driven mock interviews using structured STAR evaluation rubrics.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack, React 19) |
| **Language** | TypeScript (Strict mode) |
| **Database** | MongoDB & Mongoose ORM |
| **Authentication** | Auth.js / NextAuth v5 (Credentials, Bcrypt 12 salt rounds, JWT session strategy) |
| **Authorization** | Role-Based Access Control (`USER` and `ADMIN`) with middleware and server helpers |
| **Validation** | Zod v4 schemas for server & client input verification |
| **UI & Styling** | Tailwind CSS v4, Lucide Icons, class-variance-authority, custom dark-first design system |
| **AI Integration** | Google Gemini API (Server-side schema isolation) |

---

## 📂 Project Architecture

```
CareerPilot AI/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── resume/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── applications/page.tsx
│   │   ├── interview/page.tsx
│   │   ├── skills/page.tsx
│   │   └── analytics/page.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── features/page.tsx
│   │   └── about/page.tsx
│   ├── admin/
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts
│   │       └── register/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/ (button, card, badge, input, container)
│   ├── layout/ (navbar, footer, session-provider, sign-out-button)
│   └── [dashboard, resume, jobs, applications, interview, skills, charts]/
├── lib/
│   ├── mongodb.ts (cached Mongoose connection singleton)
│   ├── auth.ts (NextAuth v5 Node handler + requireAuth / requireAdmin helpers)
│   ├── validations.ts (Zod schemas for Auth, Profile, and Jobs)
│   ├── constants.ts
│   └── utils.ts
├── models/
│   └── User.ts (User Mongoose model with roles, indexes, and password masking)
├── scripts/
│   └── seed-admin.mjs (Safe development admin seeding script)
├── types/
│   ├── index.ts
│   └── next-auth.d.ts (Session & JWT module augmentations)
├── auth.config.ts (Edge-compatible Auth.js middleware config)
├── middleware.ts (Next.js route protection & redirect handler)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔒 Authentication & Authorization Architecture

1. **Password Security**: Passwords are never stored in plaintext. They are salted and hashed with **bcryptjs** (12 salt rounds) prior to database insertion.
2. **Sanitization**: Mongoose `toJSON` transforms permanently strip `passwordHash` and internal versioning keys before objects are serialized.
3. **Session Strategy**: Authenticated sessions utilize cryptographically signed server JWT tokens managed by Auth.js v5.
4. **Role-Based Access Control (RBAC)**:
   - `USER`: Access to candidate dashboard, resume management, application tracking, and interview simulator.
   - `ADMIN`: Elevated access to system administration and candidate management at `/admin`.
5. **Route Protection**:
   - Next.js Edge Middleware (`middleware.ts` + `auth.config.ts`) inspects incoming requests and redirects unauthenticated traffic to `/login?callbackUrl=...`.
   - Server-side helpers (`requireAuth()`, `requireAdmin()`, `getCurrentUser()`) enforce authorization directly inside Server Components and Route Handlers.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Default / Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/careerpilot-ai` |
| `AUTH_SECRET` | NextAuth secret (generate via `openssl rand -base64 32`) | `development-secret-careerpilot-ai-secure-token-2026` |
| `GEMINI_API_KEY` | Google Gemini API key (Server-only) | `AIzaSy...` |
| `NEXT_PUBLIC_APP_URL` | Application root URL | `http://localhost:3000` |

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18.18+ or v20+ / v22+)
- **MongoDB** running locally or a MongoDB Atlas connection string.

### 2. Installation
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build Verification
```bash
npm run build
```

### 5. Automated Verification Suites
```bash
# Test Stage 2: Database, Registration, NextAuth & Route Protection
npm run test:auth

# Test Stage 3: Profile API, Skills Management, Completion Bar & Dashboard Shell
npm run test:stage3

# Test Stage 4: AI Career Engine (Resume Upload, PDF Extraction, Gemini Analysis, Job Matcher, Skill Gap)
npm run test:stage4

# Test Stage 5: Career Management, Analytics, AI Interview Prep & Admin Dashboard
npm run test:stage5

# Test Stage 6: Final Security Audit, Multi-Tenant Isolation & Environment Hygiene
npm run test:stage6
```

---

## 🎯 Stage 6: Final Polish, Security Audit & Submission Readiness

### 1. Final Security & Multi-Tenancy Audit
- **Zero Secrets in Code**: Verified that `GEMINI_API_KEY`, database credentials, and session tokens are never committed or exposed via `NEXT_PUBLIC_`.
- **IDOR Immunity**: Cryptographically verifies `sessionUser.id` on every resource retrieval and mutation. Unauthorized cross-user requests receive `404 Not Found`.
- **Safe Division Guarantee**: All mathematical ratios and conversion rates employ zero-checks to eliminate `NaN` or `Infinity`.
- **Server-Only Resume Storage**: Candidate PDFs reside exclusively in private `/uploads` server directories outside the public web root.

### 2. Full Regression Suite (145/145 Passed)
- Stage 2 Auth: 17/17 passed
- Stage 3 Profile & Shell: 33/33 passed
- Stage 4 AI Career Engine: 43/43 passed
- Stage 5 Career Pipeline & Analytics: 38/38 passed
- Stage 6 Final Security Audit: 14/14 passed
- Total: 145/145 tests passed (100% success rate)

---

## 🎯 Stage 5: Career Management, Analytics, Interview Intelligence & Admin Insights

### 1. Application Tracker (`/applications`)
- **Pipeline Stages**: `SAVED` ➔ `APPLIED` ➔ `SCREENING` ➔ `INTERVIEW` ➔ `OFFER` (and `REJECTED`).
- **Comprehensive Data Model**: Company, job title, location, employment type (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `OTHER`), salary range, application URL, applied date, interview date, source, and interview notes.
- **Dynamic Search & Filtering**: Multi-field search across company, job title, and location; filter by pipeline status and employment type; sort by newest, oldest, company name, interview date, or status.
- **Responsive Layout**: Clean desktop tabular view automatically transitions to accessible cards on mobile screens to avoid horizontal overflow.
- **Tenant Isolation**: Complete IDOR protection; `userId` is always derived strictly from authenticated session.

### 2. Career Analytics (`/analytics`)
- **Zero Fake Data Guarantee**: Every metric, conversion rate, and distribution curve is computed live from MongoDB via aggregation pipelines.
- **Funnel & Rate Analysis**: Computes real conversion rates with safe division (preventing `NaN` or `Infinity` on zero applications):
  - Total Applications
  - Applications Logged This Month
  - Active Interviews & Interview Rate (`interviews / totalApplications`)
  - Offers Received & Offer Rate (`offers / totalApplications`)
  - Rejection Rate (`rejected / totalApplications`)
- **Interactive Visualizations**: Powered by **Recharts**:
  - Application Pipeline Funnel (Bar chart)
  - 6-Month Application Volume Trend (Area chart)
  - Status Distribution (Donut chart)
  - Top Target Companies (Ranked breakdown)
- **Honest Empty State**: If zero applications have been logged, clean empty state encourages candidate to log their first application instead of rendering misleading 0-charts.

### 3. AI Interview Preparation (`/interview-prep`)
- **Context-Grounded Generation**: Questions are grounded in candidate competencies, resume text, uploaded ATS analysis, and linked applications.
- **Session Types & Difficulties**:
  - `GENERAL`, `TECHNICAL`, `BEHAVIORAL`, `JOB_SPECIFIC`
  - `EASY`, `MEDIUM`, `HARD`
- **Interactive Practice Studio**: Single-question focus interface with timer, answer textarea, and instant STAR-rubric AI evaluation.
- **Instant AI STAR Feedback**:
  - Numerical score (0-100)
  - Strengths identified
  - Constructive areas for improvement
  - Model senior-engineer response (`improvedAnswer`)
- **Holistic Session Assessment**: Aggregate performance score, personalized coaching recommendations, and session persistence in MongoDB (`InterviewSession` model).
- **Interview History**: Review past sessions, practice logs, and track score progression over time.

### 4. Admin Dashboard & System Insights (`/admin`)
- **Restricted Access**: Enforced server-side using `requireAdmin()` and RBAC checks; unauthorized normal users receive `403 Forbidden` / redirect.
- **System KPIs**: Real-time aggregated platform metrics:
  - Total Registered Candidates
  - New Candidate Growth This Month
  - Uploaded & Scanned Resumes
  - Total Applications Tracked Across System
  - Completed Interview Simulation Sessions
  - Total System-Wide Offers
- **Candidate Directory**: Real user directory with live search by name and email, role badges, registration timestamps, and calculated profile completion meters.
- **Security Sanitization**: User management API strictly strips `passwordHash`, credentials, internal system tokens, and private filesystem paths.

### 5. Known Limitations
- **Scanned Image PDFs**: Resumes composed solely of flat image scans without text layers are detected and rejected with a friendly message advising candidates to upload text-based PDFs.
- **Encrypted/Password-Protected PDFs**: Password-protected PDFs are rejected safely during upload with appropriate user-facing guidance.

---

## 🛡️ Creating a Development Admin Account

CareerPilot AI avoids hardcoded passwords in codebase files. You can safely create or promote an admin account using the provided seed utility:

```bash
# Syntax: node scripts/seed-admin.mjs <email> <password> [name]
node scripts/seed-admin.mjs admin@careerpilot.ai AdminPassword123 "Lead Administrator"
```

Or via environment variables:
```bash
ADMIN_EMAIL=admin@careerpilot.ai ADMIN_PASSWORD=AdminPassword123 npm run seed:admin
```

> **Note**: Passwords must be at least 8 characters long, contain at least 1 uppercase letter, and 1 number.

---

## 🧭 Protected Routes Reference

| Route | Minimum Role | Redirect on Failure |
|---|---|---|
| `/dashboard` | `USER` | `/login?callbackUrl=/dashboard` |
| `/profile` | `USER` | `/login?callbackUrl=/profile` |
| `/resume` | `USER` | `/login?callbackUrl=/resume` |
| `/job-analysis` | `USER` | `/login?callbackUrl=/job-analysis` |
| `/job-matcher` | `USER` | `/login?callbackUrl=/job-matcher` |
| `/applications` | `USER` | `/login?callbackUrl=/applications` |
| `/interview-prep` | `USER` | `/login?callbackUrl=/interview-prep` |
| `/skills` | `USER` | `/login?callbackUrl=/skills` |
| `/analytics` | `USER` | `/login?callbackUrl=/analytics` |
| `/admin` | `ADMIN` | `/login` (if guest) or `/dashboard?error=unauthorized` (if USER) |
| `/login` | Guest | `/dashboard` (if already authenticated) |
| `/register` | Guest | `/dashboard` (if already authenticated) |

