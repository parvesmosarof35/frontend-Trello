'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  closestCorners,
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
  const [mounted, setMounted] = useState(false);
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const lastOverId = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeTask) {
      setLocalColumns(columns);
    }
  }, [columns, activeTask]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const customCollisionDetection: CollisionDetection = (args) => {
    try {
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions && pointerCollisions.length > 0) {
        return pointerCollisions;
      }
      const rectCollisions = rectIntersection(args);
      if (rectCollisions && rectCollisions.length > 0) {
        return rectCollisions;
      }
      const cornerCollisions = closestCorners(args);
      if (cornerCollisions && cornerCollisions.length > 0) {
        return cornerCollisions;
      }
      const firstCollision = getFirstCollision(rectCollisions || [], 'id');
      return firstCollision ? [{ id: firstCollision }] : [];
    } catch {
      return [];
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    try {
      const { active } = event;
      const task = active.data.current?.task as Task | undefined;
      if (task) {
        setActiveTask(task);
      } else {
        const found = localColumns
          .flatMap((c) => c.tasks || [])
          .find((t) => t && String(t.id) === String(active.id));
        if (found) setActiveTask(found);
      }
    } catch (err) {
      console.error('Error starting drag:', err);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    try {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeId === overId) return;
      if (lastOverId.current === overId) return;

      setLocalColumns((prevCols) => {
        const sourceCol = prevCols.find((c) =>
          (c.tasks || []).some((t) => t && String(t.id) === activeId),
        );
        const destCol =
          prevCols.find((c) =>
            (c.tasks || []).some((t) => t && String(t.id) === overId),
          ) || prevCols.find((c) => String(c.id) === overId);

        if (!sourceCol || !destCol || sourceCol.id === destCol.id) return prevCols;

        lastOverId.current = overId;

        const sourceTasks = [...(sourceCol.tasks || [])];
        const destTasks = [...(destCol.tasks || [])];

        const activeIndex = sourceTasks.findIndex(
          (t) => t && String(t.id) === activeId,
        );
        if (activeIndex === -1) return prevCols;

        const [movingTask] = sourceTasks.splice(activeIndex, 1);
        if (!movingTask) return prevCols;

        const overIndex = destTasks.findIndex(
          (t) => t && String(t.id) === overId,
        );
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
    } catch (err) {
      console.error('Error during drag over:', err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    try {
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
        localColumns.find((c) =>
          (c.tasks || []).some((t) => t && String(t.id) === activeId),
        ) ||
        localColumns.find((c) =>
          (c.tasks || []).some((t) => t && String(t.id) === overId),
        ) ||
        localColumns.find((c) => String(c.id) === overId);

      if (!targetCol) {
        setLocalColumns(columns);
        return;
      }

      const targetTasks = [...(targetCol.tasks || [])];
      const activeIndex = targetTasks.findIndex(
        (t) => t && String(t.id) === activeId,
      );
      let targetIndex = targetTasks.findIndex(
        (t) => t && String(t.id) === overId,
      );

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

      await api.patch(`/tasks/${activeId}/move`, {
        targetColumnId: targetCol.id,
        targetIndex,
      });
    } catch (error) {
      console.error('Failed to sync task move to backend:', error);
    }
  };

  const handleQuickMove = async (task: Task, targetColumnId: string) => {
    if (!task || task.columnId === targetColumnId) return;

    try {
      const sourceCol = localColumns.find((c) => c.id === task.columnId);
      const destCol = localColumns.find((c) => c.id === targetColumnId);
      if (!sourceCol || !destCol) return;

      const sourceTasks = (sourceCol.tasks || []).filter((t) => t && t.id !== task.id);
      const destTasks = [...(destCol.tasks || []), { ...task, columnId: targetColumnId }];

      const updated = localColumns.map((c) => {
        if (c.id === sourceCol.id) return { ...c, tasks: sourceTasks };
        if (c.id === destCol.id) return { ...c, tasks: destTasks };
        return c;
      });

      setLocalColumns(updated);
      onColumnsChange(updated);

      await api.patch(`/tasks/${task.id}/move`, {
        targetColumnId,
        targetIndex: destTasks.length - 1,
      });
    } catch (err) {
      console.error('Failed to quick move task:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex gap-4 items-start overflow-x-auto overflow-y-hidden pb-4 h-full min-h-0 select-none">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={column.tasks || []}
            allColumns={columns}
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
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveTask(null);
        setLocalColumns(columns);
      }}
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
