import { supabase } from '../lib/supabase';
import { Company, Transaction, UserSettings } from '../types';
import { Database } from '../types/database';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];

// Helper functions to convert between database rows and app types
const convertCompanyFromDb = (row: CompanyRow): Company => ({
  id: row.id,
  name: row.name,
  phone: row.phone || undefined,
  address: row.address || undefined,
  totalBought: Number(row.total_bought),
  totalPaid: Number(row.total_paid),
  remainingAmount: Number(row.remaining_amount),
  createdAt: row.created_at,
  lastTransactionDate: row.last_transaction_date || undefined,
  userId: row.user_id
});

const convertTransactionFromDb = (row: TransactionRow): Transaction => ({
  id: row.id,
  companyId: row.company_id,
  companyName: row.company_name,
  type: row.type,
  description: row.description,
  amount: Number(row.amount),
  date: row.date,
  paymentMethod: row.payment_method || undefined,
  paidBy: row.paid_by || undefined,
  createdAt: row.created_at,
  userId: row.user_id
});

export const supabaseUtils = {
  // Authentication
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!session?.user) {
      throw new Error('Auth session missing!');
    }
    
    return session.user;
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (!data) {
      // Create default settings
      const defaultSettings = {
        user_id: user.id,
        user1_name: 'User 1',
        user2_name: 'User 2'
      };

      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (insertError) throw insertError;
      return {
        user1Name: newData.user1_name,
        user2Name: newData.user2_name
      };
    }

    return {
      user1Name: data.user1_name,
      user2Name: data.user2_name
    };
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        user1_name: settings.user1Name,
        user2_name: settings.user2Name
      });

    if (error) throw error;
  },

  // Companies
  async getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(convertCompanyFromDb);
  },

  async addCompany(company: Omit<Company, 'id' | 'createdAt' | 'userId'>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        phone: company.phone || null,
        address: company.address || null,
        user_id: user.id
      });

    if (error) throw error;
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .update({
        name: updates.name,
        phone: updates.phone || null,
        address: updates.address || null
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(convertTransactionFromDb);
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('transactions')
      .insert({
        company_id: transaction.companyId,
        company_name: transaction.companyName,
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        payment_method: transaction.paymentMethod || null,
        paid_by: transaction.paidBy || null,
        user_id: user.id
      });

    if (error) throw error;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};