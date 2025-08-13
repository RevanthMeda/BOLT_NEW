import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  title: string;
  projectRef: string;
  documentRef: string;
  revision: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    fullName: string;
    email: string;
  };
  technicalManager?: {
    id: string;
    fullName: string;
    email: string;
  };
  projectManager?: {
    id: string;
    fullName: string;
    email: string;
  };
  signatures: Array<{
    id: string;
    role: string;
    signedAt: string;
    user: {
      fullName: string;
      role: string;
    };
  }>;
  _count: {
    comments: number;
    files: number;
  };
}

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

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reportsData, isLoading, error } = useQuery({
    queryKey: ['reports', selectedTab, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTab !== 'all') params.append('status', selectedTab);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/reports?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      return response.json();
    },
  });

  const getDashboardTabs = () => {
    switch (user?.role) {
      case 'ENGINEER':
        return [
          { id: 'all', label: 'All Reports', count: reportsData?.reports?.length || 0 },
          { id: 'DRAFT', label: 'Draft', count: reportsData?.reports?.filter((r: Report) => r.status === 'DRAFT').length || 0 },
          { id: 'PENDING_TM_APPROVAL', label: 'Under Review', count: reportsData?.reports?.filter((r: Report) => r.status === 'PENDING_TM_APPROVAL' || r.status === 'PENDING_PM_APPROVAL').length || 0 },
          { id: 'REJECTED', label: 'Needs Attention', count: reportsData?.reports?.filter((r: Report) => r.status === 'REJECTED').length || 0 },
          { id: 'COMPLETED', label: 'Completed', count: reportsData?.reports?.filter((r: Report) => r.status === 'COMPLETED').length || 0 },
        ];
      case 'TECHNICAL_MANAGER':
        return [
          { id: 'all', label: 'All Assigned', count: reportsData?.reports?.length || 0 },
          { id: 'PENDING_TM_APPROVAL', label: 'Awaiting My Review', count: reportsData?.reports?.filter((r: Report) => r.status === 'PENDING_TM_APPROVAL').length || 0 },
          { id: 'PENDING_PM_APPROVAL', label: 'Approved by Me', count: reportsData?.reports?.filter((r: Report) => r.status === 'PENDING_PM_APPROVAL').length || 0 },
          { id: 'COMPLETED', label: 'Completed', count: reportsData?.reports?.filter((r: Report) => r.status === 'COMPLETED').length || 0 },
        ];
      case 'PROJECT_MANAGER':
        return [
          { id: 'all', label: 'All Assigned', count: reportsData?.reports?.length || 0 },
          { id: 'PENDING_PM_APPROVAL', label: 'Awaiting My Approval', count: reportsData?.reports?.filter((r: Report) => r.status === 'PENDING_PM_APPROVAL').length || 0 },
          { id: 'COMPLETED', label: 'Completed', count: reportsData?.reports?.filter((r: Report) => r.status === 'COMPLETED').length || 0 },
        ];
      case 'ADMIN':
        return [
          { id: 'all', label: 'All Reports', count: reportsData?.reports?.length || 0 },
          { id: 'DRAFT', label: 'Draft', count: reportsData?.reports?.filter((r: Report) => r.status === 'DRAFT').length || 0 },
          { id: 'PENDING_TM_APPROVAL', label: 'TM Review', count: reportsData?.reports?.filter((r: Report) => r.status === 'PENDING_TM_APPROVAL').length || 0 },
          { id: 'PENDING_PM_APPROVAL', label: 'PM Approval', count: reportsData?.reports?.filter((r: Report) => r.status === 'PENDING_PM_APPROVAL').length || 0 },
          { id: 'COMPLETED', label: 'Completed', count: reportsData?.reports?.filter((r: Report) => r.status === 'COMPLETED').length || 0 },
        ];
      default:
        return [];
    }
  };

  const tabs = getDashboardTabs();
  
  const filteredReports = reportsData?.reports?.filter((report: Report) => {
    if (selectedTab === 'all') return true;
    return report.status === selectedTab;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    toast.error('Failed to load reports');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'ENGINEER' && 'My Reports'}
            {user?.role === 'TECHNICAL_MANAGER' && 'Technical Reviews'}
            {user?.role === 'PROJECT_MANAGER' && 'Final Approvals'}
            {user?.role === 'ADMIN' && 'System Reports'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'ENGINEER' && 'Manage and track your SAT reports'}
            {user?.role === 'TECHNICAL_MANAGER' && 'Review reports assigned to you for technical approval'}
            {user?.role === 'PROJECT_MANAGER' && 'Provide final approval for completed reports'}
            {user?.role === 'ADMIN' && 'Overview of all reports in the system'}
          </p>
        </div>
        
        {user?.role === 'ENGINEER' && (
          <Link
            to="/reports/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New SAT Report
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports by title, project ref, or document ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  selectedTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm ? 'No reports found' : 'No reports yet'}
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : user?.role === 'ENGINEER' 
                ? 'Create your first SAT report to get started'
                : 'No reports have been assigned to you yet'
              }
            </p>
            {user?.role === 'ENGINEER' && !searchTerm && (
              <div className="mt-6">
                <Link
                  to="/reports/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Report
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report: Report) => {
                  const status = statusConfig[report.status as keyof typeof statusConfig];
                  const StatusIcon = status?.icon || FileText;
                  
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {report.documentRef} v{report.revision} • {report.projectRef}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Created: {formatDate(report.createdAt)}
                          </div>
                          {report.updatedAt !== report.createdAt && (
                            <div className="text-xs text-gray-400">
                              Updated: {formatDate(report.updatedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>Engineer: {report.creator.fullName}</div>
                          {report.technicalManager && (
                            <div>TM: {report.technicalManager.fullName}</div>
                          )}
                          {report.projectManager && (
                            <div>PM: {report.projectManager.fullName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>{report._count.comments} comments</div>
                          <div>{report._count.files} files</div>
                          <div>{report.signatures.length} signatures</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/reports/${report.id}`}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-blue-600 hover:bg-blue-50"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {(user?.role === 'ENGINEER' && report.creator.id === user.id && report.status === 'DRAFT') && (
                            <Link
                              to={`/reports/${report.id}/edit`}
                              className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-600 hover:bg-gray-50"
                              title="Edit Report"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;