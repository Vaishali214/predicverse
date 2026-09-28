import express from 'express';
import http from 'http';
import { tripsRouter } from './routes/trips.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ensureDatabaseReady } from './lib/db-server.js';
import { AIService, aiItineraryResponseSchema } from './services/ai.service.js';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();

async function runAIQualityVerification() {
  console.log('===========================================================');
  console.log('PREDICVERSE — PHASE 3 AI QUALITY & FALLBACK TEST SUITE');
  console.log('===========================================================\n');

  await ensureDatabaseReady();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use('/api/trips', tripsRouter);
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
    // -------------------------------------------------------------
    // Test 1: Representative Payload - Paris (Medium Budget, Culture + Food)
    // -------------------------------------------------------------
    const res1 = await fetch(`${baseUrl}/api/trips/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: 'Paris, France',
        days: 3,
        travelers: 2,
        budget: 2500,
        interests: ['Culture', 'Food'],
      }),
    });
    const data1 = await res1.json();
    const hasValidStructure1 = data1.destination === 'Paris, France' && typeof data1.itinerary === 'string' && data1.days === 3;
    assertTest('Test 1: Paris Itinerary Generation (200 OK & Valid Structure)', res1.status === 200 && hasValidStructure1);

    // -------------------------------------------------------------
    // Test 2: Representative Payload - Tokyo (High Budget, Food + Shopping)
    // -------------------------------------------------------------
    const res2 = await fetch(`${baseUrl}/api/trips/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: 'Tokyo, Japan',
        days: 5,
        travelers: 1,
        budget: 5000,
        interests: ['Food', 'Shopping', 'Technology'],
      }),
    });
    const data2 = await res2.json();
    const hasValidStructure2 = data2.destination === 'Tokyo, Japan' && typeof data2.itinerary === 'string' && data2.days === 5;
    assertTest('Test 2: Tokyo Itinerary Generation (200 OK & 5-Day Structure)', res2.status === 200 && hasValidStructure2);

    // -------------------------------------------------------------
    // Test 3: Representative Payload - Manali (Low Budget, Nature + Adventure)
    // -------------------------------------------------------------
    const res3 = await fetch(`${baseUrl}/api/trips/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: 'Manali, India',
        days: 3,
        travelers: 4,
        budget: 600,
        interests: ['Nature', 'Adventure'],
      }),
    });
    const data3 = await res3.json();
    const hasValidStructure3 = data3.destination === 'Manali, India' && typeof data3.itinerary === 'string' && data3.days === 3;
    assertTest('Test 3: Manali Low-Budget Itinerary Generation (200 OK & 3-Day Structure)', res3.status === 200 && hasValidStructure3);

    // -------------------------------------------------------------
    // Test 4: Deterministic Fallback Simulation (Gemini Unavailable)
    // -------------------------------------------------------------
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = ''; // Simulate unconfigured/unavailable API key

    const res4 = await fetch(`${baseUrl}/api/trips/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: 'Rome, Italy',
        days: 4,
        travelers: 2,
        budget: 1800,
        interests: ['History', 'Culture'],
      }),
    });
    const data4 = await res4.json();
    const fallbackSuccess = res4.status === 200 && data4.aiGenerated === false && data4.destination === 'Rome, Italy';
    assertTest('Test 4: Graceful Deterministic Fallback when Gemini Key Unset (aiGenerated: false)', fallbackSuccess);

    process.env.GEMINI_API_KEY = originalKey; // Restore key

    // -------------------------------------------------------------
    // Test 5: Zod Schema Validation on AI Structure
    // -------------------------------------------------------------
    const sampleAIJson = {
      destination: 'Kyoto, Japan',
      durationDays: 2,
      estimatedTotalCost: 1200,
      currency: 'USD',
      dailyPlan: [
        {
          dayNumber: 1,
          theme: 'Ancient Temples & Zen Gardens',
          morning: 'Visit Fushimi Inari Shrine',
          afternoon: 'Explore Kiyomizu-dera Temple',
          evening: 'Gion District Geisha Quarter Stroll',
          foodRecommendation: 'Traditional Kaiseki Dinner',
          transportTip: 'Kyoto Bus Pass',
          estimatedDailyCost: 600,
        },
        {
          dayNumber: 2,
          theme: 'Bamboo Groves & Arashiyama',
          morning: 'Walk through Arashiyama Bamboo Grove',
          afternoon: 'Monkey Park Iwatayama',
          evening: 'Pontocho Alley Izakaya Stroll',
          foodRecommendation: 'Matcha Parfait & Yudofu',
          transportTip: 'JR Sagano Line',
          estimatedDailyCost: 600,
        },
      ],
      culturalTips: ['Bow gently when greeting', 'Take off shoes inside traditional rooms'],
      weatherNotes: 'Pleasant spring weather around 18°C',
      hiddenGems: ['Otagi Nenbutsu-ji Temple'],
      practicalTips: ['Keep small cash for temples'],
    };

    const zodCheck = aiItineraryResponseSchema.safeParse(sampleAIJson);
    assertTest('Test 5: Zod AI Output Schema Validation (Validates Strict Structure)', zodCheck.success);

    const malformedJson = { destination: 'Incomplete', durationDays: 'two' }; // Invalid types
    const zodCheckFail = aiItineraryResponseSchema.safeParse(malformedJson);
    assertTest('Test 5b: Zod AI Output Schema Validation (Rejects Malformed JSON)', !zodCheckFail.success);

    // -------------------------------------------------------------
    // Test 6: Secret Protection Check (GEMINI_API_KEY never in response payload)
    // -------------------------------------------------------------
    const rawResponseText = JSON.stringify(data1) + JSON.stringify(data2) + JSON.stringify(data3) + JSON.stringify(data4);
    const keyLeaked = originalKey && originalKey.length > 5 ? rawResponseText.includes(originalKey) : false;
    assertTest('Test 6: Security Check — GEMINI_API_KEY is Never Leaked in API Responses', !keyLeaked);
  } catch (err) {
    console.error('AI Quality test execution exception:', err);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  }

  console.log('\n===========================================================');
  console.log(`AI TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log('===========================================================');
  if (passed !== total) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAIQualityVerification();
