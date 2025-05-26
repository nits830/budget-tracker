'use client';

import TransactionForm from './components/TransactionForm';
import RecentTransactions from './components/RecentTransactions';
import CategoryBreakdown from './components/CategoryBreakdown';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Transaction Form - Spans 4 columns */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h2>
                <TransactionForm />
              </div>
            </div>
          </div>

          {/* Recent Transactions - Spans 8 columns */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
                <RecentTransactions />
              </div>
            </div>
          </div>

          {/* Category Breakdown - Spans 6 columns */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
                <CategoryBreakdown />
              </div>
            </div>
          </div>

          {/* Monthly Summary - Spans 6 columns */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h2>
                {/* Add your monthly summary component here */}
              </div>
            </div>
          </div>

          {/* Budget Progress - Spans 6 columns */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h2>
                {/* Add your budget progress component here */}
              </div>
            </div>
          </div>

          {/* Savings Goals - Spans 6 columns */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Savings Goals</h2>
                {/* Add your savings goals component here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
