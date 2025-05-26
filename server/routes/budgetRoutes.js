const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');



// Create a new transaction
router.post('/transactions', authMiddleware, async (req, res) => {
    const { amount, type, category, date } = req.body;

    // Validate input
    if (!amount || !type || !category || !date) {
        return res.status(400).json({ message: 'Amount, type, category, and date are required' });
    }

    // Create new transaction
    const transaction = new Transaction({
        userId: req.user.id, // Assuming req.user is set by authMiddleware
        amount,
        type,
        category,
        date
    });

    try {
        await transaction.save();
        res.status(201).json({ message: 'Transaction created successfully', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get budget for a specific month and year
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const userId = req.user.id;
    const budget = await Budget.findOne({
      userId,
      month: parseInt(month),
      year: parseInt(year)
    });

    if (!budget) {
      return res.json({ limit: 0 }); // Return 0 if no budget is set
    }

    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ 
      message: 'Error fetching budget', 
      error: error.message 
    });
  }
});

// Set or update budget for a specific month and year
router.post('/', authMiddleware, async (req, res) => {
  console.log('Received budget request:', req.body);

  try {
    const { limit, month, year } = req.body;

    // Validate required fields
    if (limit === undefined || !month || !year) {
      console.log('Missing required fields:', { limit, month, year });
      return res.status(400).json({ 
        message: 'Limit, month, and year are required',
        received: { limit, month, year }
      });
    }

    // Validate limit is a positive number
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      console.log('Invalid limit value:', limit);
      return res.status(400).json({ 
        message: 'Limit must be a positive number',
        received: limit
      });
    }

    // Validate month is between 1 and 12
    const parsedMonth = parseInt(month);
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      console.log('Invalid month value:', month);
      return res.status(400).json({ 
        message: 'Month must be between 1 and 12',
        received: month
      });
    }

    // Validate year is a reasonable number
    const parsedYear = parseInt(year);
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      console.log('Invalid year value:', year);
      return res.status(400).json({ 
        message: 'Invalid year',
        received: year
      });
    }

    const userId = req.user.id;
    console.log('Processing budget for user:', userId);

    try {
      // Find existing budget
      let budget = await Budget.findOne({ userId, month: parsedMonth, year: parsedYear });
      console.log('Existing budget found:', budget);
      
      if (budget) {
        // Update existing budget
        budget.limit = parsedLimit;
        await budget.save();
        console.log('Updated existing budget:', budget);
      } else {
        // Create new budget
        budget = new Budget({
          userId,
          month: parsedMonth,
          year: parsedYear,
          limit: parsedLimit
        });
        await budget.save();
        console.log('Created new budget:', budget);
      }

      res.json(budget);
    } catch (error) {
      console.error('Database operation error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          error: error.message,
          details: error.errors
        });
      }
      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(400).json({ 
          message: 'A budget already exists for this month and year',
          error: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error setting budget:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error setting budget', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get summary of budgets and transactions for a given month
router.get('/summary', authMiddleware, async (req, res) => {
    const { month, year } = req.query;

    // Validate input
    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
    }

    try {
        const userId = req.user.id;
        const budgets = await Budget.find({ userId, month: parseInt(month), year: parseInt(year) });
        const transactions = await Transaction.find({ 
            userId, 
            month: parseInt(month),
            year: parseInt(year)
        });

        // Calculate total income and expenses
        const totalIncome = transactions
            .filter(transaction => transaction.type === 'income')
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        
        const totalExpenses = transactions
            .filter(transaction => transaction.type === 'expense')
            .reduce((acc, transaction) => acc + transaction.amount, 0);

        // Prepare summary
        const summary = {
            month,
            year,
            budgets,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses
        };

        res.status(200).json(summary);
    } catch (err) {
        console.error('Error fetching summary:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
