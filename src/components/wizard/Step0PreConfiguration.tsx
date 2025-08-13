import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Settings } from 'lucide-react';

const preConfigSchema = z.object({
  digitalModules: z.array(z.object({
    rackNo: z.string().min(1, 'Rack number is required'),
    modulePosition: z.string().min(1, 'Module position is required'),
    channelCount: z.number().min(1, 'Channel count must be at least 1'),
  })),
  analogModules: z.array(z.object({
    rackNo: z.string().min(1, 'Rack number is required'),
    modulePosition: z.string().min(1, 'Module position is required'),
    defaultRange: z.string().min(1, 'Default I/O range is required'),
  })),
  modbusConfig: z.object({
    digitalCoils: z.object({
      startAddress: z.number().min(0),
      registerCount: z.number().min(0),
    }),
    digitalInputs: z.object({
      startAddress: z.number().min(0),
      registerCount: z.number().min(0),
    }),
    analogHolding: z.object({
      startAddress: z.number().min(0),
      registerCount: z.number().min(0),
    }),
    analogInput: z.object({
      startAddress: z.number().min(0),
      registerCount: z.number().min(0),
    }),
  }),
});

type PreConfigForm = z.infer<typeof preConfigSchema>;

interface Step0PreConfigurationProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step0PreConfiguration: React.FC<Step0PreConfigurationProps> = ({
  data,
  onChange,
  onSave,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<PreConfigForm>({
    resolver: zodResolver(preConfigSchema),
    defaultValues: {
      digitalModules: data.digitalModules || [{ rackNo: '1', modulePosition: '1', channelCount: 16 }],
      analogModules: data.analogModules || [{ rackNo: '1', modulePosition: '2', defaultRange: '4-20mA' }],
      modbusConfig: data.modbusConfig || {
        digitalCoils: { startAddress: 0, registerCount: 100 },
        digitalInputs: { startAddress: 10000, registerCount: 100 },
        analogHolding: { startAddress: 40000, registerCount: 50 },
        analogInput: { startAddress: 30000, registerCount: 50 },
      },
    },
  });

  const {
    fields: digitalFields,
    append: addDigital,
    remove: removeDigital,
  } = useFieldArray({
    control,
    name: 'digitalModules',
  });

  const {
    fields: analogFields,
    append: addAnalog,
    remove: removeAnalog,
  } = useFieldArray({
    control,
    name: 'analogModules',
  });

  const formData = watch();

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Pre-Configuration & Signal Setup
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure your digital and analog modules and Modbus settings. This will automatically
          generate the correct number of rows for signal testing in Step 5.
        </p>
      </div>

      {/* Digital Modules */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-blue-900">Digital Modules</h4>
          <button
            type="button"
            onClick={() => addDigital({ rackNo: '', modulePosition: '', channelCount: 16 })}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Module
          </button>
        </div>

        <div className="space-y-4">
          {digitalFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rack No.
                </label>
                <input
                  {...register(`digitalModules.${index}.rackNo`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
                {errors.digitalModules?.[index]?.rackNo && (
                  <p className="mt-1 text-xs text-red-600">{errors.digitalModules[index]?.rackNo?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Position
                </label>
                <input
                  {...register(`digitalModules.${index}.modulePosition`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
                {errors.digitalModules?.[index]?.modulePosition && (
                  <p className="mt-1 text-xs text-red-600">{errors.digitalModules[index]?.modulePosition?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Count
                </label>
                <input
                  {...register(`digitalModules.${index}.channelCount`, { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="1"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="16"
                />
                {errors.digitalModules?.[index]?.channelCount && (
                  <p className="mt-1 text-xs text-red-600">{errors.digitalModules[index]?.channelCount?.message}</p>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeDigital(index)}
                  disabled={digitalFields.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove module"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analog Modules */}
      <div className="bg-green-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-green-900">Analog Modules</h4>
          <button
            type="button"
            onClick={() => addAnalog({ rackNo: '', modulePosition: '', defaultRange: '4-20mA' })}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Module
          </button>
        </div>

        <div className="space-y-4">
          {analogFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rack No.
                </label>
                <input
                  {...register(`analogModules.${index}.rackNo`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
                {errors.analogModules?.[index]?.rackNo && (
                  <p className="mt-1 text-xs text-red-600">{errors.analogModules[index]?.rackNo?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Position
                </label>
                <input
                  {...register(`analogModules.${index}.modulePosition`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2"
                />
                {errors.analogModules?.[index]?.modulePosition && (
                  <p className="mt-1 text-xs text-red-600">{errors.analogModules[index]?.modulePosition?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default I/O Range
                </label>
                <select
                  {...register(`analogModules.${index}.defaultRange`)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="4-20mA">4-20mA</option>
                  <option value="0-20mA">0-20mA</option>
                  <option value="0-10V">0-10V</option>
                  <option value="1-5V">1-5V</option>
                  <option value="0-5V">0-5V</option>
                </select>
                {errors.analogModules?.[index]?.defaultRange && (
                  <p className="mt-1 text-xs text-red-600">{errors.analogModules[index]?.defaultRange?.message}</p>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeAnalog(index)}
                  disabled={analogFields.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove module"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modbus Configuration */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h4 className="text-base font-medium text-purple-900 mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Modbus Configuration
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-900">Digital Registers</h5>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coils Start Address
                </label>
                <input
                  {...register('modbusConfig.digitalCoils.startAddress', { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Register Count
                </label>
                <input
                  {...register('modbusConfig.digitalCoils.registerCount', { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inputs Start Address
                </label>
                <input
                  {...register('modbusConfig.digitalInputs.startAddress', { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Register Count
                </label>
                <input
                  {...register('modbusConfig.digitalInputs.registerCount', { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-900">Analog Registers</h5>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holding Start Address
                </label>
                <input
                  {...register('modbusConfig.analogHolding.startAddress', { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="40000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Register Count
                </label>
                <input
                  {...register('modbusConfig.analogHolding.registerCount', { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Start Address
                </label>
                <input
                  {...register('modbusConfig.analogInput.startAddress', { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Register Count
                </label>
                <input
                  {...register('modbusConfig.analogInput.registerCount', { 
                    valueAsNumber: true 
                  })}
                  type="number"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-2">Configuration Summary:</p>
          <ul className="space-y-1">
            <li>• Digital Modules: {digitalFields.length} modules, {digitalFields.reduce((sum, module) => sum + (formData.digitalModules?.[digitalFields.indexOf(module)]?.channelCount || 0), 0)} total channels</li>
            <li>• Analog Modules: {analogFields.length} modules</li>
            <li>• Modbus Digital: {(formData.modbusConfig?.digitalCoils?.registerCount || 0) + (formData.modbusConfig?.digitalInputs?.registerCount || 0)} registers</li>
            <li>• Modbus Analog: {(formData.modbusConfig?.analogHolding?.registerCount || 0) + (formData.modbusConfig?.analogInput?.registerCount || 0)} registers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Step0PreConfiguration;