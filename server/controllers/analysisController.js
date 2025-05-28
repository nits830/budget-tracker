const dotenv = require('dotenv');
const OpenAI = require('openai');
const { Transaction } = require('../models/Transaction');

// Load environment variables
dotenv.config();

// Debug: Check if API key exists
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);

// Initialize OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const analyzeSpendingHabits = async (req, res) => {
    try {
        const { month, year } = req.body;
        
        // Get all transactions for the user in the specified month
        const transactions = await Transaction.find({
            userId: req.user.id,
            month: parseInt(month),
            year: parseInt(year)
        }).sort({ date: -1 });

        // Separate income and expenses
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        // Calculate total income and expenses
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

        // Group expenses by category
        const categoryExpenses = expenses.reduce((acc, transaction) => {
            const category = transaction.category;
            if (!acc[category]) {
                acc[category] = {
                    total: 0,
                    transactions: []
                };
            }
            acc[category].total += transaction.amount;
            acc[category].transactions.push({
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.date
            });
            return acc;
        }, {});

        // Prepare data for ChatGPT
        const prompt = `
        Analyze the following financial data and provide exactly 4 one-line insights:
        
        Total Income: $${totalIncome.toFixed(2)}
        Total Expenses: $${totalExpenses.toFixed(2)}
        Net Savings: $${(totalIncome - totalExpenses).toFixed(2)}
        
        Category-wise Expenses:
        ${Object.entries(categoryExpenses).map(([category, data]) => `
        ${category}: $${data.total.toFixed(2)}
        - Number of transactions: ${data.transactions.length}
        - Average transaction: $${(data.total / data.transactions.length).toFixed(2)}
        `).join('\n')}
        
        Provide exactly 4 one-line insights in this format:
        1. [Positive Point] - Start with "Good job on..." or "You're doing well with..."
        2. [Negative Point] - Start with "Watch out for..." or "Be careful with..."
        3. [Positive Point] - Start with "Great progress in..." or "Keep up the good work with..."
        4. [Negative Point] - Start with "Consider reducing..." or "Try to minimize..."
        
        Requirements for each point:
        - Must be a single line
        - Include specific numbers where relevant
        - Use the exact starting phrases provided
        - Mix of 2 positive and 2 negative points
        - Keep it concise and actionable
        `;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a financial advisor analyzing spending habits. Provide exactly 4 one-line insights, alternating between positive and negative points. Use the exact starting phrases provided and keep each point concise and actionable."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const analysis = completion.choices[0].message.content;

        // Format the response into a structured object
        const formattedAnalysis = {
            keyPoints: analysis.split('\n')
                .filter(line => line.trim().match(/^\d\./))
                .map(line => line.replace(/^\d\.\s*/, '').trim()),
            summary: {
                totalIncome,
                totalExpenses,
                netSavings: totalIncome - totalExpenses,
                categoryBreakdown: categoryExpenses
            }
        };

        res.json(formattedAnalysis);

    } catch (error) {
        console.error('Error analyzing spending habits:', error);
        res.status(500).json({ 
            message: 'Failed to analyze spending habits',
            error: error.message 
        });
    }
};

module.exports = {
    analyzeSpendingHabits
}; 