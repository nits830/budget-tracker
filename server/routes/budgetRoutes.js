const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Budget = require('../models/Budget');

// Create a new budget
router.post('/', authMiddleware, async (req, res) => {
    const { month, limit } = req.body;

    // Validate input
    if (!month || !limit) {
        return res.status(400).json({ message: 'Month and limit are required' });
    }

    // Create new budget
    const budget = new Budget({
        userId: req.user.id, // Assuming req.user is set by authMiddleware
        month,
        limit
    });

    try {
        await budget.save();
        res.status(201).json({ message: 'Budget created successfully', budget });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

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

// Get summary of budgets and transactions for a given month
router.get('/summary', authMiddleware, async (req, res) => {
    const { month } = req.query;

    // Validate input
    if (!month) {
        return res.status(400).json({ message: 'Month is required' });
    }

    try {
        const userId = req.user.id;
        const budgets = await Budget.find({ userId, month });
        const transactions = await Transaction.find({ userId, date: { $gte: new Date(`${month}-01`), $lt: new Date(`${month}-01T23:59:59.999Z`) } });

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
            budgets,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses
        };

        res.status(200).json(summary);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
