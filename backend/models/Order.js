import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['hotels', 'trips', 'transport'], required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], default: [] },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['upi'], default: 'upi' },
  paymentReference: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);


