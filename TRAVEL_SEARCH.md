# PredicVerse — Phase 5 Travel Search Documentation

## Overview

The **PredicVerse Travel Search Service** provides live flight and hotel search capabilities integrated directly into the PredicVerse AI Travel & Culture Intelligence Platform.

This service strictly adheres to **zero-fabrication integrity**:
- **Never fabricates** flight prices, hotel prices, availability, airline schedules, hotel availability, ratings, or booking URLs.
- **Normalizes provider data** into provider-independent, stable PredicVerse JSON data structures.
- **Communicates exclusively server-to-server** so that API keys remain protected on the backend and are never exposed via `VITE_*` public variables.
- **Gracefully communicates unconfigured state** when live credentials are absent or provider returns no offers.

---

## Architecture & Provider Abstraction

```text
React (Client)
  ↓ HTTP REST (JWT Protected or Anonymous)
Express Backend Router (/api/travel)
  ↓ Zod Validation Layer
Travel Search Service Layer (TravelSearchService)
  ↓ Provider Interface / OAuth Token Manager
External Travel Provider (e.g. Amadeus Self-Service API)
```

### Supported Provider(s)
- **Primary Provider**: **Amadeus Self-Service API**
  - Flight Offers Search (`/v2/shopping/flight-offers`)
  - Hotel Search (`/v1/reference-data/locations/hotels/by-city` & `/v3/shopping/hotel-offers`)
  - Deep-link / Booking provider link support

---

## Environment Configuration

Set the following server-side environment variables in `server/.env` (or cloud platform env vars):

```env
# Selected Provider (Default: "amadeus")
TRAVEL_PROVIDER="amadeus"

# Amadeus Developer API Credentials
AMADEUS_CLIENT_ID="YOUR_AMADEUS_API_KEY"
AMADEUS_CLIENT_SECRET="YOUR_AMADEUS_API_SECRET"
```

> **Security Note**: These keys must remain server-side only. Do not add `VITE_` prefixes or include them in client bundles.

---

## Normalized Data Specifications

### Flight Response Normalization (`NormalizedFlight`)

```json
{
  "id": "flight-12345",
  "airline": "Air France",
  "flightNumber": "AF334",
  "origin": "DEL",
  "destination": "CDG",
  "departure": "2026-10-15T11:00:00.000Z",
  "arrival": "2026-10-15T17:30:00.000Z",
  "duration": "8h 30m",
  "stops": 0,
  "cabin": "ECONOMY",
  "price": {
    "amount": 540.00,
    "currency": "USD"
  },
  "bookingUrl": "https://www.airfrance.com"
}
```

### Hotel Response Normalization (`NormalizedHotel`)

```json
{
  "id": "hotel-67890",
  "name": "Le Grand Hotel Paris",
  "location": "Paris, France",
  "rating": 4,
  "roomType": "Deluxe King Room",
  "checkIn": "2026-10-15",
  "checkOut": "2026-10-20",
  "price": {
    "amount": 220.00,
    "currency": "EUR"
  },
  "bookingUrl": "https://www.booking.com/hotel/fr/le-grand"
}
```

---

## API Endpoints

### 1. Flight Search
- **GET** `/api/travel/flights/search`
- **POST** `/api/travel/flights/search`

**Supported Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `origin` | string | Yes | 3-letter IATA origin code or city name |
| `destination` | string | Yes | 3-letter IATA destination code or city name |
| `departureDate` | string | Yes | YYYY-MM-DD ISO date string |
| `returnDate` | string | No | YYYY-MM-DD ISO date string for round-trip |
| `oneWay` | boolean | No | True for one-way flight |
| `travelers` | number | No | Number of adult passengers (Default: 1) |
| `cabin` | string | No | ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST |
| `currency` | string | No | Preferred ISO currency code (Default: USD) |

### 2. Hotel Search
- **GET** `/api/travel/hotels/search`
- **POST** `/api/travel/hotels/search`

**Supported Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `destination` | string | Yes | Destination city or country |
| `checkIn` | string | Yes | YYYY-MM-DD ISO date string |
| `checkOut` | string | Yes | YYYY-MM-DD ISO date string |
| `guests` | number | No | Total guest count (Default: 1) |
| `rooms` | number | No | Number of requested rooms (Default: 1) |
| `currency` | string | No | Preferred ISO currency code (Default: USD) |

---

## Rate Limits & Provider Quotas

- **Amadeus Test Environment**:
  - Rate limit: 10 calls per second
  - Quota: 2,000 free monthly requests
- **Production Environment**:
  - Rate limits scale depending on partner tier.

---

## Error & Empty State Handling

- **Input Validation Error (HTTP 400)**: Returned when dates are in the past, return date precedes departure date, or traveler counts are invalid.
- **Unconfigured Provider (HTTP 200)**: When credentials are un-set, the API returns:
  ```json
  {
    "success": true,
    "providerConfigured": false,
    "message": "Live travel search provider credentials are not configured.",
    "flights": []
  }
  ```
- **No Results Found (HTTP 200)**: Returns empty array with clear user notice: `"No flights found matching your exact itinerary dates."`
- **Provider Outage / Timeout (HTTP 503)**: Returns sanitized error message without exposing API credentials or stack traces.

---

## Testing Strategy

Run the Phase 5 Travel Search verification suite:

```bash
cd server
npx tsx src/test-travel-search.ts
```

The test runner separates output into 3 distinct categories:
1. **UNIT TESTS**: Verifies Zod schema validation rules, date order checks, traveler bounds, and service status methods.
2. **INTEGRATION TESTS**: Verifies Express routes, input coercion, HTTP 400 error codes, JSON safety, and secret credential non-leakage.
3. **LIVE PROVIDER TESTS**: Executes live API calls if `AMADEUS_CLIENT_ID` is present; explicitly reports `SKIPPED` if unconfigured.
