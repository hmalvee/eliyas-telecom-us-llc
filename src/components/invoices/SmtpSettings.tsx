import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const SmtpSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [formData, setFormData] = useState({
    smtp: {
      host: settings.smtp?.host || '',
      port: settings.smtp?.port || '',
      username: settings.smtp?.username || '',
      password: settings.smtp?.password || '',
      secure: settings.smtp?.secure ?? true
    },
    email: settings.email
  });
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    try {
      await updateSettings({
        ...settings,
        smtp: formData.smtp,
        email: formData.email
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-smtp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData.smtp),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
        console.error('SMTP Error:', data.error);
      }
    } catch (error) {
      console.error('SMTP test failed:', error);
      toast.error('Failed to test SMTP connection');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">SMTP Configuration</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
              <input
                type="text"
                value={formData.smtp.host}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  smtp: { ...prev.smtp, host: e.target.value }
                }))}
                placeholder="smtp.example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input
                type="text"
                value={formData.smtp.port}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  smtp: { ...prev.smtp, port: e.target.value }
                }))}
                placeholder="587"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={formData.smtp.username}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  smtp: { ...prev.smtp, username: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={formData.smtp.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  smtp: { ...prev.smtp, password: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.smtp.secure}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    smtp: { ...prev.smtp, secure: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Use SSL/TLS
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isTesting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Email Template</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Default Subject</label>
              <input
                type="text"
                value={formData.email.subject}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: { ...prev.email, subject: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email Template</label>
              <p className="mt-1 text-sm text-gray-500">
                Available variables: {'{customerName}'}, {'{invoiceNumber}'}, {'{amount}'}, {'{dueDate}'}, {'{paymentLink}'}
              </p>
              <textarea
                value={formData.email.template}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: { ...prev.email, template: e.target.value }
                }))}
                rows={10}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmtpSettings;