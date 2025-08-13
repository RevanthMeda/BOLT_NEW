import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ClipboardList, Upload } from 'lucide-react';

const preTestSchema = z.object({
  requirements: z.array(z.object({
    item: z.string().min(1, 'Item is required'),
    test: z.string().min(1, 'Test description is required'),
    method: z.string().min(1, 'Method/Test steps are required'),
    acceptanceCriteria: z.string().min(1, 'Acceptance criteria is required'),
  })),
});

type PreTestForm = z.infer<typeof preTestSchema>;

interface Step3PreTestRequirementsProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step3PreTestRequirements: React.FC<Step3PreTestRequirementsProps> = ({
  data,
  onChange,
  onSave,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PreTestForm>({
    resolver: zodResolver(preTestSchema),
    defaultValues: {
      requirements: data.requirements || [
        {
          item: '',
          test: '',
          method: '',
          acceptanceCriteria: '',
        }
      ],
    },
  });

  const {
    fields: requirementFields,
    append: addRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: 'requirements',
  });

  const formData = watch();

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handlePasteFromExcel = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    if (rows.length > 0) {
      // Clear existing requirements
      setValue('requirements', []);
      
      // Parse and add new requirements
      const newRequirements = rows.map(row => {
        const columns = row.split('\t');
        return {
          item: columns[0] || '',
          test: columns[1] || '',
          method: columns[2] || '',
          acceptanceCriteria: columns[3] || '',
        };
      });
      
      setValue('requirements', newRequirements);
    }
  };

  const addSampleRequirements = () => {
    const samples = [
      {
        item: 'Power Supply Verification',
        test: 'Verify all power supplies are operational',
        method: '1. Check voltage levels at main distribution\n2. Verify backup power systems\n3. Test UPS functionality',
        acceptanceCriteria: 'All power supplies within ±5% of nominal voltage',
      },
      {
        item: 'Network Connectivity',
        test: 'Verify network communication',
        method: '1. Ping test to all network devices\n2. Check switch port status\n3. Verify VLAN configuration',
        acceptanceCriteria: '100% network connectivity with <10ms latency',
      },
      {
        item: 'Safety Systems Check',
        test: 'Verify all safety interlocks',
        method: '1. Test emergency stop circuits\n2. Verify safety relay operation\n3. Check alarm systems',
        acceptanceCriteria: 'All safety systems respond within 500ms',
      },
    ];
    
    setValue('requirements', samples);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ClipboardList className="w-5 h-5 mr-2" />
          Pre-Test Requirements
        </h3>
        <p className="text-sm text-gray-600">
          Define the pre-test requirements, procedures, and acceptance criteria that must
          be met before proceeding with the main testing activities.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => addRequirement({ item: '', test: '', method: '', acceptanceCriteria: '' })}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Requirement
        </button>
        
        <button
          type="button"
          onClick={addSampleRequirements}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Add Sample Data
        </button>
      </div>

      {/* Smart Paste Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <Upload className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-green-900">Smart Paste from Excel/CSV</h4>
            <p className="text-sm text-green-800 mt-1">
              Copy data from Excel with columns: Item | Test | Method/Steps | Acceptance Criteria, 
              then paste into any field below to automatically populate the table.
            </p>
          </div>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="space-y-6">
        {requirementFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-medium text-gray-900">
                Requirement #{index + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeRequirement(index)}
                disabled={requirementFields.length === 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove requirement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item *
                </label>
                <input
                  {...register(`requirements.${index}.item`)}
                  type="text"
                  onPaste={handlePasteFromExcel}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Power Supply Verification"
                />
                {errors.requirements?.[index]?.item && (
                  <p className="mt-1 text-xs text-red-600">{errors.requirements[index]?.item?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test *
                </label>
                <input
                  {...register(`requirements.${index}.test`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Verify all power supplies are operational"
                />
                {errors.requirements?.[index]?.test && (
                  <p className="mt-1 text-xs text-red-600">{errors.requirements[index]?.test?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Method/Test Steps *
                </label>
                <textarea
                  {...register(`requirements.${index}.method`)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1. Check voltage levels at main distribution&#10;2. Verify backup power systems&#10;3. Test UPS functionality"
                />
                {errors.requirements?.[index]?.method && (
                  <p className="mt-1 text-xs text-red-600">{errors.requirements[index]?.method?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acceptance Criteria *
                </label>
                <textarea
                  {...register(`requirements.${index}.acceptanceCriteria`)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="All power supplies within ±5% of nominal voltage"
                />
                {errors.requirements?.[index]?.acceptanceCriteria && (
                  <p className="mt-1 text-xs text-red-600">{errors.requirements[index]?.acceptanceCriteria?.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {requirementFields.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No requirements added</h3>
          <p className="mt-2 text-gray-500">
            Add your first pre-test requirement to get started.
          </p>
          <button
            type="button"
            onClick={() => addRequirement({ item: '', test: '', method: '', acceptanceCriteria: '' })}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Requirement
          </button>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Best Practices:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Be specific and measurable in your acceptance criteria</li>
          <li>• Include step-by-step procedures in the method field</li>
          <li>• Consider safety requirements and environmental conditions</li>
          <li>• Reference applicable standards and specifications</li>
          <li>• Ensure all prerequisites are clearly defined</li>
        </ul>
      </div>
    </div>
  );
};

export default Step3PreTestRequirements;