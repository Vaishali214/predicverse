import { ensureDatabaseReady } from './db-server.js';
import { execSync } from 'child_process';

async function main() {
  console.log('[DB Init Script] Ensuring PostgreSQL server is active...');
  await ensureDatabaseReady();

  console.log('[DB Init Script] Pushing Prisma schema to PostgreSQL database...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[DB Init Script] ✓ Database schema pushed successfully.');
  } catch (err) {
    console.error('[DB Init Script] Error pushing schema:', err);
  }

  console.log('[DB Init Script] Seeding development data...');
  try {
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    console.log('[DB Init Script] ✓ Database seeded successfully.');
  } catch (err) {
    console.error('[DB Init Script] Error seeding database:', err);
  }

  console.log('[DB Init Script] Database initialization complete!');
}

main().catch(console.error);
