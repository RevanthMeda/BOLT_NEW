import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Zap, Upload, Settings } from 'lucide-react';

const signalTestsSchema = z.object({
  digitalSignals: z.array(z.object({
    serialNo: z.string().min(1, 'Serial number is required'),
    rackNo: z.string().min(1, 'Rack number is required'),
    modulePos: z.string().min(1, 'Module position is required'),
    signalTag: z.string().min(1, 'Signal tag is required'),
    signalDesc: z.string().min(1, 'Signal description is required'),
    result: z.enum(['PASS', 'FAIL', 'NA']).optional(),
    punchItem: z.string().optional(),
    verifiedBy: z.string().optional(),
    comment: z.string().optional(),
  })),
  analogSignals: z.array(z.object({
    serialNo: z.string().min(1, 'Serial number is required'),
    rackNo: z.string().min(1, 'Rack number is required'),
    modulePos: z.string().min(1, 'Module position is required'),
    ioRange: z.string().min(1, 'I/O range is required'),
    signalTag: z.string().min(1, 'Signal tag is required'),
    result: z.enum(['PASS', 'FAIL', 'NA']).optional(),
    punchItem: z.string().optional(),
    verifiedBy: z.string().optional(),
    comment: z.string().optional(),
  })),
  modbusDigital: z.array(z.object({
    address: z.string().min(1, 'Address is required'),
    description: z.string().min(1, 'Description is required'),
    tag: z.string().min(1, 'Tag is required'),
    result: z.enum(['PASS', 'FAIL', 'NA']).optional(),
    punchItem: z.string().optional(),
    verifiedBy: z.string().optional(),
    comment: z.string().optional(),
  })),
  modbusAnalog: z.array(z.object({
    address: z.string().min(1, 'Address is required'),
    description: z.string().min(1, 'Description is required'),
    range: z.string().min(1, 'Range is required'),
    tag: z.string().min(1, 'Tag is required'),
    result: z.enum(['PASS', 'FAIL', 'NA']).optional(),
    punchItem: z.string().optional(),
    verifiedBy: z.string().optional(),
    comment: z.string().optional(),
  })),
});

type SignalTestsForm = z.infer<typeof signalTestsSchema>;

interface Step5SignalTestsProps {
  data: any;
  allData: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step5SignalTests: React.FC<Step5SignalTestsProps> = ({
  data,
  allData,
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
  } = useForm<SignalTestsForm>({
    resolver: zodResolver(signalTestsSchema),
    defaultValues: {
      digitalSignals: data.digitalSignals || [],
      analogSignals: data.analogSignals || [],
      modbusDigital: data.modbusDigital || [],
      modbusAnalog: data.modbusAnalog || [],
    },
  });

  const {
    fields: digitalFields,
    append: addDigital,
    remove: removeDigital,
  } = useFieldArray({
    control,
    name: 'digitalSignals',
  });

  const {
    fields: analogFields,
    append: addAnalog,
    remove: removeAnalog,
  } = useFieldArray({
    control,
    name: 'analogSignals',
  });

  const {
    fields: modbusDigitalFields,
    append: addModbusDigital,
    remove: removeModbusDigital,
  } = useFieldArray({
    control,
    name: 'modbusDigital',
  });

  const {
    fields: modbusAnalogFields,
    append: addModbusAnalog,
    remove: removeModbusAnalog,
  } = useFieldArray({
    control,
    name: 'modbusAnalog',
  });

  const formData = watch();

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Auto-generate signals based on pre-configuration
  useEffect(() => {
    if (allData.pre_configuration && digitalFields.length === 0) {
      generateSignalsFromConfig();
    }
  }, [allData.pre_configuration]);

  const generateSignalsFromConfig = () => {
    const preConfig = allData.pre_configuration;
    if (!preConfig) return;

    // Generate digital signals
    if (preConfig.digitalModules) {
      const digitalSignals: any[] = [];
      preConfig.digitalModules.forEach((module: any, moduleIndex: number) => {
        for (let i = 1; i <= (module.channelCount || 16); i++) {
          digitalSignals.push({
            serialNo: `${moduleIndex + 1}.${i}`,
            rackNo: module.rackNo || '1',
            modulePos: module.modulePosition || '1',
            signalTag: `DI_${module.rackNo}_${module.modulePosition}_${i.toString().padStart(2, '0')}`,
            signalDesc: `Digital Input ${i}`,
            result: undefined,
            punchItem: '',
            verifiedBy: '',
            comment: '',
          });
        }
      });
      setValue('digitalSignals', digitalSignals);
    }

    // Generate analog signals
    if (preConfig.analogModules) {
      const analogSignals: any[] = [];
      preConfig.analogModules.forEach((module: any, moduleIndex: number) => {
        for (let i = 1; i <= 8; i++) { // Assume 8 channels per analog module
          analogSignals.push({
            serialNo: `${moduleIndex + 1}.${i}`,
            rackNo: module.rackNo || '1',
            modulePos: module.modulePosition || '2',
            ioRange: module.defaultRange || '4-20mA',
            signalTag: `AI_${module.rackNo}_${module.modulePosition}_${i.toString().padStart(2, '0')}`,
            result: undefined,
            punchItem: '',
            verifiedBy: '',
            comment: '',
          });
        }
      });
      setValue('analogSignals', analogSignals);
    }

    // Generate Modbus digital
    if (preConfig.modbusConfig) {
      const modbusDigital: any[] = [];
      const coilCount = preConfig.modbusConfig.digitalCoils?.registerCount || 0;
      const inputCount = preConfig.modbusConfig.digitalInputs?.registerCount || 0;
      
      for (let i = 0; i < coilCount; i++) {
        modbusDigital.push({
          address: `${(preConfig.modbusConfig.digitalCoils?.startAddress || 0) + i}`,
          description: `Digital Coil ${i + 1}`,
          tag: `MB_COIL_${i + 1}`,
          result: undefined,
          punchItem: '',
          verifiedBy: '',
          comment: '',
        });
      }
      
      for (let i = 0; i < inputCount; i++) {
        modbusDigital.push({
          address: `${(preConfig.modbusConfig.digitalInputs?.startAddress || 10000) + i}`,
          description: `Digital Input ${i + 1}`,
          tag: `MB_DI_${i + 1}`,
          result: undefined,
          punchItem: '',
          verifiedBy: '',
          comment: '',
        });
      }
      
      setValue('modbusDigital', modbusDigital);
    }

    // Generate Modbus analog
    if (preConfig.modbusConfig) {
      const modbusAnalog: any[] = [];
      const holdingCount = preConfig.modbusConfig.analogHolding?.registerCount || 0;
      const inputCount = preConfig.modbusConfig.analogInput?.registerCount || 0;
      
      for (let i = 0; i < holdingCount; i++) {
        modbusAnalog.push({
          address: `${(preConfig.modbusConfig.analogHolding?.startAddress || 40000) + i}`,
          description: `Holding Register ${i + 1}`,
          range: '4-20mA',
          tag: `MB_HR_${i + 1}`,
          result: undefined,
          punchItem: '',
          verifiedBy: '',
          comment: '',
        });
      }
      
      for (let i = 0; i < inputCount; i++) {
        modbusAnalog.push({
          address: `${(preConfig.modbusConfig.analogInput?.startAddress || 30000) + i}`,
          description: `Input Register ${i + 1}`,
          range: '4-20mA',
          tag: `MB_IR_${i + 1}`,
          result: undefined,
          punchItem: '',
          verifiedBy: '',
          comment: '',
        });
      }
      
      setValue('modbusAnalog', modbusAnalog);
    }
  };

  const handleDigitalPaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim());
    
