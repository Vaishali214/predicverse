# 🤖 PredicVerse — Gemini AI Integration & Intelligence Guide

This document details the architecture, configuration, Zod output validation, and fallback mechanisms for the Google Gemini AI itinerary generation system in **PredicVerse**.

---

## 🏗️ AI System Architecture

```text
React 18 Client (TripPlanner.tsx)
              │
    (POST /api/trips/generate)
              │
              ▼
  Express API Backend (TripsService)
              │
     Check GEMINI_API_KEY
        ┌─────┴─────┐
     Key Set?     Key Unset?
        │           │
        ▼           ▼
   AIService     Deterministic Fallback Engine
  (Gemini API)     (Gazette Travel Generator)
        │           │
   Zod Schema       │
   Validation       │
        │           │
        └─────┬─────┘
              ▼
   Return Itinerary Response JSON
```

---

## 🔑 1. Environment Configuration

The Gemini API key is maintained **strictly server-side** in `server/.env`. It is NEVER exposed to the frontend browser bundle or client environment variables.

### Server Environment (`server/.env`)

```env
# Server-side Google Gemini API Key
GEMINI_API_KEY="your_actual_google_gemini_api_key"

# Gemini Model Identifier
GEMINI_MODEL="gemini-1.5-flash"
```

> [!IMPORTANT]
> If `GEMINI_API_KEY` is omitted, left blank, or set to a placeholder string, the backend automatically and silently activates the internal Gazette deterministic trip generator. The application will never throw a 500 server error due to an unconfigured or unavailable AI API key.

---

## 🛡️ 2. Structured Output Zod Validation

To ensure 100% predictable data structures, every AI response returned by Google Gemini is validated against a strict **Zod Schema** before being returned to the frontend.

### Schema Definition (`server/src/services/ai.service.ts`)

```typescript
export const aiDailyPlanSchema = z.object({
  dayNumber: z.number().int().positive(),
  theme: z.string(),
  morning: z.string(),
  afternoon: z.string(),
  evening: z.string(),
  foodRecommendation: z.string(),
  transportTip: z.string(),
  estimatedDailyCost: z.number().nonnegative(),
});

export const aiItineraryResponseSchema = z.object({
  destination: z.string(),
  durationDays: z.number().int().positive(),
  estimatedTotalCost: z.number().nonnegative(),
  currency: z.string().default('USD'),
  dailyPlan: z.array(aiDailyPlanSchema).min(1),
  culturalTips: z.array(z.string()).default([]),
  weatherNotes: z.string().default(''),
  hiddenGems: z.array(z.string()).default([]),
  practicalTips: z.array(z.string()).default([]),
});
```

If Gemini returns malformed JSON or missing fields:
1. `aiItineraryResponseSchema.safeParse()` flags the failure.
2. The server logs a warning internally without exposing stack traces.
3. The server smoothly engages the deterministic fallback engine to return a complete, valid itinerary.

---

## ⏱️ 3. Timeout & Error Resilience

- **Timeout Protection:** AI requests use an `AbortController` set to a 12-second timeout threshold.
- **HTTP Error Handling:** Non-200 responses, rate-limiting (429), or network dropouts trigger immediate fallback.
- **Security Check:** API keys are excluded from all log outputs, stack traces, and API response bodies.

---

## 🧪 4. AI Quality & Fallback Test Suite

Run the automated AI test suite to verify Gemini response parsing, Zod validation, and fallback mechanisms:

```bash
cd server
npx tsx src/test-ai-quality.ts
```

### Verified Test Cases (7/7 Passed):
1. **Paris (Medium Budget, Culture + Food):** `200 OK & Valid Structure`
2. **Tokyo (High Budget, Food + Shopping + Tech):** `200 OK & 5-Day Structure`
3. **Manali (Low Budget, Nature + Adventure):** `200 OK & 3-Day Structure`
4. **Deterministic Fallback Simulation:** Returns `aiGenerated: false` when key is unpopulated
5. **Zod Output Validation:** Validates strict JSON output schema
6. **Zod Rejection Test:** Correctly rejects malformed JSON payloads
7. **Secret Leak Protection:** Confirms `GEMINI_API_KEY` is suppressed from API outputs
