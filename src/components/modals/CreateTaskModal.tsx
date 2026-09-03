'use client';

import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import api from '@/lib/api';
import { Task } from '@/types';
import { Image as ImageIcon, Loader2, Plus, UploadCloud, X } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  columnName: string;
  onTaskCreated: (task: Task) => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  columnId,
  columnName,
  onTaskCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    setError('');

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setImageUrl(uploadedUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image to Cloudinary');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post<Task>(`/columns/${columnId}/tasks`, {
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl || undefined,
      });
      onTaskCreated(data);
      setTitle('');
      setDescription('');
      setImageUrl(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Task to "${columnName}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement user login API"
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            placeholder="Add any helpful details, acceptance criteria, or links..."
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {/* Cloudinary Cover Image Attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Cover Image (Cloudinary)
          </label>

          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
              <img
                src={imageUrl}
                alt="Task attachment"
                className="w-full h-36 object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-500 text-slate-200 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="task-image-upload"
              />
              <label
                htmlFor="task-image-upload"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800/60 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-slate-600 rounded-xl text-xs font-medium text-slate-300 hover:text-white cursor-pointer transition-all"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                )}
                <span>
                  {isUploadingImage
                    ? 'Uploading to Cloudinary...'
                    : 'Upload Cover Image'}
                </span>
              </label>
            </div>
          )}
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
            disabled={isLoading || isUploadingImage || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add Task</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
