# 🚀 PredicVerse — Production Cloud Deployment Guide

This guide provides step-by-step instructions for deploying **PredicVerse** to production using **Cloud PostgreSQL** (Neon / Supabase), **Render / Railway** (Express REST API), and **Vercel** (React 18 + Vite Frontend).

---

## 🏗️ System Architecture

```text
  React 18 + Vite Client (Vercel)
                 │
  (HTTPS / JWT Authorization Header)
                 │
                 ▼
Node.js + Express REST API (Render / Railway)
  ├── CORS Middleware (Enforces CLIENT_ORIGIN)
  ├── Global Error Handler (Sanitizes DB Errors)
  └── Services (Auth, Weather, Currency, Gemini AI)
                 │
                 ▼
Prisma ORM (Cloud PostgreSQL — Neon / Supabase)
```

---

## 🗄️ 1. Database Setup (Cloud PostgreSQL)

PredicVerse requires a PostgreSQL database instance. Recommended providers: **Neon** (serverless PostgreSQL) or **Supabase**.

1. Create a new PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the database connection strings:
   - **`DATABASE_URL`**: Pooled or transactional connection string (e.g. `postgresql://user:password@ep-name.us-east-2.aws.neon.tech/predicverse?sslmode=require`)
   - **`DIRECT_URL`**: Direct connection string used for Prisma migrations (if using PgBouncer/connection pooler).

---

## ⚡ 2. Backend API Deployment (Render / Railway)

### Render Setup
1. Log in to [Render](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Set Environment Variables in Render Dashboard:

| Variable | Recommended Value / Description |
| :--- | :--- |
| `DATABASE_URL` | Cloud PostgreSQL Connection String |
| `DIRECT_URL` | Direct Cloud PostgreSQL Connection String |
| `JWT_SECRET` | Secure random string (minimum 32 characters) |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-1.5-flash` |
| `TRAVEL_PROVIDER` | `amadeus` (External flight/hotel travel search provider) |
| `AMADEUS_CLIENT_ID` | *(Optional)* Amadeus Self-Service API Key |
| `AMADEUS_CLIENT_SECRET` | *(Optional)* Amadeus Self-Service API Secret |
| `CLIENT_ORIGIN` | `https://your-predicverse-app.vercel.app` (Vercel Frontend URL) |
| `NODE_ENV` | `production` |

5. Run Production Migrations & Seed Data:
   In the Render shell or terminal connected to the production DB:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

---

## 🎨 3. Frontend Deployment (Vercel)

### Vercel Setup
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variable in Vercel Dashboard:

| Variable | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://your-backend-api.onrender.com` (Your deployed Render backend URL) |

5. Deploy. Vercel automatically processes SPA route rewrites configured in `client/vercel.json`.

---

## 🔐 4. Environment Variables Checklist

### Backend (`server/.env`)
```env
DATABASE_URL="postgresql://user:password@host:5432/predicverse?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/predicverse?sslmode=require"
JWT_SECRET="replace_with_a_secure_random_string_minimum_32_characters"
GEMINI_API_KEY="your_optional_gemini_api_key"
GEMINI_MODEL="gemini-1.5-flash"
CLIENT_ORIGIN="https://your-predicverse-app.vercel.app"
NODE_ENV="production"
PORT=3001
```

### Frontend (`client/.env`)
```env
VITE_API_URL="https://your-backend-api.onrender.com"
```

> [!IMPORTANT]
> Never place server secrets (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`) into `client/.env` or Vite environment variables exposed to the browser.

---

## 🧪 5. Post-Deployment Verification

After deploying, verify health and API connectivity:

1. **Backend Health Check:**
   ```bash
   curl -i https://your-backend-api.onrender.com/health
   ```
   *Expected Response (`200 OK`):*
   ```json
   {
     "status": "ok",
     "service": "PredicVerse Backend Gazette Service",
     "database": "connected",
     "timestamp": "2026-09-27T00:55:00.000Z",
     "version": "1.0.0-phase2"
   }
   ```

2. **Frontend SPA Navigation:**
   Visit `https://your-predicverse-app.vercel.app`, log in or register, create a trip, add a wishlist item, and test Travel DNA calculation.

3. **CORS Enforcement Verification:**
   Cross-origin requests from non-allowed domains will be blocked cleanly without exposing internal server stack traces.

---

## 🛠️ Local Production Build Verification Commands

To verify full production compilation and test suites locally before pushing to production:

```bash
# 1. Validate Prisma Schema
cd server
npx prisma validate

# 2. Generate Prisma Client
npx prisma generate

# 3. Build Express Backend (TypeScript compilation)
npm run build

# 4. Build Vite Frontend (Production Bundle)
cd ../client
npm run build

# 5. Run Backend Verification Suites
cd ../server
npx tsx src/test-live-proof.ts
npx tsx src/test-phase1-security.ts
npx tsx src/test-travel-search.ts
```
