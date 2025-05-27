'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface MonthlySummaryGraphProps {
  selectedMonth: number;
  selectedYear: number;
  refreshTrigger: number;
}

export default function MonthlySummaryGraph({ selectedMonth, selectedYear, refreshTrigger }: MonthlySummaryGraphProps) {
  const [summaryData, setSummaryData] = useState({
    income: 0,
    expenses: 0,
    savings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaryData();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      setError(null);
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

      setSummaryData({
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalIncome - totalExpenses
      });
    } catch (err) {
      console.error('Error fetching summary data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Monthly Summary'],
    datasets: [
      {
        label: 'Expenses',
        data: [summaryData.expenses],
        backgroundColor: 'rgba(239, 68, 68, 0.6)', // red
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Savings',
        data: [summaryData.savings],
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Expenses vs Savings',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value;
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
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-[400px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
} 