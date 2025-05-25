import React, { useState } from 'react';
import { Bell, Store, CreditCard, Shield, Users, FileText, Mail } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Settings: React.FC = () => {
  const { updateSettings, settings } = useApp();
  const [formData, setFormData] = useState({
    businessInfo: {
      telecom: {
        name: settings?.businessInfo?.telecom?.name || 'Eliyas Telecom USA',
        logo: settings?.businessInfo?.telecom?.logo || '',
        address: settings?.businessInfo?.telecom?.address || '',
        phone: settings?.businessInfo?.telecom?.phone || '',
        email: settings?.businessInfo?.telecom?.email || ''
      },
      travel: {
        name: settings?.businessInfo?.travel?.name || 'USA Tours & Travels',
        logo: settings?.businessInfo?.travel?.logo || '',
        address: settings?.businessInfo?.travel?.address || '',
        phone: settings?.businessInfo?.travel?.phone || '',
        email: settings?.businessInfo?.travel?.email || ''
      }
    },
    invoiceTemplate: {
      colors: {
        primary: settings?.invoiceTemplate?.colors?.primary || '#3b82f6',
        secondary: settings?.invoiceTemplate?.colors?.secondary || '#1d4ed8'
      },
      font: settings?.invoiceTemplate?.font || 'Inter',
      showQrCode: settings?.invoiceTemplate?.showQrCode ?? true,
      showSignature: settings?.invoiceTemplate?.showSignature ?? true,
      showWatermark: settings?.invoiceTemplate?.showWatermark ?? true,
      footer: settings?.invoiceTemplate?.footer || 'Thank you for your business!'
    },
    email: {
      senderName: settings?.email?.senderName || 'Eliyas Telecom',
      senderEmail: settings?.email?.senderEmail || 'invoices@eliyastelecom.com',
      subject: settings?.email?.subject || 'Invoice from Eliyas Telecom',
      template: settings?.email?.template || `
Dear {customerName},

Please find your invoice ({invoiceNumber}) attached.

Amount Due: {amount}
Due Date: {dueDate}

You can view and pay your invoice online at:
{paymentLink}

Thank you for your business!

Best regards,
Eliyas Telecom Team
      `.trim()
    }
  });

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
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
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="mt-1 flex items-center space-x-4">
                  {formData.businessInfo.travel.logo && (
                    <img
                      src={formData.businessInfo.travel.logo}
                      alt="Travel Logo"
                      className="h-12 w-12 object-contain"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload('travel', file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
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
                  rows={3}
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

      {/* Invoice Template Settings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText size={20} className="text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Invoice Template</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Font Family</label>
              <select
                value={formData.invoiceTemplate.font}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  invoiceTemplate: {
                    ...prev.invoiceTemplate,
                    font: e.target.value
                  }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
              </select>
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
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Mail size={20} className="text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Email Settings</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sender Name</label>
              <input
                type="text"
                value={formData.email.senderName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: {
                    ...prev.email,
                    senderName: e.target.value
                  }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sender Email</label>
              <input
                type="email"
                value={formData.email.senderEmail}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: {
                    ...prev.email,
                    senderEmail: e.target.value
                  }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Subject</label>
              <input
                type="text"
                value={formData.email.subject}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: {
                    ...prev.email,
                    subject: e.target.value
                  }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Template</label>
            <p className="mt-1 text-sm text-gray-500">
              Available variables: {'{customerName}'}, {'{invoiceNumber}'}, {'{amount}'}, {'{dueDate}'}, {'{paymentLink}'}
            </p>
            <textarea
              value={formData.email.template}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: {
                  ...prev.email,
                  template: e.target.value
                }
              }))}
              rows={10}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
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

export default Settings;