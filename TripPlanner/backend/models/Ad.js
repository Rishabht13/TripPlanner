import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  category: { type: String, enum: ['hotels', 'trips', 'transport'], required: true },
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountedPrice: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  imageUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  totalSlots: { type: Number, default: 5, min: 0 },
  availableSlots: { type: Number, default: 5, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

adSchema.pre('save', function(next) {
  if (this.discountPercent && this.discountPercent > 0) {
    const discounted = Math.round((this.price * (100 - this.discountPercent)) / 100);
    this.discountedPrice = discounted;
  } else {
    this.discountedPrice = this.price;
  }
  if (this.isModified('totalSlots') && !this.isModified('availableSlots')) {
    this.availableSlots = this.totalSlots;
  }
  if (this.availableSlots > this.totalSlots) {
    this.availableSlots = this.totalSlots;
  }
  next();
});

export default mongoose.model('Ad', adSchema);


