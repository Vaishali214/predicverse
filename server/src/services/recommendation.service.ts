import { prisma } from '../lib/prisma.js';

export interface RecommendationMatchResult {
  destinationId: string;
  destinationName: string;
  matchPercentage: number;
  archetype: string;
  reasons: string[];
  breakdown: Record<string, { userScore: number; destScore: number; match: number }>;
}

const DESTINATION_PROFILES: Record<string, { name: string; scores: Record<string, number> }> = {
  japan: {
    name: 'Japan',
    scores: { culture: 95, food: 92, history: 90, nature: 82, adventure: 65, relaxation: 75 },
  },
  india: {
    name: 'India',
    scores: { culture: 96, food: 95, history: 94, nature: 80, adventure: 75, relaxation: 60 },
  },
  france: {
    name: 'France',
    scores: { culture: 94, food: 96, history: 90, nature: 72, adventure: 60, relaxation: 78 },
  },
  austria: {
    name: 'Austria',
    scores: { culture: 90, food: 80, history: 88, nature: 92, adventure: 75, relaxation: 85 },
  },
  netherlands: {
    name: 'Netherlands',
    scores: { culture: 90, food: 78, history: 85, nature: 75, adventure: 60, relaxation: 88 },
  },
  usa: {
    name: 'United States',
    scores: { culture: 82, food: 85, history: 70, nature: 90, adventure: 92, relaxation: 70 },
  },
  italy: {
    name: 'Italy',
    scores: { culture: 95, food: 98, history: 95, nature: 80, adventure: 65, relaxation: 78 },
  },
};

export class RecommendationService {
  static async calculateMatch(userId: string | undefined, destinationId: string): Promise<RecommendationMatchResult> {
    const destKey = destinationId.toLowerCase().trim();
    const dest = DESTINATION_PROFILES[destKey] || {
      name: destinationId.toUpperCase(),
      scores: { culture: 80, food: 80, history: 80, nature: 80, adventure: 70, relaxation: 70 },
    };

    let userScores = {
      culture: 75,
      food: 82,
      adventure: 65,
      nature: 70,
      history: 78,
      relaxation: 60,
    };
    let userArchetype = 'THE CULTURAL EXPLORER';

    if (userId) {
      const dna = await prisma.travelDNA.findUnique({ where: { userId } });
      if (dna) {
        userScores = {
          culture: dna.culture,
          food: dna.food,
          adventure: dna.adventure,
          nature: dna.nature,
          history: dna.history,
          relaxation: dna.relaxation,
        };
        userArchetype = dna.archetype || 'THE CULTURAL EXPLORER';
      }
    }

    const categories = ['culture', 'food', 'adventure', 'nature', 'history', 'relaxation'] as const;
    let totalDiff = 0;
    const breakdown: Record<string, { userScore: number; destScore: number; match: number }> = {};
    const reasons: string[] = [];

    categories.forEach((cat) => {
      const uScore = userScores[cat];
      const dScore = dest.scores[cat] ?? 75;
      const diff = Math.abs(uScore - dScore);
      totalDiff += diff;
      const catMatch = Math.max(0, 100 - diff);
      breakdown[cat] = { userScore: uScore, destScore: dScore, match: catMatch };

      if (uScore >= 70 && dScore >= 80) {
        if (cat === 'culture') reasons.push('✓ High cultural exploration potential matching your profile');
        if (cat === 'food') reasons.push('✓ Strong culinary scene aligned with your food preference');
        if (cat === 'history') reasons.push('✓ Rich heritage and ancient historical landmarks');
        if (cat === 'nature') reasons.push('✓ Breathtaking natural landscapes and scenic beauty');
        if (cat === 'adventure') reasons.push('✓ Exciting outdoor activities and active exploration');
        if (cat === 'relaxation') reasons.push('✓ Peaceful atmosphere and tranquil retreats');
      }
    });

    const averageDiff = totalDiff / categories.length;
    const matchPercentage = Math.round(Math.max(50, Math.min(99, 100 - averageDiff * 0.5)));

    if (reasons.length === 0) {
      reasons.push('✓ Fits your preferred travel style and interests');
      reasons.push('✓ Balanced mix of sightseeing and local experiences');
    }

    return {
      destinationId: destKey,
      destinationName: dest.name,
      matchPercentage,
      archetype: userArchetype,
      reasons: reasons.slice(0, 4),
      breakdown,
    };
  }
}
