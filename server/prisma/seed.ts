/**
 * PredicVerse — Prisma Database Seed
 * Phase 1 Development Seed Data
 *
 * This seed populates development-only HiddenGems data.
 * It NEVER overwrites or modifies real user data.
 * Safe to run multiple times (idempotent via upsert).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEV_HIDDEN_GEMS = [
  {
    id: 'gem_chand_baori',
    destination: 'Chand Baori',
    country: 'India',
    city: 'Abhaneri',
    codename: 'The Geometric Labyrinth of Rajasthan',
    description:
      'One of the deepest and largest stepwells in the world, featuring 3,500 narrow steps arranged in perfect geometric symmetry across 13 stories.',
    location: 'Abhaneri village, Dausa District, Rajasthan',
    crowdLevel: 'Low (15-20% Tourists)',
    estimatedCost: '$5-15/day entry',
    rating: 4.9,
    category: 'Heritage',
    latitude: 27.0083,
    longitude: 76.6051,
    imageUrl:
      'https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    id: 'gem_hallstatt_salt',
    destination: 'Hallstatt Salt Mine',
    country: 'Austria',
    city: 'Hallstatt',
    codename: 'The Ancient Salt Cathedral Beneath the Alps',
    description:
      'The world\'s oldest known salt mine with 7,000 years of history, featuring underground salt lakes and prehistoric mining tools still preserved in perfect condition.',
    location: 'Hallstatt, Salzkammergut, Austria',
    crowdLevel: 'Very Low (Under 10%)',
    estimatedCost: '$25-40 entry',
    rating: 4.85,
    category: 'History',
    latitude: 47.5622,
    longitude: 13.6493,
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    id: 'gem_giethoorn',
    destination: 'Giethoorn',
    country: 'Netherlands',
    city: 'Giethoorn',
    codename: 'The Village Without Roads',
    description:
      'A Dutch village accessible only by boat or on foot through canals — there are no roads. Historic thatched-roof farmhouses line waterways unchanged for centuries.',
    location: 'Giethoorn, Overijssel, Netherlands',
    crowdLevel: 'Low (Off-Season)',
    estimatedCost: '$30-60 boat rental',
    rating: 4.8,
    category: 'Culture',
    latitude: 52.7397,
    longitude: 6.0831,
    imageUrl:
      'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    id: 'gem_zhangye_danxia',
    destination: 'Zhangye Danxia',
    country: 'China',
    city: 'Zhangye',
    codename: 'The Rainbow Mountains of Gansu',
    description:
      'Geological wonder featuring naturally colored rock formations in red, orange, yellow, and green stripes formed over 24 million years of mineral deposits.',
    location: 'Zhangye National Geopark, Gansu Province, China',
    crowdLevel: 'Moderate (Weekdays only)',
    estimatedCost: '$15-25 entry',
    rating: 4.88,
    category: 'Nature',
    latitude: 38.9324,
    longitude: 100.0945,
    imageUrl:
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
  {
    id: 'gem_socotra',
    destination: 'Socotra Island',
    country: 'Yemen',
    city: 'Hadibo',
    codename: 'The Galapagos of the Arabian Sea',
    description:
      'Home to the alien-looking Dragon Blood Trees found nowhere else on Earth. 37% of plant species here are endemic to this isolated island.',
    location: 'Gulf of Aden, Yemen',
    crowdLevel: 'Very Low (Remote Access)',
    estimatedCost: '$80-150/day',
    rating: 4.95,
    category: 'Nature',
    latitude: 12.4634,
    longitude: 53.8237,
    imageUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  },
];

async function main() {
  console.log('[Seed] Starting PredicVerse development seed...');

  // Seed HiddenGems — upsert is idempotent (safe to run multiple times)
  let seeded = 0;
  for (const gem of DEV_HIDDEN_GEMS) {
    await prisma.hiddenGem.upsert({
      where: { id: gem.id },
      update: gem,
      create: gem,
    });
    seeded++;
    console.log(`[Seed] ✓ HiddenGem: ${gem.codename}`);
  }

  console.log(`[Seed] ✅ Seeded ${seeded} development Hidden Gems.`);
  console.log('[Seed] ⚠️  This is DEV data — never used in production without explicit review.');
  console.log('[Seed] Seed complete. Real user data was NOT affected.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
