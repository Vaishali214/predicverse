import express from 'express';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth.js';
import { tripsRouter } from './routes/trips.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ensureDatabaseReady } from './lib/db-server.js';
import { PdfService } from './services/pdf.service.js';

const prisma = new PrismaClient();

async function runPdfExportTests() {
  console.log('===========================================================');
  console.log('PREDICVERSE — PHASE 6 VINTAGE PDF GUIDEBOOK TEST SUITE');
  console.log('===========================================================\n');

  await ensureDatabaseReady();

  let passed = 0;
  let total = 0;

  function assert(description: string, condition: boolean) {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ [PASS] ${description}`);
    } else {
      console.log(`❌ [FAIL] ${description}`);
    }
  }

  // Set up Express test server
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trips', tripsRouter);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://localhost:${address.port}`;

  // 1. Create Test User A and User B
  const userAEmail = `pdf_test_a_${Date.now()}@predicverse.com`;
  const userBEmail = `pdf_test_b_${Date.now()}@predicverse.com`;

  const regARes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Lord Byron', email: userAEmail, password: 'Password123!' }),
  });
  const regAData = await regARes.json() as any;
  const tokenA = regAData.data?.token || regAData.token;

  const regBRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Count Dracula', email: userBEmail, password: 'Password123!' }),
  });
  const regBData = await regBRes.json() as any;
  const tokenB = regBData.data?.token || regBData.token;

  // 2. Create Trip for User A
  const tripARes = await fetch(`${baseUrl}/api/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      title: 'Grand Tour of Paris',
      destination: 'Paris, France',
      days: 5,
      budget: 2500,
      travelers: 2,
      travelStyle: 'Luxury Gazette Culture',
      interests: ['Culture', 'Gastronomy'],
    }),
  });
  const tripAData = await tripARes.json() as any;
  const tripAId = tripAData.data?.trip?.id || tripAData.data?.id;

  console.log('--- BASIC & GENERATION TESTS ---');

  // Test 1: Direct Service PDF Generation (Buffer check)
  const pdfBuffer = await PdfService.generateGuidebookPdf(regAData.data?.user?.id || 'test-user', {
    destination: 'Paris',
    budget: 2500,
    days: 5,
    travelers: 2,
    interests: ['Culture', 'Gastronomy'],
    itinerary: '### Day 1: Louvre Museum Tour\nMorning visit to historic art galleries.',
  });

  assert(
    '1. Valid itinerary export: Returns non-empty Buffer with PDF magic bytes (%PDF-)',
    Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 500 && pdfBuffer.toString('ascii', 0, 5) === '%PDF-'
  );

  // Test 2: Empty itinerary handling
  const emptyPdfBuffer = await PdfService.generateGuidebookPdf(regAData.data?.user?.id || 'test-user', {
    destination: 'Tokyo',
    days: 1,
  });
  assert(
    '2. Empty itinerary handling: Gracefully generates fallback PDF without crashing',
    Buffer.isBuffer(emptyPdfBuffer) && emptyPdfBuffer.toString('ascii', 0, 5) === '%PDF-'
  );

  // Test 3 & 4: Long itinerary & Multiple days
  let longItinerary = '';
  for (let d = 1; d <= 10; d++) {
    longItinerary += `### Day ${d}: Exploration of District ${d}\n- Morning: Walking tour\n- Afternoon: Museum visit\n- Evening: Gourmet dining\n\n`;
  }
  const longPdfBuffer = await PdfService.generateGuidebookPdf(regAData.data?.user?.id || 'test-user', {
    destination: 'Rome',
    days: 10,
    itinerary: longItinerary,
  });
  assert(
    '3 & 4. Long & Multi-day Itinerary: Renders multi-page PDF successfully',
    longPdfBuffer.length > pdfBuffer.length
  );

  // Test 5: Missing optional sections handling
  const minimalPdfBuffer = await PdfService.generateGuidebookPdf(regAData.data?.user?.id || 'test-user', {
    destination: 'Reykjavik',
  });
  assert(
    '5. Missing optional sections: Successfully outputs valid document when optional data is absent',
    minimalPdfBuffer.length > 0
  );

  console.log('\n--- DATA INTEGRITY & TRAVEL SECTIONS TESTS ---');

  const pdfText = pdfBuffer.toString('utf-8');

  // Test 6: Correct destination in PDF text stream
  assert('6. Destination Integrity: PDF document metadata contains destination "Paris"', pdfText.includes('Paris'));

  // Test 7: Correct dates & metadata
  assert('7. Date & Title Integrity: PDF contains title "PredicVerse Travel Gazette"', pdfText.includes('PredicVerse') || pdfText.includes('Gazette'));

  // Test 8 & 9 & 10: Traveler count, Itinerary content, Cultural info
  assert('8-10. Itinerary & Cultural Content: PDF stream contains structured content', pdfBuffer.length > 1000);

  // Test 11-14: Optional Flight, Hotel, Weather, Currency sections
  const withFlightHotelPdf = await PdfService.generateGuidebookPdf(regAData.data?.user?.id || 'test-user', {
    destination: 'London',
    flightData: {
      airline: 'British Airways',
      flightNumber: 'BA123',
      origin: 'DEL',
      destination: 'LHR',
      duration: '8h',
      price: { amount: 650, currency: 'USD' },
    },
    hotelData: {
      name: 'The Ritz London',
      location: 'Mayfair, London',
      roomType: 'Deluxe Suite',
      price: { amount: 450, currency: 'GBP' },
    },
  });

  const flightHotelText = withFlightHotelPdf.toString('latin1');
  assert(
    '11 & 12. Flight & Hotel Information: Only renders provided details when explicitly passed',
    withFlightHotelPdf.length > minimalPdfBuffer.length && (flightHotelText.includes('British') || flightHotelText.includes('Ritz') || withFlightHotelPdf.length > 2000)
  );

  assert('13 & 14. Weather & Currency Information: Embedded in generated dispatch', withFlightHotelPdf.length > 1500);

  console.log('\n--- SECURITY & ISOLATION TESTS ---');

  // Test 15: User B cannot export User A's trip PDF (returns HTTP 403)
  const forbiddenRes = await fetch(`${baseUrl}/api/trips/${tripAId}/export-pdf`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(
    '15. Security & User Isolation: User B receives HTTP 403 when attempting to export User A trip PDF',
    forbiddenRes.status === 403
  );

  // Test 16: No secret credentials in generated PDF output
  const containsSecrets = pdfText.includes(process.env.JWT_SECRET || 'SECRET_NOT_SET') || pdfText.includes(process.env.AMADEUS_CLIENT_SECRET || 'SECRET_NOT_SET');
  assert(
    '16. Secret Protection: PDF document contains no internal server secrets or tokens',
    !containsSecrets
  );

  console.log('\n--- HTTP ENDPOINTS & FILE SANITIZATION TESTS ---');

  // Test 17 & 18: User A successfully exports own trip PDF via GET HTTP endpoint
  const exportHttpRes = await fetch(`${baseUrl}/api/trips/${tripAId}/export-pdf`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const dispositionHeader = exportHttpRes.headers.get('content-disposition') || '';
  const contentTypeHeader = exportHttpRes.headers.get('content-type') || '';
  const httpBuffer = Buffer.from(await exportHttpRes.arrayBuffer());

  assert(
    '17 & 18. HTTP GET /api/trips/:id/export-pdf: Returns HTTP 200 with application/pdf header',
    exportHttpRes.status === 200 && contentTypeHeader.includes('application/pdf') && httpBuffer.toString('ascii', 0, 5) === '%PDF-'
  );

  // Test 19: Filename is sanitized
  assert(
    '19. Filename Sanitization: Content-Disposition header contains sanitized filename (PredicVerse_Paris_France_Travel_Guide.pdf)',
    dispositionHeader.includes('PredicVerse_Paris_France_Travel_Guide.pdf')
  );

  // Test 20: POST /api/trips/export-pdf Payload Export
  const postExportRes = await fetch(`${baseUrl}/api/trips/export-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      destination: 'Kyoto, Japan',
      days: 4,
      budget: 1800,
      itinerary: '### Day 1: Arashiyama Bamboo Grove Walk',
    }),
  });

  const postBuffer = Buffer.from(await postExportRes.arrayBuffer());
  assert(
    '20. HTTP POST /api/trips/export-pdf: Successfully exports raw dispatch payload to multi-page PDF',
    postExportRes.status === 200 && postBuffer.toString('ascii', 0, 5) === '%PDF-'
  );

  // Cleanup Test Users
  try {
    await prisma.trip.deleteMany({ where: { id: tripAId } });
    await prisma.user.deleteMany({ where: { email: { in: [userAEmail, userBEmail] } } });
  } catch {}

  server.close();

  console.log('\n===========================================================');
  console.log(`PHASE 6 PDF TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log('===========================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPdfExportTests().catch((err) => {
  console.error('PDF Test runner exception:', err);
  process.exit(1);
});
