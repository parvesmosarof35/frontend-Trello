'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import api from '@/lib/api';
import { Board, BoardMember, Role } from '@/types';
import { Loader2, Mail, Shield, Trash2, UserCheck, UserPlus } from 'lucide-react';

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  onMembersUpdated: () => void;
}

export default function ShareBoardModal({
  isOpen,
  onClose,
  board,
  onMembersUpdated,
}: ShareBoardModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/boards/${board.id}/members`, {
        email: email.trim().toLowerCase(),
        role,
      });
      setSuccess(`Invited ${email} successfully!`);
      setEmail('');
      onMembersUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the board?')) return;
    try {
      await api.delete(`/boards/${board.id}/members/${memberId}`);
      onMembersUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    try {
      await api.patch(`/boards/${board.id}/members/${memberId}`, {
        role: newRole,
      });
      onMembersUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update member role');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${board.name}"`} maxWidth="lg">
      <div className="space-y-6">
        {/* Invite Form */}
        <form onSubmit={handleInvite} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Invite by Email
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full pl-10 pr-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MEMBER">Member (Edit)</option>
              <option value="VIEWER">Viewer (Read Only)</option>
            </select>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-500/20"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Invite</span>
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg">
              {success}
            </p>
          )}
        </form>

        {/* Members List */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Board Members ({1 + (board.members?.length || 0)})
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {/* Owner */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {board.owner?.name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{board.owner?.name}</p>
                  <p className="text-xs text-slate-400">{board.owner?.email}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                <Shield className="w-3 h-3" /> Owner
              </span>
            </div>

            {/* Invited Members */}
            {board.members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800/80 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {member.user?.name?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.user?.name}</p>
                    <p className="text-xs text-slate-400">{member.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                    className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1 focus:outline-none"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                  </select>

                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    title="Remove Member"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
