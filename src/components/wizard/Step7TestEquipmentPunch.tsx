import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Wrench, AlertTriangle, Calendar } from 'lucide-react';

const testEquipmentPunchSchema = z.object({
  testEquipment: z.array(z.object({
    item: z.string().min(1, 'Item is required'),
    model: z.string().min(1, 'Model is required'),
    serialNo: z.string().min(1, 'Serial number is required'),
    calibrationDue: z.string().min(1, 'Calibration due date is required'),
  })),
  punchList: z.array(z.object({
    itemNo: z.string().min(1, 'Item number is required'),
    description: z.string().min(1, 'Description is required'),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    assignedTo: z.string().min(1, 'Assigned to is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    status: z.enum(['OPEN', 'CLOSED']).default('OPEN'),
  })),
});

type TestEquipmentPunchForm = z.infer<typeof testEquipmentPunchSchema>;

interface Step7TestEquipmentPunchProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step7TestEquipmentPunch: React.FC<Step7TestEquipmentPunchProps> = ({
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
  } = useForm<TestEquipmentPunchForm>({
    resolver: zodResolver(testEquipmentPunchSchema),
    defaultValues: {
      testEquipment: data.testEquipment || [
        { item: '', model: '', serialNo: '', calibrationDue: '' }
      ],
      punchList: data.punchList || [
        { itemNo: '', description: '', severity: 'MEDIUM', assignedTo: '', dueDate: '', status: 'OPEN' }
      ],
    },
  });

  const {
    fields: equipmentFields,
    append: addEquipment,
    remove: removeEquipment,
  } = useFieldArray({
    control,
    name: 'testEquipment',
  });

  const {
    fields: punchFields,
    append: addPunchItem,
    remove: removePunchItem,
  } = useFieldArray({
    control,
    name: 'punchList',
  });

  const formData = watch();

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const addSampleEquipment = () => {
    const samples = [
      {
        item: 'Digital Multimeter',
        model: 'Fluke 87V',
        serialNo: 'FL87V-001',
        calibrationDue: '2025-12-31',
      },
      {
        item: 'Process Calibrator',
        model: 'Fluke 754',
        serialNo: 'FL754-002',
        calibrationDue: '2025-06-30',
      },
      {
        item: 'Oscilloscope',
        model: 'Tektronix TBS1052B',
        serialNo: 'TEK-003',
        calibrationDue: '2025-09-15',
      },
      {
        item: 'Pressure Calibrator',
        model: 'Druck DPI 611',
        serialNo: 'DRK-004',
        calibrationDue: '2025-03-20',
      },
    ];
    setValue('testEquipment', samples);
  };

  const addSamplePunchItems = () => {
    const samples = [
      {
        itemNo: 'P001',
        description: 'Temperature sensor reading 2°C higher than reference',
        severity: 'MEDIUM' as const,
        assignedTo: 'Instrumentation Team',
        dueDate: '2025-02-15',
        status: 'OPEN' as const,
      },
      {
        itemNo: 'P002',
        description: 'HMI alarm acknowledgment button not responding',
        severity: 'HIGH' as const,
        assignedTo: 'Controls Team',
        dueDate: '2025-02-10',
        status: 'OPEN' as const,
      },
      {
        itemNo: 'P003',
        description: 'Network cable labeling incomplete in panel 3',
        severity: 'LOW' as const,
        assignedTo: 'Electrical Team',
        dueDate: '2025-02-20',
        status: 'OPEN' as const,
      },
    ];
    setValue('punchList', samples);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate default due date (2 weeks from now)
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Test Equipment & Punch List
        </h3>
        <p className="text-sm text-gray-600">
          Document all test equipment used during the SAT and maintain a punch list
          of issues that need to be resolved before final acceptance.
        </p>
      </div>

      {/* Test Equipment Section */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-blue-900 flex items-center">
            <Wrench className="w-4 h-4 mr-2" />
            Test Equipment
          </h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addSampleEquipment}
              className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Add Samples
            </button>
            <button
              type="button"
              onClick={() => addEquipment({ item: '', model: '', serialNo: '', calibrationDue: '' })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Equipment
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {equipmentFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item *
                </label>
                <input
                  {...register(`testEquipment.${index}.item`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digital Multimeter"
                />
                {errors.testEquipment?.[index]?.item && (
                  <p className="mt-1 text-xs text-red-600">{errors.testEquipment[index]?.item?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  {...register(`testEquipment.${index}.model`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Fluke 87V"
                />
                {errors.testEquipment?.[index]?.model && (
                  <p className="mt-1 text-xs text-red-600">{errors.testEquipment[index]?.model?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial No. *
                </label>
                <input
                  {...register(`testEquipment.${index}.serialNo`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="FL87V-001"
                />
                {errors.testEquipment?.[index]?.serialNo && (
                  <p className="mt-1 text-xs text-red-600">{errors.testEquipment[index]?.serialNo?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Calibration Due *
                </label>
                <input
                  {...register(`testEquipment.${index}.calibrationDue`)}
                  type="date"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.testEquipment?.[index]?.calibrationDue && (
                  <p className="mt-1 text-xs text-red-600">{errors.testEquipment[index]?.calibrationDue?.message}</p>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeEquipment(index)}
                  disabled={equipmentFields.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove equipment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All test equipment must have valid calibration certificates.
            Ensure calibration dates are current and equipment is within specification.
          </p>
        </div>
      </div>

      {/* Punch List Section */}
      <div className="bg-red-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-red-900 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Punch List
          </h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addSamplePunchItems}
              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              Add Samples
            </button>
            <button
              type="button"
              onClick={() => addPunchItem({ 
                itemNo: `P${String(punchFields.length + 1).padStart(3, '0')}`, 
                description: '', 
                severity: 'MEDIUM', 
                assignedTo: '', 
                dueDate: getDefaultDueDate(), 
                status: 'OPEN' 
              })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Punch Item
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {punchFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-white rounded-lg border border-red-200">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item No. *
                  </label>
                  <input
                    {...register(`punchList.${index}.itemNo`)}
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="P001"
                  />
                  {errors.punchList?.[index]?.itemNo && (
                    <p className="mt-1 text-xs text-red-600">{errors.punchList[index]?.itemNo?.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register(`punchList.${index}.description`)}
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the issue or deficiency..."
                  />
                  {errors.punchList?.[index]?.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.punchList[index]?.description?.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity *
                  </label>
                  <select
                    {...register(`punchList.${index}.severity`)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To *
                  </label>
                  <input
                    {...register(`punchList.${index}.assignedTo`)}
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Team/Person"
                  />
                  {errors.punchList?.[index]?.assignedTo && (
                    <p className="mt-1 text-xs text-red-600">{errors.punchList[index]?.assignedTo?.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    {...register(`punchList.${index}.dueDate`)}
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.punchList?.[index]?.dueDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.punchList[index]?.dueDate?.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      {...register(`punchList.${index}.status`)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(watch(`punchList.${index}.severity`))}`}>
                      {watch(`punchList.${index}.severity`)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(watch(`punchList.${index}.status`))}`}>
                      {watch(`punchList.${index}.status`)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removePunchItem(index)}
                  disabled={punchFields.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove punch item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-lg p-4 border border-red-200">
          <h5 className="text-sm font-medium text-red-900 mb-2">Punch List Guidelines:</h5>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• <strong>Critical:</strong> Safety-related issues that must be resolved immediately</li>
            <li>• <strong>High:</strong> Issues that prevent system operation or acceptance</li>
            <li>• <strong>Medium:</strong> Issues that affect performance but don't prevent operation</li>
            <li>• <strong>Low:</strong> Minor issues or improvements that can be addressed later</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• All punch list items must be resolved before final system acceptance</li>
          <li>• Critical and High severity items typically require immediate attention</li>
          <li>• Assign realistic due dates and responsible parties for each item</li>
          <li>• Track punch item resolution and update status accordingly</li>
          <li>• Maintain calibration records for all test equipment used</li>
        </ul>
      </div>
    </div>
  );
};

export default Step7TestEquipmentPunch;