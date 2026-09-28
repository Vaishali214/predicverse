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

async function runLiveProofVerification() {
  console.log('===========================================================');
  console.log('PREDICVERSE — FINAL LIVE API & DATA PROOF VERIFICATION');
  console.log('===========================================================\n');

  await ensureDatabaseReady();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
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

  console.log('--- 1. WEATHER API LIVE PROOF (Open-Meteo) ---');
  const cities = ['Paris', 'Tokyo', 'Delhi', 'London'];
  for (const city of cities) {
    try {
      const res = await fetch(`${baseUrl}/api/intelligence/weather?destination=${city}`);
      const data = await res.json();
      console.log(`Weather for ${city}:`, {
        status: res.status,
        location: data.data?.location,
        temp: `${data.data?.temperature}${data.data?.unit}`,
        condition: data.data?.condition,
        humidity: `${data.data?.humidity}%`,
        wind: `${data.data?.windSpeed} km/h`,
        isLive: data.data?.isLive,
      });
    } catch (err) {
      console.error(`Weather fetch error for ${city}:`, err);
    }
  }

  console.log('\n--- 2. CURRENCY API LIVE PROOF (open.er-api.com) ---');
  try {
    const res = await fetch(`${baseUrl}/api/intelligence/currency?amount=1000&from=USD`);
    const data = await res.json();
    console.log('Currency Rates (Base USD):', {
      status: res.status,
      isLive: data.data?.isLive,
      USD_to_INR: data.data?.rates?.INR,
      EUR_to_INR: data.data?.conversions?.EUR?.formatted,
      GBP_to_INR: data.data?.conversions?.GBP?.formatted,
      JPY_to_INR: data.data?.conversions?.JPY?.formatted,
    });
  } catch (err) {
    console.error('Currency fetch error:', err);
  }

  console.log('\n--- 3. GEMINI AI SERVICE PROOF ---');
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  console.log('Gemini Configuration:', {
    hasKey: !!apiKey && apiKey.trim() !== '' && !apiKey.includes('your_gemini_api_key'),
    model,
    endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    timeout: '12000ms',
    keyServerOnly: true,
  });

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_gemini_api_key')) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with JSON: {"status": "ok"}' }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        },
      );
      console.log('Gemini Live API Response Status:', response.status);
    } catch (err) {
      console.log('Gemini API Live Request Error:', err);
    }
  } else {
    console.log('Gemini API Key is unconfigured/dummy in local env. Algorithmic fallback engine active.');
  }

  console.log('\n--- 4. DATABASE & PERSISTENCE PROOF ---');
  try {
    const testEmail = `proof_user_${Date.now()}@predicverse.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Proof User', email: testEmail, password: 'Password123!' }),
    });
    const regData = await regRes.json();
    const token = regData.data?.token;
    console.log('User Auth Registration & JWT Token:', regRes.status, !!token);

    // Save DNA
    const dnaRes = await fetch(`${baseUrl}/api/users/me/travel-dna`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ culture: 92, food: 88, archetype: 'THE CULTURAL CULINARIAN' }),
    });
    const dnaData = await dnaRes.json();
    console.log('Travel DNA Saved:', dnaRes.status, dnaData.data?.travelDNA?.culture === 92);

    // Save Wishlist
    const wishRes = await fetch(`${baseUrl}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ destinationType: 'country', destinationId: 'japan', destinationName: 'Japan' }),
    });
    const wishData = await wishRes.json();
    console.log('Wishlist Saved:', wishRes.status, wishData.data?.item?.destinationId === 'japan');

    // Fetch Auth /me to verify persistence
    const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    const meData = await meRes.json();
    console.log('Auth Me Verification:', meRes.status, meData.data?.user?.email === testEmail);

    // Cleanup
    await prisma.user.deleteMany({ where: { email: testEmail } });
  } catch (err) {
    console.error('Database proof error:', err);
  } finally {
    server.close();
    await prisma.$disconnect();
  }

  console.log('\n===========================================================');
  console.log('LIVE PROOF COMPLETED');
  console.log('===========================================================');
}

runLiveProofVerification();
