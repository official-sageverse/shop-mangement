export interface Payment {
  id: string;
  company: string;
  billDescription: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'check' | 'other';
  referenceNumber: string;
  createdAt: string;
}

export interface CompanySummary {
  company: string;
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  lastTransaction: string;
  transactions: Payment[];
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  company?: string;
  searchTerm?: string;
  paymentMethod?: string;
}