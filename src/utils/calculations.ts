import { Payment, CompanySummary } from '../types';

export const calculateCompanySummaries = (payments: Payment[]): CompanySummary[] => {
  const companyMap = new Map<string, CompanySummary>();

  payments.forEach(payment => {
    const existing = companyMap.get(payment.company);
    
    if (existing) {
      existing.totalBills += 1;
      existing.totalAmount += payment.totalAmount;
      existing.totalPaid += payment.paidAmount;
      existing.totalRemaining += payment.remainingAmount;
      existing.transactions.push(payment);
      
      if (new Date(payment.createdAt) > new Date(existing.lastTransaction)) {
        existing.lastTransaction = payment.createdAt;
      }
    } else {
      companyMap.set(payment.company, {
        company: payment.company,
        totalBills: 1,
        totalAmount: payment.totalAmount,
        totalPaid: payment.paidAmount,
        totalRemaining: payment.remainingAmount,
        lastTransaction: payment.createdAt,
        transactions: [payment]
      });
    }
  });

  return Array.from(companyMap.values())
    .sort((a, b) => b.totalRemaining - a.totalRemaining);
};

export const getTotalOutstanding = (summaries: CompanySummary[]): number => {
  return summaries.reduce((total, summary) => total + Math.max(0, summary.totalRemaining), 0);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};