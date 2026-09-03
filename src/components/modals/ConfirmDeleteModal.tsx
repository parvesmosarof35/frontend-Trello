'use client';

import React from 'react';
import Modal from '../ui/Modal';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete Permanently',
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="sm">
      <div className="text-center py-2 space-y-4">
        {/* Warning Badge / Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10 animate-in zoom-in-95 duration-200">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Deleting...' : confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
