'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import AddTransaction from './components/AddTransaction';
import RecentTransactions from './components/RecentTransactions';
import CategoryBreakdown from './components/CategoryBreakdown';
import MonthlySummaryGraph from './components/MonthlySummaryGraph';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const fetchTotalExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/transactions/category-breakdown?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const total = response.data.reduce((sum: number, item: any) => sum + item.total, 0);
      setTotalExpenses(total);
    } catch (err) {
      console.error('Error fetching total expenses:', err);
    }
  };

  const handleTransactionAdded = () => {
    fetchTotalExpenses();
    setRefreshTrigger(prev => prev + 1); // Increment trigger to refresh CategoryBreakdown
  };

  useEffect(() => {
    fetchTotalExpenses();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Month/Year selector */}
      <div className="flex gap-4 items-center justify-center mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Add Transaction */}
        <div className="lg:col-span-1">
          <AddTransaction 
            totalExpenses={totalExpenses} 
            onTransactionAdded={handleTransactionAdded}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>

        {/* Right column - Category Breakdown and Monthly Summary */}
        <div className="lg:col-span-2 space-y-4">
          <CategoryBreakdown refreshTrigger={refreshTrigger} />
          <MonthlySummaryGraph
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Recent Transactions at the bottom */}
      <div className="mt-4">
        <RecentTransactions onTransactionAdded={handleTransactionAdded} />
      </div>
    </div>
  );
}
