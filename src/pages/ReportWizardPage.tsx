import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Wizard Steps Components
import Step0PreConfiguration from '../components/wizard/Step0PreConfiguration';
import Step1DocumentInfo from '../components/wizard/Step1DocumentInfo';
import Step2IntroductionScope from '../components/wizard/Step2IntroductionScope';
import Step3PreTestRequirements from '../components/wizard/Step3PreTestRequirements';
import Step4AssetRegister from '../components/wizard/Step4AssetRegister';
import Step5SignalTests from '../components/wizard/Step5SignalTests';
import Step6ProcessScadaAlarms from '../components/wizard/Step6ProcessScadaAlarms';
import Step7TestEquipmentPunch from '../components/wizard/Step7TestEquipmentPunch';
import Step8ReviewSubmit from '../components/wizard/Step8ReviewSubmit';

import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const WIZARD_STEPS = [
  { id: 0, name: 'Pre-Configuration', component: Step0PreConfiguration, title: 'Module & Modbus Setup' },
  { id: 1, name: 'Document Info', component: Step1DocumentInfo, title: 'Document Information' },
  { id: 2, name: 'Introduction', component: Step2IntroductionScope, title: 'Introduction & Scope' },
  { id: 3, name: 'Pre-Test', component: Step3PreTestRequirements, title: 'Pre-Test Requirements' },
  { id: 4, name: 'Assets', component: Step4AssetRegister, title: 'Asset Register' },
  { id: 5, name: 'Signal Tests', component: Step5SignalTests, title: 'Signal Tests' },
  { id: 6, name: 'SCADA & Alarms', component: Step6ProcessScadaAlarms, title: 'Process, SCADA & Alarms' },
  { id: 7, name: 'Equipment & Punch', component: Step7TestEquipmentPunch, title: 'Test Equipment & Punch List' },
  { id: 8, name: 'Review & Submit', component: Step8ReviewSubmit, title: 'Review & Submit' },
];

const ReportWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [reportData, setReportData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!id;

  // Fetch existing report data if editing
  const { data: existingReport, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/reports/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Create new report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create report');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/reports/${data.id}/edit`);
      toast.success('Report created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create report');
    },
  });

  // Update report step mutation
  const updateStepMutation = useMutation({
    mutationFn: async ({ reportId, stepName, data }: { reportId: string; stepName: string; data: any }) => {
      const response = await fetch(`/api/reports/${reportId}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepName, data }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to save step');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Step saved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save step');
    },
  });

  // Submit report mutation
  const submitReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/reports/${reportId}/submit`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit report');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Report submitted successfully!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit report');
    },
  });

  // Load existing report data
  useEffect(() => {
    if (existingReport) {
      // Convert steps array to object for easier access
      const stepsData = existingReport.steps.reduce((acc: any, step: any) => {
        acc[step.stepName] = step.data;
        return acc;
      }, {});
      
      setReportData({
        id: existingReport.id,
        title: existingReport.title,
        projectRef: existingReport.projectRef,
        documentRef: existingReport.documentRef,
        revision: existingReport.revision,
        tmId: existingReport.tmId,
        pmId: existingReport.pmId,
        status: existingReport.status,
        ...stepsData,
      });
    }
  }, [existingReport]);

  const handleStepChange = (stepId: string, data: any) => {
    setReportData(prev => ({
      ...prev,
      [stepId]: data,
    }));
  };

  const saveStep = async () => {
    const currentStepData = WIZARD_STEPS[currentStep];
    const stepData = reportData[currentStepData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')];
    
    if (!stepData) return;

    if (reportData.id) {
      // Update existing report
      updateStepMutation.mutate({
        reportId: reportData.id,
        stepName: currentStepData.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        data: stepData,
      });
    } else if (currentStep === 1 && stepData) {
      // Create new report with document info
      createReportMutation.mutate({
        title: stepData.title,
        projectRef: stepData.projectRef,
        documentRef: stepData.documentRef,
        revision: stepData.revision,
        tmId: stepData.tmId,
        pmId: stepData.pmId,
      });
    }
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      saveStep();
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportData.id) {
      toast.error('Please save the report first');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReportMutation.mutateAsync(reportData.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check permissions
  if (isEditMode && existingReport && user?.role !== 'ADMIN') {
    if (existingReport.creator.id !== user?.id || existingReport.status !== 'DRAFT') {
      return (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-2 text-gray-500">
            You can only edit draft reports that you created.
          </p>
        </div>
      );
    }
  }

  const CurrentStepComponent = WIZARD_STEPS[currentStep].component;
  const currentStepKey = WIZARD_STEPS[currentStep].name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit SAT Report' : 'Create New SAT Report'}
            </h1>
            <p className="text-gray-600 mt-1">
              Step {currentStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].title}
            </p>
          </div>
          
          {reportData.id && (
            <div className="text-sm text-gray-500">
              Report ID: {reportData.id}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < WIZARD_STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      index <= currentStep
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </div>
                  </div>
                </div>
                
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <CurrentStepComponent
            data={reportData[currentStepKey] || {}}
            allData={reportData}
            onChange={(data: any) => handleStepChange(currentStepKey, data)}
            onSave={saveStep}
          />
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={saveStep}
                disabled={updateStepMutation.isPending || createReportMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {(updateStepMutation.isPending || createReportMutation.isPending) ? (
                  <LoadingSpinner size="small" className="mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </button>

              {currentStep === WIZARD_STEPS.length - 1 ? (
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmitting || !reportData.id}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" className="mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Report
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportWizardPage;