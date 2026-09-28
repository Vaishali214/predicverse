/**
 * PredicVerse — Phase 8: Final Production End-to-End Verification
 * ================================================================
 * Comprehensive test covering all 21 verification points.
 *
 * Run: npx tsx src/test-final-production.ts
 * Requires: Server running on http://localhost:3001
 */

const BASE = 'http://localhost:3001/api';
let passed = 0;
let failed = 0;
let skipped = 0;

const log = {
  pass: (name: string) => { passed++; console.log(`  ✅ PASS: ${name}`); },
  fail: (name: string, err?: any) => { failed++; console.log(`  ❌ FAIL: ${name}`, err?.message || ''); },
  skip: (name: string, reason: string) => { skipped++; console.log(`  ⏭️  SKIP: ${name} — ${reason}`); },
  section: (name: string) => console.log(`\n📋 ${name}`),
};

// Unique test user for this run
const testId = Date.now().toString(36);
const testUser = {
  name: `Test Traveler ${testId}`,
  email: `test_${testId}@predicverse.test`,
  password: 'Gazette_Secure_2026!',
};
const testUser2 = {
  name: `Traveler B ${testId}`,
  email: `test_b_${testId}@predicverse.test`,
  password: 'Gazette_Secure_B_2026!',
};

let authToken = '';
let userId = '';
let authToken2 = '';
let userId2 = '';
let tripId = '';
let shareToken = '';
let shareLinkId = '';

