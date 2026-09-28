import { Request, Response, NextFunction } from 'express';
import { PdfService } from '../services/pdf.service.js';
import { TripsService } from '../services/trips.service.js';
import { AppError } from '../utils/AppError.js';

export class PdfController {
  /**
   * Export PDF Guidebook from a saved Trip ID (Enforces User Isolation)
   */
  static async exportTripPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const tripId = req.params.id;
      const { trip } = await TripsService.getTrip(req.userId!, tripId);

      if (!trip) {
        throw new AppError('Trip not found.', 404);
      }

      // Parse JSON interests if string
      let interests: string[] = [];
      try {
        interests = typeof trip.interests === 'string' ? JSON.parse(trip.interests) : trip.interests;
      } catch {
        interests = [];
      }

      const pdfBuffer = await PdfService.generateGuidebookPdf(req.userId!, {
        destination: trip.destination,
        budget: trip.budget || 1000,
        days: trip.days || 3,
        travelers: trip.travelers || 1,
        interests,
        travelStyle: trip.travelStyle || 'Standard Gazette Traveler',
        itinerary: trip.itinerary || '',
      });

      const sanitizedDest = (trip.destination || 'Destination')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_');
      const filename = `PredicVerse_${sanitizedDest}_Travel_Guide.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export PDF Guidebook from raw itinerary dispatch payload
   */
  static async exportPayloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { destination, budget, days, travelers, interests, travelStyle, itinerary, structuredAI, flightData, hotelData } = req.body;

      if (!destination || typeof destination !== 'string' || destination.trim() === '') {
        throw new AppError('Destination is required for guidebook generation.', 400);
      }

      const pdfBuffer = await PdfService.generateGuidebookPdf(req.userId!, {
        destination,
        budget: budget ? Number(budget) : 1000,
        days: days ? Number(days) : 3,
        travelers: travelers ? Number(travelers) : 1,
        interests: Array.isArray(interests) ? interests : [],
        travelStyle,
        itinerary: itinerary || '',
        structuredAI,
        flightData,
        hotelData,
      });

      const sanitizedDest = destination.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      const filename = `PredicVerse_${sanitizedDest}_Travel_Guide.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
