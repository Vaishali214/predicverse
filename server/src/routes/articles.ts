import { Router } from 'express';
import { ArticlesController } from '../controllers/articles.controller.js';

export const articlesRouter = Router();

articlesRouter.get('/today', ArticlesController.getTodayArticle);
