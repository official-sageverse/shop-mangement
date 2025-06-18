export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          phone: string | null
          address: string | null
          total_bought: number
          total_paid: number
          remaining_amount: number
          last_transaction_date: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          address?: string | null
          total_bought?: number
          total_paid?: number
          remaining_amount?: number
          last_transaction_date?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          address?: string | null
          total_bought?: number
          total_paid?: number
          remaining_amount?: number
          last_transaction_date?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      transactions: {
        Row: {
          id: string
          company_id: string
          company_name: string
          type: 'purchase' | 'payment'
          description: string
          amount: number
          date: string
          payment_method: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'check' | 'other' | null
          paid_by: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          company_id: string
          company_name: string
          type: 'purchase' | 'payment'
          description: string
          amount: number
          date: string
          payment_method?: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'check' | 'other' | null
          paid_by?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          company_id?: string
          company_name?: string
          type?: 'purchase' | 'payment'
          description?: string
          amount?: number
          date?: string
          payment_method?: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'check' | 'other' | null
          paid_by?: string | null
          created_at?: string
          user_id?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          user1_name: string
          user2_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user1_name?: string
          user2_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user1_name?: string
          user2_name?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}