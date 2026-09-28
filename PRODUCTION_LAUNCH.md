# PredicVerse — Production Launch Guide

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Frontend (React)  │────▶│  Backend (Express)   │────▶│   PostgreSQL     │
│   Vercel / Netlify  │     │  Render / Railway    │     │   Neon / Supabase│
│   Static SPA        │     │  Node.js Server      │     │   Cloud DB       │
└─────────────────────┘     └─────────────────────┘     └──────────────────┘
                                     │
                              ┌──────┴──────┐
                              │ Google       │
                              │ Gemini AI    │
                              └─────────────┘
```

## Deployment Order

> [!IMPORTANT]
> Deploy in this exact order to avoid broken references.

1. **PostgreSQL Database** (Neon / Supabase)
2. **Backend API** (Render / Railway)
3. **Frontend Client** (Vercel)

---

## 1. Database Setup (Neon / Supabase)

### Create Database

1. Sign up at [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a new PostgreSQL database named `predicverse`
3. Copy the connection string

### Connection String Format

```
postgresql://USER:PASSWORD@HOST:5432/predicverse?schema=public&sslmode=require
```

### Run Migrations

```bash
cd server
DATABASE_URL="your_connection_string" npx prisma migrate deploy
```

> [!CAUTION]
> Never run `prisma migrate reset` on a production database. It will destroy all data.

---

## 2. Backend Deployment (Render)

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `DIRECT_URL` | ✅ | Direct PostgreSQL URL (same as DATABASE_URL for most providers) |
| `JWT_SECRET` | ✅ | Unique 128-char hex string — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey) |
| `GEMINI_MODEL` | Optional | Default: `gemini-1.5-flash` |
| `PORT` | Optional | Default: `3001` (Render sets this automatically) |
| `NODE_ENV` | ✅ | Set to `production` |
| `CLIENT_ORIGIN` | ✅ | Frontend URL, e.g. `https://predicverse.vercel.app` |

### Build & Start Commands

```
Build Command:
npm install && npx prisma generate && npm run build

Start Command:
npm run db:migrate && npm start
```

### Render Configuration

- **Runtime**: Node
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && node dist/index.js`
- **Health Check Path**: `/health`

### Railway Configuration

- **Builder**: Nixpacks
- **Start Command**: `npx prisma migrate deploy && node dist/index.js`
- **Health Check Path**: `/health`

---

## 3. Frontend Deployment (Vercel)

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend URL, e.g. `https://predicverse-api.onrender.com` (NO trailing slash) |

### Build Configuration

```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### SPA Routing

Create `client/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures client-side routes like `/shared/trips/:token`, `/planner`, `/passport` work correctly.

---

## 4. CORS Configuration

The backend enforces strict CORS in production:

- In production (`NODE_ENV=production`), only origins listed in `CLIENT_ORIGIN` are allowed
- Requests with no `Origin` header are rejected in production
- Multiple origins can be comma-separated: `https://predicverse.vercel.app,https://www.predicverse.com`

---

## 5. Gemini AI Configuration

| Setting | Value |
|---|---|
| API Key Source | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| Default Model | `gemini-1.5-flash` |
| Request Timeout | 12 seconds |
| Fallback | Deterministic algorithm (always available) |
| Output Validation | Zod schema enforcement |

If `GEMINI_API_KEY` is empty or invalid, the system gracefully falls back to the deterministic itinerary generator. No user-facing errors occur.

---

## 6. Production Testing

After deployment, verify all systems:

```bash
# Health check
curl https://your-backend.onrender.com/health

# Expected response:
# {"status":"ok","service":"PredicVerse Backend Gazette Service","version":"1.0.0","environment":"production","database":"connected","uptime":...,"timestamp":"..."}
```

### Local E2E Test

```bash
cd server
npx tsx src/test-final-production.ts
# Expected: 34/34 PASS
```

### Security Regression

```bash
cd server
npx tsx src/test-phase1-security.ts
# Expected: 16/16 PASS

npx tsx src/test-trip-collaboration.ts
# Expected: 21/21 PASS
```

---

## 7. Troubleshooting

### Database Connection Fails

- Verify `DATABASE_URL` includes `?sslmode=require` for cloud PostgreSQL
- Check that your IP is allowlisted in the database provider's settings
- Run `npx prisma db pull` to verify connection

### Prisma Migration Errors

```bash
# Check migration status
npx prisma migrate status

# Deploy pending migrations
npx prisma migrate deploy

# NEVER use in production:
# npx prisma migrate reset
```

### CORS Errors in Browser

- Ensure `CLIENT_ORIGIN` matches your exact frontend URL (protocol + domain)
- No trailing slash: `https://predicverse.vercel.app` ✅
- With trailing slash: `https://predicverse.vercel.app/` ❌

### Gemini API Errors

- Verify API key at [AI Studio](https://aistudio.google.com/app/apikey)
- Check that the key has Generative Language API enabled
- The system automatically falls back to deterministic generation

### PDF Generation Issues

- Ensure `pdfkit` is in `dependencies` (not `devDependencies`)
- PDFs require authentication — include `Authorization: Bearer <token>` header

---

## 8. Security Checklist

- [x] JWT secret is unique, strong (128-char hex), and stored as environment variable
- [x] Passwords hashed with bcrypt (12 rounds)
- [x] CORS restricts origins in production
- [x] No secrets exposed in health endpoints
- [x] Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS
- [x] User data isolation enforced at service layer
- [x] Share tokens are cryptographically secure (64-char hex)
- [x] Expired/revoked share links return 410/404
- [x] Collaborator permissions checked on every operation
- [x] Request body limited to 1MB
- [x] Zod validation on all user inputs
- [x] No stack traces or internal errors exposed to clients
- [x] `VITE_API_URL` is the only env var accessible to the client bundle
- [x] Graceful shutdown handler for SIGTERM/SIGINT

---

## 9. Test Results Summary

| Test Suite | Result |
|---|---|
| Phase 8 Final Production E2E | **34/34 PASS** |
| Phase 1 Security & Isolation | **16/16 PASS** |
| Phase 7 Collaboration & Sharing | **21/21 PASS** |
| Client TypeScript | **0 errors** |
| Server TypeScript | **0 errors** |
| Prisma Schema | **VALID** |
| Vite Production Build | **PASS** |
| Responsive UI Audit | **0 defects** |

---

## 10. Bundle Analysis

### Before Phase 8 Optimization

| File | Size (gzip) |
|---|---|
| `index.js` (monolithic) | 256.72 KB |

### After Phase 8 Optimization

| File | Size (gzip) |
|---|---|
| `index.js` (core) | 115.35 KB |
| `vendor-react.js` | 53.38 KB |
| `vendor-leaflet.js` | 44.96 KB |
| Page chunks (11 files) | 1.5-8.5 KB each |

**Initial load reduced by ~55%** through React.lazy code-splitting and manual vendor chunks.
