import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Transaction } from '@/server/models/Transaction';

export async function GET() {
  try {
    await connectToDatabase();
    
    const transactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent transactions' },
      { status: 500 }
    );
  }
} 