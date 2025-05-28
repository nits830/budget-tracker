const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { analyzeSpendingHabits } = require('../controllers/analysisController');

// POST /api/analysis/spending
router.post('/spending', authMiddleware, analyzeSpendingHabits);

module.exports = router; 