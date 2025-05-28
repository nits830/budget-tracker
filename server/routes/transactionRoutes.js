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
  
  // GET /api/transactions
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const { month, year, type } = req.query;
      const query = { userId: req.user.id };

      // Add filters if provided
      if (month && year) {
        query.month = parseInt(month);
        query.year = parseInt(year);
      }
      if (type) {
        query.type = type;
      }

      const transactions = await Transaction.find(query)
        .sort({ date: -1 });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // DELETE /api/transactions/:id
  router.delete('/:id', authMiddleware, deleteTransaction);
  
  // PUT /api/transactions/:id
  router.put('/:id', authMiddleware, updateTransaction);
  
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

  // Get category breakdown
  router.get('/category-breakdown', authMiddleware, async (req, res) => {
    try {
      const { month, year } = req.query;
      
      // Create date range for the selected month and year
      const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      console.log('Date Range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        month,
        year
      });

      // Get expense transactions for the user within the date range
      const transactions = await Transaction.find({
        userId: req.user.id,
        type: 'expense',
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });

      console.log('Found transactions:', transactions.length);

      // Group transactions by category and sum amounts
      const categoryTotals = transactions.reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {});

      // Convert to array format for the frontend
      const categoryBreakdown = Object.entries(categoryTotals).map(([category, total]) => ({
        category,
        total
      }));

      // Sort by total amount in descending order
      categoryBreakdown.sort((a, b) => b.total - a.total);

      console.log('Category breakdown:', categoryBreakdown);

      res.json(categoryBreakdown);
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      res.status(500).json({ error: 'Failed to fetch category breakdown' });
    }
  });
  
  // Get expense insights
  router.get('/expense-insights', authMiddleware, async (req, res) => {
    try {
      const { month, year } = req.query;
      
      // Get all expense transactions for the user
      const transactions = await Transaction.find({
        userId: req.user.id,
        type: 'expense',
        month: parseInt(month),
        year: parseInt(year)
      }).sort({ date: -1 });

      // Calculate insights
      const insights = {
        totalExpenses: transactions.reduce((sum, t) => sum + t.amount, 0),
        averageTransactionAmount: transactions.length > 0 
          ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
          : 0,
        highestExpense: transactions.length > 0 
          ? Math.max(...transactions.map(t => t.amount))
          : 0,
        lowestExpense: transactions.length > 0 
          ? Math.min(...transactions.map(t => t.amount))
          : 0,
        categoryBreakdown: {},
        dailySpending: {},
        topSpendingDay: null,
        topSpendingCategory: null
      };

      // Calculate category breakdown
      transactions.forEach(transaction => {
        insights.categoryBreakdown[transaction.category] = 
          (insights.categoryBreakdown[transaction.category] || 0) + transaction.amount;
      });

      // Calculate daily spending
      transactions.forEach(transaction => {
        const day = transaction.date.getDate();
        insights.dailySpending[day] = 
          (insights.dailySpending[day] || 0) + transaction.amount;
      });

      // Find top spending day
      const dailySpendingEntries = Object.entries(insights.dailySpending);
      if (dailySpendingEntries.length > 0) {
        const [topDay, amount] = dailySpendingEntries.reduce((max, [day, amount]) => 
          amount > max[1] ? [day, amount] : max
        , ['0', 0]);
        insights.topSpendingDay = { day: parseInt(topDay), amount };
      }

      // Find top spending category
      const categoryEntries = Object.entries(insights.categoryBreakdown);
      if (categoryEntries.length > 0) {
        const [topCategory, amount] = categoryEntries.reduce((max, [category, amount]) => 
          amount > max[1] ? [category, amount] : max
        , ['', 0]);
        insights.topSpendingCategory = { category: topCategory, amount };
      }

      res.json(insights);
    } catch (error) {
      console.error('Error fetching expense insights:', error);
      res.status(500).json({ error: 'Failed to fetch expense insights' });
    }
  });
  
  module.exports = router;