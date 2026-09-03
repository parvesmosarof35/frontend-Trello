'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task } from '@/types';
import TaskCard from './TaskCard';
import { Plus, MoreHorizontal, Trash2, Edit2, Check, X, Sparkles, CornerDownLeft } from 'lucide-react';
import api from '@/lib/api';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  allColumns?: Column[];
  onAddTask: (columnId: string, columnName: string) => void;
  onQuickTaskCreated?: (newTask: Task) => void;
  onTaskClick: (task: Task) => void;
  onQuickMove?: (task: Task, targetColumnId: string) => void;
  onColumnUpdated: (updatedColumn: Column) => void;
  onColumnDeleted: (columnId: string) => void;
}

export default function KanbanColumn({
  column,
  tasks = [],
  allColumns = [],
  onAddTask,
  onQuickTaskCreated,
  onTaskClick,
  onQuickMove,
  onColumnUpdated,
  onColumnDeleted,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);

  // Inline quick task addition
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const handleUpdateName = async () => {
    if (!name.trim() || name === column.name) {
      setIsEditing(false);
      return;
    }

    try {
      const { data } = await api.patch<Column>(`/columns/${column.id}`, {
        name: name.trim(),
      });
      onColumnUpdated(data);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update column name');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete column "${column.name}" and all its tasks?`)) return;
    try {
      await api.delete(`/columns/${column.id}`);
      onColumnDeleted(column.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete column');
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsSubmittingQuick(true);
    try {
      const { data } = await api.post<Task>(`/columns/${column.id}/tasks`, {
        title: quickTitle.trim(),
        position: tasks.length,
      });
      if (onQuickTaskCreated) {
        onQuickTaskCreated(data);
      }
      setQuickTitle('');
      setIsQuickAdding(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add quick task');
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const taskIds = safeTasks.map((t) => t.id);

  // Column accent colors based on name heuristics
  const getColumnAccent = (colName: string) => {
    const lower = colName.toLowerCase();
    if (lower.includes('progress') || lower.includes('doing')) return 'from-amber-500 to-orange-500';
    if (lower.includes('done') || lower.includes('complete')) return 'from-emerald-500 to-teal-500';
    if (lower.includes('review') || lower.includes('qa') || lower.includes('test')) return 'from-purple-500 to-indigo-500';
    if (lower.includes('backlog')) return 'from-slate-500 to-slate-400';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <div className="flex flex-col w-[290px] sm:w-[325px] shrink-0 bg-slate-900/95 border border-slate-800/90 rounded-2xl max-h-full shadow-lg shadow-black/20 select-none backdrop-blur-md">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-1 mr-2">
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateName();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-full px-2.5 py-1 bg-slate-800 border border-blue-500 rounded-lg text-sm text-white focus:outline-none ring-2 ring-blue-500/20"
            />
            <button
              onClick={handleUpdateName}
              className="p-1 text-green-400 hover:bg-slate-800 rounded"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-slate-400 hover:bg-slate-800 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${getColumnAccent(column.name)} shadow-sm shrink-0`} />
            <h3
              onClick={() => setIsEditing(true)}
              className="font-semibold text-sm text-slate-100 hover:text-white cursor-pointer transition-colors truncate"
              title="Click to rename"
            >
              {column.name}
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0 shadow-inner">
              {safeTasks.length}
            </span>
          </div>
        )}

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1.5 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-30 text-xs text-slate-200 backdrop-blur-xl animate-in fade-in duration-100">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-800 text-left transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Rename Column</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDelete();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-red-500/10 text-left transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Column</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Droppable Task List */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[140px] max-h-[calc(100vh-250px)] transition-all ${
          isOver
            ? 'bg-blue-600/10 ring-2 ring-blue-500/50 rounded-2xl m-1 scale-[0.99]'
            : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {safeTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              allColumns={allColumns}
              onQuickMove={onQuickMove}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {safeTasks.length === 0 && !isOver && !isQuickAdding && (
          <div className="h-28 border border-dashed border-slate-800/90 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-500 select-none p-3 text-center space-y-1">
            <Sparkles className="w-4 h-4 text-slate-600 mb-0.5" />
            <span className="font-medium text-slate-400">No tasks here yet</span>
            <span className="text-[11px] text-slate-600">Drag a task or click Add Task</span>
          </div>
        )}

        {/* Inline Quick Task Creator */}
        {isQuickAdding && (
          <form
            onSubmit={handleQuickSubmit}
            className="p-3 bg-slate-800 border border-blue-500/50 rounded-2xl shadow-lg space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
          >
            <textarea
              autoFocus
              rows={2}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickSubmit(e);
                }
                if (e.key === 'Escape') setIsQuickAdding(false);
              }}
              placeholder="What needs to be done?"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3 text-slate-500" /> Enter to save
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsQuickAdding(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuick || !quickTitle.trim()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Add Task Options Footer */}
      <div className="p-2.5 border-t border-slate-800/80 flex items-center gap-1.5">
        <button
          onClick={() => setIsQuickAdding(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800/50 hover:bg-slate-800 hover:text-white border border-slate-700/40 hover:border-slate-600 rounded-xl text-xs font-medium text-slate-300 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>Quick Task</span>
        </button>

        <button
          onClick={() => onAddTask(column.id, column.name)}
          title="Full task details & image upload"
          className="px-2.5 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-700/40 rounded-xl text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
