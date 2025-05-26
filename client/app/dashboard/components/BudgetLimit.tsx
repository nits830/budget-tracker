'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface BudgetLimitProps {
  selectedMonth: number;
  selectedYear: number;
  totalExpenses: number;
}

export default function BudgetLimit({ selectedMonth, selectedYear, totalExpenses }: BudgetLimitProps) {
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingLimit, setIsSettingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState('');

  useEffect(() => {
    fetchBudgetLimit();
  }, [selectedMonth, selectedYear]);

  const fetchBudgetLimit = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/budgets?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Fetched budget:', response.data); // Debug log
      setBudgetLimit(response.data.limit || 0);
    } catch (err) {
      console.error('Error fetching budget limit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSetLimit = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate the input
      const limit = parseFloat(newLimit);
      if (isNaN(limit) || limit <= 0) {
        throw new Error('Please enter a valid positive number');
      }

      console.log('Setting budget:', { limit, month: selectedMonth, year: selectedYear }); // Debug log

      const response = await axios.post(
        `${API_BASE_URL}/api/budgets`,
        {
          limit,
          month: selectedMonth,
          year: selectedYear
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Budget set response:', response.data); // Debug log
      setBudgetLimit(response.data.limit);
      setIsSettingLimit(false);
      setNewLimit('');
      
      // Refresh the budget limit
      await fetchBudgetLimit();
    } catch (err) {
      console.error('Error setting budget limit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const percentage = budgetLimit > 0 ? (totalExpenses / budgetLimit) * 100 : 0;
  const remaining = budgetLimit - totalExpenses;

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
    );
  }

  if (!budgetLimit && !isSettingLimit) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Set Monthly Budget</h3>
          <button
            onClick={() => setIsSettingLimit(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Set Budget Limit
          </button>
        </div>
      </div>
    );
  }

  if (isSettingLimit) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Set Monthly Budget</h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="Enter budget limit"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleSetLimit}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsSettingLimit(false);
                setNewLimit('');
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Monthly Budget</h3>
        <button
          onClick={() => setIsSettingLimit(true)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Edit Limit
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Spent: ${totalExpenses.toFixed(2)}</span>
          <span>Limit: ${budgetLimit.toFixed(2)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              percentage > 100 ? 'bg-red-600' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
            {remaining < 0
              ? `Over budget by $${Math.abs(remaining).toFixed(2)}`
              : `Remaining: $${remaining.toFixed(2)}`}
          </span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
} 