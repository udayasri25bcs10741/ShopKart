import express from 'express';
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from '../controllers/cart.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// All cart routes are protected
router.use(authMiddleware);

router.post('/:productId', addToCart);
router.get('/', getCart);
router.patch('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);

export default router;
