import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['hotels', 'trips', 'transport'], required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  items: { type: [cartItemSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);


