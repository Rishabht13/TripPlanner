import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Cart from '../models/Cart.js';
import Ad from '../models/Ad.js';

const router = express.Router();

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
    await cart.save();
  }
  return cart;
}

async function formatCart(cart) {
  await cart.populate('items.ad', 'availableSlots');
  const formatted = cart.toObject();
  formatted.items = cart.items.map((item) => {
    const itemObj = item.toObject();
    // Ensure ad is a string ID, not an object
    itemObj.ad = String(itemObj.ad?._id || itemObj.ad || '');
    itemObj.availableSlots = item.ad?.availableSlots ?? 0;
    return itemObj;
  });
  return formatted;
}

// Get cart
router.get('/', authenticate, async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json(await formatCart(cart));
});

// Add item { adId, quantity }
router.post('/items', authenticate, async (req, res) => {
  try {
    const { adId, quantity = 1 } = req.body;
    const ad = await Ad.findById(adId);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    if (ad.availableSlots <= 0) {
      return res.status(400).json({ message: 'No vacancies left for this ad' });
    }
    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(i => String(i.ad) === String(ad._id));
    const desiredQty = Number(quantity) || 1;
    if (desiredQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    if (existing) {
      const newQty = existing.quantity + desiredQty;
      if (newQty > ad.availableSlots) {
        return res.status(400).json({ message: `Only ${ad.availableSlots} slot(s) left` });
      }
      existing.quantity = newQty;
    } else {
      if (desiredQty > ad.availableSlots) {
        return res.status(400).json({ message: `Only ${ad.availableSlots} slot(s) left` });
      }
      cart.items.push({
        ad: ad._id,
        title: ad.title,
        category: ad.category,
        quantity: desiredQty,
        price: ad.price,
        discountedPrice: ad.discountedPrice,
        imageUrl: ad.imageUrl,
      });
    }
    await cart.save();
    res.status(201).json(await formatCart(cart));
  } catch (e) {
    res.status(500).json({ message: 'Failed to add to cart', error: e.message });
  }
});

// Update quantity
router.put('/items/:adId', authenticate, async (req, res) => {
  try {
    const { adId } = req.params;
    const { quantity } = req.body;
    
    // Validate adId
    if (!adId || adId === '[object Object]' || adId === 'undefined') {
      return res.status(400).json({ message: 'Invalid ad ID' });
    }
    
    const desiredQty = Math.max(1, Number(quantity) || 1);
    const [cart, ad] = await Promise.all([
      getOrCreateCart(req.user._id),
      Ad.findById(adId)
    ]);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    const item = cart.items.find(i => String(i.ad) === String(adId));
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });
    if (desiredQty > ad.availableSlots) {
      return res.status(400).json({ message: `Only ${ad.availableSlots} slot(s) left` });
    }
    item.quantity = desiredQty;
    await cart.save();
    res.json(await formatCart(cart));
  } catch (e) {
    console.error('Cart update error:', e);
    res.status(500).json({ message: 'Failed to update cart item', error: e.message });
  }
});

// Remove item
router.delete('/items/:adId', authenticate, async (req, res) => {
  const { adId } = req.params;
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter(i => String(i.ad) !== String(adId));
  await cart.save();
  res.json(await formatCart(cart));
});

// Clear cart
router.delete('/', authenticate, async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json(await formatCart(cart));
});

export default router;


