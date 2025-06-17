import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Menu, 
  X,
  BookOpen,
  Settings as SettingsIcon
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CompanyDetails from './components/CompanyDetails';
import CompanyForm from './components/CompanyForm';
import TransactionForm from './components/TransactionForm';
import Settings from './components/Settings';
import { Company, Transaction } from './types';
import { storageUtils } from './utils/storage';

type ActiveView = 'dashboard' | 'company-details';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [transactionType, setTransactionType] = useState<'purchase' | 'payment'>('purchase');
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();

  useEffect(() => {
    refreshData();
    document.title = 'KhataBook - Business Account Management';
  }, []);

  const refreshData = () => {
    setCompanies(storageUtils.getCompanies());
    setTransactions(storageUtils.getTransactions());
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setActiveView('company-details');
  };

  const handleBackToDashboard = () => {
    setSelectedCompany(null);
    setActiveView('dashboard');
  };

  const handleAddCompany = () => {
    setEditingCompany(undefined);
    setShowCompanyForm(true);
  };

  const handleEditCompany = () => {
    if (selectedCompany) {
      setEditingCompany(selectedCompany);
      setShowCompanyForm(true);
    }
  };

  const handleAddTransaction = (type: 'purchase' | 'payment') => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  const handleCompanyAdded = () => {
    refreshData();
    setShowCompanyForm(false);
    // If we were editing, refresh the selected company
    if (editingCompany && selectedCompany) {
      const updatedCompany = storageUtils.getCompanies().find(c => c.id === selectedCompany.id);
      if (updatedCompany) {
        setSelectedCompany(updatedCompany);
      }
    }
  };

  const handleTransactionAdded = () => {
    refreshData();
    setShowTransactionForm(false);
    // Refresh selected company data
    if (selectedCompany) {
      const updatedCompany = storageUtils.getCompanies().find(c => c.id === selectedCompany.id);
      if (updatedCompany) {
        setSelectedCompany(updatedCompany);
      }
    }
  };

  const handleSettingsUpdated = () => {
    refreshData();
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            companies={companies} 
            transactions={transactions}
            onCompanySelect={handleCompanySelect}
            onAddCompany={handleAddCompany}
          />
        );
      case 'company-details':
        return selectedCompany ? (
          <CompanyDetails 
            company={selectedCompany}
            transactions={transactions}
            onBack={handleBackToDashboard}
            onAddTransaction={handleAddTransaction}
            onEditCompany={handleEditCompany}
            onRefresh={() => {
              refreshData();
              const updatedCompany = storageUtils.getCompanies().find(c => c.id === selectedCompany.id);
              if (updatedCompany) {
                setSelectedCompany(updatedCompany);
              } else {
                handleBackToDashboard();
              }
            }}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KhataBook</h1>
                <p className="text-xs text-gray-600">Business Account Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={handleBackToDashboard}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <SettingsIcon className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleAddCompany}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Receipt className="w-4 h-4" />
                Add Company
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    handleBackToDashboard();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  <SettingsIcon className="w-5 h-5" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    handleAddCompany();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Receipt className="w-5 h-5" />
                  Add Company
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Company Form Modal */}
      {showCompanyForm && (
        <CompanyForm
          onCompanyAdded={handleCompanyAdded}
          onClose={() => setShowCompanyForm(false)}
          company={editingCompany}
        />
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && selectedCompany && (
        <TransactionForm
          onTransactionAdded={handleTransactionAdded}
          onClose={() => setShowTransactionForm(false)}
          company={selectedCompany}
          transactionType={transactionType}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onSettingsUpdated={handleSettingsUpdated}
        />
      )}
    </div>
  );
}

export default App;