import { Request, Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service.js';
import { AppError } from '../utils/AppError.js';
import { createWishlistItemSchema, formatZodError } from '../lib/validation.js';

export class WishlistController {
  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.getWishlist(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createWishlistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createWishlistItemSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await WishlistService.createWishlistItem(req.userId!, parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteWishlistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.deleteWishlistItem(req.userId!, req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async deleteByDestination(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.deleteByDestination(req.userId!, req.params.destinationId);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
