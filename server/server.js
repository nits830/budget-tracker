const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const transactionRoutes = require('./routes/transactionRoutes');


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/transactions', transactionRoutes);

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
