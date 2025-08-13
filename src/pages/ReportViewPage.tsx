import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft,
  FileText,
  Calendar,
  User,
  MessageCircle,
  Paperclip,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: Edit,
  },
  PENDING_TM_APPROVAL: {
    label: 'Pending TM Approval',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  PENDING_PM_APPROVAL: {
    label: 'Pending PM Approval',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      if (!id) throw new Error('Report ID is required');
      
      const response = await fetch(`/api/reports/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Report not found or you do not have permission to view it');
        }
        throw new Error('Failed to fetch report');
      }
      
      return response.json();
    },
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Report Not Found</h3>
        <p className="mt-2 text-gray-500">
          {error instanceof Error ? error.message : 'The requested report could not be found.'}
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[report.status as keyof typeof statusConfig];
  const StatusIcon = status?.icon || FileText;

  const canEdit = user?.role === 'ENGINEER' && report.creator.id === user.id && report.status === 'DRAFT';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {report.title}
                </h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>{report.documentRef} v{report.revision}</span>
                  <span>•</span>
                  <span>{report.projectRef}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status?.color}`}>
                <StatusIcon className="w-4 h-4 mr-2" />
                {status?.label}
              </span>

              {canEdit && (
                <Link
                  to={`/reports/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Report
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Report Info Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created By</h3>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {report.creator.fullName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {report.creator.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{report.creator.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Technical Manager</h3>
              {report.technicalManager ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {report.technicalManager.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {report.technicalManager.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{report.technicalManager.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Not assigned</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Project Manager</h3>
              {report.projectManager ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {report.projectManager.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {report.projectManager.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{report.projectManager.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Not assigned</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-900">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(report.createdAt)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-900">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(report.updatedAt)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Activity</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-900">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{report.comments.length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Paperclip className="w-4 h-4" />
                  <span>{report.files.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Steps Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Report Content</h2>
        </div>
        <div className="p-6">
          {report.steps.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Content Yet</h3>
              <p className="mt-2 text-gray-500">
                This report doesn't have any content steps saved yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {report.steps.map((step: any) => (
                <div key={step.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                  <h3 className="text-base font-medium text-gray-900 mb-4 capitalize">
                    {step.stepName.replace(/_/g, ' ')}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Signatures */}
      {report.signatures.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Digital Signatures</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {report.signatures.map((signature: any) => (
                <div key={signature.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {signature.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {signature.user.role.replace('_', ' ')} • Signed on {formatDateTime(signature.signedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
        </div>
        <div className="p-6">
          {report.comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-gray-500">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {report.comments.map((comment: any) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {comment.user.fullName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Files */}
      {report.files.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.files.map((file: any) => (
                <div key={file.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Paperclip className="w-5 h-5 text-gray-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportViewPage;