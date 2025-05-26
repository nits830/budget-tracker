const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be after 2000'],
    max: [2100, 'Year must be before 2100']
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0, 'Budget limit must be positive']
  }
}, {
  timestamps: true
});

// Compound index to ensure unique budget per user per month/year
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// Add error handling for duplicate key errors
budgetSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('A budget already exists for this month and year'));
  } else {
    next(error);
  }
});

// Add a static method to find or create budget
budgetSchema.statics.findOrCreate = async function(userId, month, year, limit) {
  try {
    let budget = await this.findOne({ userId, month, year });
    if (!budget) {
      budget = await this.create({ userId, month, year, limit });
    }
    return budget;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('Budget', budgetSchema);

