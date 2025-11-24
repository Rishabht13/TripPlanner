import express from 'express';
import Trip from '../models/Trip.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all trips for user
router.get('/', authenticate, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id })
      .sort({ startDate: -1 })
      .populate('user', 'name email');
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single trip
router.get('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id })
      .populate('user', 'name email');
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create trip
router.post('/', authenticate, async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, currency, itinerary, notes, status } = req.body;

    const trip = new Trip({
      user: req.user._id,
      destination,
      startDate,
      endDate,
      budget,
      currency: currency || 'INR',
      itinerary: itinerary || [],
      notes: notes || '',
      status: status || 'upcoming'
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update trip
router.put('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const { destination, startDate, endDate, budget, currency, itinerary, notes, status } = req.body;

    if (destination) trip.destination = destination;
    if (startDate) trip.startDate = startDate;
    if (endDate) trip.endDate = endDate;
    if (budget !== undefined) trip.budget = budget;
    if (currency) trip.currency = currency;
    if (itinerary) trip.itinerary = itinerary;
    if (notes !== undefined) trip.notes = notes;
    if (status) trip.status = status;

    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete trip
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