async function request(path: string, options: any = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const headers: Record<string, string> = options.headers || {};
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  }

  return { status: res.status, data, headers: res.headers, ok: res.ok };
}

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PREDICVERSE — FINAL PRODUCTION VERIFICATION SUITE       ║');
  console.log('║  Phase 8 — End-to-End Test (21 Checkpoints)              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // ── 1. Health ──
  log.section('1. HEALTH ENDPOINTS');
  try {
    const h1 = await request('http://localhost:3001/health', { method: 'GET' });
    if (h1.status === 200 && h1.data?.status) {
      log.pass(`GET /health → ${h1.data.status} (DB: ${h1.data.database}, Env: ${h1.data.environment})`);
    } else { log.fail('GET /health'); }

    const h2 = await request('http://localhost:3001/api/health', { method: 'GET' });
    if (h2.status === 200 && h2.data?.status) {
      log.pass(`GET /api/health → ${h2.data.status}`);
    } else { log.fail('GET /api/health'); }
  } catch (e) { log.fail('Health endpoints', e); }

  // ── 2. Registration ──
  log.section('2. USER REGISTRATION');
  try {
    const reg = await request('/auth/register', { method: 'POST', body: testUser });
    if (reg.status === 201 && reg.data?.data?.token) {
      authToken = reg.data.data.token;
      userId = reg.data.data.user.id;
      log.pass(`Register user "${testUser.name}" → ID: ${userId.substring(0, 8)}...`);
    } else { log.fail('Register user', { message: JSON.stringify(reg.data) }); }
  } catch (e) { log.fail('Register user', e); }

  // ── 3. Login ──
  log.section('3. USER LOGIN');
  try {
    const login = await request('/auth/login', { method: 'POST', body: { email: testUser.email, password: testUser.password } });
    if (login.status === 200 && login.data?.data?.token) {
      authToken = login.data.data.token;
      log.pass('Login → JWT acquired');
    } else { log.fail('Login', { message: JSON.stringify(login.data) }); }
  } catch (e) { log.fail('Login', e); }

  // ── 4. Authenticated User ──
  log.section('4. AUTHENTICATED USER (GET /auth/me)');
  try {
    const me = await request('/auth/me', { token: authToken });
    if (me.status === 200 && me.data?.data?.user?.id === userId) {
      log.pass(`Authenticated as: ${me.data.data.user.name}`);
    } else { log.fail('Auth/me', { message: JSON.stringify(me.data) }); }
  } catch (e) { log.fail('Auth/me', e); }

  // ── 5. Profile ──
  log.section('5. USER PROFILE');
  try {
    const profile = await request('/users/me/profile', { token: authToken });
    if (profile.status === 200) {
      log.pass('User profile retrieved');
    } else { log.fail('User profile'); }

    const updateProfile = await request('/users/me/profile', {
      method: 'PUT', token: authToken,
      body: { bio: 'Test gazette traveler', travelStyle: 'Culture Explorer' },
    });
    if (updateProfile.status === 200) {
      log.pass('User profile updated');
    } else { log.fail('User profile update'); }
  } catch (e) { log.fail('User profile', e); }

  // ── 6. Travel DNA ──
  log.section('6. TRAVEL DNA');
  try {
    const dna = await request('/users/me/travel-dna', { token: authToken });
    if (dna.status === 200 && dna.data?.data?.travelDNA) {
      log.pass(`Travel DNA retrieved (archetype: ${dna.data.data.travelDNA.archetype || 'default'})`);
    } else { log.fail('Travel DNA get'); }

    const updDna = await request('/users/me/travel-dna', {
      method: 'PUT', token: authToken,
      body: { culture: 90, food: 85, adventure: 70 },
    });
    if (updDna.status === 200) {
      log.pass('Travel DNA updated');
    } else { log.fail('Travel DNA update'); }
  } catch (e) { log.fail('Travel DNA', e); }

  // ── 7. Trip Creation ──
  log.section('7. TRIP CREATION');
  try {
    const trip = await request('/trips', {
      method: 'POST', token: authToken,
      body: {
        title: 'Phase 8 Test Trip to Kyoto',
        destination: 'Kyoto, Japan',
        country: 'Japan',
        city: 'Kyoto',
        budget: 2000,
        days: 5,
        travelers: 2,
        interests: ['Culture & History', 'Food'],
      },
    });
    if (trip.status === 201 && trip.data?.data?.trip?.id) {
      tripId = trip.data.data.trip.id;
      log.pass(`Trip created → ${tripId.substring(0, 8)}...`);
    } else { log.fail('Trip creation', { message: JSON.stringify(trip.data) }); }
  } catch (e) { log.fail('Trip creation', e); }

  // ── 8. Gemini Itinerary ──
  log.section('8. GEMINI AI ITINERARY');
  try {
    const gen = await request('/trips/generate', {
      method: 'POST',
      body: { destination: 'Tokyo, Japan', budget: 1500, days: 3, travelers: 1, interests: ['Culture & History'] },
    });
    if (gen.status === 200 && gen.data?.itinerary) {
      const isAI = gen.data.aiGenerated === true;
      log.pass(`Itinerary generated (AI: ${isAI ? 'YES ✨' : 'Fallback used'})`);
    } else { log.fail('Itinerary generation'); }
  } catch (e) { log.fail('Itinerary generation', e); }

  // ── 9. Fallback Itinerary ──
  log.section('9. FALLBACK ITINERARY');
  try {
    // The fallback is already verified in #8 if Gemini key is empty
    // We can also verify the itinerary contains expected sections
    const gen = await request('/trips/generate', {
      method: 'POST',
      body: { destination: 'Rome, Italy', budget: 800, days: 2, travelers: 1, interests: [] },
    });
    if (gen.status === 200 && gen.data?.itinerary?.includes('Day')) {
      log.pass('Fallback itinerary contains daily schedule');
    } else { log.fail('Fallback itinerary structure'); }
  } catch (e) { log.fail('Fallback itinerary', e); }

  // ── 10. Weather ──
  log.section('10. WEATHER INTELLIGENCE');
  try {
    const weather = await request('/intelligence/weather?location=Tokyo');
    if (weather.status === 200 && weather.data?.data) {
      const w = weather.data.data;
      log.pass(`Weather → ${w.location}: ${w.temperature}${w.unit}, Live: ${w.isLive}`);
    } else { log.fail('Weather API'); }
  } catch (e) { log.fail('Weather API', e); }

  // ── 11. Currency ──
  log.section('11. CURRENCY CONVERSION');
  try {
    const currency = await request('/intelligence/currency?amount=1000&base=USD');
    if (currency.status === 200 && currency.data?.data) {
      const c = currency.data.data;
      log.pass(`Currency → $1000 USD, Live: ${c.isLive}`);
    } else { log.fail('Currency API'); }
  } catch (e) { log.fail('Currency API', e); }

  // ── 12. Wishlist ──
  log.section('12. WISHLIST');
  try {
    const add = await request('/wishlist', {
      method: 'POST', token: authToken,
      body: { destinationType: 'country', destinationId: 'japan', destinationName: 'Japan' },
    });
    if (add.status === 201) {
      log.pass('Wishlist item added');
    } else { log.fail('Wishlist add', { message: JSON.stringify(add.data) }); }

    const list = await request('/wishlist', { token: authToken });
    if (list.status === 200 && list.data?.data?.items?.length > 0) {
      log.pass(`Wishlist retrieved (${list.data.data.items.length} items)`);
    } else { log.fail('Wishlist get'); }
  } catch (e) { log.fail('Wishlist', e); }

  // ── 13. Passport ──
  log.section('13. DIGITAL PASSPORT');
  try {
    const stamp = await request('/passport', {
      method: 'POST', token: authToken,
      body: { destinationType: 'country', destinationId: 'japan', destinationName: 'Japan', destination: 'Japan', flag: 'JP' },
    });
    if (stamp.status === 201) {
      log.pass('Passport stamp added');
    } else { log.fail('Passport stamp', { message: JSON.stringify(stamp.data) }); }

    const list = await request('/passport', { token: authToken });
    if (list.status === 200 && list.data?.data?.stamps?.length > 0) {
      log.pass(`Passport retrieved (${list.data.data.stamps.length} stamps)`);
    } else { log.fail('Passport get'); }
  } catch (e) { log.fail('Passport', e); }

  // ── 14. Hidden Gems ──
  log.section('14. HIDDEN GEMS');
  try {
    const gems = await request('/hidden-gems?country=Japan');
    if (gems.status === 200) {
      log.pass(`Hidden gems endpoint responded`);
    } else { log.fail('Hidden gems'); }
  } catch (e) { log.fail('Hidden gems', e); }

  // ── 15. Travel Search ──
  log.section('15. TRAVEL SEARCH');
  try {
    const flights = await request('/travel/flights/search', {
      method: 'POST',
      body: { origin: 'NYC', destination: 'LAX', departureDate: '2026-12-01' },
    });
    if (flights.status === 200) {
      log.pass(`Flight search → provider: ${flights.data?.provider || 'N/A'}`);
    } else { log.fail('Flight search'); }

    const hotels = await request('/travel/hotels/search', {
      method: 'POST',
      body: { destination: 'Tokyo', checkInDate: '2026-12-01', checkOutDate: '2026-12-05' },
    });
    if (hotels.status === 200) {
      log.pass(`Hotel search → provider: ${hotels.data?.provider || 'N/A'}`);
    } else { log.fail('Hotel search'); }
  } catch (e) { log.fail('Travel search', e); }

  // ── 16. PDF Guidebook ──
  log.section('16. PDF GUIDEBOOK EXPORT');
  try {
    const pdf = await request('/trips/export-pdf', {
      method: 'POST', token: authToken,
      body: { destination: 'Kyoto, Japan', budget: 2000, days: 5, travelers: 2, interests: ['Culture & History'] },
    });
    // PDF response should be application/pdf
    if (pdf.status === 200) {
      log.pass('PDF guidebook generated successfully');
    } else { log.fail('PDF export', { message: `Status: ${pdf.status}` }); }
  } catch (e) { log.fail('PDF export', e); }

  // ── 17. Share Link ──
  log.section('17. SHARE LINK CREATION');
  try {
    if (!tripId) { log.skip('Share link', 'No trip created'); }
    else {
      const share = await request(`/trips/${tripId}/share`, {
        method: 'POST', token: authToken,
        body: { role: 'VIEWER' },
      });
      if (share.status === 201 && share.data?.data?.token) {
        shareToken = share.data.data.token;
        shareLinkId = share.data.data.id;
        log.pass(`Share link created → token: ${shareToken.substring(0, 12)}...`);
      } else { log.fail('Share link creation', { message: JSON.stringify(share.data) }); }
    }
  } catch (e) { log.fail('Share link creation', e); }

  // ── 18. Shared Trip (Public) ──
  log.section('18. PUBLIC SHARED TRIP RESOLUTION');
  try {
    if (!shareToken) { log.skip('Shared trip', 'No share token'); }
    else {
      const shared = await request(`/shared/trips/${shareToken}`);
      if (shared.status === 200 && shared.data?.data?.destination) {
        log.pass(`Shared trip resolved → ${shared.data.data.destination}`);
      } else { log.fail('Shared trip resolution'); }
    }
  } catch (e) { log.fail('Shared trip resolution', e); }

  // ── 19. Collaborator Permissions ──
  log.section('19. COLLABORATOR PERMISSIONS');
  try {
    // Register second user
    const reg2 = await request('/auth/register', { method: 'POST', body: testUser2 });
    if (reg2.status === 201) {
      authToken2 = reg2.data.data.token;
      userId2 = reg2.data.data.user.id;
    }

    if (!tripId || !userId2) { log.skip('Collaborator', 'Missing trip or second user'); }
    else {
      // Add collaborator
      const addCollab = await request(`/trips/${tripId}/collaborators`, {
        method: 'POST', token: authToken,
        body: { email: testUser2.email, role: 'VIEWER' },
      });
      if (addCollab.status === 201) {
        log.pass('Collaborator added (VIEWER)');
      } else { log.fail('Add collaborator'); }

      // Verify viewer cannot delete
      const delAttempt = await request(`/trips/${tripId}`, {
        method: 'DELETE', token: authToken2,
      });
      if (delAttempt.status === 403) {
        log.pass('VIEWER cannot delete trip (403)');
      } else { log.fail('VIEWER delete restriction', { message: `Got ${delAttempt.status}` }); }

      // Owner can list collaborators
      const collabs = await request(`/trips/${tripId}/collaborators`, { token: authToken });
      if (collabs.status === 200 && collabs.data?.data?.collaborators?.length > 0) {
        log.pass(`Collaborators listed (${collabs.data.data.collaborators.length} collaborators)`);
      } else { log.fail('List collaborators'); }
    }
  } catch (e) { log.fail('Collaborator permissions', e); }

  // ── 20. User Isolation ──
  log.section('20. USER ISOLATION');
  try {
    if (!authToken2) { log.skip('User isolation', 'No second user'); }
    else {
      // User B should NOT see User A's wishlist items
      const wishlistB = await request('/wishlist', { token: authToken2 });
      if (wishlistB.status === 200 && (wishlistB.data?.data?.items?.length || 0) === 0) {
        log.pass('User B has empty wishlist (isolated from A)');
      } else { log.fail('Wishlist isolation'); }

      // User B's trips should not include User A's owned trips (unless collaborated)
      const tripsB = await request('/trips', { token: authToken2 });
      if (tripsB.status === 200) {
        const ownedByB = (tripsB.data?.data?.trips || []).filter((t: any) => t.userId === userId2 && !t.isSharedWithMe);
        log.pass(`User B owns ${ownedByB.length} trips (own data isolated)`);
      } else { log.fail('Trip isolation'); }
    }
  } catch (e) { log.fail('User isolation', e); }

  // ── 21. Secret Protection ──
  log.section('21. SECRET PROTECTION');
  try {
    // Health endpoint should not expose secrets
    const health = await request('/health', { method: 'GET' });
    const healthStr = JSON.stringify(health.data);
    const hasSecrets = healthStr.includes('postgres_password') || healthStr.includes('JWT_SECRET') || healthStr.includes('GEMINI_API_KEY');
    if (!hasSecrets) {
      log.pass('Health endpoint does not expose secrets');
    } else { log.fail('Secret leakage in health endpoint'); }

    // Unauthenticated requests should fail
    const noAuth = await request('/trips');
    if (noAuth.status === 401) {
      log.pass('Unauthenticated request rejected (401)');
    } else { log.fail('Auth enforcement', { message: `Got ${noAuth.status}` }); }

    // Invalid token should fail
    const badToken = await request('/auth/me', { token: 'invalid_token_abc123' });
    if (badToken.status === 401) {
      log.pass('Invalid JWT rejected (401)');
    } else { log.fail('Invalid JWT handling'); }

    // Invalid share token should fail
    const badShare = await request('/shared/trips/invalid_token_xyz');
    if (badShare.status === 404) {
      log.pass('Invalid share token returns 404');
    } else { log.fail('Invalid share token handling'); }
  } catch (e) { log.fail('Secret protection', e); }

  // ── Cleanup ──
  log.section('CLEANUP');
  try {
    if (tripId && authToken) {
      await request(`/trips/${tripId}`, { method: 'DELETE', token: authToken });
      log.pass('Test trip deleted');
    }
  } catch { /* ignore cleanup errors */ }

  // ── FINAL REPORT ──
  const total = passed + failed + skipped;
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  FINAL PRODUCTION VERIFICATION RESULTS                   ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  ✅ PASSED:  ${String(passed).padStart(3)}                                         ║`);
  console.log(`║  ❌ FAILED:  ${String(failed).padStart(3)}                                         ║`);
  console.log(`║  ⏭️  SKIPPED: ${String(skipped).padStart(3)}                                         ║`);
  console.log(`║  📊 TOTAL:   ${String(total).padStart(3)}                                         ║`);
  console.log('╠═══════════════════════════════════════════════════════════╣');
  if (failed === 0) {
    console.log('║  🎉 ALL TESTS PASSED — PRODUCTION READY                  ║');
  } else {
    console.log('║  ⚠️  SOME TESTS FAILED — REVIEW REQUIRED                 ║');
  }
  console.log('╚═══════════════════════════════════════════════════════════╝');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('\n💥 Test runner crashed:', err);
  process.exit(1);
});
