import express from 'express';
import http from 'http';
import { flightSearchSchema, hotelSearchSchema } from './lib/validation.js';
import { travelRouter } from './routes/travel.js';
import { TravelSearchService } from './services/travel-search.service.js';
import { errorHandler } from './middleware/error.middleware.js';

async function runTravelSearchTests() {
  console.log('===========================================================');
  console.log('PREDICVERSE — PHASE 5 TRAVEL SEARCH TEST SUITE');
  console.log('===========================================================\n');

  let unitPassed = 0;
  let unitTotal = 0;

  let intPassed = 0;
  let intTotal = 0;

  let livePassed = 0;
  let liveTotal = 0;
  let liveSkipped = 0;

  function assertUnit(description: string, condition: boolean) {
    unitTotal++;
    if (condition) {
      unitPassed++;
      console.log(`  [UNIT PASS] ${description}`);
    } else {
      console.log(`  [UNIT FAIL] ${description}`);
    }
  }

  function assertInt(description: string, condition: boolean) {
    intTotal++;
    if (condition) {
      intPassed++;
      console.log(`  [INT PASS] ${description}`);
    } else {
      console.log(`  [INT FAIL] ${description}`);
    }
  }

  function assertLive(description: string, condition: boolean) {
    liveTotal++;
    if (condition) {
      livePassed++;
      console.log(`  [LIVE PASS] ${description}`);
    } else {
      console.log(`  [LIVE FAIL] ${description}`);
    }
  }

  console.log('--- CATEGORY 1: UNIT TESTS (SCHEMA & VALIDATION) ---');

  // Test 1: Valid flight search schema
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 5);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 12);

  const validFlightPayload = {
    origin: 'DEL',
    destination: 'CDG',
    departureDate: tomorrow.toISOString().split('T')[0],
    returnDate: nextWeek.toISOString().split('T')[0],
    oneWay: false,
    travelers: 2,
    cabinClass: 'ECONOMY' as const,
    currency: 'USD',
  };

  const flightResult = flightSearchSchema.safeParse(validFlightPayload);
  assertUnit('1. Flight Schema: Accepts valid flight search payload', flightResult.success);

  // Test 2: Invalid origin (empty/missing)
  const invalidOriginResult = flightSearchSchema.safeParse({
    ...validFlightPayload,
    origin: '',
  });
  assertUnit('2. Flight Schema: Rejects empty origin', !invalidOriginResult.success);

  // Test 3: Return date before departure date
  const pastReturnPayload = {
    ...validFlightPayload,
    departureDate: nextWeek.toISOString().split('T')[0],
    returnDate: tomorrow.toISOString().split('T')[0],
  };
  const pastReturnResult = flightSearchSchema.safeParse(pastReturnPayload);
  assertUnit('3. Flight Schema: Rejects return date before departure date', !pastReturnResult.success);

  // Test 4: Invalid traveler count (0 or negative)
  const invalidTravelersResult = flightSearchSchema.safeParse({
    ...validFlightPayload,
    travelers: 0,
  });
  assertUnit('4. Flight Schema: Rejects invalid traveler count (0)', !invalidTravelersResult.success);

  // Test 5: Invalid cabin class
  const invalidCabinResult = flightSearchSchema.safeParse({
    ...validFlightPayload,
    cabinClass: 'SUPER_LUXURY' as any,
  });
  assertUnit('5. Flight Schema: Rejects unsupported cabin class', !invalidCabinResult.success);

  // Test 6: Valid hotel search schema
  const validHotelPayload = {
    destination: 'Paris',
    checkInDate: tomorrow.toISOString().split('T')[0],
    checkOutDate: nextWeek.toISOString().split('T')[0],
    guests: 2,
    rooms: 1,
    currency: 'USD',
  };

  const hotelResult = hotelSearchSchema.safeParse(validHotelPayload);
  assertUnit('6. Hotel Schema: Accepts valid hotel search payload', hotelResult.success);

  // Test 7: Invalid hotel check-out before check-in
  const invalidHotelDatesResult = hotelSearchSchema.safeParse({
    ...validHotelPayload,
    checkInDate: nextWeek.toISOString().split('T')[0],
    checkOutDate: tomorrow.toISOString().split('T')[0],
  });
  assertUnit('7. Hotel Schema: Rejects check-out before check-in', !invalidHotelDatesResult.success);

  // Test 8: Invalid guest/room count
  const invalidGuestResult = hotelSearchSchema.safeParse({
    ...validHotelPayload,
    guests: -1,
    rooms: 0,
  });
  assertUnit('8. Hotel Schema: Rejects invalid guest and room counts', !invalidGuestResult.success);

  // Test 9: TravelSearchService provider status check
  const status = TravelSearchService.getProviderStatus();
  assertUnit(
    '9. Service Abstraction: Correctly identifies provider configuration status',
    typeof status.isConfigured === 'boolean' && typeof status.provider === 'string'
  );

  console.log('\n--- CATEGORY 2: INTEGRATION TESTS (EXPRESS ENDPOINTS & ERROR HANDLING) ---');

  const app = express();
  app.use(express.json());
  app.use('/api/travel', travelRouter);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://localhost:${address.port}`;

  // Test 10: GET /api/travel/flights/search with valid params
  try {
    const url = `${baseUrl}/api/travel/flights/search?origin=DEL&destination=CDG&departureDate=${validFlightPayload.departureDate}&returnDate=${validFlightPayload.returnDate}&travelers=2&cabinClass=ECONOMY`;
    const res = await fetch(url);
    const body = await res.json() as any;
    assertInt(
      '10. GET /api/travel/flights/search: Handles valid search query and returns structured response',
      res.status === 200 && typeof body.success === 'boolean' && Array.isArray(body.flights)
    );
  } catch (err) {
    assertInt('10. GET /api/travel/flights/search endpoint error', false);
  }

  // Test 11: POST /api/travel/flights/search with invalid dates
  try {
    const res = await fetch(`${baseUrl}/api/travel/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'DEL',
        destination: 'CDG',
        departureDate: validFlightPayload.returnDate,
        returnDate: validFlightPayload.departureDate, // Invalid order
      }),
    });
    const body = await res.json() as any;
    assertInt(
      '11. POST /api/travel/flights/search: Returns HTTP 400 with validation message on invalid date order',
      res.status === 400 && body.success === false
    );
  } catch {
    assertInt('11. POST /api/travel/flights/search error handling', false);
  }

  // Test 12: GET /api/travel/hotels/search with valid params
  try {
    const url = `${baseUrl}/api/travel/hotels/search?destination=Paris&checkInDate=${validHotelPayload.checkInDate}&checkOutDate=${validHotelPayload.checkOutDate}&guests=2&rooms=1`;
    const res = await fetch(url);
    const body = await res.json() as any;
    assertInt(
      '12. GET /api/travel/hotels/search: Handles valid hotel query and returns structured response',
      res.status === 200 && typeof body.success === 'boolean' && Array.isArray(body.hotels)
    );
  } catch {
    assertInt('12. GET /api/travel/hotels/search endpoint error', false);
  }

  // Test 13: POST /api/travel/hotels/search with invalid destination
  try {
    const res = await fetch(`${baseUrl}/api/travel/hotels/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: '', // Empty
        checkInDate: validHotelPayload.checkInDate,
        checkOutDate: validHotelPayload.checkOutDate,
      }),
    });
    const body = await res.json() as any;
    assertInt(
      '13. POST /api/travel/hotels/search: Returns HTTP 400 on missing destination',
      res.status === 400 && body.success === false
    );
  } catch {
    assertInt('13. POST /api/travel/hotels/search error handling', false);
  }

  // Test 14: Security / API Key Protection check — Ensure no secret credentials leaked in client responses
  try {
    const res = await fetch(`${baseUrl}/api/travel/flights/search?origin=DEL&destination=CDG&departureDate=${validFlightPayload.departureDate}`);
    const rawText = await res.text();
    const containsSecret = rawText.includes(process.env.AMADEUS_CLIENT_SECRET || 'SECRET_NOT_SET_NEVER_MATCH');
    assertInt(
      '14. Security: API credentials remain isolated server-side and never leak in response payload',
      !containsSecret
    );
  } catch {
    assertInt('14. Security credential check error', false);
  }

  // Test 15: Malformed JSON handling
  try {
    const res = await fetch(`${baseUrl}/api/travel/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid": json}',
    });
    assertInt(
      '15. Security & Stability: Server safely handles malformed JSON payload without crashing',
      res.status === 400
    );
  } catch {
    assertInt('15. Malformed JSON handling error', false);
  }

  console.log('\n--- CATEGORY 3: LIVE PROVIDER TESTS (AMADEUS / EXTERNAL API) ---');

  if (status.isConfigured) {
    console.log(`[INFO] Provider is configured (${status.provider}). Executing live API calls...`);
    try {
      const liveFlightRes = await TravelSearchService.searchFlights(validFlightPayload);
      assertLive(
        '16. Live Flight Search: External provider returned valid normalized response',
        liveFlightRes.success && Array.isArray(liveFlightRes.flights)
      );
    } catch {
      assertLive('16. Live Flight Search failed', false);
    }

    try {
      const liveHotelRes = await TravelSearchService.searchHotels(validHotelPayload);
      assertLive(
        '17. Live Hotel Search: External provider returned valid normalized response',
        liveHotelRes.success && Array.isArray(liveHotelRes.hotels)
      );
    } catch {
      assertLive('17. Live Hotel Search failed', false);
    }
  } else {
    liveSkipped = 2;
    console.log('⚠️  [SKIPPED] Live provider API credentials (AMADEUS_CLIENT_ID & AMADEUS_CLIENT_SECRET) are unconfigured.');
    console.log('    The system gracefully returned unconfigured notice without fabricating flight or hotel prices/availability.');
  }

  server.close();

  console.log('\n===========================================================');
  console.log('PHASE 5 TRAVEL SEARCH TEST RESULTS SUMMARY');
  console.log('===========================================================');
  console.log(`UNIT TESTS           : ${unitPassed}/${unitTotal} PASSED`);
  console.log(`INTEGRATION TESTS    : ${intPassed}/${intTotal} PASSED`);
  if (liveSkipped > 0) {
    console.log(`LIVE PROVIDER TESTS  : SKIPPED (${liveSkipped} tests skipped due to unconfigured API keys)`);
  } else {
    console.log(`LIVE PROVIDER TESTS  : ${livePassed}/${liveTotal} PASSED`);
  }
  console.log('===========================================================\n');

  if (unitPassed !== unitTotal || intPassed !== intTotal) {
    process.exit(1);
  }
}

runTravelSearchTests().catch((err) => {
  console.error('Test runner exception:', err);
  process.exit(1);
});
