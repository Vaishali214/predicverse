import { Router } from 'express';
import { CollaborationController } from '../controllers/collaboration.controller.js';

export const sharedRouter = Router();

// Public route to view shared trips by cryptographically secure token
sharedRouter.get('/trips/:token', CollaborationController.resolveSharedTrip);
