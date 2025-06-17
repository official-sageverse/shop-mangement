import { Payment } from '../types';

const PAYMENTS_KEY = 'company_payments';

export const storageUtils = {
  // Payments
  getPayments(): Payment[] {
    try {
      const data = localStorage.getItem(PAYMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading payments:', error);
      return [];
    }
  },

  savePayments(payments: Payment[]): void {
    try {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payments:', error);
      throw new Error('Failed to save payments');
    }
  },

  addPayment(payment: Payment): void {
    const payments = this.getPayments();
    payments.push(payment);
    this.savePayments(payments);
  },

  updatePayment(id: string, updates: Partial<Payment>): void {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updates };
      this.savePayments(payments);
    }
  },

  deletePayment(id: string): void {
    const payments = this.getPayments().filter(p => p.id !== id);
    this.savePayments(payments);
  },

  // Utility
  clearAllData(): void {
    localStorage.removeItem(PAYMENTS_KEY);
  }
};