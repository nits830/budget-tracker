'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import AddTransaction from './components/AddTransaction';
import RecentTransactions from './components/RecentTransactions';
import CategoryBreakdown from './components/CategoryBreakdown';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [totalExpenses, setTotalExpenses] = useState(0);
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

  useEffect(() => {
    fetchTotalExpenses();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Top row with AddTransaction and CategoryBreakdown side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <AddTransaction 
              totalExpenses={totalExpenses} 
              onTransactionAdded={fetchTotalExpenses}
            />
          </div>
          <div>
            <CategoryBreakdown />
          </div>
        </div>

        {/* Bottom row with RecentTransactions at full width */}
        <div className="w-full">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
