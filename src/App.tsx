import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Menu, 
  X,
  IndianRupee
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import PaymentForm from './components/PaymentForm';
import PaymentsTable from './components/PaymentsTable';
import { Payment } from './types';
import { storageUtils } from './utils/storage';

type ActiveTab = 'dashboard' | 'payments';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    setPayments(storageUtils.getPayments());
    document.title = 'PayTracker - Company Payment Management';
  }, []);

  const refreshData = () => {
    setPayments(storageUtils.getPayments());
  };

  const existingCompanies = Array.from(new Set(payments.map(p => p.company))).sort();

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setActiveTab('payments');
  };

  const handleBackToDashboard = () => {
    setSelectedCompany(undefined);
    setActiveTab('dashboard');
  };

  const handleAddPayment = (company?: string) => {
    setSelectedCompany(company);
    setShowPaymentForm(true);
  };

  const handlePaymentAdded = () => {
    refreshData();
    setShowPaymentForm(false);
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payments' as const, label: 'All Payments', icon: CreditCard }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard payments={payments} onCompanySelect={handleCompanySelect} />;
      case 'payments':
        return (
          <PaymentsTable 
            payments={payments} 
            onPaymentsChange={refreshData}
            selectedCompany={selectedCompany}
            onBackToDashboard={handleBackToDashboard}
            onAddPayment={handleAddPayment}
          />
        );
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
              <div className="p-2 bg-emerald-600 rounded-lg">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PayTracker</h1>
                <p className="text-xs text-gray-600">Company Payment Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'dashboard') {
                        setSelectedCompany(undefined);
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Add Payment Button */}
            <div className="hidden md:block">
              <button
                onClick={() => handleAddPayment()}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                Add Payment
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
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id === 'dashboard') {
                          setSelectedCompany(undefined);
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    handleAddPayment();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <CreditCard className="w-5 h-5" />
                  Add Payment
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          onPaymentAdded={handlePaymentAdded}
          existingCompanies={existingCompanies}
          selectedCompany={selectedCompany}
        />
      )}
    </div>
  );
}

export default App;