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
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      if (response.data && response.data.length > 0) {
        setBudgetLimit(response.data[0].limit);
      } else {
        setBudgetLimit(null);
      }
    } catch (err) {
      console.error('Error fetching budget limit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLimit = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        `${API_BASE_URL}/api/budgets`,
        {
          month: selectedMonth,
          year: selectedYear,
          limit: parseFloat(newLimit)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBudgetLimit(parseFloat(newLimit));
      setIsEditing(false);
      setNewLimit('');
    } catch (err) {
      console.error('Error setting budget limit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = budgetLimit ? (totalExpenses / budgetLimit) * 100 : 0;
  const isOverBudget = progressPercentage > 100;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Monthly Budget</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {budgetLimit ? 'Edit' : 'Set Limit'}
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="Enter budget limit"
              className="w-32 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleSaveLimit}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNewLimit('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {budgetLimit && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>${totalExpenses.toFixed(2)} / ${budgetLimit.toFixed(2)}</span>
            <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                isOverBudget ? 'bg-red-600' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
} 