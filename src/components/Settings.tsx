import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, User } from 'lucide-react';
import { UserSettings } from '../types';
import { supabaseUtils } from '../utils/supabase';

interface SettingsProps {
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export default function Settings({ onClose, onSettingsUpdated }: SettingsProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({ user1Name: 'User 1', user2Name: 'User 2' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await supabaseUtils.getSettings();
        setSettings(userSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!settings.user1Name.trim()) {
      newErrors.user1Name = 'User 1 name is required';
    }
    
    if (!settings.user2Name.trim()) {
      newErrors.user2Name = 'User 2 name is required';
    }

    if (settings.user1Name.trim() === settings.user2Name.trim()) {
      newErrors.user2Name = 'User names must be different';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedSettings = {
        user1Name: settings.user1Name.trim(),
        user2Name: settings.user2Name.trim()
      };
      
      await supabaseUtils.saveSettings(updatedSettings);
      onSettingsUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setErrors({ general: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Set up the names of the two users who will be making transactions. This helps track who made each purchase or payment.
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                First User Name *
              </div>
            </label>
            <input
              type="text"
              name="user1Name"
              value={settings.user1Name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.user1Name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter first user name"
            />
            {errors.user1Name && <p className="text-red-500 text-xs mt-1">{errors.user1Name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Second User Name *
              </div>
            </label>
            <input
              type="text"
              name="user2Name"
              value={settings.user2Name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.user2Name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter second user name"
            />
            {errors.user2Name && <p className="text-red-500 text-xs mt-1">{errors.user2Name}</p>}
          </div>

          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> These names will appear in transaction forms to help you track who made each purchase or payment.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}