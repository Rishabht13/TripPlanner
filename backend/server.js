import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import expenseRoutes from './routes/expenses.js';
import aiRoutes from './routes/ai.js';
import savedItineraryRoutes from './routes/savedItineraries.js';
import adsRoutes from './routes/ads.js';
import cartRoutes from './routes/cart.js';
import checkoutRoutes from './routes/checkout.js';
import notificationRoutes from './routes/notifications.js';
import fs from 'fs';
import path from 'path';
import User from './models/User.js';
import Ad from './models/Ad.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists and serve static files
const uploadsDir = path.resolve('./uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected');
  try {
    let admin = await User.findOne({ email: 'admin@sample.com' });
    if (!admin) {
      admin = new User({ name: 'Sample Admin', email: 'admin@sample.com', password: 'Admin1234', role: 'admin' });
      await admin.save();
      console.log('🧩 Seeded admin user admin@sample.com / Admin1234');
    }
    const adCount = await Ad.countDocuments();
    if (adCount === 0) {
      const samples = [
        { category: 'hotels', title: 'Seaside Resort', location: 'Goa, India', price: 120, discountPercent: 20, rating: 4.5, imageUrl: 'https://picsum.photos/seed/h1/800/480', totalSlots: 12 },
        { category: 'hotels', title: 'Mountain View Lodge', location: 'Manali, India', price: 90, discountPercent: 10, rating: 4.2, imageUrl: 'https://picsum.photos/seed/h2/800/480', totalSlots: 8 },
        { category: 'hotels', title: 'Desert Mirage Camp', location: 'Jaisalmer, India', price: 150, discountPercent: 18, rating: 4.4, imageUrl: 'https://picsum.photos/seed/h3/800/480', totalSlots: 6 },
        { category: 'trips', title: 'Kerala Backwaters Tour', location: 'Alleppey, India', price: 300, discountPercent: 15, rating: 4.7, imageUrl: 'https://picsum.photos/seed/t1/800/480', totalSlots: 20 },
        { category: 'trips', title: 'Golden Triangle', location: 'Delhi-Agra-Jaipur', price: 450, discountPercent: 5, rating: 4.6, imageUrl: 'https://picsum.photos/seed/t2/800/480', totalSlots: 15 },
        { category: 'trips', title: 'North East Explorer', location: 'Shillong-Tawang', price: 520, discountPercent: 12, rating: 4.8, imageUrl: 'https://picsum.photos/seed/t3/800/480', totalSlots: 10 },
        { category: 'transport', title: 'SUV Rental', location: 'Bengaluru, India', price: 50, discountPercent: 0, rating: 4.1, imageUrl: 'https://picsum.photos/seed/m1/800/480', totalSlots: 5 },
        { category: 'transport', title: 'Scooter Hire', location: 'Goa, India', price: 12, discountPercent: 25, rating: 4.0, imageUrl: 'https://picsum.photos/seed/m2/800/480', totalSlots: 10 },
        { category: 'transport', title: 'Luxury Coach Transfer', location: 'Mumbai-Pune', price: 80, discountPercent: 8, rating: 4.3, imageUrl: 'https://picsum.photos/seed/m3/800/480', totalSlots: 4 },
      ];
      await Ad.insertMany(samples.map(s => ({ ...s, availableSlots: s.totalSlots, createdBy: admin._id })));
      console.log('🧩 Seeded sample ads');
    }
  } catch (e) {
    console.error('Seed error:', e.message);
  }
})
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/saved-itineraries', savedItineraryRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Travel Planner API is running' });
});

// DB health
app.get('/api/health/db', (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    readyState: mongoose.connection.readyState,
    state: stateMap[mongoose.connection.readyState] || 'unknown',
    uri: process.env.MONGODB_URI ? 'env' : 'default'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

