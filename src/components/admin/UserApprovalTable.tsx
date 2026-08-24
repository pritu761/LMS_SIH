'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  Eye,
  Building,
  GraduationCap,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { MockUser } from '@/lib/mockData';
import { UserDetailModal } from './UserDetailModal';

interface UserApprovalTableProps {
  initialUsersList: MockUser[];
}

export function UserApprovalTable({ initialUsersList }: UserApprovalTableProps) {
  const [users, setUsers] = useState<MockUser[]>(initialUsersList);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForModal, setSelectedUserForModal] = useState<MockUser | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const fetchLiveUsers = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error('Failed to fetch live users:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  React.useEffect(() => {
    fetchLiveUsers();
  }, []);

  // Filter users based on role, status, and search query
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesSearch =
      u.profile.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.profile.organization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (
    userId: string,
    newStatus: 'APPROVED' | 'SUSPENDED' | 'REJECTED' | 'PENDING',
    newRole?: 'TRAINEE' | 'TRAINER' | 'ADMIN'
  ) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus, role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === userId) {
              return {
                ...u,
                status: newStatus,
                isVerified: newStatus === 'APPROVED',
                role: newRole || u.role,
              };
            }
            return u;
          })
        );
        if (selectedUserForModal && selectedUserForModal.id === userId) {
          setSelectedUserForModal((prev) =>
            prev ? { ...prev, status: newStatus, role: newRole || prev.role } : null
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const pendingCount = users.filter((u) => u.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters & Pending Alert */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        
        {/* KPI Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              User Approvals & Role-Based Access Control
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review credential submissions, assign governance permissions, or suspend unauthorized accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveUsers}
              disabled={isLoadingList}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50"
              title="Refresh from PostgreSQL database"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingList ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isLoadingList ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            {pendingCount > 0 && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs font-semibold text-amber-300 animate-pulse">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span>{pendingCount} Pending Approvals</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by full name, email, or government department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'PENDING_ONLY', 'TRAINER', 'TRAINEE', 'ADMIN'].map((filterKey) => {
              let label = filterKey;
              if (filterKey === 'PENDING_ONLY') label = `Pending (${pendingCount})`;

              const isActive =
                (filterKey === 'PENDING_ONLY' && statusFilter === 'PENDING') ||
                (filterKey !== 'PENDING_ONLY' && roleFilter === filterKey && statusFilter !== 'PENDING');

              return (
                <button
                  key={filterKey}
                  onClick={() => {
                    if (filterKey === 'PENDING_ONLY') {
                      setStatusFilter('PENDING');
                      setRoleFilter('ALL');
                    } else {
                      setStatusFilter('ALL');
                      setRoleFilter(filterKey);
                    }
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">User & Profile</th>
                <th className="px-6 py-4">Designation & Org</th>
                <th className="px-6 py-4">Role Guard</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions & Role Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((u) => {
                const isUpdating = updatingUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* User & Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'}
                          alt={u.profile.fullName}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{u.profile.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Designation & Org */}
                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-medium">{u.profile.headline || 'General Professional'}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="h-3 w-3 text-slate-500" />
                        <span>{u.profile.organization || 'Government Department'}</span>
                      </div>
                    </td>

                    {/* Role Guard (with quick selector) */}
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleUpdateStatus(u.id, u.status, e.target.value as any)
                        }
                        className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="TRAINEE">TRAINEE</option>
                        <option value="TRAINER">TRAINER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                          u.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : u.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.status === 'APPROVED'
                              ? 'bg-emerald-400'
                              : u.status === 'PENDING'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {u.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Dossier button */}
                        <button
                          onClick={() => setSelectedUserForModal(u)}
                          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors"
                          title="Inspect full candidate dossier & credentials"
                        >
                          <Eye className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Dossier</span>
                        </button>

                        {/* Approve button for pending accounts */}
                        {u.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                            disabled={isUpdating}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Suspend / Reactivate Toggle */}
                        {u.status === 'APPROVED' && u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')}
                            disabled={isUpdating}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition-colors"
                          >
                            Suspend
                          </button>
                        )}

                        {u.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                            disabled={isUpdating}
                            className="rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 px-2.5 py-1.5 text-xs font-medium transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching user records found for the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* User Dossier Modal */}
      {selectedUserForModal && (
        <UserDetailModal
          user={selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          onApprove={() => handleUpdateStatus(selectedUserForModal.id, 'APPROVED')}
          onSuspend={() => handleUpdateStatus(selectedUserForModal.id, 'SUSPENDED')}
        />
      )}
    </div>
  );
}
