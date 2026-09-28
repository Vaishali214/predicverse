import { Request, Response, NextFunction } from 'express';
import { ItineraryService } from '../services/itinerary.service.js';
import { AppError } from '../utils/AppError.js';
import {
  createItineraryDaySchema,
  updateItineraryDaySchema,
  createItineraryItemSchema,
  updateItineraryItemSchema,
  formatZodError,
} from '../lib/validation.js';

export class ItineraryController {
  static async getItinerary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ItineraryService.getItinerary(req.userId!, req.params.tripId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createDay(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createItineraryDaySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await ItineraryService.createDay(req.userId!, req.params.tripId, parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateDay(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateItineraryDaySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await ItineraryService.updateDay(req.userId!, req.params.id, parsed.data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDay(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ItineraryService.deleteDay(req.userId!, req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createItineraryItemSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await ItineraryService.createItem(req.userId!, req.params.dayId, parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateItineraryItemSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await ItineraryService.updateItem(req.userId!, req.params.id, parsed.data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ItineraryService.deleteItem(req.userId!, req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
