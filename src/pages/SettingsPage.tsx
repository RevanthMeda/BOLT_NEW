import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings,
  Save,
  Upload,
  Building,
  FolderOpen,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('company');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update setting');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'storage', label: 'Storage Locations', icon: FolderOpen },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          System Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2 inline" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'company' && (
            <CompanyInfoSettings 
              settings={settings}
              onUpdate={(key, value) => updateSettingMutation.mutate({ key, value })}
              isUpdating={updateSettingMutation.isPending}
            />
          )}
          
          {activeTab === 'storage' && (
            <StorageLocationSettings
              settings={settings}
              onUpdate={(key, value) => updateSettingMutation.mutate({ key, value })}
              isUpdating={updateSettingMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface SettingsProps {
  settings: any;
  onUpdate: (key: string, value: any) => void;
  isUpdating: boolean;
}

const CompanyInfoSettings: React.FC<SettingsProps> = ({ settings, onUpdate, isUpdating }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: settings?.company_info?.name || 'Cully Engineering',
      logo: settings?.company_info?.logo || '/logo/company-logo.png',
      primaryColor: settings?.company_info?.primaryColor || '#3B82F6',
    },
  });

  const onSubmit = (data: any) => {
    onUpdate('company_info', data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Company Information</h3>
        <p className="text-sm text-gray-600">
          Configure your company details that will appear in reports and the application header.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            {...register('name', { required: 'Company name is required' })}
            type="text"
            className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo URL
          </label>
          <input
            {...register('logo')}
            type="url"
            className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/logo.png"
          />
          <p className="mt-1 text-sm text-gray-500">
            URL to your company logo image. This will appear in the app header and exported documents.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Brand Color
          </label>
          <input
            {...register('primaryColor')}
            type="color"
            className="block w-24 h-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Primary color used throughout the application interface.
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isUpdating ? (
              <LoadingSpinner size="small" className="mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Company Info
          </button>
        </div>
      </form>
    </div>
  );
};

const StorageLocationSettings: React.FC<SettingsProps> = ({ settings, onUpdate, isUpdating }) => {
  const { control, handleSubmit, register } = useForm({
    defaultValues: {
      locations: settings?.final_storage_locations || [
        '/storage/completed/project-a',
        '/storage/completed/project-b',
        '/storage/archive/2025',
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'locations',
  });

  const onSubmit = (data: any) => {
    onUpdate('final_storage_locations', data.locations);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Final Storage Locations</h3>
        <p className="text-sm text-gray-600">
          Configure the available storage locations where completed reports and their attachments will be archived.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">Storage Paths</h4>
            <button
              type="button"
              onClick={() => append('')}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Location
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  {...register(`locations.${index}` as const, { 
                    required: 'Storage path is required' 
                  })}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/storage/completed/project-name"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove location"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Notes
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>These paths will be available for selection during report final approval</li>
                  <li>Ensure these directories exist and have proper write permissions</li>
                  <li>Use absolute paths for better reliability</li>
                  <li>Consider using date-based or project-based organization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isUpdating ? (
              <LoadingSpinner size="small" className="mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Storage Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;