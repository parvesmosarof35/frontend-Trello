'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import api from '@/lib/api';
import { Comment, Priority, Subtask, Task } from '@/types';
import {
  Calendar,
  Check,
  CheckSquare,
  Flag,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  User as UserIcon,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { uploadToCloudinary } from '@/lib/cloudinary';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import toast from 'react-hot-toast';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

const PRESET_LABELS = ['Bug', 'Feature', 'Design', 'Backend', 'DevOps', 'Urgent'];

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
  onTaskDeleted,
}: EditTaskModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments'>('details');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [customLabel, setCustomLabel] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subtasks state
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'MEDIUM');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setSelectedLabels(task.labels || []);
      setImageUrl(task.imageUrl || null);
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
      setError('');
      setActiveTab('details');
    }
  }, [task]);

  if (!task) return null;

  const toggleLabel = (lbl: string) => {
    if (selectedLabels.includes(lbl)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== lbl));
    } else {
      setSelectedLabels([...selectedLabels, lbl]);
    }
  };

  const handleAddCustomLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customLabel.trim()) {
      e.preventDefault();
      if (!selectedLabels.includes(customLabel.trim())) {
        setSelectedLabels([...selectedLabels, customLabel.trim()]);
      }
      setCustomLabel('');
    }
  };

  // Subtask Handlers
  const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
    const updated = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: !currentStatus } : st,
    );
    setSubtasks(updated);

    try {
      await api.patch(`/tasks/${task.id}/subtasks/${subtaskId}`, {
        isCompleted: !currentStatus,
      });
      onTaskUpdated({ ...task, subtasks: updated });
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setIsAddingSubtask(true);
    try {
      const { data } = await api.post<Subtask>(`/tasks/${task.id}/subtasks`, {
        title: newSubtaskTitle.trim(),
      });
      const updated = [...subtasks, data];
      setSubtasks(updated);
      setNewSubtaskTitle('');
      onTaskUpdated({ ...task, subtasks: updated });
      toast.success('Checklist item added');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add subtask');
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const updated = subtasks.filter((st) => st.id !== subtaskId);
    setSubtasks(updated);

    try {
      await api.delete(`/tasks/${task.id}/subtasks/${subtaskId}`);
      onTaskUpdated({ ...task, subtasks: updated });
      toast.success('Checklist item deleted');
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  // Comment Handlers
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const { data } = await api.post<Comment>(`/tasks/${task.id}/comments`, {
        content: newComment.trim(),
      });
      const updated = [...comments, data];
      setComments(updated);
      setNewComment('');
      onTaskUpdated({ ...task, comments: updated });
      toast.success('Comment posted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);

    try {
      await api.delete(`/tasks/${task.id}/comments/${commentId}`);
      onTaskUpdated({ ...task, comments: updated });
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

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
      toast.success('Cover image attached');
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
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        labels: selectedLabels,
      });
      onTaskUpdated({ ...data, subtasks, comments });
      toast.success('Task saved successfully');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeleteTask = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${task.id}`);
      onTaskDeleted(task.id);
      toast.success('Task deleted successfully');
      setIsDeleteModalOpen(false);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  // Subtask progress
  const completedSubtasks = subtasks.filter((st) => st.isCompleted).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Task Management" maxWidth="lg">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'details'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Details & Priority
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('subtasks')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'subtasks'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Checklist ({completedSubtasks}/{subtasks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'comments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments ({comments.length})</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* TAB 1: DETAILS & PRIORITY */}
          {activeTab === 'details' && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Cover Image Banner */}
              {imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 group shadow-md">
                  <img
                    src={imageUrl}
                    alt="Task attachment"
                    className="w-full h-40 object-cover"
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

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              {/* Priority & Due Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Priority Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5 text-blue-400" />
                    <span>Priority</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700">
                    {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map((p) => {
                      const isSelected = priority === p;
                      let activeColor = 'bg-blue-600 text-white';
                      if (p === 'LOW') activeColor = 'bg-slate-600 text-white';
                      if (p === 'HIGH') activeColor = 'bg-orange-600 text-white';
                      if (p === 'URGENT') activeColor = 'bg-red-600 text-white';

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`py-1.5 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                            isSelected
                              ? `${activeColor} shadow-md`
                              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                          }`}
                        >
                          {p.toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Due Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Due Date</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Labels */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Labels</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {PRESET_LABELS.map((lbl) => {
                    const isSelected = selectedLabels.includes(lbl);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => toggleLabel(lbl)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                            : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  onKeyDown={handleAddCustomLabel}
                  placeholder="Add custom label (press Enter)..."
                  className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add detailed task description..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none"
                />
              </div>

              {/* Attach Cover Image */}
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Task</span>
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
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SUBTASKS CHECKLIST */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                    Checklist Progress
                  </span>
                  <span>{completedSubtasks} of {subtasks.length} completed ({subtaskProgress}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
              </div>

              {/* Subtask Item List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl group transition-colors"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 mr-2">
                      <input
                        type="checkbox"
                        checked={st.isCompleted}
                        onChange={() => handleToggleSubtask(st.id, st.isCompleted)}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 shrink-0 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium truncate ${
                          st.isCompleted
                            ? 'line-through text-slate-500'
                            : 'text-slate-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {subtasks.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No subtasks added yet. Break down this task into smaller items!
                  </div>
                )}
              </div>

              {/* Add Subtask Form */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new checklist item..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-colors"
                >
                  {isAddingSubtask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: COMMENTS & ACTIVITY */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Comments Stream */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
                          {c.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs font-semibold text-slate-200">
                          {c.author?.name || 'User'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {formatDate(c.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 rounded transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-7">
                      {c.content}
                    </p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No comments yet. Start the conversation with your team!
                  </div>
                )}
              </div>

              {/* Post Comment Input */}
              <form onSubmit={handlePostComment} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isPostingComment || !newComment.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-colors"
                >
                  {isPostingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </Modal>

      {/* Modern Confirm Delete Task Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteTask}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This task, its subtasks, and comments will be permanently removed.`}
        confirmText="Delete Task"
        isLoading={isDeleting}
      />
    </>
  );
}
