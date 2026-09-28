import { Request, Response, NextFunction } from 'express';
import { HiddenGemsService } from '../services/hidden-gems.service.js';

export class HiddenGemsController {
  static async getAllGems(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HiddenGemsService.getAllGems();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getGemById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HiddenGemsService.getGemById(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
