'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task } from '@/types';
import TaskCard from './TaskCard';
import { Plus, MoreHorizontal, Trash2, Edit2, Check, X } from 'lucide-react';
import api from '@/lib/api';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  allColumns?: Column[];
  onAddTask: (columnId: string, columnName: string) => void;
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
  onTaskClick,
  onQuickMove,
  onColumnUpdated,
  onColumnDeleted,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);

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

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const taskIds = safeTasks.map((t) => t.id);

  return (
    <div className="flex flex-col w-[280px] sm:w-[320px] shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl max-h-full shadow-md select-none">
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
              className="w-full px-2 py-1 bg-slate-800 border border-blue-500 rounded-lg text-sm text-white focus:outline-none"
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
          <div className="flex items-center gap-2 min-w-0">
            <h3
              onClick={() => setIsEditing(true)}
              className="font-semibold text-sm text-slate-200 hover:text-white cursor-pointer transition-colors truncate"
            >
              {column.name}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50 shrink-0">
              {safeTasks.length}
            </span>
          </div>
        )}

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-20 text-xs text-slate-200">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-700/60 text-left transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
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
        className={`flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[140px] max-h-[calc(100vh-250px)] transition-colors ${
          isOver ? 'bg-blue-500/5 ring-1 ring-blue-500/40 rounded-xl m-1' : ''
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

        {safeTasks.length === 0 && !isOver && (
          <div className="h-24 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 select-none">
            Drop task here
          </div>
        )}
      </div>

      {/* Add Task Button Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => onAddTask(column.id, column.name)}
          className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
