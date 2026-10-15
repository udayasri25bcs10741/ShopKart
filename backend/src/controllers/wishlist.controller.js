import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

// POST /wishlist/:productId - Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check for duplicate entry
    const isAlreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyInWishlist) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlistCount: user.wishlist.length,
    });
  } catch (err) {
    console.error('Add to wishlist error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /wishlist - Get current user's populated wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock description',
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Filter out any potential nulls if a product was deleted
    const validWishlist = (user.wishlist || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (err) {
    console.error('Get wishlist error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /wishlist/:productId - Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    user.wishlist.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlistCount: user.wishlist.length,
    });
  } catch (err) {
    console.error('Remove from wishlist error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /wishlist/:productId/toggle - Bonus: Toggle Wishlist Item
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let isAdded = false;
    if (itemIndex > -1) {
      user.wishlist.splice(itemIndex, 1);
      isAdded = false;
    } else {
      user.wishlist.push(productId);
      isAdded = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      isAdded,
      message: isAdded ? 'Product added to wishlist' : 'Product removed from wishlist',
      wishlistCount: user.wishlist.length,
    });
  } catch (err) {
    console.error('Toggle wishlist error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
