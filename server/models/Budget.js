const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  month:    { type: String, required: true }, // e.g., "2025-05"
  limit:    { type: Number, required: true },
});

module.exports = mongoose.model('Budget', budgetSchema);

