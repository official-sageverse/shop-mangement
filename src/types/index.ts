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
  referenceNumber?: string;
  createdAt: string;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  company?: string;
  searchTerm?: string;
  transactionType?: 'purchase' | 'payment';
  paymentMethod?: string;
}