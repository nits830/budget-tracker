const { Transaction } = require('../models/Transaction');

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
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if the transaction belongs to the user
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this transaction' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, isCustomCategory } = req.body;
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        amount,
        type,
        category,
        description,
        isCustomCategory,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction
};
