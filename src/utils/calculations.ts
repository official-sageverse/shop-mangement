import { Company, Transaction } from '../types';

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
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTotalOutstanding = (companies: Company[]): number => {
  return companies.reduce((total, company) => total + Math.max(0, company.remainingAmount), 0);
};

export const getTotalBought = (companies: Company[]): number => {
  return companies.reduce((total, company) => total + company.totalBought, 0);
};

export const getTotalPaid = (companies: Company[]): number => {
  return companies.reduce((total, company) => total + company.totalPaid, 0);
};