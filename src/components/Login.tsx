import React, { useState } from 'react';
import { LogIn, Loader2, Cake, UserPlus } from 'lucide-react';
import { supabaseUtils } from '../utils/supabase';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    email: 'shivam@yash.com',
    password: 'Shivam@123'
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await supabaseUtils.signUp(formData.email, formData.password);
        setError('Account created successfully! You can now sign in.');
        setMode('login');
      } else {
        await supabaseUtils.signIn(formData.email, formData.password);
        onLogin();
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Account not found. Please create an account first or check your credentials.');
      } else {
        setError(err.message || `${mode === 'login' ? 'Login' : 'Sign up'} failed`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Cake className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shivam Bakers</h1>
          <p className="text-gray-600">Business Account Management</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className={`p-3 border rounded-lg ${
              error.includes('successfully') 
                ? 'bg-green-50 border-green-200 text-green-600' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-medium text-orange-800 mb-2">Default Credentials:</h3>
          <div className="text-sm text-orange-700 space-y-1">
            <p><strong>Email:</strong> shivam@yash.com</p>
            <p><strong>Password:</strong> Shivam@123</p>
          </div>
          <p className="text-xs text-orange-600 mt-2">
            {mode === 'login' 
              ? 'If this is your first time, please create an account first using these credentials.'
              : 'Create an account with these credentials to get started.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}