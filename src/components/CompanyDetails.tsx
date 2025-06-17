import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Receipt, 
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Download,
  User
} from 'lucide-react';
import { Company, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { storageUtils } from '../utils/storage';

interface CompanyDetailsProps {
  company: Company;
  transactions: Transaction[];
  onBack: () => void;
  onAddTransaction: (type: 'purchase' | 'payment') => void;
  onEditCompany: () => void;
  onRefresh: () => void;
}

export default function CompanyDetails({ 
  company, 
  transactions, 
  onBack, 
  onAddTransaction, 
  onEditCompany,
  onRefresh 
}: CompanyDetailsProps) {
  const [filter, setFilter] = useState<'all' | 'purchase' | 'payment'>('all');
  const settings = storageUtils.getSettings();

  const companyTransactions = transactions
    .filter(t => t.companyId === company.id)
    .filter(t => filter === 'all' || t.type === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      storageUtils.deleteTransaction(id);
      onRefresh();
    }
  };

  const handleDeleteCompany = () => {
    if (window.confirm(`Are you sure you want to delete ${company.name} and all its transactions?`)) {
      storageUtils.deleteCompany(company.id);
      onBack();
    }
  };

  const exportTransactions = () => {
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Payment Method', 'Paid By'];
    const csvData = [
      headers.join(','),
      ...companyTransactions.map(t => [
        t.date,
        t.type,
        `"${t.description}"`,
        t.amount,
        t.paymentMethod || '',
        `"${t.paidBy || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.name}-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex gap-2">
            <button
              onClick={onEditCompany}
              className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDeleteCompany}
              className="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h1>
            <div className="space-y-1">
              {company.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {company.address}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                Added on {formatDate(company.createdAt)}
              </div>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-lg text-right ${
            company.remainingAmount > 0 
              ? 'bg-red-100 border border-red-200' 
              : company.remainingAmount < 0
              ? 'bg-green-100 border border-green-200'
              : 'bg-gray-100 border border-gray-200'
          }`}>
            <p className="text-sm text-gray-600">
              {company.remainingAmount > 0 ? 'You owe them' : 
               company.remainingAmount < 0 ? 'They owe you' : 'All settled'}
            </p>
            <p className={`text-xl font-bold ${
              company.remainingAmount > 0 ? 'text-red-600' : 
              company.remainingAmount < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {formatCurrency(Math.abs(company.remainingAmount))}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-700">Total Bought</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(company.totalBought)}</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(company.totalPaid)}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{companyTransactions.length}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => onAddTransaction('purchase')}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Receipt className="w-4 h-4" />
            Add Purchase
          </button>
          <button
            onClick={() => onAddTransaction('payment')}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            disabled={company.remainingAmount <= 0}
          >
            <CreditCard className="w-4 h-4" />
            Pay Due ({formatCurrency(company.remainingAmount)})
          </button>
          <button
            onClick={exportTransactions}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('purchase')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'purchase' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setFilter('payment')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'payment' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Payments
            </button>
          </div>
        </div>

        {companyTransactions.length > 0 ? (
          <div className="space-y-3">
            {companyTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'purchase' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {transaction.type === 'purchase' ? (
                      <Receipt className="w-5 h-5 text-red-600" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.paymentMethod && (
                        <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                      )}
                      {transaction.paidBy && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{transaction.paidBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'purchase' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No transactions yet</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => onAddTransaction('purchase')}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Receipt className="w-4 h-4" />
                Add Purchase
              </button>
              <button
                onClick={() => onAddTransaction('payment')}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CreditCard className="w-4 h-4" />
                Add Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}