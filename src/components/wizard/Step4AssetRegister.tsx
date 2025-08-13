import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Package, Network, Upload } from 'lucide-react';

const assetRegisterSchema = z.object({
  keyComponents: z.array(z.object({
    serialNo: z.string().min(1, 'Serial number is required'),
    model: z.string().min(1, 'Model is required'),
    description: z.string().min(1, 'Description is required'),
    remarks: z.string().optional(),
  })),
  ipAddresses: z.array(z.object({
    deviceName: z.string().min(1, 'Device name is required'),
    ipAddress: z.string().min(1, 'IP address is required'),
    gateway: z.string().optional(),
    comments: z.string().optional(),
  })),
});

type AssetRegisterForm = z.infer<typeof assetRegisterSchema>;

interface Step4AssetRegisterProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step4AssetRegister: React.FC<Step4AssetRegisterProps> = ({
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
  } = useForm<AssetRegisterForm>({
    resolver: zodResolver(assetRegisterSchema),
    defaultValues: {
      keyComponents: data.keyComponents || [
        { serialNo: '', model: '', description: '', remarks: '' }
      ],
      ipAddresses: data.ipAddresses || [
        { deviceName: '', ipAddress: '', gateway: '', comments: '' }
      ],
    },
  });

  const {
    fields: componentFields,
    append: addComponent,
    remove: removeComponent,
  } = useFieldArray({
    control,
    name: 'keyComponents',
  });

  const {
    fields: ipFields,
    append: addIpAddress,
    remove: removeIpAddress,
  } = useFieldArray({
    control,
    name: 'ipAddresses',
  });

  const formData = watch();

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleComponentPaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    if (rows.length > 0) {
      setValue('keyComponents', []);
      const newComponents = rows.map(row => {
        const columns = row.split('\t');
        return {
          serialNo: columns[0] || '',
          model: columns[1] || '',
          description: columns[2] || '',
          remarks: columns[3] || '',
        };
      });
      setValue('keyComponents', newComponents);
    }
  };

  const handleIpPaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    if (rows.length > 0) {
      setValue('ipAddresses', []);
      const newIpAddresses = rows.map(row => {
        const columns = row.split('\t');
        return {
          deviceName: columns[0] || '',
          ipAddress: columns[1] || '',
          gateway: columns[2] || '',
          comments: columns[3] || '',
        };
      });
      setValue('ipAddresses', newIpAddresses);
    }
  };

  const addSampleComponents = () => {
    const samples = [
      {
        serialNo: 'PLC001',
        model: 'Allen-Bradley ControlLogix 5580',
        description: 'Main Process Controller',
        remarks: 'Firmware v32.011',
      },
      {
        serialNo: 'HMI001',
        model: 'Schneider Electric Magelis GTU',
        description: 'Operator Interface Terminal',
        remarks: 'Touch screen, 15 inch',
      },
      {
        serialNo: 'SW001',
        model: 'Cisco Catalyst 2960',
        description: 'Ethernet Switch 24-port',
        remarks: 'Managed switch with VLAN support',
      },
    ];
    setValue('keyComponents', samples);
  };

  const addSampleIpAddresses = () => {
    const samples = [
      {
        deviceName: 'Main PLC',
        ipAddress: '192.168.1.10/24',
        gateway: '192.168.1.1',
        comments: 'Primary controller',
      },
      {
        deviceName: 'HMI Station',
        ipAddress: '192.168.1.20/24',
        gateway: '192.168.1.1',
        comments: 'Operator interface',
      },
      {
        deviceName: 'Engineering Station',
        ipAddress: '192.168.1.30/24',
        gateway: '192.168.1.1',
        comments: 'Programming workstation',
      },
    ];
    setValue('ipAddresses', samples);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Asset Register
        </h3>
        <p className="text-sm text-gray-600">
          Document all key components and network devices that are part of the system
          being tested. This creates a comprehensive inventory for reference.
        </p>
      </div>

      {/* Key Components Section */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-blue-900 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Key Components
          </h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addSampleComponents}
              className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Add Samples
            </button>
            <button
              type="button"
              onClick={() => addComponent({ serialNo: '', model: '', description: '', remarks: '' })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Component
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Upload className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div>
              <h5 className="text-sm font-medium text-blue-900">Smart Paste from Excel</h5>
              <p className="text-sm text-blue-800 mt-1">
                Copy from Excel with columns: S.No | Model | Description | Remarks
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {componentFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  S.No *
                </label>
                <input
                  {...register(`keyComponents.${index}.serialNo`)}
                  type="text"
                  onPaste={handleComponentPaste}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PLC001"
                />
                {errors.keyComponents?.[index]?.serialNo && (
                  <p className="mt-1 text-xs text-red-600">{errors.keyComponents[index]?.serialNo?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  {...register(`keyComponents.${index}.model`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Allen-Bradley ControlLogix"
                />
                {errors.keyComponents?.[index]?.model && (
                  <p className="mt-1 text-xs text-red-600">{errors.keyComponents[index]?.model?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  {...register(`keyComponents.${index}.description`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Main Process Controller"
                />
                {errors.keyComponents?.[index]?.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.keyComponents[index]?.description?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <input
                  {...register(`keyComponents.${index}.remarks`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Firmware version, notes"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeComponent(index)}
                  disabled={componentFields.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove component"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IP Address Schedule Section */}
      <div className="bg-green-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-green-900 flex items-center">
            <Network className="w-4 h-4 mr-2" />
            IP Address Schedule
          </h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addSampleIpAddresses}
              className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              Add Samples
            </button>
            <button
              type="button"
              onClick={() => addIpAddress({ deviceName: '', ipAddress: '', gateway: '', comments: '' })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add IP Address
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Upload className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
            <div>
              <h5 className="text-sm font-medium text-green-900">Smart Paste from Excel</h5>
              <p className="text-sm text-green-800 mt-1">
                Copy from Excel with columns: Device Name | IP Address/Subnet | Gateway | Comments
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {ipFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Name *
                </label>
                <input
                  {...register(`ipAddresses.${index}.deviceName`)}
                  type="text"
                  onPaste={handleIpPaste}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Main PLC"
                />
                {errors.ipAddresses?.[index]?.deviceName && (
                  <p className="mt-1 text-xs text-red-600">{errors.ipAddresses[index]?.deviceName?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address / Subnet *
                </label>
                <input
                  {...register(`ipAddresses.${index}.ipAddress`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="192.168.1.10/24"
                />
                {errors.ipAddresses?.[index]?.ipAddress && (
                  <p className="mt-1 text-xs text-red-600">{errors.ipAddresses[index]?.ipAddress?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gateway
                </label>
                <input
                  {...register(`ipAddresses.${index}.gateway`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="192.168.1.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <input
                  {...register(`ipAddresses.${index}.comments`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Primary controller"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeIpAddress(index)}
                  disabled={ipFields.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove IP address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Documentation Tips:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Include firmware versions and software revisions in remarks</li>
          <li>• Use consistent naming conventions for devices</li>
          <li>• Document both static and DHCP assigned addresses</li>
          <li>• Include VLAN information where applicable</li>
          <li>• Note any special network configurations or security settings</li>
        </ul>
      </div>
    </div>
  );
};

export default Step4AssetRegister;