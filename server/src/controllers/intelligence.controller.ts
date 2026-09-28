import { Request, Response, NextFunction } from 'express';
import { WeatherService } from '../services/weather.service.js';
import { CurrencyService } from '../services/currency.service.js';
import { RecommendationService } from '../services/recommendation.service.js';
import { CultureService } from '../services/culture.service.js';

export class IntelligenceController {
  static async getWeather(req: Request, res: Response, next: NextFunction) {
    try {
      const location = (req.query.location as string) || (req.query.destination as string) || 'Tokyo';
      const data = await WeatherService.getWeather(location);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrency(req: Request, res: Response, next: NextFunction) {
    try {
      const amount = parseFloat(req.query.amount as string) || 1000;
      const base = (req.query.base as string) || (req.query.from as string) || 'USD';
      const data = await CurrencyService.convert(amount, base);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendationMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const destinationId = (req.query.destinationId as string) || (req.query.destination as string) || 'japan';
      const data = await RecommendationService.calculateMatch(req.userId, destinationId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static getCulture(req: Request, res: Response, next: NextFunction) {
    try {
      const countryId = (req.query.countryId as string) || (req.query.destination as string) || 'japan';
      const data = CultureService.getCultureData(countryId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
