import React, { useState } from 'react';
import { Bell, Store, CreditCard, Shield, Users, FileText, Mail, LayoutDashboard, BarChart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Settings: React.FC = () => {
  const { updateSettings, settings } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    dashboard: {
      refreshInterval: settings?.dashboard?.refreshInterval || 5,
      defaultDateRange: settings?.dashboard?.defaultDateRange || '30d',
      showRevenueChart: settings?.dashboard?.showRevenueChart ?? true,
      showProfitChart: settings?.dashboard?.showProfitChart ?? true,
      showCustomerStats: settings?.dashboard?.showCustomerStats ?? true,
      showExpiringPlans: settings?.dashboard?.showExpiringPlans ?? true,
      showRecentSales: settings?.dashboard?.showRecentSales ?? true,
      alertThresholds: {
        lowStock: settings?.dashboard?.alertThresholds?.lowStock || 10,
        expiringPlans: settings?.dashboard?.alertThresholds?.expiringPlans || 7,
        paymentOverdue: settings?.dashboard?.alertThresholds?.paymentOverdue || 3
      },
      chartColors: {
        revenue: settings?.dashboard?.chartColors?.revenue || '#3b82f6',
        profit: settings?.dashboard?.chartColors?.profit || '#22c55e',
        expenses: settings?.dashboard?.chartColors?.expenses || '#ef4444'
      }
    },
    businessInfo: settings?.businessInfo || {
      telecom: {
        name: 'Eliyas Telecom USA',
        logo: '',
        address: '',
        phone: '',
        email: ''
      },
      travel: {
        name: 'USA Tours & Travels',
        logo: '',
        address: '',
        phone: '',
        email: ''
      }
    }
  });

  const handleSave = async () => {
    try {
      await updateSettings({
        ...settings,
        ...formData
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 border-b-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-center">
                <LayoutDashboard size={18} className="mr-2" />
                Dashboard Settings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 ${
                activeTab === 'business'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 border-b-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-center">
                <Store size={18} className="mr-2" />
                Business Information
              </div>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Dashboard Display Settings */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <LayoutDashboard size={20} className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Dashboard Display</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Auto Refresh Interval (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.dashboard.refreshInterval}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        refreshInterval: parseInt(e.target.value)
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Date Range</label>
                  <select
                    value={formData.dashboard.defaultDateRange}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        defaultDateRange: e.target.value
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dashboard.showRevenueChart}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        showRevenueChart: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Show Revenue Chart
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dashboard.showProfitChart}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        showProfitChart: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Show Profit Chart
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dashboard.showCustomerStats}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        showCustomerStats: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Show Customer Statistics
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dashboard.showExpiringPlans}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        showExpiringPlans: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Show Expiring Plans
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dashboard.showRecentSales}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        showRecentSales: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Show Recent Sales
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Bell size={20} className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Alert Thresholds</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Low Stock Alert (items)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dashboard.alertThresholds.lowStock}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        alertThresholds: {
                          ...prev.dashboard.alertThresholds,
                          lowStock: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiring Plans Alert (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.dashboard.alertThresholds.expiringPlans}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        alertThresholds: {
                          ...prev.dashboard.alertThresholds,
                          expiringPlans: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Overdue Alert (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.dashboard.alertThresholds.paymentOverdue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dashboard: {
                        ...prev.dashboard,
                        alertThresholds: {
                          ...prev.dashboard.alertThresholds,
                          paymentOverdue: parseInt(e.target.value)
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chart Colors */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <BarChart size={20} className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Chart Colors</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Revenue Color</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.dashboard.chartColors.revenue}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          chartColors: {
                            ...prev.dashboard.chartColors,
                            revenue: e.target.value
                          }
                        }
                      }))}
                      className="h-8 w-8 rounded-md border border-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.dashboard.chartColors.revenue}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          chartColors: {
                            ...prev.dashboard.chartColors,
                            revenue: e.target.value
                          }
                        }
                      }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Profit Color</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.dashboard.chartColors.profit}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          chartColors: {
                            ...prev.dashboard.chartColors,
                            profit: e.target.value
                          }
                        }
                      }))}
                      className="h-8 w-8 rounded-md border border-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.dashboard.chartColors.profit}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          chartColors: {
                            ...prev.dashboard.chartColors,
                            profit: e.target.value
                          }
                        }
                      }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expenses Color</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.dashboard.chartColors.expenses}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          chartColors: {
                            ...prev.dashboard.chartColors,
                            expenses: e.target.value
                          }
                        }
                      }))}
                      className="h-8 w-8 rounded-md border border-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.dashboard.chartColors.expenses}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          chartColors: {
                            ...prev.dashboard.chartColors,
                            expenses: e.target.value
                          }
                        }
                      }))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'business' && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Store size={20} className="text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Business Information</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Telecom Business */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Eliyas Telecom USA</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessInfo.telecom.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        telecom: {
                          ...prev.businessInfo.telecom,
                          name: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={formData.businessInfo.telecom.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        telecom: {
                          ...prev.businessInfo.telecom,
                          address: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.businessInfo.telecom.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        telecom: {
                          ...prev.businessInfo.telecom,
                          phone: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.businessInfo.telecom.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        telecom: {
                          ...prev.businessInfo.telecom,
                          email: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Travel Business */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">USA Tours & Travels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessInfo.travel.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        travel: {
                          ...prev.businessInfo.travel,
                          name: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={formData.businessInfo.travel.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        travel: {
                          ...prev.businessInfo.travel,
                          address: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.businessInfo.travel.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        travel: {
                          ...prev.businessInfo.travel,
                          phone: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.businessInfo.travel.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        travel: {
                          ...prev.businessInfo.travel,
                          email: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;