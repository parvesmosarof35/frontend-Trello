'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
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
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  getFirstCollision,
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
  onQuickTaskCreated?: (newTask: Task) => void;
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
  onQuickTaskCreated,
  onTaskClick,
  onColumnUpdated,
  onColumnDeleted,
  renderAddColumn,
}: KanbanBoardProps) {
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const activeColIdRef = useRef<string | null>(null);
  const lastOverId = useRef<string | null>(null);

  useEffect(() => {
    if (!activeTask) {
      setLocalColumns(columns);
    }
  }, [columns, activeTask]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumnOfTask = (
    taskId: string,
    cols: Column[] = localColumns,
  ): Column | undefined => {
    return cols.find((col) => (col.tasks || []).some((t) => t.id === taskId));
  };

  const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }
    const firstCollision = getFirstCollision(rectCollisions, 'id');
    return firstCollision ? [{ id: firstCollision }] : [];
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task;
    if (task) {
      setActiveTask(task);
      const col = findColumnOfTask(String(active.id));
      activeColIdRef.current = col ? col.id : null;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeCol = findColumnOfTask(activeId, localColumns);
    const overCol =
      findColumnOfTask(overId, localColumns) ||
      localColumns.find((c) => c.id === overId);

    if (!activeCol || !overCol) return;

    if (activeCol.id !== overCol.id) {
      if (lastOverId.current === overId) return;
      lastOverId.current = overId;

      setLocalColumns((prevCols) => {
        const sourceCol = prevCols.find((c) => c.id === activeCol.id);
        const destCol = prevCols.find((c) => c.id === overCol.id);

        if (!sourceCol || !destCol) return prevCols;

        const sourceTasks = [...(sourceCol.tasks || [])];
        const destTasks = [...(destCol.tasks || [])];

        const activeIndex = sourceTasks.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return prevCols;

        const [movingTask] = sourceTasks.splice(activeIndex, 1);
        const overIndex = destTasks.findIndex((t) => t.id === overId);
        const newIndex = overIndex >= 0 ? overIndex : destTasks.length;

        const updatedMovingTask = {
          ...movingTask,
          columnId: destCol.id,
        };

        destTasks.splice(newIndex, 0, updatedMovingTask);

        return prevCols.map((c) => {
          if (c.id === sourceCol.id) return { ...c, tasks: sourceTasks };
          if (c.id === destCol.id) return { ...c, tasks: destTasks };
          return c;
        });
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const movingTask = activeTask;
    setActiveTask(null);
    lastOverId.current = null;

    if (!over || !movingTask) {
      setLocalColumns(columns);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const targetCol =
      findColumnOfTask(activeId, localColumns) ||
      findColumnOfTask(overId, localColumns) ||
      localColumns.find((c) => c.id === overId);

    if (!targetCol) {
      setLocalColumns(columns);
      return;
    }

    const targetTasks = [...(targetCol.tasks || [])];
    const activeIndex = targetTasks.findIndex((t) => t.id === activeId);
    let targetIndex = targetTasks.findIndex((t) => t.id === overId);

    if (targetIndex < 0) {
      targetIndex = activeIndex >= 0 ? activeIndex : targetTasks.length - 1;
    }
    if (targetIndex < 0) targetIndex = 0;

    let finalColumns = localColumns;

    if (activeIndex !== -1 && activeIndex !== targetIndex) {
      const reordered = arrayMove(targetTasks, activeIndex, targetIndex);
      finalColumns = localColumns.map((col) =>
        col.id === targetCol.id ? { ...col, tasks: reordered } : col,
      );
      setLocalColumns(finalColumns);
    }

    onColumnsChange(finalColumns);

    try {
      await api.patch(`/tasks/${activeId}/move`, {
        targetColumnId: targetCol.id,
        targetIndex,
      });
    } catch (error) {
      console.error('Failed to sync task move to backend:', error);
    }
  };

  const handleQuickMove = async (task: Task, targetColumnId: string) => {
    if (task.columnId === targetColumnId) return;

    const sourceCol = localColumns.find((c) => c.id === task.columnId);
    const destCol = localColumns.find((c) => c.id === targetColumnId);
    if (!sourceCol || !destCol) return;

    const sourceTasks = (sourceCol.tasks || []).filter((t) => t.id !== task.id);
    const destTasks = [...(destCol.tasks || []), { ...task, columnId: targetColumnId }];

    const updated = localColumns.map((c) => {
      if (c.id === sourceCol.id) return { ...c, tasks: sourceTasks };
      if (c.id === destCol.id) return { ...c, tasks: destTasks };
      return c;
    });

    setLocalColumns(updated);
    onColumnsChange(updated);

    try {
      await api.patch(`/tasks/${task.id}/move`, {
        targetColumnId,
        targetIndex: destTasks.length - 1,
      });
    } catch (err) {
      console.error('Failed to quick move task:', err);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex gap-4 items-start overflow-x-auto overflow-y-hidden pb-4 h-full min-h-0 touch-pan-x select-none">
        {localColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={column.tasks || []}
            allColumns={localColumns}
            onAddTask={onAddTask}
            onQuickTaskCreated={onQuickTaskCreated}
            onTaskClick={onTaskClick}
            onQuickMove={handleQuickMove}
            onColumnUpdated={onColumnUpdated}
            onColumnDeleted={onColumnDeleted}
          />
        ))}

        {renderAddColumn}
      </div>

      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeTask ? (
          <div className="pointer-events-none rotate-1 scale-105 opacity-95 shadow-2xl">
            <DragOverlayTask task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
