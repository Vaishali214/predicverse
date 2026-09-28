import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';
import { createWishlistItemSchema } from '../lib/validation.js';

export class WishlistService {
  static async getWishlist(userId: string) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  }

  static async createWishlistItem(userId: string, data: z.infer<typeof createWishlistItemSchema>) {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId: data.destinationId,
        },
      },
    });

    if (existing) {
      throw new AppError('This destination is already in your wishlist.', 409);
    }

    const item = await prisma.wishlistItem.create({
      data: {
        ...data,
        userId,
      },
    });

    return { item };
  }

  static async deleteWishlistItem(userId: string, itemId: string) {
    const item = await prisma.wishlistItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new AppError('Wishlist item not found.', 404);
    }
    if (item.userId !== userId) {
      throw new AppError('Access denied.', 403);
    }

    await prisma.wishlistItem.delete({ where: { id: itemId } });
    return { message: 'Removed from wishlist.' };
  }

  static async deleteByDestination(userId: string, destinationId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId,
        },
      },
    });

    if (!item) {
      throw new AppError('Wishlist item not found.', 404);
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });
    return { message: 'Removed from wishlist.' };
  }
}
