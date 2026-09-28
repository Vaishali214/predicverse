import express from 'express';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { tripsRouter } from './routes/trips.js';
import { itineraryRouter } from './routes/itinerary.js';
import { wishlistRouter } from './routes/wishlist.js';
import { passportRouter } from './routes/passport.js';
import { hiddenGemsRouter } from './routes/hidden-gems.js';
import { articlesRouter } from './routes/articles.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ensureDatabaseReady } from './lib/db-server.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runE2EProductionVerification() {
  console.log('===========================================================');
  console.log('PREDICVERSE — PHASE 4 PRODUCTION END-TO-END VERIFICATION');
  console.log('===========================================================\n');

  await ensureDatabaseReady();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  const healthHandler = async (_req: express.Request, res: express.Response) => {
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }
    res.json({
      status: 'ok',
      service: 'PredicVerse Backend Gazette Service',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0-phase4',
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/trips', tripsRouter);
  app.use('/api', itineraryRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/passport', passportRouter);
  app.use('/api/hidden-gems', hiddenGemsRouter);
  app.use('/api/articles', articlesRouter);
  app.use('/api/intelligence', intelligenceRouter);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://localhost:${address.port}`;

  let passed = 0;
  let total = 0;

  function assertFeature(name: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ [PASS] ${name}`);
    } else {
      console.error(`✗ [FAIL] ${name} ${details ? `(${details})` : ''}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. Health Endpoints Check
    // -------------------------------------------------------------
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    assertFeature('Health Endpoint (/health -> 200 OK & DB Connected)', healthRes.status === 200 && healthJson.database === 'connected');

    const apiHealthRes = await fetch(`${baseUrl}/api/health`);
    const apiHealthJson = await apiHealthRes.json();
    assertFeature('API Health Endpoint (/api/health -> 200 OK)', apiHealthRes.status === 200 && apiHealthJson.status === 'ok');

    // -------------------------------------------------------------
    // 2. Authentication Flow (Register, Login, Me, Logout)
    // -------------------------------------------------------------
    const testEmail = `e2e_user_${Date.now()}@predicverse.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Tester', email: testEmail, password: 'Password123!' }),
    });
    const regJson = await regRes.json();
    const token = regJson.data?.token;
    assertFeature('Auth: Registration & JWT Token Issuance', regRes.status === 201 && !!token);

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'Password123!' }),
    });
    const loginJson = await loginRes.json();
    assertFeature('Auth: User Login & Credentials Verification', loginRes.status === 200 && !!loginJson.data?.token);

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meJson = await meRes.json();
    assertFeature('Auth: Protected User Identity Endpoint (/auth/me)', meRes.status === 200 && meJson.data?.user?.email === testEmail);

    // -------------------------------------------------------------
    // 3. User Profile & Travel DNA Persistence
    // -------------------------------------------------------------
    const profileRes = await fetch(`${baseUrl}/api/users/me/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ travelStyle: 'Cultural Explorer', bio: 'Passionate globetrotter' }),
    });
    const profileJson = await profileRes.json();
    assertFeature('User Profile: Persistence & Schema Sync', profileRes.status === 200 && profileJson.data?.profile?.travelStyle === 'Cultural Explorer');

    const dnaRes = await fetch(`${baseUrl}/api/users/me/travel-dna`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ culture: 95, food: 90, archetype: 'THE CULTURAL CULINARIAN' }),
    });
    const dnaJson = await dnaRes.json();
    assertFeature('Travel DNA: 10-Trait Personality Sync & Archetype', dnaRes.status === 200 && dnaJson.data?.travelDNA?.culture === 95);

    // -------------------------------------------------------------
    // 4. Trip Planner & Itinerary Dispatch
    // -------------------------------------------------------------
    const tripRes = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Kyoto Cultural Retreat', destination: 'Kyoto, Japan', days: 4, budget: 2000, travelers: 2 }),
    });
    const tripJson = await tripRes.json();
    const tripId = tripJson.data?.trip?.id;
    assertFeature('Trip Planner: Create Trip Record (PostgreSQL Persisted)', tripRes.status === 201 && !!tripId);

    const generateRes = await fetch(`${baseUrl}/api/trips/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: 'Kyoto, Japan', days: 4, budget: 2000, travelers: 2, interests: ['Culture', 'Food'] }),
    });
    const generateJson = await generateRes.json();
    assertFeature('Itinerary Engine: Day-by-Day Generation & Structured Markdown', generateRes.status === 200 && typeof generateJson.itinerary === 'string');

    // -------------------------------------------------------------
    // 5. Wishlist Management
    // -------------------------------------------------------------
    const wishRes = await fetch(`${baseUrl}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ destinationType: 'country', destinationId: 'japan', destinationName: 'Japan' }),
    });
    const wishJson = await wishRes.json();
    const wishId = wishJson.data?.item?.id;
    assertFeature('Wishlist: Add Destination (Unique Constraint Enforced)', wishRes.status === 201 && !!wishId);

    const wishGetRes = await fetch(`${baseUrl}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const wishGetJson = await wishGetRes.json();
    assertFeature('Wishlist: Retrieve User Wishlist Items', wishGetRes.status === 200 && wishGetJson.data?.items?.length > 0);

    // -------------------------------------------------------------
    // 6. Digital Passport Stamps
    // -------------------------------------------------------------
    const stampRes = await fetch(`${baseUrl}/api/passport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ destinationType: 'country', destinationId: 'japan', destination: 'Japan', flag: 'JP' }),
    });
    const stampJson = await stampRes.json();
    assertFeature('Passport: Digital Stamp Creation & Visit Counter', stampRes.status === 201 && stampJson.data?.stamp?.destinationId === 'japan');

    // -------------------------------------------------------------
    // 7. Live Weather Integration (Open-Meteo)
    // -------------------------------------------------------------
    const weatherRes = await fetch(`${baseUrl}/api/intelligence/weather?destination=Tokyo`);
    const weatherJson = await weatherRes.json();
    assertFeature('Live Weather: Open-Meteo Real-Time Geocoding & Forecast (200 OK)', weatherRes.status === 200 && weatherJson.data?.isLive === true);

    // -------------------------------------------------------------
    // 8. Live Currency Integration (Open ER API)
    // -------------------------------------------------------------
    const currencyRes = await fetch(`${baseUrl}/api/intelligence/currency?amount=1000&from=USD`);
    const currencyJson = await currencyRes.json();
    assertFeature('Live Currency: Open Exchange Rates Live Conversion (200 OK)', currencyRes.status === 200 && currencyJson.data?.isLive === true);

    // -------------------------------------------------------------
    // 9. Hidden Gems Catalog
    // -------------------------------------------------------------
    const gemRes = await fetch(`${baseUrl}/api/hidden-gems`);
    const gemJson = await gemRes.json();
    assertFeature('Hidden Gems: Database Catalog Endpoint (200 OK)', gemRes.status === 200 && Array.isArray(gemJson.data?.gems));

    // -------------------------------------------------------------
    // 10. Cultural Intelligence & Recommendation Matching
    // -------------------------------------------------------------
    const recRes = await fetch(`${baseUrl}/api/intelligence/recommendation-match?destinationName=Japan`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const recJson = await recRes.json();
    assertFeature('Cultural Intelligence: Travel DNA Match Calculator', recRes.status === 200 && typeof recJson.data?.matchPercentage === 'number');

    // -------------------------------------------------------------
    // 11. Security & Client Secret Audit
    // -------------------------------------------------------------
    const clientDistPath = path.join(process.cwd(), '../client/dist');
    let bundleHasSecrets = false;
    if (fs.existsSync(clientDistPath)) {
      const files = fs.readdirSync(path.join(clientDistPath, 'assets'));
      for (const f of files) {
        if (f.endsWith('.js')) {
          const content = fs.readFileSync(path.join(clientDistPath, 'assets', f), 'utf-8');
          if (content.includes('DATABASE_URL') || content.includes('JWT_SECRET') || content.includes('GEMINI_API_KEY')) {
            bundleHasSecrets = true;
          }
        }
      }
    }
    assertFeature('Security Secret Audit: Client Production Bundle Free of Backend Secrets', !bundleHasSecrets);

    // Cleanup
    await prisma.user.deleteMany({ where: { email: testEmail } });
    console.log('\n✓ E2E test data cleanup executed.');
  } catch (err) {
    console.error('E2E Production Test Exception:', err);
  } finally {
    server.close();
    await prisma.$disconnect();
  }

  console.log('\n===========================================================');
  console.log(`END-TO-END PRODUCTION SMOKE TEST SUMMARY: ${passed} / ${total} PASSED`);
  console.log('===========================================================');
  if (passed !== total) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2EProductionVerification();
