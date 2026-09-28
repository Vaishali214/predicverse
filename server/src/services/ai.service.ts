import { z } from 'zod';

export const aiDailyPlanSchema = z.object({
  dayNumber: z.number().int().positive(),
  theme: z.string(),
  morning: z.string(),
  afternoon: z.string(),
  evening: z.string(),
  foodRecommendation: z.string(),
  transportTip: z.string(),
  estimatedDailyCost: z.number().nonnegative(),
});

export const aiItineraryResponseSchema = z.object({
  destination: z.string(),
  durationDays: z.number().int().positive(),
  estimatedTotalCost: z.number().nonnegative(),
  currency: z.string().default('USD'),
  dailyPlan: z.array(aiDailyPlanSchema).min(1),
  culturalTips: z.array(z.string()).default([]),
  weatherNotes: z.string().default(''),
  hiddenGems: z.array(z.string()).default([]),
  practicalTips: z.array(z.string()).default([]),
});

export type AIItineraryResponse = z.infer<typeof aiItineraryResponseSchema>;

export class AIService {
  static async generateTripPlan(params: {
    destination: string;
    budget: number;
    days: number;
    travelers: number;
    interests: string[];
    travelStyle?: string;
    travelDNA?: any;
  }): Promise<AIItineraryResponse | null> {
    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback if GEMINI_API_KEY is not configured or blank
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
      return null;
    }

    try {
      const interestsList = params.interests && params.interests.length > 0
        ? params.interests.join(', ')
        : 'General Exploration & Culture';

      const prompt = `You are a world-class travel guide and cultural intelligence expert for PredicVerse.
Generate a highly tailored, day-by-day travel itinerary for:
- Destination: ${params.destination}
- Duration: ${params.days} day(s) (Create exactly ${params.days} daily entries in dailyPlan)
- Total Budget: $${params.budget} USD (Adjust activities to fit a budget level of $${params.budget} total)
- Travelers: ${params.travelers} traveler(s)
- Selected Interests: ${interestsList}
${params.travelStyle ? `- Travel Style Preference: ${params.travelStyle}` : ''}
${params.travelDNA ? `- Travel DNA Profile: ${params.travelDNA.archetype || 'Explorer'}` : ''}

STRICT REQUIREMENTS:
1. Return ONLY valid, raw JSON. Do NOT wrap in markdown code blocks like \`\`\`json or include explanatory text.
2. The JSON MUST strictly follow this exact structure:
{
  "destination": "${params.destination}",
  "durationDays": ${params.days},
  "estimatedTotalCost": ${params.budget},
  "currency": "USD",
  "dailyPlan": [
    {
      "dayNumber": 1,
      "theme": "Descriptive Day Theme",
      "morning": "Detailed morning activity aligned with interests",
      "afternoon": "Detailed afternoon activity aligned with interests",
      "evening": "Detailed evening activity aligned with interests",
      "foodRecommendation": "Authentic regional dish or recommended restaurant",
      "transportTip": "Practical local transport advice",
      "estimatedDailyCost": ${Math.round(params.budget / (params.days || 1))}
    }
  ],
  "culturalTips": ["Etiquette or local custom tip 1", "Tip 2"],
  "weatherNotes": "Seasonal weather expectations summary",
  "hiddenGems": ["Secret spot or off-the-beaten-path highlight 1", "Spot 2"],
  "practicalTips": ["Safety or local utility tip 1", "Tip 2"]
}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout protection

      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[AIService] Gemini API request returned status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        console.warn('[AIService] Gemini API response contained no candidate text.');
        return null;
      }

      // Clean markdown fencing if present
      const cleanedJsonText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const rawParsed = JSON.parse(cleanedJsonText);
      const validated = aiItineraryResponseSchema.safeParse(rawParsed);

      if (!validated.success) {
        console.warn('[AIService] Gemini output failed Zod schema validation:', validated.error.format());
        return null;
      }

      return validated.data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('[AIService] Gemini request timed out after 12s. Fallback engine activated.');
      } else {
        console.warn('[AIService] Gemini request exception:', err.message || err);
      }
      return null;
    }
  }
}
