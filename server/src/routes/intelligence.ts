import { Router, Request, Response, NextFunction } from 'express';
import { IntelligenceController } from '../controllers/intelligence.controller.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'predicverse_secret_key_2026';

// Optional auth middleware for recommendation personalization
const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      req.userId = decoded.id;
    } catch {
      // Continue unauthenticated if token invalid
    }
  }
  next();
};

export const intelligenceRouter = Router();

intelligenceRouter.get('/weather', IntelligenceController.getWeather);
intelligenceRouter.get('/currency', IntelligenceController.getCurrency);
intelligenceRouter.get('/culture', IntelligenceController.getCulture);
intelligenceRouter.get('/recommendation-match', optionalAuthMiddleware, IntelligenceController.getRecommendationMatch);
