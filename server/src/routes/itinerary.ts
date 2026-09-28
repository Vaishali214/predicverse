import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { ItineraryController } from '../controllers/itinerary.controller.js';

export const itineraryRouter = Router();

itineraryRouter.get('/trips/:tripId/itinerary', authMiddleware, ItineraryController.getItinerary);
itineraryRouter.post('/trips/:tripId/itinerary', authMiddleware, ItineraryController.createDay);
itineraryRouter.put('/itinerary/:id', authMiddleware, ItineraryController.updateDay);
itineraryRouter.delete('/itinerary/:id', authMiddleware, ItineraryController.deleteDay);

itineraryRouter.post('/itinerary/:dayId/items', authMiddleware, ItineraryController.createItem);
itineraryRouter.put('/itinerary/items/:id', authMiddleware, ItineraryController.updateItem);
itineraryRouter.delete('/itinerary/items/:id', authMiddleware, ItineraryController.deleteItem);

