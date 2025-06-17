import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Payment } from '../types';
import { storageUtils } from '../utils/storage';

interface PaymentFormProps {
  onPaymentAdded: () => void;
  existingCompanies: string[];
  selectedCompany?: string;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' }
];

export default function PaymentForm({ onPaymentAdded, existingCompanies, selectedCompany }: PaymentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: selectedCompany || '',
    billDescription: '',
    totalAmount: '',
    paidAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as Payment['paymentMethod'],
    referenceNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.billDescription.trim()) newErrors.billDescription = 'Bill description is required';
    if (!formData.totalAmount || Number(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    }
    if (!formData.paidAmount || Number(formData.paidAmount) < 0) {
      newErrors.paidAmount = 'Paid amount cannot be negative';
    }
    if (Number(formData.paidAmount) > Number(formData.totalAmount)) {
      newErrors.paidAmount = 'Paid amount cannot exceed total amount';
    }
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    if (!formData.referenceNumber.trim()) newErrors.referenceNumber = 'Reference number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const totalAmount = Number(formData.totalAmount);
      const paidAmount = Number(formData.paidAmount);
      const remainingAmount = totalAmount - paidAmount;

      const payment: Payment = {
        id: crypto.randomUUID(),
        company: formData.company.trim(),
        billDescription: formData.billDescription.trim(),
        totalAmount,
        paidAmount,
        remainingAmount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber.trim(),
        createdAt: new Date().toISOString()
      };

      storageUtils.addPayment(payment);
      
      // Reset form
      setFormData({
        company: selectedCompany || '',
        billDescription: '',
        totalAmount: '',
        paidAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        referenceNumber: ''
      });
      setErrors({});
      setIsOpen(false);
      onPaymentAdded();
    } catch (error) {
      console.error('Error adding payment:', error);
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

  React.useEffect(() => {
    if (selectedCompany) {
      setFormData(prev => ({ ...prev, company: selectedCompany }));
    }
  }, [selectedCompany]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Payment
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Payment</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              list="existing-companies"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.company ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter company name"
            />
            <datalist id="existing-companies">
              {existingCompanies.map(company => (
                <option key={company} value={company} />
              ))}
            </datalist>
            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill Description *
            </label>
            <input
              type="text"
              name="billDescription"
              value={formData.billDescription}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.billDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="What is this bill for?"
            />
            {errors.billDescription && <p className="text-red-500 text-xs mt-1">{errors.billDescription}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount *
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="₹0.00"
              />
              {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid Amount *
              </label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.paidAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="₹0.00"
              />
              {errors.paidAmount && <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>}
            </div>
          </div>

          {formData.totalAmount && formData.paidAmount && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Remaining Amount: </span>
                ₹{(Number(formData.totalAmount) - Number(formData.paidAmount)).toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.paymentDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.referenceNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Transaction ID, Check number, etc."
            />
            {errors.referenceNumber && <p className="text-red-500 text-xs mt-1">{errors.referenceNumber}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}