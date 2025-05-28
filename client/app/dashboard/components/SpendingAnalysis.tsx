'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SpendingAnalysisProps {
  selectedMonth: number;
  selectedYear: number;
  refreshTrigger: number;
  totalExpenses: number;
}

interface Insights {
  totalExpenses: number;
  averageTransactionAmount: number;
  highestExpense: number;
  lowestExpense: number;
  dailySpending: { [key: string]: number };
  topSpendingDay: { day: number; amount: number } | null;
  topSpendingCategory: { category: string; amount: number } | null;
}

export default function SpendingAnalysis({ 
  selectedMonth, 
  selectedYear, 
  refreshTrigger,
  totalExpenses 
}: SpendingAnalysisProps) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/transactions/expense-insights?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setInsights(response.data);
    } catch (err) {
      console.error('Error fetching expense insights:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = () => {
    if (!insights) return [];

    const analysis = [];

    // Analyze average transaction amount
    const avgTransaction = insights.averageTransactionAmount;
    if (avgTransaction > 100) {
      analysis.push({
        type: 'red',
        text: `Your average transaction amount ($${avgTransaction.toFixed(2)}) is quite high. Consider reviewing your spending habits.`
      });
    } else if (avgTransaction < 50) {
      analysis.push({
        type: 'green',
        text: `Good job! Your average transaction amount ($${avgTransaction.toFixed(2)}) is relatively low.`
      });
    }

    // Analyze highest expense
    const highestExpense = insights.highestExpense;
    if (highestExpense > 500) {
      analysis.push({
        type: 'red',
        text: `Your highest expense ($${highestExpense.toFixed(2)}) is significantly high. Review if this was necessary.`
      });
    }

    // Analyze spending patterns
    if (insights.topSpendingDay) {
      const topDayAmount = insights.topSpendingDay.amount;
      const avgDailySpending = totalExpenses / Object.keys(insights.dailySpending).length;
      
      if (topDayAmount > avgDailySpending * 2) {
        analysis.push({
          type: 'red',
          text: `You spent $${topDayAmount.toFixed(2)} on ${new Date(selectedYear, selectedMonth - 1, insights.topSpendingDay.day).toLocaleDateString('default', { day: 'numeric', month: 'short' })}, which is more than double your daily average.`
        });
      }
    }

    // Analyze category spending
    if (insights.topSpendingCategory) {
      const categoryAmount = insights.topSpendingCategory.amount;
      const categoryPercentage = (categoryAmount / totalExpenses) * 100;
      
      if (categoryPercentage > 50) {
        analysis.push({
          type: 'red',
          text: `${insights.topSpendingCategory.category} accounts for ${categoryPercentage.toFixed(1)}% of your total expenses. Consider diversifying your spending.`
        });
      } else if (categoryPercentage < 20) {
        analysis.push({
          type: 'green',
          text: `Good balance! Your highest spending category (${insights.topSpendingCategory.category}) is only ${categoryPercentage.toFixed(1)}% of total expenses.`
        });
      }
    }

    // Add general insights
    if (totalExpenses > 0) {
      const daysWithSpending = Object.keys(insights.dailySpending).length;
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const spendingFrequency = (daysWithSpending / daysInMonth) * 100;

      if (spendingFrequency > 80) {
        analysis.push({
          type: 'red',
          text: `You're making transactions on ${spendingFrequency.toFixed(0)}% of days this month. Consider reducing your spending frequency.`
        });
      } else if (spendingFrequency < 40) {
        analysis.push({
          type: 'green',
          text: `Great job! You're only making transactions on ${spendingFrequency.toFixed(0)}% of days this month.`
        });
      }
    }

    return analysis;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-gray-500 text-center p-4">
        No expense data available for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>
    );
  }

  const analysis = generateAnalysis();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Spending Analysis</h2>
      </div>
      
      <div className="p-4">
        {analysis.length > 0 ? (
          <div className="space-y-3">
            {analysis.map((item, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  item.type === 'red' 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                    item.type === 'red' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <p className={`ml-3 text-sm ${
                    item.type === 'red' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center p-4">
            No significant insights available for this period.
          </div>
        )}
      </div>
    </div>
  );
} 