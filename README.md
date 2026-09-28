# PredicVerse — AI Travel & Culture Intelligence Platform

> **An AI-powered travel intelligence platform combining personalized destination discovery, cultural intelligence, live travel data, and intelligent itinerary planning.**

PredicVerse solves the fragmentation of trip preparation by integrating live meteorological conditions, real-time exchange rates, Travel DNA personality matching, authentic cultural etiquette dossiers, and Google Gemini AI itinerary generation into a unified, high-aesthetic vintage editorial interface.

---

## 🌟 Key Features

- **Google Gemini AI Itinerary Generator**: Custom day-by-day itineraries featuring morning, afternoon, and evening activities, daily cost estimates, food recommendations, and cultural tips with automatic algorithmic fallback.
- **Dynamic Live Weather**: Real-time temperature, condition, humidity, wind, and multi-day forecasts powered by Open-Meteo dynamic geocoding.
- **Live Currency Conversion**: Multi-currency conversion (USD, INR, EUR, GBP, JPY, CAD, AUD) powered by Open Exchange Rates API.
- **Travel DNA Recommendation Engine**: Mathematical compatibility percentage matching traveler personality profiles with destination attributes.
- **Cultural Intelligence Dossiers**: Local etiquette guidelines, traditional greetings (with pronunciations), dress codes, tipping customs, and common mistakes to avoid.
- **Interactive Grayscale World Map**: Custom Leaflet map rendering with vintage map tile layers and custom flag markers.
- **Vintage Passport & Wishlist**: Digital stamp book, country visit counters, and saved wishlist items synchronized with relational database persistence.
- **Country & City Comparison**: Side-by-side comparison matrix evaluating budgets, safety, food scenes, climate, and travel style compatibility.

---

## 🏗️ System Architecture

```text
React 18 + TypeScript Client (Vite, Leaflet, Framer Motion)
                          │
             (HTTPS / JWT Authorization)
                          │
                          ▼
       Node.js + Express REST API (TypeScript)
       ├── Middleware (JWT Auth, Zod Validation, Error Handler)
       ├── Controllers (Auth, Users, Trips, Wishlist, Passport, Intelligence)
       └── Services
           ├── AIService (Google Gemini REST API with null fallback)
           ├── WeatherService (Open-Meteo Geocoding & Weather)
           ├── CurrencyService (Open ER Live Exchange Rates)
           ├── RecommendationService (Deterministic Travel DNA Match)
           └── CultureService (Cultural Etiquette & Greetings)
                          │
                          ▼
          Prisma ORM (PostgreSQL / SQLite)
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, Leaflet (`react-leaflet`), Framer Motion, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** SQLite (Development) / PostgreSQL (Production ready)
- **AI & External APIs:** Google Gemini API (`gemini-1.5-flash`), Open-Meteo Weather API, Open Exchange Rates API
- **Authentication & Security:** JWT (JSON Web Tokens), bcrypt password hashing (12 rounds), Zod input validation
- **Design System:** Newsprint editorial theme

---

## 🔒 Security & Authorization

- **Secret Isolation**: Server-side secrets (`GEMINI_API_KEY`, `JWT_SECRET`, `DATABASE_URL`) are maintained strictly inside `server/.env` and are never exposed to the client bundle.
- **Multi-Tenant Authorization**: All protected endpoints enforce strict ownership checks ensuring users cannot view, edit, or delete another user's wishlist, passport, or trips.
- **Password Security**: Passwords are hashed using bcrypt with 12 salt rounds; plaintext passwords and hashes are suppressed from all API responses.
- **Multi-User State Reset**: Logging out purges all client token storage keys and resets in-memory React state to prevent data leakage between sessions.

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ installed

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Create `server/.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="predicverse_secret_key_2026_dev_mode_secret_key_string"
GEMINI_API_KEY="your_gemini_api_key_here" # Optional: Algorithmic fallback activates if absent
PORT=3001
NODE_ENV=development
```

### 3. Initialize Database & Seed
```bash
cd server
npx prisma db push
npx tsx prisma/seed.ts
cd ..
```

### 4. Start Development Server
```bash
npm run dev
```
Starts both the frontend (`http://localhost:5173`) and backend (`http://localhost:3001`) concurrently.

---

## 🧪 Testing & Verification

PredicVerse includes a comprehensive automated test suite verifying database CRUD, JWT security, user data isolation, live API integrations, AI fallbacks, and deterministic match algorithms.

```bash
cd server
npx tsx src/test-final-release.ts
```

```text
Baseline Database & Auth Tests:     20 / 20 PASS
Intelligence & AI Tests:            10 / 10 PASS
Production Security & Audit Tests:  15 / 15 PASS
TOTAL VERIFIED TESTS:               45 / 45 PASSED (0 FAILED)
```

---

## 🌐 Production Deployment Guide

### Client Deployment (Vercel / Netlify)
1. Push repository to GitHub.
2. Import `client/` project to Vercel or Netlify.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: `VITE_API_URL="https://your-express-backend.onrender.com"`

### Backend Deployment (Render / Railway)
1. Import `server/` project to Render or Railway.
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Set Environment Variables:
   - `DATABASE_URL`: Production PostgreSQL connection string (Neon / Supabase)
   - `JWT_SECRET`: Long random secret string
   - `GEMINI_API_KEY`: Google Gemini API key
   - `CLIENT_ORIGIN`: `https://your-predicverse-app.vercel.app`

---

## 📄 License & Status

**Status**: `PREDICVERSE — FINAL RELEASE READY`  
Developed for travel exploration, cultural discovery, and portfolio demonstration.
