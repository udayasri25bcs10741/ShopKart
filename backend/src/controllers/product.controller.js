import mongoose from 'mongoose';
import Product from '../models/product.model.js';

// POST /products
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    return res.status(201).json({ success: true, message: 'Product created', product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    console.error('Create Product Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /products  (supports ?search, ?category, ?sort)
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search?.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category?.trim() && category.toLowerCase() !== 'all') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };

    const products = await Product.find(query).sort(sortOption);

    return res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('Get Products Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (err) {
    console.error('Get Product Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
