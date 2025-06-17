import React from 'react';
import { 
  CreditCard, 
  AlertTriangle, 
  TrendingUp,
  Building2,
  Receipt,
  IndianRupee
} from 'lucide-react';
import { Payment, CompanySummary } from '../types';
import { calculateCompanySummaries, getTotalOutstanding, formatCurrency } from '../utils/calculations';

interface DashboardProps {
  payments: Payment[];
  onCompanySelect: (company: string) => void;
}

export default function Dashboard({ payments, onCompanySelect }: DashboardProps) {
  const companySummaries = calculateCompanySummaries(payments);
  const totalOutstanding = getTotalOutstanding(companySummaries);
  const totalAmount = companySummaries.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = companySummaries.reduce((sum, c) => sum + c.totalPaid, 0);
  
  const recentPayments = payments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const overdueCompanies = companySummaries.filter(c => c.totalRemaining > 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className={`text-2xl font-bold ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${totalOutstanding > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Companies</p>
              <p className="text-2xl font-bold text-purple-600">{companySummaries.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Company Summaries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Company Overview</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {companySummaries.map((summary) => (
            <div 
              key={summary.company} 
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => onCompanySelect(summary.company)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{summary.company}</h4>
                <span className="text-xs text-gray-500">{summary.totalBills} bills</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-medium text-gray-900">{formatCurrency(summary.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Paid</p>
                  <p className="font-medium text-emerald-600">{formatCurrency(summary.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Remaining</p>
                  <p className={`font-medium ${summary.totalRemaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(summary.totalRemaining)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {companySummaries.length === 0 && (
          <p className="text-gray-500 text-center py-8">No companies found. Add your first payment to get started.</p>
        )}
      </div>

      {/* Outstanding Payments */}
      {overdueCompanies.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Outstanding Payments</h3>
          </div>
          <div className="space-y-3">
            {overdueCompanies.slice(0, 5).map((summary) => (
              <div 
                key={summary.company} 
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => onCompanySelect(summary.company)}
              >
                <div>
                  <p className="font-medium text-gray-900">{summary.company}</p>
                  <p className="text-sm text-gray-600">
                    Total: {formatCurrency(summary.totalAmount)} | 
                    Paid: {formatCurrency(summary.totalPaid)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{formatCurrency(summary.totalRemaining)}</p>
                  <p className="text-xs text-gray-500">Outstanding</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="space-y-3">
          {recentPayments.length > 0 ? (
            recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{payment.company}</p>
                  <p className="text-sm text-gray-600">{payment.billDescription}</p>
                  <p className="text-xs text-gray-500">
                    {payment.paymentMethod.replace('_', ' ').toUpperCase()} • {payment.referenceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    {formatCurrency(payment.paidAmount)}
                  </p>
                  {payment.remainingAmount > 0 && (
                    <p className="text-xs text-red-500">
                      {formatCurrency(payment.remainingAmount)} remaining
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  );
}