'use client';

import React from 'react';
import { Task } from '@/types';
import { GripVertical, AlignLeft, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DragOverlayTask({ task }: { task: Task }) {
  return (
    <div className="bg-slate-800 border-2 border-blue-500 rounded-xl overflow-hidden shadow-2xl scale-105 rotate-2 cursor-grabbing select-none text-slate-100 w-[280px]">
      {task.imageUrl && (
        <div className="h-28 w-full overflow-hidden bg-slate-900 border-b border-slate-700">
          <img
            src={task.imageUrl}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-white leading-snug line-clamp-2">
            {task.title}
          </h4>
          <div className="p-1 text-blue-400">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>

        {task.description && (
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <p className="truncate">{task.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[9px]">
              {task.creator?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="truncate max-w-[90px]">{task.creator?.name || 'User'}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
