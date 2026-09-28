import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';
import { createPassportStampSchema } from '../lib/validation.js';

export class PassportService {
  static async getPassportStamps(userId: string) {
    const stamps = await prisma.passportStamp.findMany({
      where: { userId },
      orderBy: { stampDate: 'desc' },
    });
    return { stamps };
  }

  static async createPassportStamp(userId: string, data: z.infer<typeof createPassportStampSchema>) {
    const { stampDate, ...rest } = data;

    const existing = await prisma.passportStamp.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId: data.destinationId,
        },
      },
    });

    if (existing) {
      const updated = await prisma.passportStamp.update({
        where: { id: existing.id },
        data: {
          visitCount: { increment: 1 },
          stampDate: stampDate ? new Date(stampDate) : new Date(),
        },
      });
      return { stamp: updated, message: 'Visit count updated for this destination.' };
    }

    const stamp = await prisma.passportStamp.create({
      data: {
        ...rest,
        userId,
        stampDate: stampDate ? new Date(stampDate) : new Date(),
      },
    });

    return { stamp };
  }

  static async deletePassportStamp(userId: string, stampId: string) {
    const stamp = await prisma.passportStamp.findUnique({ where: { id: stampId } });
    if (!stamp) {
      throw new AppError('Passport stamp not found.', 404);
    }
    if (stamp.userId !== userId) {
      throw new AppError('Access denied.', 403);
    }

    await prisma.passportStamp.delete({ where: { id: stampId } });
    return { message: 'Passport stamp removed.' };
  }

  static async deleteByDestination(userId: string, destinationId: string) {
    const stamp = await prisma.passportStamp.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId,
        },
      },
    });

    if (!stamp) {
      throw new AppError('Passport stamp not found.', 404);
    }

    await prisma.passportStamp.delete({ where: { id: stamp.id } });
    return { message: 'Passport stamp removed.' };
  }
}
