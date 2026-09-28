import { Request, Response, NextFunction } from 'express';
import { TripsService } from '../services/trips.service.js';
import { createTripSchema, updateTripSchema, formatZodError } from '../lib/validation.js';
import { AppError } from '../utils/AppError.js';

export class TripsController {
  static async getTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TripsService.getTrips(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TripsService.getTrip(req.userId!, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createTripSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await TripsService.createTrip(req.userId!, parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateTripSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await TripsService.updateTrip(req.userId!, req.params.id, parsed.data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TripsService.deleteTrip(req.userId!, req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async generateItinerary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TripsService.generateItinerary(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
