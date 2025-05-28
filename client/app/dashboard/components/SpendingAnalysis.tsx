'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SpendingAnalysisProps {
  selectedMonth: number;
  selectedYear: number;
  refreshTrigger: number;
  totalExpenses: number;
}

interface AnalysisResponse {
  keyPoints: string[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    categoryBreakdown: {
      [key: string]: {
        total: number;
        transactions: Array<{
          amount: number;
          description: string;
          date: string;
        }>;
      };
    };
  };
}

export default function SpendingAnalysis({ 
  selectedMonth, 
  selectedYear, 
  refreshTrigger,
  totalExpenses 
}: SpendingAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/analysis/spending`,
        {
          month: selectedMonth,
          year: selectedYear
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAnalysis(response.data);
    } catch (err) {
      console.error('Error fetching spending analysis:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPointType = (point: string): 'red' | 'green' => {
    const redFlags = [
      'concern',
      'warning',
      'high',
      'excessive',
      'overspending',
      'over budget',
      'debt',
      'increase',
      'spike',
      'unusual',
      'unexpected',
      'significant',
      'substantial',
      'major',
      'critical'
    ];

    const lowerPoint = point.toLowerCase();
    return redFlags.some(flag => lowerPoint.includes(flag)) ? 'red' : 'green';
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

  if (!analysis) {
    return (
      <div className="text-gray-500 text-center p-4">
        No analysis available for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Spending Analysis</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          {analysis.keyPoints.map((point, index) => {
            const type = getPointType(point);
            return (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  type === 'red' 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                    type === 'red' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <p className={`ml-3 text-sm ${
                    type === 'red' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {point}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 