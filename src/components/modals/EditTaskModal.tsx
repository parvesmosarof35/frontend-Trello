'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import api from '@/lib/api';
import { Task } from '@/types';
import { Loader2, Trash2, Calendar, User as UserIcon, UploadCloud, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
  onTaskDeleted,
}: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setImageUrl(task.imageUrl || null);
      setError('');
    }
  }, [task]);

  if (!task) return null;

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.patch<Task>(`/tasks/${task.id}`, {
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl,
      });
      onTaskUpdated(data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${task.id}`);
      onTaskDeleted(task.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" maxWidth="lg">
      <form onSubmit={handleUpdate} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Cloudinary Cover Image Preview */}
        {imageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
            <img
              src={imageUrl}
              alt="Task attachment"
              className="w-full h-44 object-cover"
            />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-500 text-slate-200 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add detailed task description..."
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {/* Change / Add Cover Image */}
        {!imageUrl && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Attach Cover Image (Cloudinary)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="edit-task-image-upload"
            />
            <label
              htmlFor="edit-task-image-upload"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-slate-600 rounded-xl text-xs font-medium text-slate-300 hover:text-white cursor-pointer transition-all"
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

        {/* Task Metadata */}
        <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Created by {task.creator?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDate(task.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
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
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
