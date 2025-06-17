import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  ChevronUp, 
  ChevronDown,
  Trash2,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Payment, FilterOptions } from '../types';
import { formatCurrency } from '../utils/calculations';
import { storageUtils } from '../utils/storage';

interface PaymentsTableProps {
  payments: Payment[];
  onPaymentsChange: () => void;
  selectedCompany?: string;
  onBackToDashboard: () => void;
  onAddPayment: (company?: string) => void;
}

type SortField = 'company' | 'billDescription' | 'totalAmount' | 'paidAmount' | 'remainingAmount' | 'paymentDate' | 'paymentMethod';
type SortDirection = 'asc' | 'desc';

const paymentMethodLabels: Record<Payment['paymentMethod'], string> = {
  cash: 'Cash',
  card: 'Credit/Debit Card',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  check: 'Check',
  other: 'Other'
};

export default function PaymentsTable({ 
  payments, 
  onPaymentsChange, 
  selectedCompany, 
  onBackToDashboard,
  onAddPayment 
}: PaymentsTableProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortField, setSortField] = useState<SortField>('paymentDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const companies = useMemo(() => {
    return Array.from(new Set(payments.map(p => p.company))).sort();
  }, [payments]);

  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter(payment => {
      if (selectedCompany && payment.company !== selectedCompany) return false;
      if (filters.startDate && payment.paymentDate < filters.startDate) return false;
      if (filters.endDate && payment.paymentDate > filters.endDate) return false;
      if (filters.company && payment.company !== filters.company) return false;
      if (filters.paymentMethod && payment.paymentMethod !== filters.paymentMethod) return false;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          payment.company.toLowerCase().includes(term) ||
          payment.billDescription.toLowerCase().includes(term) ||
          payment.referenceNumber.toLowerCase().includes(term) ||
          paymentMethodLabels[payment.paymentMethod].toLowerCase().includes(term)
        );
      }
      return true;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'billDescription':
          aValue = a.billDescription.toLowerCase();
          bValue = b.billDescription.toLowerCase();
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'paidAmount':
          aValue = a.paidAmount;
          bValue = b.paidAmount;
          break;
        case 'remainingAmount':
          aValue = a.remainingAmount;
          bValue = b.remainingAmount;
          break;
        case 'paymentDate':
          aValue = new Date(a.paymentDate);
          bValue = new Date(b.paymentDate);
          break;
        case 'paymentMethod':
          aValue = paymentMethodLabels[a.paymentMethod];
          bValue = paymentMethodLabels[b.paymentMethod];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [payments, filters, sortField, sortDirection, selectedCompany]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      storageUtils.deletePayment(id);
      onPaymentsChange();
    }
  };

  const exportToCSV = () => {
    const headers = ['Company', 'Bill Description', 'Total Amount', 'Paid Amount', 'Remaining Amount', 'Payment Date', 'Payment Method', 'Reference Number'];
    const csvData = [
      headers.join(','),
      ...filteredAndSortedPayments.map(payment => [
        `"${payment.company}"`,
        `"${payment.billDescription}"`,
        payment.totalAmount,
        payment.paidAmount,
        payment.remainingAmount,
        payment.paymentDate,
        `"${paymentMethodLabels[payment.paymentMethod]}"`,
        `"${payment.referenceNumber}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${selectedCompany || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      ) : (
        <div className="w-4 h-4" />
      )}
    </button>
  );

  const totalAmount = filteredAndSortedPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = filteredAndSortedPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalRemaining = filteredAndSortedPayments.reduce((sum, p) => sum + p.remainingAmount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {selectedCompany && (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCompany ? `${selectedCompany} - Payments` : 'All Payments'}
              </h2>
              {selectedCompany && (
                <p className="text-sm text-gray-600">
                  {filteredAndSortedPayments.length} transactions
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedCompany && (
              <button
                onClick={() => onAddPayment(selectedCompany)}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Payment
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search payments..."
              value={filters.searchTerm || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {!selectedCompany && (
            <select
              value={filters.company || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value || undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          )}

          <select
            value={filters.paymentMethod || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Methods</option>
            {Object.entries(paymentMethodLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <input
            type="date"
            placeholder="Start Date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />

          <input
            type="date"
            placeholder="End Date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {!selectedCompany && (
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  <SortButton field="company">Company</SortButton>
                </th>
              )}
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                <SortButton field="billDescription">Bill Description</SortButton>
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">
                <SortButton field="totalAmount">Total</SortButton>
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">
                <SortButton field="paidAmount">Paid</SortButton>
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">
                <SortButton field="remainingAmount">Remaining</SortButton>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                <SortButton field="paymentDate">Date</SortButton>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                <SortButton field="paymentMethod">Method</SortButton>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
              <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPayments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                {!selectedCompany && (
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{payment.company}</div>
                  </td>
                )}
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{payment.billDescription}</div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">
                  {formatCurrency(payment.totalAmount)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-emerald-600">
                  {formatCurrency(payment.paidAmount)}
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  <span className={payment.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(payment.remainingAmount)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {paymentMethodLabels[payment.paymentMethod]}
                </td>
                <td className="py-3 px-4 text-gray-600">{payment.referenceNumber}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Delete payment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedPayments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No payments found</p>
          {selectedCompany && (
            <button
              onClick={() => onAddPayment(selectedCompany)}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add First Payment
            </button>
          )}
        </div>
      )}

      {filteredAndSortedPayments.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Showing {filteredAndSortedPayments.length} of {payments.length} payments</span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Total: </span>
              <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Paid: </span>
              <span className="font-medium text-emerald-600">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Remaining: </span>
              <span className={`font-medium ${totalRemaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(totalRemaining)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}