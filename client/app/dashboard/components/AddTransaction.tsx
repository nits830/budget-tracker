'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetLimit from './BudgetLimit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AddTransactionProps {
  totalExpenses: number;
  onTransactionAdded: () => void;
  selectedMonth: number;
  selectedYear: number;
}

interface Categories {
  INCOME: string[];
  EXPENSE: string[];
}

interface MonthlySummary {
  income: number;
  expenses: number;
  savings: number;
}

export default function AddTransaction({ 
  totalExpenses, 
  onTransactionAdded,
  selectedMonth,
  selectedYear 
}: AddTransactionProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Categories>({
    INCOME: [],
    EXPENSE: []
  });
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
    income: 0,
    expenses: 0,
    savings: 0
  });

  useEffect(() => {
    fetchCategories();
    fetchMonthlySummary();
  }, [selectedMonth, selectedYear]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/transactions/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCategories(response.data);
      // Set initial category based on type
      setCategory(response.data.EXPENSE[0] || '');
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get income transactions
      const incomeResponse = await axios.get(
        `${API_BASE_URL}/api/transactions?month=${selectedMonth}&year=${selectedYear}&type=income`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Get expense transactions
      const expenseResponse = await axios.get(
        `${API_BASE_URL}/api/transactions?month=${selectedMonth}&year=${selectedYear}&type=expense`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const totalIncome = incomeResponse.data.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
      const totalExpenses = expenseResponse.data.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);

      setMonthlySummary({
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalIncome - totalExpenses
      });
    } catch (err) {
      console.error('Error fetching monthly summary:', err);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setType(newType);
    // Reset category when type changes
    setCategory(categories[newType.toUpperCase() as keyof Categories][0] || '');
    setIsCustomCategory(false);
    setCustomCategory('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/transactions`,
        {
          amount: parseFloat(amount),
          type,
          category: isCustomCategory ? customCategory : category,
          description,
          isCustomCategory
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(true);
      setAmount('');
      setType('expense');
      setCategory(categories.EXPENSE[0] || '');
      setDescription('');
      setIsCustomCategory(false);
      setCustomCategory('');
      
      // Call the callback to refresh total expenses
      onTransactionAdded();
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Add Transaction</h2>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={handleTypeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            {isCustomCategory ? (
              <input
                type="text"
                id="category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter custom category"
              />
            ) : (
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {categories[type.toUpperCase() as keyof Categories]?.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isCustomCategory}
                onChange={(e) => setIsCustomCategory(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Use custom category</span>
            </label>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter description (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500 text-sm text-center">
              Transaction added successfully!
            </div>
          )}
        </form>

        <div className="mt-4 space-y-4">
          <BudgetLimit
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            totalExpenses={totalExpenses}
          />

          {/* Monthly Summary Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Monthly Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Income</span>
                <span className="text-sm font-medium text-green-600">
                  ${monthlySummary.income.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expenses</span>
                <span className="text-sm font-medium text-red-600">
                  ${monthlySummary.expenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Savings</span>
                <span className={`text-sm font-medium ${monthlySummary.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${monthlySummary.savings.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 