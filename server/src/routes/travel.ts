import { Router } from 'express';
import { TravelSearchController } from '../controllers/travel-search.controller.js';

export const travelRouter = Router();

// Flight Search Routes (Supports GET and POST)
travelRouter.get('/flights/search', TravelSearchController.searchFlights);
travelRouter.post('/flights/search', TravelSearchController.searchFlights);

// Hotel Search Routes (Supports GET and POST)
travelRouter.get('/hotels/search', TravelSearchController.searchHotels);
travelRouter.post('/hotels/search', TravelSearchController.searchHotels);
