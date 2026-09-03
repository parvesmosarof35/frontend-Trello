'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
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
}

export default function KanbanBoard({
  columns,
  onColumnsChange,
  onAddTask,
  onTaskClick,
  onColumnUpdated,
  onColumnDeleted,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Avoid accidental drags when clicking
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

    const activeId = active.id as string;
    const overId = over.id as string;

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
    const movingTask = activeTasks[activeIndex];

    if (!movingTask) return;

    // Remove from active column
    activeTasks.splice(activeIndex, 1);

    // Insert into over column
    const overIndex = overTasks.findIndex((t) => t.id === overId);
    const newIndex = overIndex >= 0 ? overIndex : overTasks.length;

    const updatedMovingTask = {
      ...movingTask,
      columnId: overCol.id,
    };

    overTasks.splice(newIndex, 0, updatedMovingTask);

    const newColumns = columns.map((col) => {
      if (col.id === activeCol.id) return { ...col, tasks: activeTasks };
      if (col.id === overCol.id) return { ...col, tasks: overTasks };
      return col;
    });

    onColumnsChange(newColumns);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnOfTask(activeId);
    const overCol =
      findColumnOfTask(overId) || columns.find((col) => col.id === overId);

    if (!activeCol || !overCol) return;

    const sourceColId = activeCol.id;
    const targetColId = overCol.id;

    const tasksInTarget = overCol.tasks || [];
    const activeIndex = (activeCol.tasks || []).findIndex((t) => t.id === activeId);
    let targetIndex = tasksInTarget.findIndex((t) => t.id === overId);

    if (targetIndex < 0) {
      targetIndex = tasksInTarget.length > 0 ? tasksInTarget.length - 1 : 0;
    }

    if (sourceColId === targetColId) {
      if (activeIndex !== targetIndex && activeIndex >= 0 && targetIndex >= 0) {
        const reorderedTasks = arrayMove(tasksInTarget, activeIndex, targetIndex);
        const updatedColumns = columns.map((col) =>
          col.id === targetColId ? { ...col, tasks: reorderedTasks } : col,
        );
        onColumnsChange(updatedColumns);

        try {
          await api.patch(`/tasks/${activeId}/move`, {
            targetColumnId: targetColId,
            targetIndex,
          });
        } catch (error) {
          console.error('Failed to persist task reorder:', error);
        }
      }
    } else {
      // Cross column drop
      try {
        await api.patch(`/tasks/${activeId}/move`, {
          targetColumnId: targetColId,
          targetIndex,
        });
      } catch (error) {
        console.error('Failed to persist cross-column task move:', error);
      }
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
      <div className="flex gap-4 items-start overflow-x-auto pb-4 h-[calc(100vh-140px)]">
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
      </div>

      <DragOverlay>
        {activeTask ? <DragOverlayTask task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
