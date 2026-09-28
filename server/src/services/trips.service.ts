import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';
import { createTripSchema, updateTripSchema } from '../lib/validation.js';
import { AIService } from './ai.service.js';
import { CollaborationService } from './collaboration.service.js';

export class TripsService {
  static async getTrips(userId: string) {
    const ownedTrips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { itineraries: true },
        },
      },
    });

    const collabRecords = await prisma.tripCollaborator.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            _count: { select: { itineraries: true } },
          },
        },
      },
    });

    const sharedTrips = collabRecords.map((c) => ({
      ...c.trip,
      userRole: c.role,
      isSharedWithMe: true,
    }));

    return { trips: [...ownedTrips, ...sharedTrips] };
  }

  static async getTrip(userId: string, tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { itineraries: { include: { items: true }, orderBy: { dayNumber: 'asc' } } },
    });

    if (!trip) {
      throw new AppError('Trip not found.', 404);
    }

    const role = await CollaborationService.getUserRole(tripId, userId);
    if (!role) {
      throw new AppError('Access denied.', 403);
    }

    return { trip: { ...trip, userRole: role } };
  }

  static async createTrip(userId: string, data: z.infer<typeof createTripSchema>) {
    const { startDate, endDate, interests, ...rest } = data;

    const trip = await prisma.trip.create({
      data: {
        ...rest,
        userId,
        interests: JSON.stringify(interests ?? []),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return { trip };
  }

  static async updateTrip(userId: string, tripId: string, data: z.infer<typeof updateTripSchema>) {
    const existing = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!existing) {
      throw new AppError('Trip not found.', 404);
    }

    const role = await CollaborationService.getUserRole(tripId, userId);
    if (role !== 'OWNER' && role !== 'EDITOR') {
      throw new AppError('Access denied.', 403);
    }

    const { startDate, endDate, interests, ...rest } = data;

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...rest,
        ...(interests !== undefined ? { interests: JSON.stringify(interests) } : {}),
        ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
      },
    });

    return { trip };
  }

  static async deleteTrip(userId: string, tripId: string) {
    const existing = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!existing) {
      throw new AppError('Trip not found.', 404);
    }

    const role = await CollaborationService.getUserRole(tripId, userId);
    if (role !== 'OWNER') {
      throw new AppError('Access denied.', 403);
    }

    await prisma.trip.delete({ where: { id: tripId } });
    return { message: 'Trip deleted successfully.' };
  }

  static async generateItinerary(data: any) {
    const { destination, budget, days, travelers, interests, travelStyle } = data;

    // 1. Try Gemini AI generation first
    const aiResult = await AIService.generateTripPlan({
      destination: destination || 'Global',
      budget: budget || 1000,
      days: days || 3,
      travelers: travelers || 1,
      interests: interests || [],
      travelStyle,
    });

    if (aiResult) {
      const lines: string[] = [];
      lines.push(`### 🤖 AI-Generated Itinerary for ${aiResult.destination} (${aiResult.durationDays} Days)`);
      lines.push(`**Estimated Total Cost:** $${aiResult.estimatedTotalCost} ${aiResult.currency} | **Travelers:** ${travelers || 1}`);
      lines.push(`**Weather Note:** ${aiResult.weatherNotes}\n`);

      aiResult.dailyPlan.forEach((day) => {
        lines.push(`#### Day ${day.dayNumber}: ${day.theme}`);
        lines.push(`- **Morning:** ${day.morning}`);
        lines.push(`- **Afternoon:** ${day.afternoon}`);
        lines.push(`- **Evening:** ${day.evening}`);
        lines.push(`- **Local Food:** ${day.foodRecommendation}`);
        lines.push(`- **Transport:** ${day.transportTip}`);
        lines.push(`- **Est. Daily Cost:** $${day.estimatedDailyCost}\n`);
      });

      if (aiResult.hiddenGems && aiResult.hiddenGems.length > 0) {
        lines.push(`💎 **Hidden Gems:**`);
        aiResult.hiddenGems.forEach((gem) => lines.push(`- ${gem}`));
        lines.push('');
      }

      if (aiResult.culturalTips && aiResult.culturalTips.length > 0) {
        lines.push(`🏛️ **Cultural Etiquette:**`);
        aiResult.culturalTips.forEach((tip) => lines.push(`- ${tip}`));
        lines.push('');
      }

      return {
        destination: aiResult.destination,
        budget: aiResult.estimatedTotalCost,
        days: aiResult.durationDays,
        travelers: travelers || 1,
        interests: interests || [],
        itinerary: lines.join('\n'),
        aiGenerated: true,
        structuredAI: aiResult,
      };
    }

    // 2. Algorithmic Fallback Itinerary
    const itineraryLines: string[] = [];
    itineraryLines.push(`### 🏛️ Day-by-Day Itinerary for ${destination} (${days} Days)`);
    itineraryLines.push(
      `**Budget Tier:** $${budget} | **Travelers:** ${travelers} | **Style:** ${(interests || []).join(', ')}\n`,
    );

    for (let day = 1; day <= (days || 3); day++) {
      itineraryLines.push(`#### Day ${day}: Exploring Core Landmarks & Culinary Delights`);
      itineraryLines.push(`- **Morning (09:00 - 12:30):** Historic Walking Tour & Breakfast at local iconic cafe.`);
      itineraryLines.push(
        `- **Afternoon (13:00 - 17:00):** Visit primary attractions and local artisan markets.`,
      );
      itineraryLines.push(
        `- **Evening (18:30 - 21:30):** Dinner experiencing traditional regional cuisine and night market stroll.\n`,
      );
    }

    itineraryLines.push(`---`);
    itineraryLines.push(`💰 **Estimated Budget Breakdown:**`);
    itineraryLines.push(`- Accommodation: $${Math.round((budget || 1000) * 0.4)}`);
    itineraryLines.push(`- Food & Dining: $${Math.round((budget || 1000) * 0.3)}`);
    itineraryLines.push(`- Activities & Entry Fees: $${Math.round((budget || 1000) * 0.2)}`);
    itineraryLines.push(`- Transport: $${Math.round((budget || 1000) * 0.1)}`);

    return {
      destination: destination || 'Global',
      budget: budget || 1000,
      days: days || 3,
      travelers: travelers || 1,
      interests: interests || [],
      itinerary: itineraryLines.join('\n'),
      aiGenerated: false,
    };
  }
}
