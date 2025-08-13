import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Send, 
  Eye,
  Calendar,
  User,
  Settings,
  Package,
  Zap,
  Monitor,
  Wrench
} from 'lucide-react';

interface Step8ReviewSubmitProps {
  data: any;
  allData: any;
  onChange: (data: any) => void;
  onSave: () => void;
}

const Step8ReviewSubmit: React.FC<Step8ReviewSubmitProps> = ({
  data,
  allData,
  onChange,
  onSave,
}) => {
  const [showFullData, setShowFullData] = useState(false);

  const stepSections = [
    {
      id: 'pre_configuration',
      title: 'Pre-Configuration',
      icon: Settings,
      data: allData.pre_configuration,
      description: 'Module and Modbus setup configuration',
    },
    {
      id: 'document_info',
      title: 'Document Information',
      icon: FileText,
      data: allData.document_info,
      description: 'Basic report metadata and assignments',
    },
    {
      id: 'introduction_scope',
      title: 'Introduction & Scope',
      icon: FileText,
      data: allData.introduction_scope,
      description: 'Report introduction and scope of work',
    },
    {
      id: 'pre_test_requirements',
      title: 'Pre-Test Requirements',
      icon: CheckCircle,
      data: allData.pre_test_requirements,
      description: 'Prerequisites and acceptance criteria',
    },
    {
      id: 'asset_register',
      title: 'Asset Register',
      icon: Package,
      data: allData.asset_register,
      description: 'Key components and IP address schedule',
    },
    {
      id: 'signal_tests',
      title: 'Signal Tests',
      icon: Zap,
      data: allData.signal_tests,
      description: 'Digital, analog, and Modbus signal testing',
    },
    {
      id: 'process_scada_alarms',
      title: 'Process, SCADA & Alarms',
      icon: Monitor,
      data: allData.process_scada_alarms,
      description: 'SCADA verification and alarm testing',
    },
    {
      id: 'test_equipment_punch',
      title: 'Test Equipment & Punch List',
      icon: Wrench,
      data: allData.test_equipment_punch,
      description: 'Equipment used and issues to resolve',
    },
  ];

  const getCompletionStatus = (stepData: any) => {
    if (!stepData) return { complete: false, percentage: 0 };
    
    const keys = Object.keys(stepData);
    if (keys.length === 0) return { complete: false, percentage: 0 };
    
    const filledKeys = keys.filter(key => {
      const value = stepData[key];
      if (Array.isArray(value)) {
        return value.length > 0 && value.some(item => 
          Object.values(item).some(val => val !== '' && val !== null && val !== undefined)
        );
      }
      return value !== '' && value !== null && value !== undefined;
    });
    
    const percentage = Math.round((filledKeys.length / keys.length) * 100);
    return { complete: percentage === 100, percentage };
  };

  const getOverallCompletion = () => {
    const completions = stepSections.map(section => getCompletionStatus(section.data));
    const totalPercentage = completions.reduce((sum, comp) => sum + comp.percentage, 0);
    const averagePercentage = Math.round(totalPercentage / stepSections.length);
    const allComplete = completions.every(comp => comp.complete);
    
    return { complete: allComplete, percentage: averagePercentage };
  };

  const overallCompletion = getOverallCompletion();

  const getDataSummary = (stepData: any) => {
    if (!stepData) return 'No data';
    
    const keys = Object.keys(stepData);
    const arrays = keys.filter(key => Array.isArray(stepData[key]));
    const objects = keys.filter(key => typeof stepData[key] === 'object' && !Array.isArray(stepData[key]) && stepData[key] !== null);
    const primitives = keys.filter(key => typeof stepData[key] !== 'object' || stepData[key] === null);
    
    const summary = [];
    if (primitives.length > 0) summary.push(`${primitives.length} fields`);
    if (arrays.length > 0) {
      const totalItems = arrays.reduce((sum, key) => sum + (stepData[key]?.length || 0), 0);
      summary.push(`${totalItems} items in ${arrays.length} tables`);
    }
    if (objects.length > 0) summary.push(`${objects.length} sections`);
    
    return summary.join(', ') || 'No data';
  };

  const canSubmit = () => {
    // Check if basic document info is complete
    const docInfo = allData.document_info;
    if (!docInfo?.title || !docInfo?.projectRef || !docInfo?.documentRef || !docInfo?.revision) {
      return false;
    }
    
    // Check if TM is assigned
    if (!docInfo?.tmId) {
      return false;
    }
    
    return true;
  };

  const getSubmissionIssues = () => {
    const issues = [];
    const docInfo = allData.document_info;
    
    if (!docInfo?.title) issues.push('Report title is required');
    if (!docInfo?.projectRef) issues.push('Project reference is required');
    if (!docInfo?.documentRef) issues.push('Document reference is required');
    if (!docInfo?.revision) issues.push('Revision is required');
    if (!docInfo?.tmId) issues.push('Technical Manager must be assigned');
    
    return issues;
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Review & Submit
        </h3>
        <p className="text-sm text-gray-600">
          Review all sections of your SAT report before submitting for Technical Manager approval.
          Ensure all required information is complete and accurate.
        </p>
      </div>

      {/* Overall Completion Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-gray-900">Report Completion Status</h4>
          <div className="flex items-center space-x-2">
            {overallCompletion.complete ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {overallCompletion.percentage}% Complete
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              overallCompletion.complete ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${overallCompletion.percentage}%` }}
          />
        </div>

        {!canSubmit() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Cannot Submit Report
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {getSubmissionIssues().map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Review */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900">Section Review</h4>
        
        {stepSections.map((section) => {
          const completion = getCompletionStatus(section.data);
          const Icon = section.icon;
          
          return (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{section.title}</h5>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {getDataSummary(section.data)}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {completion.complete ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span className="text-xs font-medium text-gray-900">
                        {completion.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      completion.complete ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-base font-medium text-blue-900 mb-4">Report Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Document Details</span>
            </div>
            <div className="space-y-1 text-blue-800 ml-6">
              <div>Title: {allData.document_info?.title || 'Not specified'}</div>
              <div>Project: {allData.document_info?.projectRef || 'Not specified'}</div>
              <div>Document: {allData.document_info?.documentRef || 'Not specified'} v{allData.document_info?.revision || '1.0'}</div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Assignments</span>
            </div>
            <div className="space-y-1 text-blue-800 ml-6">
              <div>Prepared By: {allData.document_info?.preparedBy || 'Not specified'}</div>
              <div>Technical Manager: {allData.document_info?.tmId ? 'Assigned' : 'Not assigned'}</div>
              <div>Project Manager: {allData.document_info?.pmId ? 'Assigned' : 'Not assigned'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview Toggle */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <button
          type="button"
          onClick={() => setShowFullData(!showFullData)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <Eye className="w-4 h-4" />
          <span>{showFullData ? 'Hide' : 'Show'} Full Data Preview</span>
        </button>
        
        {showFullData && (
          <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(allData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Submission Confirmation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Ready to Submit?
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p className="mb-2">
                Once you submit this report, it will be sent to the assigned Technical Manager for review.
                You will not be able to make changes until the report is either approved or rejected.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>All data will be saved automatically</li>
                <li>The Technical Manager will receive an email notification</li>
                <li>You can track the approval status from your dashboard</li>
                <li>Comments and feedback will be available during the review process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <button
          type="button"
          disabled={!canSubmit()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (canSubmit()) {
              // This will be handled by the parent component
              console.log('Submit report');
            }
          }}
        >
          <Send className="w-5 h-5 mr-2" />
          Submit Report for TM Approval
        </button>
      </div>
    </div>
  );
};

export default Step8ReviewSubmit;