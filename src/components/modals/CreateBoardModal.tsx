'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import api from '@/lib/api';
import { Board } from '@/types';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated: (board: Board) => void;
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  onBoardCreated,
}: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post<Board>('/boards', {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onBoardCreated(data);
      toast.success(`Board "${data.name}" created`);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create board');
      toast.error(err.response?.data?.message || 'Failed to create board');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Board">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Board Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website Redesign, Marketing Campaign"
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief details about the project goals..."
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-500/25 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Create Board</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
