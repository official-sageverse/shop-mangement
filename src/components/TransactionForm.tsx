import React, { useState } from 'react';
import { X, Receipt, CreditCard } from 'lucide-react';
import { Transaction, Company } from '../types';
import { storageUtils } from '../utils/storage';
import { formatCurrency } from '../utils/calculations';

interface TransactionFormProps {
  onTransactionAdded: () => void;
  onClose: () => void;
  company: Company;
  transactionType?: 'purchase' | 'payment';
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' }
];

export default function TransactionForm({ 
  onTransactionAdded, 
  onClose, 
  company, 
  transactionType = 'purchase' 
}: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: transactionType,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as Transaction['paymentMethod'],
    referenceNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.type === 'payment' && Number(formData.amount) > company.remainingAmount) {
      newErrors.amount = `Payment cannot exceed remaining amount of ${formatCurrency(company.remainingAmount)}`;
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.type === 'payment') {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = 'Payment method is required';
      }
      if (!formData.referenceNumber.trim()) {
        newErrors.referenceNumber = 'Reference number is required for payments';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        companyId: company.id,
        companyName: company.name,
        type: formData.type as 'purchase' | 'payment',
        description: formData.description.trim(),
        amount: Number(formData.amount),
        date: formData.date,
        paymentMethod: formData.type === 'payment' ? formData.paymentMethod : undefined,
        referenceNumber: formData.type === 'payment' ? formData.referenceNumber.trim() : undefined,
        createdAt: new Date().toISOString()
      };

      storageUtils.addTransaction(transaction);
      onTransactionAdded();
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (type: 'purchase' | 'payment') => {
    setFormData(prev => ({ ...prev, type }));
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${formData.type === 'purchase' ? 'bg-red-100' : 'bg-green-100'}`}>
              {formData.type === 'purchase' ? (
                <Receipt className={`w-5 h-5 ${formData.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`} />
              ) : (
                <CreditCard className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add Transaction
              </h2>
              <p className="text-sm text-gray-600">{company.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('purchase')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.type === 'purchase'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Receipt className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Purchase</div>
                <div className="text-xs text-gray-500">You bought from them</div>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('payment')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.type === 'payment'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Payment</div>
                <div className="text-xs text-gray-500">You paid them</div>
              </button>
            </div>
          </div>

          {/* Company Balance Info */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Total Bought</p>
                <p className="font-medium text-red-600">{formatCurrency(company.totalBought)}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Paid</p>
                <p className="font-medium text-green-600">{formatCurrency(company.totalPaid)}</p>
              </div>
              <div>
                <p className="text-gray-600">Balance</p>
                <p className={`font-medium ${company.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(company.remainingAmount)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.type === 'purchase' ? 'What did you buy?' : 'Payment for what?'}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="₹0.00"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {formData.type === 'payment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number *
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.referenceNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Transaction ID, Check number, etc."
                />
                {errors.referenceNumber && <p className="text-red-500 text-xs mt-1">{errors.referenceNumber}</p>}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                formData.type === 'purchase' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Adding...' : `Add ${formData.type === 'purchase' ? 'Purchase' : 'Payment'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}