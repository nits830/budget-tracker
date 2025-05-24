'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Category {
  INCOME: string[];
  EXPENSE: string[];
}

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function TransactionForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category>({
    INCOME: [],
    EXPENSE: []
  });
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    isCustomCategory: false
  });
  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/transactions/categories');
        setCategories(data);
        setFormData(prev => ({
          ...prev,
          category: data.EXPENSE[0]
        }));
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: newType,
      category: categories[newType.toUpperCase() as keyof Category][0],
      isCustomCategory: false
    }));
    setCustomCategory('');
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    if (selectedCategory === 'custom') {
      setFormData(prev => ({
        ...prev,
        isCustomCategory: true,
        category: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        category: selectedCategory,
        isCustomCategory: false
      }));
    }
  };

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await api.post('/api/transactions', {
        ...formData,
        amount: parseFloat(formData.amount)
      });

      console.log('Transaction created:', response.data);

      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        category: categories.EXPENSE[0],
        description: '',
        isCustomCategory: false
      });
      setCustomCategory('');
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Transaction error:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to add transaction');
      } else {
        setError('Failed to add transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Add Transaction</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={handleTypeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">Category</label>
            <select
              value={formData.isCustomCategory ? 'custom' : formData.category}
              onChange={handleCategoryChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              {categories[formData.type.toUpperCase() as keyof Category]?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="custom">Custom Category</option>
            </select>
          </div>

          {formData.isCustomCategory && (
            <div>
              <label className="block text-xs font-medium text-gray-700">Custom Category</label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={handleCustomCategoryChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="Enter custom category"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Enter description (optional)"
              rows={2}
            />
          </div>

          {error && (
            <div className="text-red-600 text-xs">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-1.5 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
} 