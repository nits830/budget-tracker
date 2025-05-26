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

export default function CategoryBreakdown() {
  const currentDate = new Date();
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchCategoryData();
  }, [selectedMonth, selectedYear]);

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

      console.log('Received data:', response.data);
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
    
    // Take top 10 categories
    const topCategories = sortedData.slice(0, 10);
    
    // Sum up the rest as "Others"
    const othersTotal = sortedData
      .slice(10)
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
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF' // Color for "Others"
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
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-center mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {categoryData.length > 0 ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="w-[350px] h-[350px]">
            <Pie data={prepareChartData()} options={chartOptions} />
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