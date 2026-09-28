import { Request, Response, NextFunction } from 'express';
import { ArticlesService } from '../services/articles.service.js';

export class ArticlesController {
  static async getTodayArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ArticlesService.getTodayArticle();
      // Legacy structure does not have the `{ success: true, data: result }` wrapper, 
      // keeping original response signature so we don't break frontend
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
