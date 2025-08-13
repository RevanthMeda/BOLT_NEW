import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users,
  UserPlus,
  Check,
  X,
  Edit,
  Trash2,
  AlertCircle,
  Shield,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    createdReports: number;
    tmAssignedReports: number;
    pmAssignedReports: number;
  };
}

const UserManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('all');
  const [approveModal, setApproveModal] = useState<{ user: User; role: string; password: string } | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', selectedTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTab !== 'all') params.append('status', selectedTab);
      
      const response = await fetch(`/api/users?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: pendingCount } = useQuery({
    queryKey: ['users', 'pending', 'count'],
    queryFn: async () => {
      const response = await fetch('/api/users/pending/count', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch pending count');
      return response.json();
    },
  });

  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, role, password }: { userId: string; role: string; password: string }) => {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setApproveModal(null);
      toast.success('User approved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const handleApproveUser = (user: User) => {
    setApproveModal({
      user,
      role: user.role,
      password: Math.random().toString(36).slice(-12), // Generate random password
    });
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const filteredUsers = users?.filter((user: User) => {
    if (selectedTab === 'all') return true;
    return user.status === selectedTab.toUpperCase();
  }) || [];

  const tabs = [
    { id: 'all', label: 'All Users', count: users?.length || 0 },
    { id: 'pending', label: 'Pending Approval', count: pendingCount?.count || 0 },
    { id: 'active', label: 'Active', count: users?.filter((u: User) => u.status === 'ACTIVE').length || 0 },
    { id: 'inactive', label: 'Inactive', count: users?.filter((u: User) => u.status === 'INACTIVE').length || 0 },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ENGINEER':
        return 'bg-blue-100 text-blue-800';
      case 'TECHNICAL_MANAGER':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROJECT_MANAGER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, approve registrations, and assign roles
          </p>
        </div>

        {pendingCount?.count > 0 && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                {pendingCount.count} user{pendingCount.count !== 1 ? 's' : ''} pending approval
              </span>
            </div>
          </div>
        )}
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

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-2 text-gray-500">
              No users match the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                        {user.status === 'ACTIVE' && <Check className="w-3 h-3 mr-1" />}
                        {user.status === 'INACTIVE' && <X className="w-3 h-3 mr-1" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>Created: {user._count.createdReports}</div>
                        <div>TM: {user._count.tmAssignedReports}</div>
                        <div>PM: {user._count.pmAssignedReports}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {user.status === 'PENDING' && (
                          <button
                            onClick={() => handleApproveUser(user)}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-green-600 hover:bg-green-50"
                            title="Approve User"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user._count.createdReports + user._count.tmAssignedReports + user._count.pmAssignedReports > 0}
                          className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user._count.createdReports + user._count.tmAssignedReports + user._count.pmAssignedReports > 0 ? "Cannot delete user with reports" : "Delete User"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve User Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Approve User Registration
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  You are about to approve <strong>{approveModal.user.fullName}</strong> ({approveModal.user.email})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Role
                </label>
                <select
                  value={approveModal.role}
                  onChange={(e) => setApproveModal({ ...approveModal, role: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ENGINEER">Engineer</option>
                  <option value="TECHNICAL_MANAGER">Technical Manager</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Password
                </label>
                <input
                  type="text"
                  value={approveModal.password}
                  onChange={(e) => setApproveModal({ ...approveModal, password: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter initial password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The user will be notified of this password via email
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setApproveModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => approveUserMutation.mutate({
                  userId: approveModal.user.id,
                  role: approveModal.role,
                  password: approveModal.password,
                })}
                disabled={approveUserMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {approveUserMutation.isPending ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Approve User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;