import express from 'express';
import Ad from '../models/Ad.js';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve('./uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `ad-${unique}${ext}`);
  }
});
const upload = multer({ storage });

// List ads (optional ?category=hotels|trips|transport)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const ads = await Ad.find(filter).sort({ createdAt: -1 });
    const normalized = ads.map(doc => {
      const obj = doc.toObject();
      obj.totalSlots = obj.totalSlots ?? obj.availableSlots ?? 0;
      obj.availableSlots = obj.availableSlots ?? obj.totalSlots ?? 0;
      return obj;
    });
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ads', error: error.message });
  }
});

// Create ad (admin only)
router.post('/', authenticate, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    const { category, title, location } = req.body;
    const price = Number(req.body.price);
    const discountPercent = Number(req.body.discountPercent || 0);
    const description = req.body.description;
    const totalSlots = Number(req.body.totalSlots || req.body.availableSlots || 5);
    const availableSlots = Number(req.body.availableSlots ?? totalSlots);
    if (totalSlots < 0 || availableSlots < 0) {
      return res.status(400).json({ message: 'Slots must be zero or greater' });
    }
    if (availableSlots > totalSlots) {
      return res.status(400).json({ message: 'Available slots cannot exceed total slots' });
    }
    let imageUrl = req.body.imageUrl;
    if (!category || !title || !location || price == null) {
      return res.status(400).json({ message: 'category, title, location, price required' });
    }
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const ad = new Ad({ category, title, location, price, imageUrl, discountPercent, description, totalSlots, availableSlots, createdBy: req.user._id });
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create ad', error: error.message });
  }
});

// Delete ad (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Ad.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete ad', error: error.message });
  }
});

export default router;


