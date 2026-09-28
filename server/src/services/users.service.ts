import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';
import {
  updateUserSchema,
  updateProfileSchema,
  updateTravelDNASchema,
} from '../lib/validation.js';

export class UsersService {
  static async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return { user };
  }

  static async updateUser(userId: string, data: z.infer<typeof updateUserSchema>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { user };
  }

  static async getProfile(userId: string) {
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          interests: "[]",
          preferredDestinations: "[]",
        },
      });
    }

    return { profile };
  }

  static async updateProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    const { interests, preferredDestinations, ...rest } = data;
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...rest,
        ...(interests !== undefined ? { interests: JSON.stringify(interests) } : {}),
        ...(preferredDestinations !== undefined ? { preferredDestinations: JSON.stringify(preferredDestinations) } : {}),
      },
      create: {
        userId,
        ...rest,
        interests: JSON.stringify(interests ?? []),
        preferredDestinations: JSON.stringify(preferredDestinations ?? []),
      },
    });
    return { profile };
  }

  static async getTravelDNA(userId: string) {
    let dna = await prisma.travelDNA.findUnique({
      where: { userId },
    });

    if (!dna) {
      dna = await prisma.travelDNA.create({
        data: { userId },
      });
    }

    return { travelDNA: dna };
  }

  static async updateTravelDNA(userId: string, data: z.infer<typeof updateTravelDNASchema>) {
    const dna = await prisma.travelDNA.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
    return { travelDNA: dna };
  }
}
