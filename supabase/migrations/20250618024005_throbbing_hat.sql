/*
  # Create companies and transactions tables for Shivam Bakers

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `phone` (text, optional)
      - `address` (text, optional)
      - `total_bought` (numeric, default 0)
      - `total_paid` (numeric, default 0)
      - `remaining_amount` (numeric, default 0)
      - `last_transaction_date` (date, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, references auth.users)

    - `transactions`
      - `id` (uuid, primary key)
      - `company_id` (uuid, references companies)
      - `company_name` (text)
      - `type` (text, 'purchase' or 'payment')
      - `description` (text)
      - `amount` (numeric)
      - `date` (date)
      - `payment_method` (text, optional)
      - `paid_by` (text, optional)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `user1_name` (text, default 'User 1')
      - `user2_name` (text, default 'User 2')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for shared access (all authenticated users can see all data for the shop)

  3. Functions
    - Function to update company totals when transactions change
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  address text,
  total_bought numeric DEFAULT 0,
  total_paid numeric DEFAULT 0,
  remaining_amount numeric DEFAULT 0,
  last_transaction_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(name, user_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'payment')),
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  payment_method text CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'upi', 'check', 'other')),
  paid_by text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  user1_name text DEFAULT 'User 1',
  user2_name text DEFAULT 'User 2',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for companies (shared access for all authenticated users)
CREATE POLICY "All authenticated users can view companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "All authenticated users can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "All authenticated users can delete companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for transactions (shared access for all authenticated users)
CREATE POLICY "All authenticated users can view transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "All authenticated users can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "All authenticated users can delete transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update company totals
CREATE OR REPLACE FUNCTION update_company_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update totals for the affected company
  UPDATE companies 
  SET 
    total_bought = COALESCE((
      SELECT SUM(amount) 
      FROM transactions 
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id) 
      AND type = 'purchase'
    ), 0),
    total_paid = COALESCE((
      SELECT SUM(amount) 
      FROM transactions 
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id) 
      AND type = 'payment'
    ), 0),
    last_transaction_date = (
      SELECT MAX(date) 
      FROM transactions 
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);

  -- Update remaining_amount
  UPDATE companies 
  SET remaining_amount = total_bought - total_paid
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update company totals
CREATE TRIGGER update_company_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_company_totals();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();