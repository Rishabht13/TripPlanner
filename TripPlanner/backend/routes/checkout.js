import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Ad from '../models/Ad.js';
import Notification from '../models/Notification.js';

const router = express.Router();

function isValidUpi(upiId = '') {
  const trimmed = upiId.trim();
  const upiRegex = /^[\w.\-]{2,}@[a-z]{2,}$/i;
  return upiRegex.test(trimmed);
}

// Create order from cart and mark paid (mock payment)
router.post('/', authenticate, async (req, res) => {
  const { upiId } = req.body;
  if (!upiId || !isValidUpi(upiId)) {
    return res.status(400).json({ message: 'Enter a valid UPI ID (example: user@paytm)' });
  }

  const cartSnapshot = await Cart.findOne({ user: req.user._id });
  if (!cartSnapshot || cartSnapshot.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const session = await mongoose.startSession();
  try {
    let responseOrder = null;
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: req.user._id }).session(session);
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      const adIds = cart.items.map(it => it.ad);
      const ads = await Ad.find({ _id: { $in: adIds } }).session(session);
      const adMap = new Map(ads.map(a => [String(a._id), a]));

      for (const item of cart.items) {
        const ad = adMap.get(String(item.ad));
        if (!ad) {
          throw new Error('Some items are no longer available');
        }
        if (ad.availableSlots < item.quantity) {
          throw new Error(`Only ${ad.availableSlots} slot(s) left for ${ad.title}`);
        }
      }

      let totalAmount = 0;
      for (const item of cart.items) {
        const ad = adMap.get(String(item.ad));
        ad.availableSlots -= item.quantity;
        await ad.save({ session });
        totalAmount += item.discountedPrice * item.quantity;
      }

      const order = new Order({
        user: req.user._id,
        items: cart.items,
        totalAmount,
        paymentStatus: 'paid',
        paymentMethod: 'upi',
        paymentReference: upiId.trim(),
      });
      await order.save({ session });
      responseOrder = order.toObject();

      const notifications = cart.items.map(item => {
        const ad = adMap.get(String(item.ad));
        return {
          recipient: ad.createdBy,
          ad: ad._id,
          order: order._id,
          message: `${req.user.name} purchased ${item.quantity} slot(s) of ${ad.title}`,
        };
      });
      if (notifications.length > 0) {
        await Notification.insertMany(notifications, { session });
      }

      cart.items = [];
      await cart.save({ session });
    });

    res.status(201).json({ message: 'Payment successful', order: responseOrder });
  } catch (e) {
    const clientErrors = ['Cart is empty', 'Some items are no longer available'];
    if (e.message?.includes('slot') || clientErrors.includes(e.message)) {
      return res.status(400).json({ message: e.message });
    }
    console.error('Checkout error:', e);
    res.status(500).json({ message: 'Checkout failed', error: e.message });
  } finally {
    await session.endSession();
  }
});

export default router;


