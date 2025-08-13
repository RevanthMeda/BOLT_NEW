import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Monitor, Upload, Image, X } from 'lucide-react';

const processScadaSchema = z.object({
  scadaVerification: z.array(z.object({
    item: z.string().min(1, 'Item is required'),
    description: z.string().min(1, 'Description is required'),
    result: z.enum(['PASS', 'FAIL', 'NA']).optional(),
    remarks: z.string().optional(),
  })),
  trendsTests: z.array(z.object({
    parameter: z.string().min(1, 'Parameter is required'),
    expectedTrend: z.string().min(1, 'Expected trend is required'),
    actualResult: z.string().optional(),
    result: z.enum(['PASS', 'FAIL', 'NA']).optional(),
    remarks: z.string().optional(),
  })),
  alarmScreenshots: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    originalName: z.string(),
    description: z.string().optional(),
  })),
});

type ProcessScadaForm = z.infer<typeof processScadaSchema>;

interface Step6ProcessScadaAlarmsProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step6ProcessScadaAlarms: React.FC<Step6ProcessScadaAlarmsProps> = ({
  data,
  onChange,
  onSave,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProcessScadaForm>({
    resolver: zodResolver(processScadaSchema),
    defaultValues: {
      scadaVerification: data.scadaVerification || [
        { item: '', description: '', result: undefined, remarks: '' }
      ],
      trendsTests: data.trendsTests || [
        { parameter: '', expectedTrend: '', actualResult: '', result: undefined, remarks: '' }
      ],
      alarmScreenshots: data.alarmScreenshots || [],
    },
  });

  const {
    fields: scadaFields,
    append: addScada,
    remove: removeScada,
  } = useFieldArray({
    control,
    name: 'scadaVerification',
  });

  const {
    fields: trendsFields,
    append: addTrend,
    remove: removeTrend,
  } = useFieldArray({
    control,
    name: 'trendsTests',
  });

  const {
    fields: screenshotFields,
    append: addScreenshot,
    remove: removeScreenshot,
  } = useFieldArray({
    control,
    name: 'alarmScreenshots',
  });

  const formData = watch();

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Add uploaded files to the form
      result.files.forEach((file: any) => {
        addScreenshot({
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          description: '',
        });
      });

    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setUploadingFiles(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const removeUploadedFile = async (fileId: string, index: number) => {
    try {
      await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      removeScreenshot(index);
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Still remove from form even if server deletion fails
      removeScreenshot(index);
    }
  };

  const addSampleScadaItems = () => {
    const samples = [
      {
        item: 'HMI Navigation',
        description: 'Verify all HMI screens are accessible and navigation works correctly',
        result: undefined,
        remarks: '',
      },
      {
        item: 'Real-time Data Display',
        description: 'Confirm all process values are displayed correctly and update in real-time',
        result: undefined,
        remarks: '',
      },
      {
        item: 'Alarm Display',
        description: 'Verify alarms are displayed with correct priority and acknowledgment functions',
        result: undefined,
        remarks: '',
      },
      {
        item: 'Historical Data',
        description: 'Check historical data logging and retrieval functionality',
        result: undefined,
        remarks: '',
      },
    ];
    setValue('scadaVerification', samples);
  };

  const addSampleTrends = () => {
    const samples = [
      {
        parameter: 'Temperature Sensor 1',
        expectedTrend: 'Smooth curve following setpoint changes',
        actualResult: '',
        result: undefined,
        remarks: '',
      },
      {
        parameter: 'Pressure Transmitter 1',
        expectedTrend: 'Stable reading with minimal noise',
        actualResult: '',
        result: undefined,
        remarks: '',
      },
      {
        parameter: 'Flow Rate Measurement',
        expectedTrend: 'Linear response to valve position changes',
        actualResult: '',
        result: undefined,
        remarks: '',
      },
    ];
    setValue('trendsTests', samples);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          Process, SCADA & Alarms
        </h3>
        <p className="text-sm text-gray-600">
          Verify SCADA system functionality, process trends, and alarm systems.
          Upload screenshots to document alarm testing and system behavior.
        </p>
      </div>

      {/* SCADA Verification */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-blue-900">SCADA Verification</h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addSampleScadaItems}
              className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Add Samples
            </button>
            <button
              type="button"
              onClick={() => addScada({ item: '', description: '', result: undefined, remarks: '' })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {scadaFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item *
                </label>
                <input
                  {...register(`scadaVerification.${index}.item`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="HMI Navigation"
                />
                {errors.scadaVerification?.[index]?.item && (
                  <p className="mt-1 text-xs text-red-600">{errors.scadaVerification[index]?.item?.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register(`scadaVerification.${index}.description`)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Verify all HMI screens are accessible..."
                />
                {errors.scadaVerification?.[index]?.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.scadaVerification[index]?.description?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Result
                </label>
                <select
                  {...register(`scadaVerification.${index}.result`)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-</option>
                  <option value="PASS">Pass</option>
                  <option value="FAIL">Fail</option>
                  <option value="NA">N/A</option>
                </select>
              </div>

              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    {...register(`scadaVerification.${index}.remarks`)}
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeScada(index)}
                  disabled={scadaFields.length === 1}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends Testing */}
      <div className="bg-green-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-green-900">Trends Testing</h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addSampleTrends}
              className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              Add Samples
            </button>
            <button
              type="button"
              onClick={() => addTrend({ parameter: '', expectedTrend: '', actualResult: '', result: undefined, remarks: '' })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Parameter
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {trendsFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parameter *
                </label>
                <input
                  {...register(`trendsTests.${index}.parameter`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Temperature Sensor 1"
                />
                {errors.trendsTests?.[index]?.parameter && (
                  <p className="mt-1 text-xs text-red-600">{errors.trendsTests[index]?.parameter?.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Trend *
                </label>
                <textarea
                  {...register(`trendsTests.${index}.expectedTrend`)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Smooth curve following setpoint changes"
                />
                {errors.trendsTests?.[index]?.expectedTrend && (
                  <p className="mt-1 text-xs text-red-600">{errors.trendsTests[index]?.expectedTrend?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Result
                </label>
                <textarea
                  {...register(`trendsTests.${index}.actualResult`)}
                  rows={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Observed behavior"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Result
                </label>
                <select
                  {...register(`trendsTests.${index}.result`)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-</option>
                  <option value="PASS">Pass</option>
                  <option value="FAIL">Fail</option>
                  <option value="NA">N/A</option>
                </select>
              </div>

              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    {...register(`trendsTests.${index}.remarks`)}
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notes..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTrend(index)}
                  disabled={trendsFields.length === 1}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove parameter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alarm Screenshots */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-purple-900 flex items-center">
            <Image className="w-4 h-4 mr-2" />
            Alarm Screenshots
          </h4>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="screenshot-upload"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="screenshot-upload"
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-1" />
              {uploadingFiles ? 'Uploading...' : 'Upload Files'}
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-sm text-purple-800">
            Upload screenshots of alarm testing, including SMS alarm tests, HMI alarm displays,
            and system responses. Supported formats: JPG, PNG, PDF (max 10MB per file).
          </p>
        </div>

        {screenshotFields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenshotFields.map((field, index) => (
              <div key={field.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Image className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {field.originalName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUploadedFile(field.id, index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    {...register(`alarmScreenshots.${index}.description`)}
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe this screenshot..."
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-purple-300 rounded-lg bg-white">
            <Image className="mx-auto h-8 w-8 text-purple-400" />
            <h3 className="mt-2 text-sm font-medium text-purple-900">No screenshots uploaded</h3>
            <p className="mt-1 text-sm text-purple-700">
              Upload screenshots to document alarm testing and system behavior.
            </p>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Testing Requirements:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• At least one screenshot is required for SMS alarm testing</li>
          <li>• Document all alarm priorities and acknowledgment procedures</li>
          <li>• Verify alarm history and logging functionality</li>
          <li>• Test alarm suppression and bypass features if applicable</li>
          <li>• Ensure all critical alarms are properly configured and tested</li>
        </ul>
      </div>
    </div>
  );
};

export default Step6ProcessScadaAlarms;