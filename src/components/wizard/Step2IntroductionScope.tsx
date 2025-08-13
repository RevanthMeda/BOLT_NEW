import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, FileText, BookOpen } from 'lucide-react';

const introScopeSchema = z.object({
  introduction: z.string().min(1, 'Introduction is required'),
  scope: z.string().min(1, 'Scope of work is required'),
  relatedDocuments: z.array(z.object({
    name: z.string().min(1, 'Document name is required'),
    reference: z.string().min(1, 'Reference is required'),
  })),
});

type IntroScopeForm = z.infer<typeof introScopeSchema>;

interface Step2IntroductionScopeProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step2IntroductionScope: React.FC<Step2IntroductionScopeProps> = ({
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
  } = useForm<IntroScopeForm>({
    resolver: zodResolver(introScopeSchema),
    defaultValues: {
      introduction: data.introduction || '',
      scope: data.scope || '',
      relatedDocuments: data.relatedDocuments || [{ name: '', reference: '' }],
    },
  });

  const {
    fields: documentFields,
    append: addDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: 'relatedDocuments',
  });

  const formData = watch();

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Introduction & Scope
        </h3>
        <p className="text-sm text-gray-600">
          Provide the introduction and scope of work for your SAT report. This section
          sets the context and defines the boundaries of the testing activities.
        </p>
      </div>

      {/* Introduction */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Introduction *
        </label>
        <textarea
          {...register('introduction')}
          rows={6}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Provide an introduction to the Site Acceptance Test, including background information, objectives, and overview of the system being tested..."
        />
        {errors.introduction && (
          <p className="mt-1 text-sm text-red-600">{errors.introduction.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Describe the purpose and context of this SAT report
        </p>
      </div>

      {/* Scope of Work */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scope of Work *
        </label>
        <textarea
          {...register('scope')}
          rows={6}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Define the scope of work including what will be tested, testing boundaries, included/excluded systems, and acceptance criteria..."
        />
        {errors.scope && (
          <p className="mt-1 text-sm text-red-600">{errors.scope.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Clearly define what is included and excluded from this testing scope
        </p>
      </div>

      {/* Related Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-gray-900 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Related Documents
          </h4>
          <button
            type="button"
            onClick={() => addDocument({ name: '', reference: '' })}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Document
          </button>
        </div>

        <div className="space-y-4">
          {documentFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  {...register(`relatedDocuments.${index}.name`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="System Design Document"
                />
                {errors.relatedDocuments?.[index]?.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.relatedDocuments[index]?.name?.message}</p>
                )}
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  {...register(`relatedDocuments.${index}.reference`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SDD-001"
                />
                {errors.relatedDocuments?.[index]?.reference && (
                  <p className="mt-1 text-xs text-red-600">{errors.relatedDocuments[index]?.reference?.message}</p>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  disabled={documentFields.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          List all documents that are referenced or related to this SAT report
        </p>
      </div>

      {/* Sample Content Helper */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Sample Content Guidelines:</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <div>
            <strong>Introduction should include:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Project background and objectives</li>
              <li>System overview and description</li>
              <li>Testing approach and methodology</li>
              <li>Stakeholders and responsibilities</li>
            </ul>
          </div>
          <div>
            <strong>Scope should define:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Systems and components to be tested</li>
              <li>Testing boundaries and limitations</li>
              <li>Acceptance criteria and success metrics</li>
              <li>Exclusions and assumptions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2IntroductionScope;