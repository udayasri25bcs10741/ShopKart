import mongoose from 'mongoose';

let memoryServer = null;

// Auto-seed products if the database is empty
const autoSeed = async () => {
  try {
    const { default: Product } = await import('../models/product.model.js');
    const count = await Product.countDocuments();
    if (count === 0) {
      const { sampleProducts } = await import('../../scripts/seed.js');
      await Product.insertMany(sampleProducts);
      console.log(`[DB] Seeded ${sampleProducts.length} default products`);
    }
  } catch (err) {
    console.warn('[DB] Auto-seed skipped:', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';
  const isRemote = !uri.includes('127.0.0.1') && !uri.includes('localhost');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isRemote ? 15000 : 3000,
    });
    console.log(`[DB] Connected: ${conn.connection.host}`);
    await autoSeed();
  } catch (err) {
    console.warn(`[DB] Connection failed: ${err.message}`);

    // Fallback to in-memory MongoDB
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const conn = await mongoose.connect(memoryServer.getUri());
      console.log(`[DB] In-memory fallback: ${conn.connection.host}`);
      await autoSeed();
    } catch (fallbackErr) {
      console.error('[DB] Fatal:', fallbackErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
  console.log('[DB] Disconnected');
};

export { connectDB, disconnectDB };
