import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  activities: [{
    time: String,
    activity: String,
    location: String,
    notes: String
  }]
}, { _id: false });

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  itinerary: [itineraryItemSchema],
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

export default mongoose.model('Trip', tripSchema);

