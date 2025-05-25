import React, { useState } from 'react';
import InvoiceList from '../components/invoices/InvoiceList';
import InvoiceSettings from '../components/invoices/InvoiceSettings';
import SmtpSettings from '../components/invoices/SmtpSettings';
import EmailHistory from '../components/invoices/EmailHistory';
import { FileText, Settings, Mail, History } from 'lucide-react';

const Invoices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings' | 'smtp' | 'history'>('list');

  const tabs = [
    { id: 'list', name: 'Invoices', icon: FileText },
    { id: 'settings', name: 'Template Settings', icon: Settings },
    { id: 'smtp', name: 'SMTP Settings', icon: Mail },
    { id: 'history', name: 'Email History', icon: History }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-gray-50
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 border-b-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-center justify-center">
                  <tab.icon size={18} className="mr-2" />
                  {tab.name}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'list' && <InvoiceList />}
      {activeTab === 'settings' && <InvoiceSettings />}
      {activeTab === 'smtp' && <SmtpSettings />}
      {activeTab === 'history' && <EmailHistory />}
    </div>
  );
};

export default Invoices;