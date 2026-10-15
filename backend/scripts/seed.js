import 'dotenv/config';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../src/config/db.js';
import Product from '../src/models/product.model.js';

export const sampleProducts = [
  {
    name: 'Mechanical Keyboard (RGB Hot-Swappable)',
    description: 'Precision mechanical keyboard with pre-lubed linear switches, aluminum frame, and per-key RGB backlighting.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 15,
  },
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Over-ear headphones with active noise cancellation, 40-hour battery, and memory foam cushions.',
    price: 7999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 24,
  },
  {
    name: 'Minimalist Ultra-Thin Laptop Stand',
    description: 'Anodized aluminum ergonomic stand for improved airflow and posture.',
    price: 1499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    stock: 35,
  },
  {
    name: 'Smart Fitness Tracker with AMOLED Display',
    description: 'Waterproof fitness watch with heart-rate, SpO2, sleep tracking, and 14-day battery.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 18,
  },
  {
    name: 'Classic Urban Canvas Backpack',
    description: 'Weather-resistant waxed canvas backpack with padded laptop compartment and leather accents.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    stock: 12,
  },
  {
    name: 'Minimalist Chronograph Leather Watch',
    description: 'Analog timepiece with surgical steel bezel, sapphire crystal, and Italian leather band.',
    price: 4599,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    stock: 8,
  },
  {
    name: 'Polarized Aviator Sunglasses',
    description: 'Titanium frame sunglasses with UV400 polarized lenses.',
    price: 1899,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    stock: 20,
  },
  {
    name: 'Clean Code: A Handbook of Agile Craftsmanship',
    description: 'Robert C. Martin's guide to writing clean, maintainable code.',
    price: 999,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    stock: 40,
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'Martin Kleppmann's guide to distributed systems, storage, and stream processing.',
    price: 1899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    stock: 25,
  },
  {
    name: 'Ceramic Pour-Over Coffee Dripper & Carafe',
    description: 'Ceramic dripper with borosilicate glass decanter for pour-over coffee.',
    price: 1799,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    stock: 14,
  },
  {
    name: 'Aroma Diffuser & Ultrasonic Humidifier',
    description: 'Ultrasonic humidifier with 7 LED lights, auto shut-off, and aromatherapy tray.',
    price: 1599,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    stock: 22,
  },
  {
    name: 'Modern Ergonomic LED Desk Lamp',
    description: 'Dimmable LED desk lamp with 5 color modes, USB charging, and swivel arm.',
    price: 2199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    stock: 10,
  },
];

export const seedProducts = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${inserted.length} products`);
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

// Run only when called directly: node scripts/seed.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedProducts();
}
