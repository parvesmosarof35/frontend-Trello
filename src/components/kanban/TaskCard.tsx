'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { AlignLeft, Calendar, GripVertical } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-blue-950/40 border-2 border-dashed border-blue-500/80 rounded-xl min-h-[96px] w-full"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group relative bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-grab active:cursor-grabbing select-none"
    >
      {/* Cover Image Banner */}
      {task.imageUrl && (
        <div className="h-28 w-full overflow-hidden bg-slate-900/60 border-b border-slate-700/50">
          <img
            src={task.imageUrl}
            alt={task.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-slate-100 leading-snug line-clamp-2">
            {task.title}
          </h4>

          <div className="p-0.5 text-slate-500 group-hover:text-slate-300 transition-colors">
            <GripVertical className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {task.description && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <AlignLeft className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <p className="truncate">{task.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px]">
              {task.creator?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="truncate max-w-[90px]">{task.creator?.name || 'User'}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{formatDate(task.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
