import React from 'react';
import { 
  Building2, 
  Receipt, 
  CreditCard,
  AlertTriangle,
  Plus,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { Company, Transaction } from '../types';
import { formatCurrency, formatDate, getTotalOutstanding, getTotalBought, getTotalPaid } from '../utils/calculations';

interface DashboardProps {
  companies: Company[];
  transactions: Transaction[];
  onCompanySelect: (company: Company) => void;
  onAddCompany: () => void;
}

export default function Dashboard({ companies, transactions, onCompanySelect, onAddCompany }: DashboardProps) {
  const totalOutstanding = getTotalOutstanding(companies);
  const totalBought = getTotalBought(companies);
  const totalPaid = getTotalPaid(companies);
  
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const overdueCompanies = companies
    .filter(c => c.remainingAmount > 0)
    .sort((a, b) => b.remainingAmount - a.remainingAmount);

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
              <p className="text-sm font-medium text-gray-600">Total Bought</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalBought)}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <Receipt className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-blue-600">{companies.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
          </div>
          <button
            onClick={onAddCompany}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => onCompanySelect(company)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </h4>
                    {company.phone && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {company.phone}
                      </div>
                    )}
                    {company.address && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{company.address}</span>
                      </div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    company.remainingAmount > 0 
                      ? 'bg-red-100 text-red-700' 
                      : company.remainingAmount < 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {company.remainingAmount > 0 ? 'You owe' : company.remainingAmount < 0 ? 'They owe' : 'Settled'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Bought</p>
                    <p className="font-medium text-red-600">{formatCurrency(company.totalBought)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Paid</p>
                    <p className="font-medium text-green-600">{formatCurrency(company.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Balance</p>
                    <p className={`font-medium ${
                      company.remainingAmount > 0 ? 'text-red-600' : 
                      company.remainingAmount < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {formatCurrency(Math.abs(company.remainingAmount))}
                    </p>
                  </div>
                </div>

                {company.lastTransactionDate && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    Last transaction: {formatDate(company.lastTransactionDate)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No companies added yet</p>
            <button
              onClick={onAddCompany}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Your First Company
            </button>
          </div>
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
            {overdueCompanies.slice(0, 5).map((company) => (
              <div 
                key={company.id} 
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => onCompanySelect(company)}
              >
                <div>
                  <p className="font-medium text-gray-900">{company.name}</p>
                  <p className="text-sm text-gray-600">
                    Bought: {formatCurrency(company.totalBought)} | 
                    Paid: {formatCurrency(company.totalPaid)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{formatCurrency(company.remainingAmount)}</p>
                  <p className="text-xs text-gray-500">Outstanding</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'purchase' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {transaction.type === 'purchase' ? (
                      <Receipt className="w-4 h-4 text-red-600" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.companyName}</p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.date)}
                      {transaction.referenceNumber && ` • ${transaction.referenceNumber}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'purchase' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}