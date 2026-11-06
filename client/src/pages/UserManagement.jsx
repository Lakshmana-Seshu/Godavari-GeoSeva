import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  Mail,
  Building,
  CheckCircle,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getUsers();
      setUsers(res?.data?.users || []);
    } catch (err) {
      setError('Failed to fetch user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await dashboardApi.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert('Failed to update role.');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await dashboardApi.updateUserStatus(userId, newStatus);
      fetchUsers();
    } catch (err) {
      alert('Failed to update account status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
            Access Control & Personnel
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Roles & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrative credentials, volunteer access clearance, and account statuses.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Users
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">User & Email</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Role Clearance</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <strong className="block text-slate-900 font-bold text-sm">
                        {u.name}
                      </strong>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {u.email}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {u.organization || 'General Public'}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2 py-1 text-xs rounded border border-slate-300 bg-white font-semibold text-teal-900 focus:ring-1 focus:ring-teal-700"
                      >
                        <option value="ADMIN">ADMIN (Full Control)</option>
                        <option value="VOLUNTEER">VOLUNTEER (Survey & Update)</option>
                        <option value="PILGRIM">PILGRIM (Citizen View)</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {formatDateTime(u.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() =>
                          handleStatusChange(
                            u._id,
                            u.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                          )
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
