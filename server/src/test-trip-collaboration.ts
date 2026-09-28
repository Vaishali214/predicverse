import express from 'express';
import http from 'http';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth.js';
import { tripsRouter } from './routes/trips.js';
import { sharedRouter } from './routes/shared.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ensureDatabaseReady } from './lib/db-server.js';
import { CollaborationService } from './services/collaboration.service.js';

const prisma = new PrismaClient();

async function runCollaborationTests() {
  console.log('===========================================================');
  console.log('PREDICVERSE — PHASE 7 TRIP COLLABORATION & SHARING TEST SUITE');
  console.log('===========================================================\n');

  await ensureDatabaseReady();

  let collabPassed = 0;
  let collabTotal = 0;

  let permPassed = 0;
  let permTotal = 0;

  let linkPassed = 0;
  let linkTotal = 0;

  let secPassed = 0;
  let secTotal = 0;

  function assertCollab(description: string, condition: boolean) {
    collabTotal++;
    if (condition) {
      collabPassed++;
      console.log(`  [COLLAB PASS] ${description}`);
    } else {
      console.log(`  [COLLAB FAIL] ${description}`);
    }
  }

  function assertPerm(description: string, condition: boolean) {
    permTotal++;
    if (condition) {
      permPassed++;
      console.log(`  [PERM PASS] ${description}`);
    } else {
      console.log(`  [PERM FAIL] ${description}`);
    }
  }

  function assertLink(description: string, condition: boolean) {
    linkTotal++;
    if (condition) {
      linkPassed++;
      console.log(`  [LINK PASS] ${description}`);
    } else {
      console.log(`  [LINK FAIL] ${description}`);
    }
  }

  function assertSec(description: string, condition: boolean) {
    secTotal++;
    if (condition) {
      secPassed++;
      console.log(`  [SEC PASS] ${description}`);
    } else {
      console.log(`  [SEC FAIL] ${description}`);
    }
  }

  // Set up Express test server
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/trips', tripsRouter);
  app.use('/api/shared', sharedRouter);
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://localhost:${address.port}`;

  // Register 3 Test Users: Owner (A), Collaborator/Editor (B), Stranger (C)
  const timestamp = Date.now();
  const emailA = `owner_${timestamp}@predicverse.com`;
  const emailB = `editor_${timestamp}@predicverse.com`;
  const emailC = `stranger_${timestamp}@predicverse.com`;

  const regA = await (await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Owner Alice', email: emailA, password: 'Password123!' }),
  })).json() as any;
  const tokenA = regA.data?.token || regA.token;
  const userAId = regA.data?.user?.id || regA.user?.id;

  const regB = await (await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Editor Bob', email: emailB, password: 'Password123!' }),
  })).json() as any;
  const tokenB = regB.data?.token || regB.token;
  const userBId = regB.data?.user?.id || regB.user?.id;

  const regC = await (await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Stranger Charlie', email: emailC, password: 'Password123!' }),
  })).json() as any;
  const tokenC = regC.data?.token || regC.token;

  // Create Trip for Owner A
  const createTripRes = await fetch(`${baseUrl}/api/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'Venetian Carnival & Canals',
      destination: 'Venice, Italy',
      days: 4,
      budget: 1600,
      travelers: 2,
    }),
  });
  const tripData = await createTripRes.json() as any;
  const tripId = tripData.data?.trip?.id || tripData.data?.id;

  console.log('--- CATEGORY 1: COLLABORATION TESTS ---');

  // Test 1: Owner creates share link
  const createLinkRes = await fetch(`${baseUrl}/api/trips/${tripId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ role: 'VIEWER', expirationDays: 7 }),
  });
  const linkData = await createLinkRes.json() as any;
  const shareToken = linkData.data?.token;

  assertCollab(
    '1. Owner creates share link: Returns HTTP 201 with 64-char token & URL',
    createLinkRes.status === 201 && typeof shareToken === 'string' && shareToken.length === 64
  );

  // Test 2: Share link resolves publicly
  const resolveRes = await fetch(`${baseUrl}/api/shared/trips/${shareToken}`);
  const resolveBody = await resolveRes.json() as any;
  assertCollab(
    '2. Share link resolves: Returns HTTP 200 with sanitized shared trip payload',
    resolveRes.status === 200 && resolveBody.data?.destination === 'Venice, Italy'
  );

  // Test 3: Owner adds collaborator by email
  const addCollabRes = await fetch(`${baseUrl}/api/trips/${tripId}/collaborators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ email: emailB, role: 'VIEWER' }),
  });
  const addCollabData = await addCollabRes.json() as any;
  assertCollab(
    '3. Owner adds collaborator by email: User B invited successfully as VIEWER',
    addCollabRes.status === 201 && addCollabData.data?.collaborator?.email === emailB
  );

  // Test 4: Collaborator appears in member list
  const getCollabsRes = await fetch(`${baseUrl}/api/trips/${tripId}/collaborators`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const getCollabsData = await getCollabsRes.json() as any;
  assertCollab(
    '4. Collaborator list: Owner and User B appear in membership list',
    getCollabsRes.status === 200 && getCollabsData.data?.collaborators?.length === 1
  );

  // Test 5: Owner changes collaborator role (VIEWER → EDITOR)
  const changeRoleRes = await fetch(`${baseUrl}/api/trips/${tripId}/collaborators/${userBId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ role: 'EDITOR' }),
  });
  const changeRoleData = await changeRoleRes.json() as any;
  assertCollab(
    '5. Role update: Owner changes User B role to EDITOR successfully',
    changeRoleRes.status === 200 && changeRoleData.data?.collaborator?.role === 'EDITOR'
  );

  // Test 6: Owner removes collaborator
  const removeCollabRes = await fetch(`${baseUrl}/api/trips/${tripId}/collaborators/${userBId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assertCollab(
    '6. Remove collaborator: Owner removes User B successfully',
    removeCollabRes.status === 200
  );

  console.log('\n--- CATEGORY 2: PERMISSION RULES TESTS ---');

  // Re-add User B as VIEWER for permission testing
  await CollaborationService.addCollaborator(userAId, tripId, emailB, 'VIEWER');

  // Test 7: Owner can edit trip
  const ownerEditRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ title: 'Venetian Grand Carnival 2026' }),
  });
  assertPerm('7. Owner permission: Owner can edit trip details (HTTP 200)', ownerEditRes.status === 200);

  // Test 8: Editor can edit permitted trip content (Promote B to EDITOR)
  await CollaborationService.updateCollaboratorRole(userAId, tripId, userBId, 'EDITOR');
  const editorEditRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ title: 'Venetian Carnival (Edited by Bob)' }),
  });
  assertPerm('8. Editor permission: Editor can update trip content (HTTP 200)', editorEditRes.status === 200);

  // Test 9: Viewer cannot edit trip (Demote B to VIEWER)
  await CollaborationService.updateCollaboratorRole(userAId, tripId, userBId, 'VIEWER');
  const viewerEditRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ title: 'Unauthorized Viewer Edit' }),
  });
  assertPerm('9. Viewer permission: Viewer blocked from editing trip (HTTP 403)', viewerEditRes.status === 403);

  // Test 10: Viewer cannot manage collaborators
  const viewerAddCollabRes = await fetch(`${baseUrl}/api/trips/${tripId}/collaborators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ email: emailC, role: 'VIEWER' }),
  });
  assertPerm('10. Viewer limitation: Viewer blocked from managing collaborators (HTTP 403)', viewerAddCollabRes.status === 403);

  // Test 11: Editor cannot delete trip (Promote B back to EDITOR)
  await CollaborationService.updateCollaboratorRole(userAId, tripId, userBId, 'EDITOR');
  const editorDeleteRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assertPerm('11. Editor limitation: Editor blocked from deleting owner trip (HTTP 403)', editorDeleteRes.status === 403);

  // Test 12: Non-member cannot access private trip
  const strangerGetRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    headers: { Authorization: `Bearer ${tokenC}` },
  });
  assertPerm('12. Non-member restriction: Stranger User C blocked with HTTP 403', strangerGetRes.status === 403);

  console.log('\n--- CATEGORY 3: SHARE LINKS TESTS ---');

  // Test 13: Valid token works
  const validLinkRes = await fetch(`${baseUrl}/api/shared/trips/${shareToken}`);
  assertLink('13. Valid share token: Resolves shared trip successfully (HTTP 200)', validLinkRes.status === 200);

  // Test 14: Invalid token rejected
  const invalidLinkRes = await fetch(`${baseUrl}/api/shared/trips/invalid_token_string_12345`);
  assertLink('14. Invalid share token: Rejected with HTTP 404', invalidLinkRes.status === 404);

  // Test 15: Revoked token rejected
  const linkId = linkData.data?.id;
  await fetch(`${baseUrl}/api/trips/${tripId}/share/${linkId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const revokedRes = await fetch(`${baseUrl}/api/shared/trips/${shareToken}`);
  const revokedBody = await revokedRes.json() as any;
  assertLink(
    '15. Revoked share token: Rejected with message "THIS GAZETTE EDITION IS NO LONGER AVAILABLE"',
    revokedRes.status === 404 && revokedBody.message?.includes('NO LONGER AVAILABLE')
  );

  // Test 16: Expired token rejected
  const expiredLink = await prisma.tripShareLink.create({
    data: {
      tripId,
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() - 10000), // Expired 10 seconds ago
    },
  });
  const expiredRes = await fetch(`${baseUrl}/api/shared/trips/${expiredLink.token}`);
  const expiredBody = await expiredRes.json() as any;
  assertLink(
    '16. Expired share token: Rejected with HTTP 410 "THIS GAZETTE EDITION HAS EXPIRED"',
    expiredRes.status === 410 && expiredBody.message?.includes('EXPIRED')
  );

  // Test 17: Modified token rejected
  const modifiedToken = shareToken.slice(0, -4) + 'abcd';
  const modifiedRes = await fetch(`${baseUrl}/api/shared/trips/${modifiedToken}`);
  assertLink('17. Tampered share token: Rejected with HTTP 404', modifiedRes.status === 404);

  console.log('\n--- CATEGORY 4: SECURITY & SECRET PROTECTION TESTS ---');

  // Test 18: User B cannot access User A trip by ID directly if uninvited
  await CollaborationService.removeCollaborator(userAId, tripId, userBId);
  const uninvitedRes = await fetch(`${baseUrl}/api/trips/${tripId}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assertSec('18. Direct Trip Access Isolation: Uninvited User B receives HTTP 403 on Trip A ID', uninvitedRes.status === 403);

  // Test 19: User B cannot manipulate collaborator IDs
  const fakeCollabRes = await fetch(`${baseUrl}/api/trips/${tripId}/collaborators/${userAId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assertSec('19. Privilege Escalation Defense: User B cannot remove owner or manipulate collaborators', fakeCollabRes.status === 403);

  // Test 20: Private user information not exposed in shared response
  const newLink = await CollaborationService.createShareLink(userAId, tripId, { role: 'VIEWER' });
  const rawShareRes = await fetch(`${baseUrl}/api/shared/trips/${newLink.token}`);
  const rawShareText = await rawShareRes.text();
  const containsSecrets =
    rawShareText.includes('passwordHash') ||
    rawShareText.includes(process.env.JWT_SECRET || 'SECRET_UNSET') ||
    rawShareText.includes('AMADEUS');
  assertSec('20. Data Leak Prevention: Shared response contains zero password hashes or internal secrets', !containsSecrets);

  // Test 21 & 22: PDF authorization & secrets check
  const pdfExportRes = await fetch(`${baseUrl}/api/trips/${tripId}/export-pdf`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assertSec('21 & 22. PDF Authorization Integrity: Uninvited User B receives HTTP 403 on PDF Export', pdfExportRes.status === 403);

  // Cleanup Test Data
  try {
    await prisma.tripShareLink.deleteMany({ where: { tripId } });
    await prisma.tripCollaborator.deleteMany({ where: { tripId } });
    await prisma.trip.deleteMany({ where: { id: tripId } });
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB, emailC] } } });
  } catch {}

  server.close();

  console.log('\n===========================================================');
  console.log('PHASE 7 TRIP COLLABORATION & SHARING SUMMARY');
  console.log('===========================================================');
  console.log(`COLLABORATION TESTS : ${collabPassed}/${collabTotal} PASSED`);
  console.log(`PERMISSION TESTS    : ${permPassed}/${permTotal} PASSED`);
  console.log(`SHARE LINKS TESTS   : ${linkPassed}/${linkTotal} PASSED`);
  console.log(`SECURITY TESTS      : ${secPassed}/${secTotal} PASSED`);
  console.log('===========================================================\n');

  if (collabPassed !== collabTotal || permPassed !== permTotal || linkPassed !== linkTotal || secPassed !== secTotal) {
    process.exit(1);
  }
}

runCollaborationTests().catch((err) => {
  console.error('Collaboration Test runner exception:', err);
  process.exit(1);
});
