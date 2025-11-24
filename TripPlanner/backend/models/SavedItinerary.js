import mongoose from 'mongoose';

const savedItinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  budget: {
    type: Number,
    required: true
  },
  itineraryData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  source: {
    type: String,
    enum: ['website', 'ai-generated', 'manual'],
    default: 'website'
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  plannedForDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('SavedItinerary', savedItinerarySchema);

