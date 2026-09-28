import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service.js';
import {
  updateUserSchema,
  updateProfileSchema,
  updateTravelDNASchema,
  formatZodError,
} from '../lib/validation.js';
import { AppError } from '../utils/AppError.js';

export class UsersController {
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UsersService.getUser(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await UsersService.updateUser(req.userId!, parsed.data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UsersService.getProfile(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await UsersService.updateProfile(req.userId!, parsed.data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTravelDNA(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UsersService.getTravelDNA(req.userId!);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateTravelDNA(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateTravelDNASchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }
      const result = await UsersService.updateTravelDNA(req.userId!, parsed.data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
