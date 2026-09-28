import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { UsersController } from '../controllers/users.controller.js';

export const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get('/me', UsersController.getUser);
usersRouter.put('/me', UsersController.updateUser);
usersRouter.get('/me/profile', UsersController.getProfile);
usersRouter.put('/me/profile', UsersController.updateProfile);
usersRouter.get('/me/travel-dna', UsersController.getTravelDNA);
usersRouter.put('/me/travel-dna', UsersController.updateTravelDNA);
