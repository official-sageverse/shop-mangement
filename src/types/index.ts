export interface Company {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  totalBought: number;
  totalPaid: number;
  remainingAmount: number;
  createdAt: string;
  lastTransactionDate?: string;
  userId: string;
}

export interface Transaction {
  id: string;
  companyId: string;
  companyName: string;
  type: 'purchase' | 'payment';
  description: string;
  amount: number;
  date: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'check' | 'other';
  paidBy?: string;
  createdAt: string;
  userId: string;
}

export interface UserSettings {
  user1Name: string;
  user2Name: string;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  company?: string;
  searchTerm?: string;
  transactionType?: 'purchase' | 'payment';
  paymentMethod?: string;
  paidBy?: string;
}

export interface User {
  id: string;
  email: string;
}