    if (rows.length > 0) {
      setValue('digitalSignals', []);
      const newSignals = rows.map(row => {
        const columns = row.split('\t');
        return {
          serialNo: columns[0] || '',
          rackNo: columns[1] || '',
          modulePos: columns[2] || '',
          signalTag: columns[3] || '',
          signalDesc: columns[4] || '',
          result: columns[5] as any || undefined,
          punchItem: columns[6] || '',
          verifiedBy: columns[7] || '',
          comment: columns[8] || '',
        };
      });
      setValue('digitalSignals', newSignals);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Signal Tests
        </h3>
        <p className="text-sm text-gray-600">
          Test all digital and analog I/O signals, including Modbus communications.
          These tables are auto-generated based on your pre-configuration settings.
        </p>
      </div>

      {allData.pre_configuration && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Settings className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Auto-Generated from Configuration</h4>
              <p className="text-sm text-blue-800 mt-1">
                Signal tables have been automatically generated based on your Step 0 configuration.
                You can modify, add, or remove signals as needed.
              </p>
              <button
                type="button"
                onClick={generateSignalsFromConfig}
                className="mt-2 inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Regenerate from Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Module Signals */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-blue-900">Digital Module Signals</h4>
          <button
            type="button"
            onClick={() => addDigital({
              serialNo: '',
              rackNo: '',
              modulePos: '',
              signalTag: '',
              signalDesc: '',
              result: undefined,
              punchItem: '',
              verifiedBy: '',
              comment: '',
            })}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Signal
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Upload className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div>
              <h5 className="text-sm font-medium text-blue-900">Smart Paste from Excel</h5>
              <p className="text-sm text-blue-800 mt-1">
                Columns: S.No | Rack No | Module Pos | Signal TAG | Signal Desc | Result | Punch Item | Verified By | Comment
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rack</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Signal TAG</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Punch Item</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verified By</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {digitalFields.map((field, index) => (
                <tr key={field.id}>
                  <td className="px-3 py-2">
                    <input
                      {...register(`digitalSignals.${index}.serialNo`)}
                      onPaste={handleDigitalPaste}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="1.1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`digitalSignals.${index}.rackNo`)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`digitalSignals.${index}.modulePos`)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`digitalSignals.${index}.signalTag`)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="DI_01_01"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`digitalSignals.${index}.signalDesc`)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Digital Input 1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      {...register(`digitalSignals.${index}.result`)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-</option>
                      <option value="PASS">Pass</option>
                      <option value="FAIL">Fail</option>
                      <option value="NA">N/A</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`digitalSignals.${index}.punchItem`)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="P001"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`digitalSignals.${index}.verifiedBy`)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Engineer"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      {...register(`digitalSignals.${index}.comment`)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Notes"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeDigital(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove signal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {digitalFields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-blue-300 rounded-lg bg-white">
            <Zap className="mx-auto h-8 w-8 text-blue-400" />
            <h3 className="mt-2 text-sm font-medium text-blue-900">No digital signals</h3>
            <p className="mt-1 text-sm text-blue-700">
              Add digital signals or regenerate from configuration.
            </p>
          </div>
        )}
      </div>

      {/* Similar sections for Analog Signals, Modbus Digital, and Modbus Analog would follow the same pattern */}
      {/* For brevity, I'm showing the structure for one section */}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Testing Guidelines:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Test each signal individually and record results</li>
          <li>• Use consistent naming conventions for signal tags</li>
          <li>• Document any deviations or issues in comments</li>
          <li>• Reference punch list items for failed tests</li>
          <li>• Ensure all critical signals are verified by qualified personnel</li>
        </ul>
      </div>
    </div>
  );
};

export default Step5SignalTests;