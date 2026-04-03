/**
 * Seed script – populates MongoDB with demo users and items
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Item = require('./models/Item');

const DEMO_USERS = [
  { name: 'Arjun Sharma', email: 'arjun@demo.com', password: 'demo1234', university: 'IIT Delhi', location: 'Hostel Block C' },
  { name: 'Priya Patel',  email: 'priya@demo.com', password: 'demo1234', university: 'IIT Delhi', location: 'Hostel Block A' },
  { name: 'Rahul Verma',  email: 'rahul@demo.com', password: 'demo1234', university: 'IIT Delhi', location: 'Off-campus' },
];

const DEMO_ITEMS = [
  {
    title: 'Engineering Mathematics – R.K. Kanodia',
    description: 'Used for 2 semesters only. All chapters intact, minimal highlighting. Perfect for GATE prep. Edition 2022.',
    price: 350, category: 'Books & Notes', condition: 'Good',
    tags: ['maths', 'gate', 'engineering'], location: 'Block C', isNegotiable: true,
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Dell Inspiron 15 Laptop – Core i5, 8GB RAM',
    description: 'Purchased in 2022. Works perfectly, no scratches. Battery backup ~4 hrs. Charger included. Windows 11 activated.',
    price: 28000, category: 'Electronics', condition: 'Good',
    tags: ['laptop', 'dell', 'i5'], location: 'Block A', isNegotiable: true,
    images: [{ url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Hero Sprint 26T Bicycle – Excellent Condition',
    description: 'Used for 1 year. Both tyres recently replaced. Brakes and gears work perfectly. Perfect for campus commute.',
    price: 4500, category: 'Bicycles & Transport', condition: 'Like New',
    tags: ['bicycle', 'hero', 'cycle'], location: 'Cycle Stand Gate 2', isNegotiable: false,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Study Table with Chair – Wooden',
    description: 'Solid wooden study table (4x2 ft) with matching chair. Minor scratch on one corner. Selling because moving out.',
    price: 1800, category: 'Furniture', condition: 'Good',
    tags: ['table', 'chair', 'furniture'], location: 'Off-campus, Hauz Khas', isNegotiable: true,
    images: [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Casio FX-991EX Scientific Calculator',
    description: 'Genuine Casio scientific calculator. Used for 1 semester. All functions working. Cover included.',
    price: 650, category: 'Stationery', condition: 'Like New',
    tags: ['calculator', 'casio', 'scientific'], location: 'Block C', isNegotiable: false,
    images: [{ url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Yamaha F310 Acoustic Guitar',
    description: 'Beautiful acoustic guitar, great sound. Comes with a bag, extra strings and picks. Only 6 months old.',
    price: 5500, category: 'Instruments', condition: 'Like New',
    tags: ['guitar', 'yamaha', 'acoustic'], location: 'Block A', isNegotiable: true,
    images: [{ url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80', publicId: '' }],
  },
  {
    title: 'JEE Advanced 2019-2023 PYQ Collection',
    description: 'Complete set of JEE Advanced previous year papers with solutions. Separate booklets for Physics, Chemistry and Maths.',
    price: 200, category: 'Books & Notes', condition: 'Good',
    tags: ['jee', 'pyq', 'advanced'], location: 'Block B', isNegotiable: true,
    images: [{ url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Nike Dri-FIT T-Shirts – Set of 3 (L)',
    description: 'Three Nike dri-fit sports t-shirts, size L. All in excellent condition, no stains. Perfect for gym.',
    price: 900, category: 'Clothing', condition: 'Good',
    tags: ['nike', 'tshirt', 'sports', 'gym'], location: 'Block C', isNegotiable: false,
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Dumbbell Set – 5kg pair',
    description: 'Cast iron dumbbell pair, 5kg each. Perfect for home workout. No rust, good grip.',
    price: 700, category: 'Sports & Fitness', condition: 'Good',
    tags: ['dumbbell', 'weights', 'fitness', 'gym'], location: 'Block B', isNegotiable: true,
    images: [{ url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', publicId: '' }],
  },
  {
    title: 'OnePlus Nord CE 2 – 128GB, Blue',
    description: 'OnePlus Nord CE 2, 8GB RAM, 128GB storage. Excellent condition. Comes with original box, charger and case.',
    price: 16500, category: 'Electronics', condition: 'Like New',
    tags: ['oneplus', 'mobile', 'android'], location: 'Block A', isNegotiable: true,
    images: [{ url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Godrej Refrigerator 190L – Single Door',
    description: 'Godrej mini fridge, 190L. Energy star 3-star rating. Works perfectly. Moving out so selling urgently.',
    price: 7500, category: 'Furniture', condition: 'Good',
    tags: ['fridge', 'godrej', 'refrigerator'], location: 'Off-campus, Satya Niketan', isNegotiable: true,
    images: [{ url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', publicId: '' }],
  },
  {
    title: 'Drawing Instruments Set – Professional',
    description: 'Complete engineering drawing set. Compass, dividers, set squares, mini drafter. All in original box.',
    price: 400, category: 'Stationery', condition: 'Good',
    tags: ['drawing', 'engineering', 'instruments'], location: 'Block C', isNegotiable: false,
    images: [{ url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&q=80', publicId: '' }],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data
    await User.deleteMany({ email: { $in: DEMO_USERS.map(u => u.email) } });
    console.log('🗑  Cleared old demo users');

    // Create users
    const users = await User.insertMany(DEMO_USERS);
    console.log(`👥 Created ${users.length} demo users`);

    // Assign sellers round-robin
    const items = DEMO_ITEMS.map((item, i) => ({
      ...item,
      sellerId: users[i % users.length]._id,
    }));

    // Clear existing demo items (by seller)
    await Item.deleteMany({ sellerId: { $in: users.map(u => u._id) } });

    const created = await Item.insertMany(items);
    console.log(`📦 Created ${created.length} demo items`);

    console.log('\n🎉 Seed complete! Demo accounts:');
    DEMO_USERS.forEach(u => console.log(`   ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
