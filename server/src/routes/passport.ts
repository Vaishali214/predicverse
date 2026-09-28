import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PassportController } from '../controllers/passport.controller.js';

export const passportRouter = Router();

passportRouter.use(authMiddleware);

passportRouter.get('/', PassportController.getPassportStamps);
passportRouter.post('/', PassportController.createPassportStamp);
passportRouter.delete('/:id', PassportController.deletePassportStamp);
passportRouter.delete('/by-destination/:destinationId', PassportController.deleteByDestination);
