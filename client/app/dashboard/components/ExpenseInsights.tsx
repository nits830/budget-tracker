'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ExpenseInsightsProps {
  selectedMonth: number;
  selectedYear: number;
  refreshTrigger: number;
}

interface Insights {
  totalExpenses: number;
  averageTransactionAmount: number;
  highestExpense: number;
  lowestExpense: number;
  categoryBreakdown: { [key: string]: number };
  dailySpending: { [key: string]: number };
  topSpendingDay: { day: number; amount: number } | null;
  topSpendingCategory: { category: string; amount: number } | null;
}

export default function ExpenseInsights({ selectedMonth, selectedYear, refreshTrigger }: ExpenseInsightsProps) {
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Expense Insights</h2>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Transaction */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Average Transaction</h3>
            <p className="text-2xl font-bold text-indigo-600">
              ${insights.averageTransactionAmount.toFixed(2)}
            </p>
          </div>

          {/* Highest Expense */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Highest Expense</h3>
            <p className="text-2xl font-bold text-red-600">
              ${insights.highestExpense.toFixed(2)}
            </p>
          </div>

          {/* Lowest Expense */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Lowest Expense</h3>
            <p className="text-2xl font-bold text-green-600">
              ${insights.lowestExpense.toFixed(2)}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expenses</h3>
            <p className="text-2xl font-bold text-gray-800">
              ${insights.totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Top Spending Day and Category */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.topSpendingDay && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Highest Spending Day</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {new Date(selectedYear, selectedMonth - 1, insights.topSpendingDay.day).toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-lg font-bold text-red-600">
                  ${insights.topSpendingDay.amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {insights.topSpendingCategory && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Top Spending Category</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {insights.topSpendingCategory.category}
                </span>
                <span className="text-lg font-bold text-red-600">
                  ${insights.topSpendingCategory.amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 