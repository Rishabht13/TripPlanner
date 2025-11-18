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
        // Hotels
        { category: 'hotels', title: 'Seaside Resort', location: 'Goa, India', price: 120, discountPercent: 20, rating: 4.5, imageUrl: 'https://picsum.photos/seed/h1/800/480', totalSlots: 12, description: 'Beachfront luxury resort with ocean views' },
        { category: 'hotels', title: 'Mountain View Lodge', location: 'Manali, India', price: 90, discountPercent: 10, rating: 4.2, imageUrl: 'https://picsum.photos/seed/h2/800/480', totalSlots: 8, description: 'Cozy mountain retreat with panoramic views' },
        { category: 'hotels', title: 'Desert Mirage Camp', location: 'Jaisalmer, India', price: 150, discountPercent: 18, rating: 4.4, imageUrl: 'https://picsum.photos/seed/h3/800/480', totalSlots: 6, description: 'Authentic desert camping experience' },
        { category: 'hotels', title: 'Heritage Palace Hotel', location: 'Udaipur, India', price: 200, discountPercent: 15, rating: 4.6, imageUrl: 'https://picsum.photos/seed/h4/800/480', totalSlots: 10, description: 'Royal heritage property with lake views' },
        { category: 'hotels', title: 'Beachside Villa', location: 'Kovalam, India', price: 110, discountPercent: 12, rating: 4.3, imageUrl: 'https://picsum.photos/seed/h5/800/480', totalSlots: 7, description: 'Private villa steps from the beach' },
        { category: 'hotels', title: 'Hill Station Resort', location: 'Ooty, India', price: 95, discountPercent: 8, rating: 4.5, imageUrl: 'https://picsum.photos/seed/h6/800/480', totalSlots: 9, description: 'Serene hill station getaway' },
        // Trips
        { category: 'trips', title: 'Kerala Backwaters Tour', location: 'Alleppey, India', price: 300, discountPercent: 15, rating: 4.7, imageUrl: 'https://picsum.photos/seed/t1/800/480', totalSlots: 20, description: '3-day houseboat cruise through scenic backwaters' },
        { category: 'trips', title: 'Golden Triangle', location: 'Delhi-Agra-Jaipur', price: 450, discountPercent: 5, rating: 4.6, imageUrl: 'https://picsum.photos/seed/t2/800/480', totalSlots: 15, description: '5-day cultural tour of iconic cities' },
        { category: 'trips', title: 'North East Explorer', location: 'Shillong-Tawang', price: 520, discountPercent: 12, rating: 4.8, imageUrl: 'https://picsum.photos/seed/t3/800/480', totalSlots: 10, description: '7-day adventure through Northeast India' },
        { category: 'trips', title: 'Rajasthan Royal Tour', location: 'Jodhpur-Jaisalmer-Bikaner', price: 480, discountPercent: 10, rating: 4.7, imageUrl: 'https://picsum.photos/seed/t4/800/480', totalSlots: 12, description: '6-day journey through royal Rajasthan' },
        { category: 'trips', title: 'Spiritual Varanasi', location: 'Varanasi, India', price: 280, discountPercent: 8, rating: 4.5, imageUrl: 'https://picsum.photos/seed/t5/800/480', totalSlots: 18, description: '3-day spiritual experience on the Ganges' },
        { category: 'trips', title: 'Goa Beach Paradise', location: 'Goa, India', price: 350, discountPercent: 20, rating: 4.6, imageUrl: 'https://picsum.photos/seed/t6/800/480', totalSlots: 25, description: '4-day beach hopping and party tour' },
        // Transport
        { category: 'transport', title: 'SUV Rental', location: 'Bengaluru, India', price: 50, discountPercent: 0, rating: 4.1, imageUrl: 'https://picsum.photos/seed/m1/800/480', totalSlots: 5, description: 'Comfortable SUV for family trips' },
        { category: 'transport', title: 'Scooter Hire', location: 'Goa, India', price: 12, discountPercent: 25, rating: 4.0, imageUrl: 'https://picsum.photos/seed/m2/800/480', totalSlots: 10, description: 'Easy scooter rental for beach exploration' },
        { category: 'transport', title: 'Luxury Coach Transfer', location: 'Mumbai-Pune', price: 80, discountPercent: 8, rating: 4.3, imageUrl: 'https://picsum.photos/seed/m3/800/480', totalSlots: 4, description: 'Premium coach with AC and WiFi' },
        { category: 'transport', title: 'Sedan Car Rental', location: 'Delhi, India', price: 45, discountPercent: 10, rating: 4.2, imageUrl: 'https://picsum.photos/seed/m4/800/480', totalSlots: 8, description: 'Comfortable sedan for city travel' },
        { category: 'transport', title: 'Motorcycle Adventure', location: 'Leh-Ladakh', price: 65, discountPercent: 15, rating: 4.5, imageUrl: 'https://picsum.photos/seed/m5/800/480', totalSlots: 6, description: 'Adventure bike for mountain roads' },
        { category: 'transport', title: 'Airport Shuttle', location: 'Mumbai Airport', price: 35, discountPercent: 5, rating: 4.4, imageUrl: 'https://picsum.photos/seed/m6/800/480', totalSlots: 12, description: 'Reliable airport transfer service' },
      ];
      await Ad.insertMany(samples.map(s => ({ ...s, availableSlots: s.totalSlots, createdBy: admin._id })));
      console.log('🧩 Seeded', samples.length, 'sample ads');
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

