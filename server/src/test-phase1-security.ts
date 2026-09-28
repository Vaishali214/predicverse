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

const prisma = new PrismaClient();

async function runSecurityVerification() {
  console.log('===========================================================');
  console.log('PREDICVERSE — PHASE 1 SECURITY & ISOLATION TEST SUITE');
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
    res.json({ status: 'ok', service: 'PredicVerse Backend Gazette Service', database: dbStatus });
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

  function assertTest(name: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ [PASS] ${name}`);
    } else {
      console.error(`✗ [FAIL] ${name} ${details ? `(${details})` : ''}`);
    }
  }

  try {
    // 0. Production Health Check Endpoint Verification
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assertTest('Production /health Endpoint (200 OK & DB Connected)', healthRes.status === 200 && healthData.status === 'ok' && healthData.database === 'connected');

    const apiHealthRes = await fetch(`${baseUrl}/api/health`);
    const apiHealthData = await apiHealthRes.json();
    assertTest('Production /api/health Endpoint (200 OK & DB Connected)', apiHealthRes.status === 200 && apiHealthData.status === 'ok' && apiHealthData.database === 'connected');

    const timestamp = Date.now();
    const userA_Email = `usera_${timestamp}@test.com`;
    const userB_Email = `userb_${timestamp}@test.com`;

    // 1. Register User A
    const regA = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userA_Email, password: 'Password123!' }),
    });
    const dataA = await regA.json();
    const tokenA = dataA.data?.token;
    assertTest('User A Registration', regA.status === 201 && !!tokenA);

    // 2. Register User B
    const regB = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userB_Email, password: 'Password123!' }),
    });
    const dataB = await regB.json();
    const tokenB = dataB.data?.token;
    assertTest('User B Registration', regB.status === 201 && !!tokenB);

    // 3. User A creates a trip
    const createTripRes = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'User A Tokyo Voyage', destination: 'Tokyo, Japan', budget: 2500, days: 5 }),
    });
    const tripDataA = await createTripRes.json();
    const tripIdA = tripDataA.data?.trip?.id;
    assertTest('User A → Create Own Trip (201)', createTripRes.status === 201 && !!tripIdA);

    // 4. User A accesses own trip -> ALLOWED
    const getTripA = await fetch(`${baseUrl}/api/trips/${tripIdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assertTest('User A → Access Own Trip (200 ALLOWED)', getTripA.status === 200);

    // 5. User A modifies own trip -> ALLOWED
    const updateTripA = await fetch(`${baseUrl}/api/trips/${tripIdA}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'User A Tokyo Voyage Updated' }),
    });
    assertTest('User A → Modify Own Trip (200 ALLOWED)', updateTripA.status === 200);

    // 6. User B accesses User A trip -> BLOCKED (403)
    const getTripB = await fetch(`${baseUrl}/api/trips/${tripIdA}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assertTest('User B → Access User A Trip (403 BLOCKED)', getTripB.status === 403);

    // 7. User B modifies User A trip -> BLOCKED (403)
    const updateTripB = await fetch(`${baseUrl}/api/trips/${tripIdA}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ title: 'Hacked Title By User B' }),
    });
    assertTest('User B → Modify User A Trip (403 BLOCKED)', updateTripB.status === 403);

    // 8. User B deletes User A trip -> BLOCKED (403)
    const deleteTripB = await fetch(`${baseUrl}/api/trips/${tripIdA}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assertTest('User B → Delete User A Trip (403 BLOCKED)', deleteTripB.status === 403);

    // 9. User A creates wishlist item & passport stamp
    const wishRes = await fetch(`${baseUrl}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ destinationType: 'country', destinationId: 'kyoto_jp', destinationName: 'Kyoto' }),
    });
    const wishData = await wishRes.json();
    const wishIdA = wishData.data?.item?.id;
    assertTest('User A → Save Wishlist Item (201)', wishRes.status === 201 && !!wishIdA);

    // 10. User B attempts to delete User A wishlist item -> BLOCKED (403)
    const delWishB = await fetch(`${baseUrl}/api/wishlist/${wishIdA}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assertTest('User B → Delete User A Wishlist Item (403 BLOCKED)', delWishB.status === 403);

    // 11. Invalid Token Handling
    const invalidAuth = await fetch(`${baseUrl}/api/trips`, {
      headers: { Authorization: 'Bearer invalid_bogus_token_string' },
    });
    assertTest('Security → Reject Invalid JWT Token (401)', invalidAuth.status === 401);

    // 12. Missing Token Handling
    const missingAuth = await fetch(`${baseUrl}/api/trips`);
    assertTest('Security → Reject Missing Authorization Header (401)', missingAuth.status === 401);

    // 13. Zod Input Validation
    const invalidPayload = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Short', email: 'not_an_email', password: '123' }),
    });
    assertTest('Validation → Reject Invalid Payload with Zod (400)', invalidPayload.status === 400);

    // 14. User A deletes own trip -> ALLOWED
    const deleteTripA = await fetch(`${baseUrl}/api/trips/${tripIdA}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assertTest('User A → Delete Own Trip (200 ALLOWED)', deleteTripA.status === 200);

    // Cleanup test users
    await prisma.user.deleteMany({ where: { email: { in: [userA_Email, userB_Email] } } });
    console.log('\n✓ Cleanup complete for test users.');
  } catch (err) {
    console.error('Test execution exception:', err);
  } finally {
    server.close();
    await prisma.$disconnect();
  }

  console.log('\n===========================================================');
  console.log(`TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log('===========================================================');
  if (passed !== total) {
    process.exit(1);
  }
}

runSecurityVerification();
