import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    validate: {
      validator: (val) => val > 0,
      message: 'Price must be greater than 0',
    },
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    validate: {
      validator: (val) => val >= 0,
      message: 'Stock cannot be negative',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Remove __v from JSON output
productSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Product', productSchema);
