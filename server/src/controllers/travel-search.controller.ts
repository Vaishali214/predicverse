import { Request, Response, NextFunction } from 'express';
import { TravelSearchService } from '../services/travel-search.service.js';
import { flightSearchSchema, hotelSearchSchema, formatZodError } from '../lib/validation.js';
import { AppError } from '../utils/AppError.js';

export class TravelSearchController {
  static async searchFlights(req: Request, res: Response, next: NextFunction) {
    try {
      // Support both GET query parameters and POST body JSON payloads
      const inputData = req.method === 'GET' ? req.query : req.body;

      // Type coercions for numeric/boolean values from query string if GET
      if (req.method === 'GET') {
        if (inputData.travelers) inputData.travelers = Number(inputData.travelers);
        if (inputData.oneWay !== undefined) inputData.oneWay = inputData.oneWay === 'true' || inputData.oneWay === true;
      }

      const parsed = flightSearchSchema.safeParse(inputData);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }

      const result = await TravelSearchService.searchFlights(parsed.data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async searchHotels(req: Request, res: Response, next: NextFunction) {
    try {
      const inputData = req.method === 'GET' ? req.query : req.body;

      if (req.method === 'GET') {
        if (inputData.guests) inputData.guests = Number(inputData.guests);
        if (inputData.rooms) inputData.rooms = Number(inputData.rooms);
      }

      const parsed = hotelSearchSchema.safeParse(inputData);
      if (!parsed.success) {
        throw new AppError(formatZodError(parsed.error), 400);
      }

      const result = await TravelSearchService.searchHotels(parsed.data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
