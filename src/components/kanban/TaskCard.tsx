'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task } from '@/types';
import {
  AlignLeft,
  Calendar,
  GripVertical,
  MoreVertical,
  ArrowRight,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  allColumns?: Column[];
  onQuickMove?: (task: Task, targetColumnId: string) => void;
  onClick: () => void;
}

export default function TaskCard({
  task,
  allColumns = [],
  onQuickMove,
  onClick,
}: TaskCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

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

  const otherColumns = allColumns.filter((c) => c.id !== task.columnId);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-blue-500/10 border-2 border-dashed border-blue-500/60 rounded-2xl min-h-[100px] w-full shadow-inner"
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
      className="group relative bg-slate-800/80 hover:bg-slate-800/95 border border-slate-700/60 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 rounded-2xl overflow-visible transition-all duration-200 cursor-grab active:cursor-grabbing select-none backdrop-blur-sm"
    >
      {/* Cover Image Banner with subtle overlay & zoom */}
      {task.imageUrl && (
        <div className="relative h-32 w-full overflow-hidden bg-slate-900/80 rounded-t-2xl border-b border-slate-700/40">
          <img
            src={task.imageUrl}
            alt={task.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-medium text-slate-200">
            <ImageIcon className="w-3 h-3 text-blue-400" />
            <span>Attachment</span>
          </div>
        </div>
      )}

      <div className="p-3.5 space-y-2.5">
        {/* Title & Quick Move Menu */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white leading-snug line-clamp-2 transition-colors">
            {task.title}
          </h4>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Quick Move Trigger for Mobile & Desktop */}
            {otherColumns.length > 0 && onQuickMove && (
              <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveMenu(!showMoveMenu);
                  }}
                  title="Move to another column"
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {showMoveMenu && (
                  <div
                    className="absolute right-0 top-7 w-48 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-40 text-xs text-slate-200 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                      Move to column
                    </div>
                    <div className="py-1">
                      {otherColumns.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMoveMenu(false);
                            onQuickMove(task, col.id);
                          }}
                          className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-blue-600 hover:text-white text-left text-slate-300 transition-colors"
                        >
                          <span className="truncate">{col.name}</span>
                          <ArrowRight className="w-3 h-3 opacity-60 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
              <GripVertical className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Task Description Preview */}
        {task.description && (
          <div className="flex items-start gap-1.5 text-xs text-slate-400">
            <AlignLeft className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed text-slate-400/90">{task.description}</p>
          </div>
        )}

        {/* Card Footer: Creator Avatar & Date */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm ring-1 ring-white/10">
              {task.creator?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="truncate max-w-[100px] font-medium text-slate-300">
              {task.creator?.name || 'User'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 bg-slate-900/40 px-2 py-0.5 rounded-md border border-slate-800">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{formatDate(task.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
