'use client';

import TransactionForm from './components/TransactionForm';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="grid grid-cols-3 grid-rows-2 gap-6 h-[calc(100vh-6rem)]">
        {/* Transaction Form */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <TransactionForm />
        </div>

        {/* Placeholder for other components */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Component 2</h2>
          {/* Add your second component here */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Component 3</h2>
          {/* Add your third component here */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Component 4</h2>
          {/* Add your fourth component here */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Component 5</h2>
          {/* Add your fifth component here */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Component 6</h2>
          {/* Add your sixth component here */}
        </div>
      </div>
    </div>
  );
}
