import { Router } from 'express';
import { HiddenGemsController } from '../controllers/hidden-gems.controller.js';

export const hiddenGemsRouter = Router();

hiddenGemsRouter.get('/', HiddenGemsController.getAllGems);
hiddenGemsRouter.get('/:id', HiddenGemsController.getGemById);
