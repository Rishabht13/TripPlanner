import express from 'express';
import Expense from '../models/Expense.js';
import Trip from '../models/Trip.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all expenses for user (optionally filtered by trip)
router.get('/', authenticate, async (req, res) => {
  try {
    const { tripId } = req.query;
    const query = { user: req.user._id };
    
    if (tripId) {
      query.trip = tripId;
    }

    const expenses = await Expense.find(query)
      .populate('trip', 'destination')
      .sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get expense statistics for a trip
router.get('/stats/:tripId', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expenses = await Expense.find({ 
      user: req.user._id, 
      trip: req.params.tripId 
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const dailyExpenses = expenses.reduce((acc, exp) => {
      const date = exp.date.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({
      totalSpent,
      budget: trip.budget,
      remaining: trip.budget - totalSpent,
      byCategory,
      dailyExpenses,
      expenses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create expense
router.post('/', authenticate, async (req, res) => {
  try {
    const { trip, category, amount, currency, date, description, paymentMethod } = req.body;

    // Verify trip belongs to user
    const tripDoc = await Trip.findOne({ _id: trip, user: req.user._id });
    if (!tripDoc) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = new Expense({
      user: req.user._id,
      trip,
      category,
      amount,
      currency: currency || 'INR',
      date: date || new Date(),
      description: description || '',
      paymentMethod: paymentMethod || 'cash'
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update expense
router.put('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { category, amount, currency, date, description, paymentMethod } = req.body;

    if (category) expense.category = category;
    if (amount !== undefined) expense.amount = amount;
    if (currency) expense.currency = currency;
    if (date) expense.date = date;
    if (description !== undefined) expense.description = description;
    if (paymentMethod) expense.paymentMethod = paymentMethod;

    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete expense
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

