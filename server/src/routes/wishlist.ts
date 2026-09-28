import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { WishlistController } from '../controllers/wishlist.controller.js';

export const wishlistRouter = Router();

wishlistRouter.use(authMiddleware);

wishlistRouter.get('/', WishlistController.getWishlist);
wishlistRouter.post('/', WishlistController.createWishlistItem);
wishlistRouter.delete('/:id', WishlistController.deleteWishlistItem);
wishlistRouter.delete('/by-destination/:destinationId', WishlistController.deleteByDestination);
