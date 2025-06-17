import { Company, Transaction, UserSettings } from '../types';

const COMPANIES_KEY = 'khatabook_companies';
const TRANSACTIONS_KEY = 'khatabook_transactions';
const SETTINGS_KEY = 'khatabook_settings';

export const storageUtils = {
  // Settings
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { user1Name: 'User 1', user2Name: 'User 2' };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { user1Name: 'User 1', user2Name: 'User 2' };
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  },

  // Companies
  getCompanies(): Company[] {
    try {
      const data = localStorage.getItem(COMPANIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  },

  saveCompanies(companies: Company[]): void {
    try {
      localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
    } catch (error) {
      console.error('Error saving companies:', error);
      throw new Error('Failed to save companies');
    }
  },

  addCompany(company: Company): void {
    const companies = this.getCompanies();
    companies.push(company);
    this.saveCompanies(companies);
  },

  updateCompany(id: string, updates: Partial<Company>): void {
    const companies = this.getCompanies();
    const index = companies.findIndex(c => c.id === id);
    if (index !== -1) {
      companies[index] = { ...companies[index], ...updates };
      this.saveCompanies(companies);
    }
  },

  deleteCompany(id: string): void {
    const companies = this.getCompanies().filter(c => c.id !== id);
    this.saveCompanies(companies);
    // Also delete all transactions for this company
    const transactions = this.getTransactions().filter(t => t.companyId !== id);
    this.saveTransactions(transactions);
  },

  // Transactions
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
      throw new Error('Failed to save transactions');
    }
  },

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
    
    // Update company totals
    this.updateCompanyTotals(transaction.companyId);
  },

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const oldTransaction = transactions[index];
      transactions[index] = { ...transactions[index], ...updates };
      this.saveTransactions(transactions);
      
      // Update company totals for both old and new company if changed
      this.updateCompanyTotals(oldTransaction.companyId);
      if (updates.companyId && updates.companyId !== oldTransaction.companyId) {
        this.updateCompanyTotals(updates.companyId);
      }
    }
  },

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      const filteredTransactions = transactions.filter(t => t.id !== id);
      this.saveTransactions(filteredTransactions);
      this.updateCompanyTotals(transaction.companyId);
    }
  },

  updateCompanyTotals(companyId: string): void {
    const transactions = this.getTransactions().filter(t => t.companyId === companyId);
    const companies = this.getCompanies();
    const companyIndex = companies.findIndex(c => c.id === companyId);
    
    if (companyIndex !== -1) {
      const totalBought = transactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalPaid = transactions
        .filter(t => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const remainingAmount = totalBought - totalPaid;
      
      const lastTransaction = transactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      companies[companyIndex] = {
        ...companies[companyIndex],
        totalBought,
        totalPaid,
        remainingAmount,
        lastTransactionDate: lastTransaction?.date
      };
      
      this.saveCompanies(companies);
    }
  },

  // Utility
  clearAllData(): void {
    localStorage.removeItem(COMPANIES_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
};