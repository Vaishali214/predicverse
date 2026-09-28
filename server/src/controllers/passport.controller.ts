import { Request, Response, NextFunction } from 'express';
import { PassportService } from '../services/passport.service.js';
import { AppError } from '../utils/AppError.js';
import { createPassportStampSchema, formatZodError } from '../lib/validation.js';

export class PassportController {
  static async getPassportStamps(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PassportService.getPassportStamps(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createPassportStamp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createPassportStampSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await PassportService.createPassportStamp(req.userId!, parsed.data);
      res.status(result.message ? 200 : 201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deletePassportStamp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PassportService.deletePassportStamp(req.userId!, req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async deleteByDestination(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PassportService.deleteByDestination(req.userId!, req.params.destinationId);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
