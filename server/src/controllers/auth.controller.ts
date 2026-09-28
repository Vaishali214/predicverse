import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema, formatZodError } from '../lib/validation.js';
import { AppError } from '../utils/AppError.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }

      const result = await AuthService.register(parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }

      const result = await AuthService.login(parsed.data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static logout(req: Request, res: Response) {
    res.json({ success: true, message: 'Logged out successfully.' });
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      const result = await AuthService.getMe(authHeader);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
