# PredicVerse — Phase 6 Vintage PDF Guidebook Documentation

## Overview

The **PredicVerse Vintage PDF Guidebook Generator** allows authenticated users to export their AI-generated or custom travel itineraries into a polished, printable PDF document designed in the signature **PredicVerse Vintage Gazette Newspaper** aesthetic.

The generated guidebook integrates the complete PredicVerse travel intelligence experience into an offline document formatted for reading, printing (in color or grayscale), saving, and sharing.

---

## Technical Architecture

```text
React Client (TripPlanner.tsx)
  │ Click "DOWNLOAD VINTAGE GUIDEBOOK"
  ▼ HTTP GET /api/trips/:id/export-pdf OR POST /api/trips/export-pdf
Express REST API (PdfController)
  │ JWT Authentication & User Data Isolation Verification
  ▼
PdfService (Node.js + pdfkit)
  ├─ Fetches User Profile & Travel DNA from PostgreSQL
  ├─ Fetches Regional Cultural Dossier (CultureService)
  ├─ Fetches Live/Cached Weather (WeatherService)
  ├─ Fetches Live/Cached Currency Conversion (CurrencyService)
  ├─ Fetches Destination Hidden Gems (HiddenGemsService)
  ├─ Fetches User Digital Passport Stamps & Wishlist Items
  └─ Renders Vintage Gazette Multi-Page PDF Document Stream
  ▼
Browser File Download (Content-Disposition: attachment; filename="PredicVerse_Paris_Travel_Guide.pdf")
```

---

## PDF Library Selection

- **Library**: `pdfkit` (Node.js server-side PDF generator)
- **Rationale**:
  - Eliminates browser-dependent canvas rendering bugs and print CSS inconsistencies across different devices.
  - Generates pixel-perfect vector graphics, double-ruled newspaper mastheads, columns, and crisp typography.
  - Native page break management prevents orphan headers (`doc.y` check before drawing new day blocks).
  - High performance: Generates multi-page PDFs in <150ms.

---

## Document Layout & Structure

| Page / Section | Contents & Design |
| :--- | :--- |
| **1. Cover & Masthead** | Vintage newspaper title ("PREDICVERSE TRAVEL GAZETTE"), edition volume, date line, double solid rules, large destination headline, metadata dispatch box (Traveler, Duration, Budget, Style, Interests). |
| **2. Traveler DNA Profile** | Traveler archetype (e.g. "THE CULTURAL EXPLORER") and radar category scores (Culture, Gastronomy, History, Nature, Adventure). |
| **3. Day-by-Day Itinerary** | Structured day blocks (Morning, Afternoon, Evening, Culinary Focus, Estimated Daily Cost). Built-in page break checks prevent split day titles. |
| **4. Cultural Intelligence** | Regional etiquette, dress code, tipping customs, greetings, taboos, and essential local phrases. |
| **5. Weather Dispatch** | Real-time weather (temp, condition, humidity, wind) from Open-Meteo API. Displays `"WEATHER DATA NOT AVAILABLE"` if offline. |
| **6. Currency Reference** | USD base budget conversion to destination and global currencies (INR, EUR, GBP, JPY). Clearly labeled `"REFERENCE CONVERSION ONLY"`. |
| **7. Flight Dispatch** | Displays selected airline, flight #, origin/dest, cabin, price, and booking link. Displays `"FLIGHT INFORMATION NOT ADDED"` if unselected. |
| **8. Hotel Dispatch** | Displays selected hotel name, location, room type, price, and booking link. Displays `"HOTEL INFORMATION NOT ADDED"` if unselected. |
| **9. Hidden Gems** | Top secret locations and local codenames for the destination from PredicVerse Hidden Gems repository. |
| **10. Passport & Wishlist** | User's passport stamp history and saved wishlist items for the destination. |
| **11. Gazette Back Page** | Gazette Publishing closing logo and mandatory legal disclaimer regarding time-sensitive provider rates and weather. |

---

## Security & User Data Isolation

1. **Authorization Check**: `GET /api/trips/:id/export-pdf` verifies `trip.userId === req.userId`. User B attempting to download User A's trip receives an `HTTP 403 Access Denied` response.
2. **Credential Safety**: Internal environment variables (`JWT_SECRET`, `GEMINI_API_KEY`, `AMADEUS_CLIENT_SECRET`) are never rendered inside the PDF text or headers.
3. **Filename Sanitization**: Destination names are sanitized (non-alphanumeric characters replaced with underscores) to prevent directory traversal or header injection (`PredicVerse_Kyoto_Japan_Travel_Guide.pdf`).

---

## Testing Strategy

Run the Phase 6 verification test suite:

```bash
cd server
npx tsx src/test-pdf-export.ts
```

The test runner verifies:
- PDF Buffer magic bytes (`%PDF-`)
- Multi-page document pagination
- Optional section fallbacks (Flights, Hotels, Weather, Currency)
- User isolation (User B blocked with HTTP 403)
- Sanitized `Content-Disposition` headers
- 0 exposed server secrets
