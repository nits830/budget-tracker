'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  category: string;
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface CategoryBreakdownProps {
  refreshTrigger: number;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export default function CategoryBreakdown({ 
  refreshTrigger, 
  selectedMonth, 
  selectedYear,
  onMonthChange,
  onYearChange 
}: CategoryBreakdownProps) {
  const currentDate = new Date();
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryData();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
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

      console.log('Received category data:', response.data);
      setCategoryData(response.data);
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!categoryData || categoryData.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 1
        }]
      };
    }

    // Sort categories by total amount
    const sortedData = [...categoryData].sort((a, b) => b.total - a.total);
    
    // Take top 5 categories
    const topCategories = sortedData.slice(0, 5);
    
    // Sum up the rest as "Others"
    const othersTotal = sortedData
      .slice(5)
      .reduce((sum, item) => sum + item.total, 0);

    const labels = [
      ...topCategories.map(item => item.category),
      ...(othersTotal > 0 ? ['Others'] : [])
    ];

    const data = [
      ...topCategories.map(item => item.total),
      ...(othersTotal > 0 ? [othersTotal] : [])
    ];

    // Generate colors
    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40' // Color for "Others"
    ];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1
      }]
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.total, 0);
  const topCategories = [...categoryData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

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

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-center mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
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
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {categoryData.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Top Categories</h3>
              <div className="space-y-2">
                {topCategories.map((category) => (
                  <div key={category.category} className="flex justify-between items-center">
                    <span className="text-sm">{category.category}</span>
                    <span className="font-medium">${category.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-center">Expense Distribution</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-[250px] h-[250px] relative">
                <Pie data={prepareChartData()} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-center p-4">
          No expense data available for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      )}
    </div>
  );
} 