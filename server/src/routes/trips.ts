import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { TripsController } from '../controllers/trips.controller.js';
import { PdfController } from '../controllers/pdf.controller.js';
import { CollaborationController } from '../controllers/collaboration.controller.js';

export const tripsRouter = Router();

// Public route for generating itineraries (allows guest exploration)
tripsRouter.post('/generate', TripsController.generateItinerary);

// Protected routes requiring authentication & user data isolation
tripsRouter.use(authMiddleware);

tripsRouter.get('/', TripsController.getTrips);
tripsRouter.post('/export-pdf', PdfController.exportPayloadPdf);

// Share Links endpoints
tripsRouter.post('/:id/share', CollaborationController.createShareLink);
tripsRouter.get('/:id/share', CollaborationController.getShareLinks);
tripsRouter.delete('/:id/share/:linkId', CollaborationController.revokeShareLink);

// Collaborators endpoints
tripsRouter.post('/:id/collaborators', CollaborationController.addCollaborator);
tripsRouter.get('/:id/collaborators', CollaborationController.getCollaborators);
tripsRouter.patch('/:id/collaborators/:targetUserId', CollaborationController.updateCollaboratorRole);
tripsRouter.delete('/:id/collaborators/:targetUserId', CollaborationController.removeCollaborator);

tripsRouter.get('/:id', TripsController.getTrip);
tripsRouter.get('/:id/export-pdf', PdfController.exportTripPdf);
tripsRouter.post('/', TripsController.createTrip);
tripsRouter.put('/:id', TripsController.updateTrip);
tripsRouter.delete('/:id', TripsController.deleteTrip);
