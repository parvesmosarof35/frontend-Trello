'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column, Task } from '@/types';
import KanbanColumn from './KanbanColumn';
import DragOverlayTask from './DragOverlayTask';
import api from '@/lib/api';

interface KanbanBoardProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onAddTask: (columnId: string, columnName: string) => void;
  onTaskClick: (task: Task) => void;
  onColumnUpdated: (updatedColumn: Column) => void;
  onColumnDeleted: (columnId: string) => void;
  renderAddColumn?: React.ReactNode;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export default function KanbanBoard({
  columns,
  onColumnsChange,
  onAddTask,
  onTaskClick,
  onColumnUpdated,
  onColumnDeleted,
  renderAddColumn,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before dragging begins
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold for mobile touch dragging
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumnOfTask = (taskId: string): Column | undefined => {
    return columns.find((col) => col.tasks?.some((t) => t.id === taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeCol = findColumnOfTask(activeId);
    const overCol =
      findColumnOfTask(overId) || columns.find((col) => col.id === overId);

    if (!activeCol || !overCol || activeCol.id === overCol.id) {
      return;
    }

    // Move task between columns dynamically during drag hover
    const activeTasks = [...(activeCol.tasks || [])];
    const overTasks = [...(overCol.tasks || [])];

    const activeIndex = activeTasks.findIndex((t) => t.id === activeId);
    if (activeIndex === -1) return;

    const [movingTask] = activeTasks.splice(activeIndex, 1);
    if (!movingTask) return;

    const overIndex = overTasks.findIndex((t) => t.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : overTasks.length;

    const updatedMovingTask = {
      ...movingTask,
      columnId: overCol.id,
    };

    overTasks.splice(insertIndex, 0, updatedMovingTask);

    const newColumns = columns.map((col) => {
      if (col.id === activeCol.id) return { ...col, tasks: activeTasks };
      if (col.id === overCol.id) return { ...col, tasks: overTasks };
      return col;
    });

    onColumnsChange(newColumns);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const currentActiveTask = activeTask;
    setActiveTask(null);

    if (!over || !currentActiveTask) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const targetCol =
      findColumnOfTask(activeId) ||
      findColumnOfTask(overId) ||
      columns.find((col) => col.id === overId);

    if (!targetCol) return;

    const tasksInTarget = targetCol.tasks || [];
    const activeIndex = tasksInTarget.findIndex((t) => t.id === activeId);
    let targetIndex = tasksInTarget.findIndex((t) => t.id === overId);

    if (targetIndex < 0) {
      targetIndex = activeIndex >= 0 ? activeIndex : tasksInTarget.length - 1;
    }
    if (targetIndex < 0) targetIndex = 0;

    if (activeIndex !== -1 && activeIndex !== targetIndex) {
      const reordered = arrayMove(tasksInTarget, activeIndex, targetIndex);
      const updatedColumns = columns.map((col) =>
        col.id === targetCol.id ? { ...col, tasks: reordered } : col,
      );
      onColumnsChange(updatedColumns);
    }

    // Sync position with backend
    try {
      await api.patch(`/tasks/${activeId}/move`, {
        targetColumnId: targetCol.id,
        targetIndex,
      });
    } catch (error) {
      console.error('Failed to sync task position with backend:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex gap-4 items-start overflow-x-auto overflow-y-hidden pb-4 h-full min-h-0 touch-pan-x">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={column.tasks || []}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
            onColumnUpdated={onColumnUpdated}
            onColumnDeleted={onColumnDeleted}
          />
        ))}

        {renderAddColumn}
      </div>

      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeTask ? (
          <div className="pointer-events-none rotate-2 scale-105">
            <DragOverlayTask task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
