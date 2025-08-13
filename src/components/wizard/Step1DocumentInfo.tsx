import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { FileText, User, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const documentInfoSchema = z.object({
  title: z.string().min(1, 'Report title is required'),
  projectRef: z.string().min(1, 'Project reference is required'),
  documentRef: z.string().min(1, 'Document reference is required'),
  revision: z.string().min(1, 'Revision is required'),
  date: z.string().min(1, 'Date is required'),
  preparedBy: z.string().min(1, 'Prepared by is required'),
  tmId: z.string().optional(),
  pmId: z.string().optional(),
});

type DocumentInfoForm = z.infer<typeof documentInfoSchema>;

interface Step1DocumentInfoProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step1DocumentInfo: React.FC<Step1DocumentInfoProps> = ({
  data,
  onChange,
  onSave,
}) => {
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DocumentInfoForm>({
    resolver: zodResolver(documentInfoSchema),
    defaultValues: {
      title: data.title || '',
      projectRef: data.projectRef || '',
      documentRef: data.documentRef || '',
      revision: data.revision || '1.0',
      date: data.date || new Date().toISOString().split('T')[0],
      preparedBy: data.preparedBy || user?.fullName || '',
      tmId: data.tmId || '',
      pmId: data.pmId || '',
    },
  });

  // Fetch Technical Managers
  const { data: technicalManagers } = useQuery({
    queryKey: ['users', 'TECHNICAL_MANAGER'],
    queryFn: async () => {
      const response = await fetch('/api/users/by-role/TECHNICAL_MANAGER', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch technical managers');
      return response.json();
    },
  });

  // Fetch Project Managers
  const { data: projectManagers } = useQuery({
    queryKey: ['users', 'PROJECT_MANAGER'],
    queryFn: async () => {
      const response = await fetch('/api/users/by-role/PROJECT_MANAGER', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch project managers');
      return response.json();
    },
  });

  const formData = watch();

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Auto-set prepared by when user is available
  useEffect(() => {
    if (user?.fullName && !data.preparedBy) {
      setValue('preparedBy', user.fullName);
    }
  }, [user, data.preparedBy, setValue]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Document Information
        </h3>
        <p className="text-sm text-gray-600">
          Provide the basic information for your SAT report. This information will appear
          in the document header and throughout the report.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Report Title *
          </label>
          <input
            {...register('title')}
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Site Acceptance Test - Control System Validation"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="projectRef" className="block text-sm font-medium text-gray-700 mb-2">
            Project Reference *
          </label>
          <input
            {...register('projectRef')}
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., PRJ-2025-001"
          />
          {errors.projectRef && (
            <p className="mt-1 text-sm text-red-600">{errors.projectRef.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="documentRef" className="block text-sm font-medium text-gray-700 mb-2">
            Document Reference *
          </label>
          <input
            {...register('documentRef')}
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., SAT-001"
          />
          {errors.documentRef && (
            <p className="mt-1 text-sm text-red-600">{errors.documentRef.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="revision" className="block text-sm font-medium text-gray-700 mb-2">
            Revision *
          </label>
          <input
            {...register('revision')}
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 1.0, 1.1, 2.0"
          />
          {errors.revision && (
            <p className="mt-1 text-sm text-red-600">{errors.revision.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Date *
          </label>
          <input
            {...register('date')}
            type="date"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="preparedBy" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <User className="w-4 h-4 mr-1" />
            Prepared By *
          </label>
          <input
            {...register('preparedBy')}
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
          {errors.preparedBy && (
            <p className="mt-1 text-sm text-red-600">{errors.preparedBy.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This is automatically set to your name
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          Approval Assignments
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Assign the Technical Manager and Project Manager who will review and approve this report.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tmId" className="block text-sm font-medium text-gray-700 mb-2">
              Technical Manager
            </label>
            <select
              {...register('tmId')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Technical Manager</option>
              {technicalManagers?.map((tm: any) => (
                <option key={tm.id} value={tm.id}>
                  {tm.fullName} ({tm.email})
                </option>
              ))}
            </select>
            {errors.tmId && (
              <p className="mt-1 text-sm text-red-600">{errors.tmId.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The TM will review the technical aspects of your report
            </p>
          </div>

          <div>
            <label htmlFor="pmId" className="block text-sm font-medium text-gray-700 mb-2">
              Project Manager
            </label>
            <select
              {...register('pmId')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Project Manager</option>
              {projectManagers?.map((pm: any) => (
                <option key={pm.id} value={pm.id}>
                  {pm.fullName} ({pm.email})
                </option>
              ))}
            </select>
            {errors.pmId && (
              <p className="mt-1 text-sm text-red-600">{errors.pmId.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The PM will provide final approval for the report
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The Document Reference + Revision combination must be unique</li>
          <li>• Both Technical Manager and Project Manager assignments are recommended for the approval workflow</li>
          <li>• You can modify these assignments later if needed (while the report is in draft)</li>
        </ul>
      </div>
    </div>
  );
};

export default Step1DocumentInfo;