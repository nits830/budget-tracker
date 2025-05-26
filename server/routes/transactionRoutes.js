const express = require('express');
const router = express.Router();
const { Transaction, MAJOR_CATEGORIES } = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');

const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction
  } = require('../controllers/transactionController');
  
  // POST /api/transactions
  router.post('/',authMiddleware, async (req, res) => {
    try {
        const { amount, type, category, description, isCustomCategory } = req.body;
        
        // Create new transaction
        const transaction = new Transaction({
            userId: req.user.id,
            amount,
            type,
            category,
            description,
            isCustomCategory
        });

        // Save transaction
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error('Transaction creation error:', error);
        res.status(400).json({ 
            message: 'Failed to create transaction',
            error: error.message 
        });
    }
  });
  
  // GET /api/transactions?userId=xxx
  router.get('/',authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  });
  
  // DELETE /api/transactions/:id
  router.delete('/:id',authMiddleware, deleteTransaction);
  
  // PUT /api/transactions/:id
  router.put('/:id',authMiddleware, updateTransaction);
  
  // Get all categories
  router.get('/categories', (req, res) => {
    res.json(MAJOR_CATEGORIES);
  });
  
  // Get recent transactions
  router.get('/recent', async (req, res) => {
    try {
      const transactions = await Transaction.find()
        .sort({ date: -1 })
        .limit(10)
        .lean();

      res.json(transactions);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      res.status(500).json({ error: 'Failed to fetch recent transactions' });
    }
  });
  
  module.exports = router;