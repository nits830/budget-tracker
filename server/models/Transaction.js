const mongoose = require('mongoose');

const MAJOR_CATEGORIES = {
  INCOME: [
    'Salary',
    'Freelance',
    'Investments',
    'Business',
    'Other Income'
  ],
  EXPENSE: [
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Education',
    'Shopping',
    'Personal Care',
    'Debt Payment',
    'Savings',
    'Other Expense'
  ]
};

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  category: {
    type: String,
    required: true,
    validate: {
      validator: function(category) {
        // If it's a predefined category, it must be in the MAJOR_CATEGORIES
        if (MAJOR_CATEGORIES[this.type.toUpperCase()].includes(category)) {
          return true;
        }
        // If it's a custom category, it must not be empty and must be a string
        return category && typeof category === 'string' && category.trim().length > 0;
      },
      message: props => `${props.value} is not a valid category for ${props.type}`
    }
  },
  description: { 
    type: String,
    trim: true
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  isCustomCategory: {
    type: Boolean,
    default: false
  }
});

// Add static method to get all categories for a type
transactionSchema.statics.getCategories = function(type) {
  return MAJOR_CATEGORIES[type.toUpperCase()] || [];
};

// Add static method to get all categories
transactionSchema.statics.getAllCategories = function() {
  return MAJOR_CATEGORIES;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction, MAJOR_CATEGORIES };

