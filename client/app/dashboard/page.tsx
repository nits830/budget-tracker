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
          <CategoryBreakdown 
            refreshTrigger={refreshTrigger}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
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
