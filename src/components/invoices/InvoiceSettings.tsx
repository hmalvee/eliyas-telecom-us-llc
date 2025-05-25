import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'react-toastify';

const InvoiceSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [formData, setFormData] = useState({
    businessInfo: settings.businessInfo,
    invoiceTemplate: settings.invoiceTemplate
  });

  const handleSave = async () => {
    try {
      await updateSettings({
        ...settings,
        businessInfo: formData.businessInfo,
        invoiceTemplate: formData.invoiceTemplate
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleLogoUpload = (business: 'telecom' | 'travel', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          [business]: {
            ...prev.businessInfo[business],
            logo: reader.result as string
          }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Business Information</h2>
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
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="mt-1 flex items-center space-x-4">
                  {formData.businessInfo.telecom.logo && (
                    <img
                      src={formData.businessInfo.telecom.logo}
                      alt="Telecom Logo"
                      className="h-12 w-12 object-contain"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload('telecom', file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
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
                  rows={3}
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
              {/* Similar fields as Telecom business */}
              {/* ... */}
            </div>
          </div>
        </div>
      </div>

      {/* Template Settings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Template Settings</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Template Style</label>
              <select
                value={formData.invoiceTemplate.template}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invoiceTemplate: {
                    ...prev.invoiceTemplate,
                    template: e.target.value as any
                  }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="standard">Standard</option>
                <option value="professional">Professional</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={formData.invoiceTemplate.currency}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invoiceTemplate: {
                    ...prev.invoiceTemplate,
                    currency: e.target.value
                  }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.invoiceTemplate.colors.primary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    invoiceTemplate: {
                      ...prev.invoiceTemplate,
                      colors: {
                        ...prev.invoiceTemplate.colors,
                        primary: e.target.value
                      }
                    }
                  }))}
                  className="h-8 w-8 rounded-md border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.invoiceTemplate.colors.primary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    invoiceTemplate: {
                      ...prev.invoiceTemplate,
                      colors: {
                        ...prev.invoiceTemplate.colors,
                        primary: e.target.value
                      }
                    }
                  }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.invoiceTemplate.colors.secondary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    invoiceTemplate: {
                      ...prev.invoiceTemplate,
                      colors: {
                        ...prev.invoiceTemplate.colors,
                        secondary: e.target.value
                      }
                    }
                  }))}
                  className="h-8 w-8 rounded-md border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.invoiceTemplate.colors.secondary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    invoiceTemplate: {
                      ...prev.invoiceTemplate,
                      colors: {
                        ...prev.invoiceTemplate.colors,
                        secondary: e.target.value
                      }
                    }
                  }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.invoiceTemplate.showQrCode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invoiceTemplate: {
                    ...prev.invoiceTemplate,
                    showQrCode: e.target.checked
                  }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Show QR Code
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.invoiceTemplate.showSignature}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invoiceTemplate: {
                    ...prev.invoiceTemplate,
                    showSignature: e.target.checked
                  }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Show Signature Line
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.invoiceTemplate.showWatermark}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invoiceTemplate: {
                    ...prev.invoiceTemplate,
                    showWatermark: e.target.checked
                  }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Show Watermark
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Footer Text</label>
            <input
              type="text"
              value={formData.invoiceTemplate.footer}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                invoiceTemplate: {
                  ...prev.invoiceTemplate,
                  footer: e.target.value
                }
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

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

export default InvoiceSettings;