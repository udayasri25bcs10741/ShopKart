import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

// Helper to get fully populated cart array
const getPopulatedCart = async (userId) => {
  const user = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: 'name price category image stock description',
  });
  // Filter out any cart items where product was deleted
  return (user?.cart || []).filter((item) => item.product !== null);
};

// POST /cart/:productId - Add product to cart (or increment quantity if already present)
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cartIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartIndex > -1) {
      // Product already in cart - increment quantity
      const newQuantity = user.cart[cartIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} units available in stock.`,
        });
      }
      user.cart[cartIndex].quantity = newQuantity;
    } else {
      // New product in cart
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();

    const populatedCart = await getPopulatedCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: populatedCart,
    });
  } catch (err) {
    console.error('Add to cart error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /cart - Get current user's populated cart
export const getCart = async (req, res) => {
  try {
    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      count: populatedCart.length,
      cart: populatedCart,
    });
  } catch (err) {
    console.error('Get cart error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /cart/:productId - Update item quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number of at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (numQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock of ${product.stock}`,
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cartIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    user.cart[cartIndex].quantity = numQuantity;
    await user.save();

    const populatedCart = await getPopulatedCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: populatedCart,
    });
  } catch (err) {
    console.error('Update cart quantity error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /cart/:productId - Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const initialLength = user.cart.length;
    user.cart = user.cart.filter((item) => item.product.toString() !== productId);

    if (user.cart.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    await user.save();

    const populatedCart = await getPopulatedCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: populatedCart,
    });
  } catch (err) {
    console.error('Remove from cart error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
