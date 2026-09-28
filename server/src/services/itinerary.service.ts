import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';
import {
  createItineraryDaySchema,
  updateItineraryDaySchema,
  createItineraryItemSchema,
  updateItineraryItemSchema,
} from '../lib/validation.js';

export class ItineraryService {
  static async verifyTripOwnership(tripId: string, userId: string): Promise<void> {
    const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { userId: true } });
    if (!trip) throw new AppError('Trip not found.', 404);
    if (trip.userId !== userId) throw new AppError('Access denied.', 403);
  }

  static async verifyDayOwnership(dayId: string, userId: string): Promise<{ tripId: string }> {
    const day = await prisma.itinerary.findUnique({
      where: { id: dayId },
      include: { trip: { select: { userId: true } } },
    });
    if (!day) throw new AppError('Itinerary day not found.', 404);
    if (day.trip.userId !== userId) throw new AppError('Access denied.', 403);
    return { tripId: day.tripId };
  }

  static async verifyItemOwnership(itemId: string, userId: string): Promise<void> {
    const item = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      include: { itinerary: { include: { trip: { select: { userId: true } } } } },
    });
    if (!item) throw new AppError('Itinerary item not found.', 404);
    if (item.itinerary.trip.userId !== userId) throw new AppError('Access denied.', 403);
  }

  static async getItinerary(userId: string, tripId: string) {
    await this.verifyTripOwnership(tripId, userId);

    const itinerary = await prisma.itinerary.findMany({
      where: { tripId },
      orderBy: { dayNumber: 'asc' },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    return { itinerary };
  }

  static async createDay(userId: string, tripId: string, data: z.infer<typeof createItineraryDaySchema>) {
    await this.verifyTripOwnership(tripId, userId);

    const { date, ...rest } = data;
    const day = await prisma.itinerary.create({
      data: {
        ...rest,
        tripId,
        date: date ? new Date(date) : null,
      },
    });
    return { day };
  }

  static async updateDay(userId: string, dayId: string, data: z.infer<typeof updateItineraryDaySchema>) {
    await this.verifyDayOwnership(dayId, userId);

    const { date, ...rest } = data;
    const day = await prisma.itinerary.update({
      where: { id: dayId },
      data: {
        ...rest,
        ...(date !== undefined ? { date: date ? new Date(date) : null } : {}),
      },
    });
    return { day };
  }

  static async deleteDay(userId: string, dayId: string) {
    await this.verifyDayOwnership(dayId, userId);

    await prisma.itinerary.delete({ where: { id: dayId } });
    return { message: 'Day deleted successfully.' };
  }

  static async createItem(userId: string, dayId: string, data: z.infer<typeof createItineraryItemSchema>) {
    await this.verifyDayOwnership(dayId, userId);

    const item = await prisma.itineraryItem.create({
      data: {
        ...data,
        itineraryId: dayId,
      },
    });
    return { item };
  }

  static async updateItem(userId: string, itemId: string, data: z.infer<typeof updateItineraryItemSchema>) {
    await this.verifyItemOwnership(itemId, userId);

    const item = await prisma.itineraryItem.update({
      where: { id: itemId },
      data,
    });
    return { item };
  }

  static async deleteItem(userId: string, itemId: string) {
    await this.verifyItemOwnership(itemId, userId);

    await prisma.itineraryItem.delete({ where: { id: itemId } });
    return { message: 'Item deleted successfully.' };
  }
}
