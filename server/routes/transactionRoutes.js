const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');

const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction
  } = require('../controllers/transactionController');
  
  // POST /api/transactions
  router.post('/',authMiddleware, addTransaction);
  
  // GET /api/transactions?userId=xxx
  router.get('/',authMiddleware, getTransactions);
  
  // DELETE /api/transactions/:id
  router.delete('/:id',authMiddleware, deleteTransaction);
  
  // PUT /api/transactions/:id
  router.put('/:id',authMiddleware, updateTransaction);
  
  module.exports = router;