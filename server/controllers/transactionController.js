const Transaction = require('../models/Transaction');

const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    // Validate required fields
    if (!amount || !type || !category) {
      return res.status(400).json({ 
        message: 'Amount, type, and category are required' 
      });
    }

    // Validate type enum
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type must be either "income" or "expense"' 
      });
    }

    // Create new transaction
    const transaction = new Transaction({
      userId: req.user.id,
      amount,
      type,
      category,
      description,
      date: date || new Date()
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
   
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ msg: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction
};
