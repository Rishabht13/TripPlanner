import express from 'express';
import SavedItinerary from '../models/SavedItinerary.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all saved itineraries for user
router.get('/', authenticate, async (req, res) => {
  try {
    const savedItineraries = await SavedItinerary.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(savedItineraries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single saved itinerary
router.get('/:id', authenticate, async (req, res) => {
  try {
    const savedItinerary = await SavedItinerary.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!savedItinerary) {
      return res.status(404).json({ message: 'Saved itinerary not found' });
    }
    
    res.json(savedItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create saved itinerary
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      title, 
      destination, 
      duration, 
      budget, 
      itineraryData, 
      source, 
      notes, 
      tags, 
      plannedForDate 
    } = req.body;

    if (!title || !destination || !duration || !budget || !itineraryData) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const savedItinerary = new SavedItinerary({
      user: req.user._id,
      title,
      destination,
      duration,
      budget,
      itineraryData,
      source: source || 'website',
      notes: notes || '',
      tags: tags || [],
      plannedForDate: plannedForDate || null
    });

    await savedItinerary.save();
    res.status(201).json(savedItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update saved itinerary
router.put('/:id', authenticate, async (req, res) => {
  try {
    const savedItinerary = await SavedItinerary.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!savedItinerary) {
      return res.status(404).json({ message: 'Saved itinerary not found' });
    }

    const { title, destination, duration, budget, itineraryData, notes, tags, plannedForDate } = req.body;

    if (title) savedItinerary.title = title;
    if (destination) savedItinerary.destination = destination;
    if (duration) savedItinerary.duration = duration;
    if (budget !== undefined) savedItinerary.budget = budget;
    if (itineraryData) savedItinerary.itineraryData = itineraryData;
    if (notes !== undefined) savedItinerary.notes = notes;
    if (tags) savedItinerary.tags = tags;
    if (plannedForDate !== undefined) savedItinerary.plannedForDate = plannedForDate;

    await savedItinerary.save();
    res.json(savedItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete saved itinerary
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const savedItinerary = await SavedItinerary.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!savedItinerary) {
      return res.status(404).json({ message: 'Saved itinerary not found' });
    }

    res.json({ message: 'Saved itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

