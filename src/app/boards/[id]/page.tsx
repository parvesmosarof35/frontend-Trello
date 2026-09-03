'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Board, Column, Task } from '@/types';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import EditTaskModal from '@/components/modals/EditTaskModal';
import ShareBoardModal from '@/components/modals/ShareBoardModal';
import {
  ArrowLeft,
  Check,
  Edit2,
  Loader2,
  Plus,
  Search,
  Share2,
  Trash2,
  X,
  Layers,
  Flag,
  Clock,
  CheckSquare,
  MessageSquare,
  Filter,
  Radio,
  Rocket,
  Smartphone,
  Palette,
  LayoutDashboard,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { getSocket } from '@/lib/socket';

const getBoardLucideIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('commerce') || n.includes('launch') || n.includes('v2')) {
    return <Rocket className="w-5 h-5 text-blue-400 shrink-0" />;
  }
  if (n.includes('mobile') || n.includes('app') || n.includes('ios') || n.includes('android')) {
    return <Smartphone className="w-5 h-5 text-purple-400 shrink-0" />;
  }
  if (n.includes('brand') || n.includes('design') || n.includes('marketing')) {
    return <Palette className="w-5 h-5 text-amber-400 shrink-0" />;
  }
  return <LayoutDashboard className="w-5 h-5 text-blue-400 shrink-0" />;
};

type FilterType = 'all' | 'high_priority' | 'overdue' | 'has_subtasks' | 'has_comments';

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const boardId = resolvedParams.id;

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Modals & Editing states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);

  // New Column
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);

  // New Task
  const [activeColumnForTask, setActiveColumnForTask] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Rename Board
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchBoard = async () => {
    try {
      const { data } = await api.get<Board>(`/boards/${boardId}`);
      setBoard(data);
      setBoardTitle(data.name);
      setColumns(data.columns || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load board. You might not have access.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && boardId) {
      fetchBoard();

      // Connect to Real-Time WebSockets Room
      const socket = getSocket();
      socket.emit('joinBoard', boardId);

      const handleBoardEvent = () => {
        // Silently refresh board data when collaborators make changes
        fetchBoard();
      };

      socket.on('board:event', handleBoardEvent);

      return () => {
        socket.emit('leaveBoard', boardId);
        socket.off('board:event', handleBoardEvent);
      };
    }
  }, [user, boardId]);

  const handleUpdateBoardName = async () => {
    if (!boardTitle.trim() || boardTitle === board?.name) {
      setIsEditingBoardTitle(false);
      return;
    }

    try {
      const { data } = await api.patch<Board>(`/boards/${boardId}`, {
        name: boardTitle.trim(),
      });
      setBoard((prev) => (prev ? { ...prev, name: data.name } : null));
      setIsEditingBoardTitle(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to rename board');
    }
  };

  const handleDeleteBoard = async () => {
    if (!confirm('Are you sure you want to permanently delete this board?')) return;
    try {
      await api.delete(`/boards/${boardId}`);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete board');
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    setIsCreatingColumn(true);
    try {
      const { data } = await api.post<Column>(`/boards/${boardId}/columns`, {
        name: newColumnName.trim(),
      });
      setColumns([...columns, { ...data, tasks: [] }]);
      setNewColumnName('');
      setIsAddingColumn(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add column');
    } finally {
      setIsCreatingColumn(false);
    }
  };

  // Filter & Search tasks based on active criteria
  const filteredColumns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const now = new Date().getTime();

    return columns.map((col) => ({
      ...col,
      tasks: (col.tasks || []).filter((t) => {
        // Search query match
        if (q) {
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchLabel = t.labels?.some((l) => l.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchLabel) return false;
        }

        // Active quick filter
        if (activeFilter === 'high_priority') {
          return t.priority === 'HIGH' || t.priority === 'URGENT';
        }
        if (activeFilter === 'overdue') {
          return (
            t.dueDate &&
            new Date(t.dueDate).setHours(23, 59, 59, 999) < now
          );
        }
        if (activeFilter === 'has_subtasks') {
          return (t.subtasks?.length || 0) > 0;
        }
        if (activeFilter === 'has_comments') {
          return (t.comments?.length || 0) > 0;
        }

        return true;
      }),
    }));
  }, [columns, searchQuery, activeFilter]);

  // Quick stats
  const totalTasks = useMemo(() => {
    return columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0);
  }, [columns]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center shadow-xl">
        <p className="text-red-400 font-medium mb-4">{error || 'Board not found'}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const addColumnRender = (
    <div className="w-[290px] sm:w-[325px] shrink-0">
      {isAddingColumn ? (
        <form
          onSubmit={handleAddColumn}
          className="p-4 bg-slate-900/95 border border-blue-500/50 rounded-2xl space-y-3 shadow-xl backdrop-blur-md"
        >
          <input
            type="text"
            autoFocus
            required
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="e.g., In Review, QA, Blocked..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsAddingColumn(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingColumn || !newColumnName.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              {isCreatingColumn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add Column</span>
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingColumn(true)}
          className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900/50 hover:bg-slate-900/80 border border-dashed border-slate-800 hover:border-blue-500/40 rounded-2xl text-xs font-medium text-slate-400 hover:text-white transition-all shadow-sm group backdrop-blur-sm"
        >
          <Plus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>Add Another Column</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col px-3 sm:px-6 lg:px-8 py-3 sm:py-4 overflow-hidden">
      {/* Board Top Header with Title, Stats & Action Toolbar */}
      <div className="flex flex-col gap-3 pb-3 mb-3 border-b border-slate-800/80 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {isEditingBoardTitle ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="text"
                  autoFocus
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateBoardName();
                    if (e.key === 'Escape') setIsEditingBoardTitle(false);
                  }}
                  className="w-full max-w-xs px-2.5 py-1 bg-slate-800 border border-blue-500 rounded-lg text-base sm:text-lg font-bold text-white focus:outline-none"
                />
                <button
                  onClick={handleUpdateBoardName}
                  className="p-1.5 text-green-400 hover:bg-slate-800 rounded-lg shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingBoardTitle(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                {getBoardLucideIcon(board.name)}
                <h1
                  onClick={() => board.isOwner && setIsEditingBoardTitle(true)}
                  className={`text-lg sm:text-xl font-bold text-white tracking-tight truncate ${
                    board.isOwner ? 'cursor-pointer hover:text-blue-400' : ''
                  } transition-colors`}
                >
                  {board.name}
                </h1>
                {board.isOwner && (
                  <button
                    onClick={() => setIsEditingBoardTitle(true)}
                    className="p-1 text-slate-400 hover:text-white shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Info Badges */}
            <div className="hidden sm:flex items-center gap-2 ml-1 shrink-0">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 font-medium">
                {board.isOwner ? 'Owner' : 'Member'}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          {/* Action Controls: Search & Share */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto shrink-0">
            {/* Real-time Task Search Bar */}
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks or labels..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 transition-colors shadow-sm shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Share ({1 + (board.members?.length || 0)})</span>
            </button>

            {board.isOwner && (
              <button
                onClick={handleDeleteBoard}
                title="Delete Board"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1-Click Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Tasks
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('high_priority')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeFilter === 'high_priority'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-orange-400 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>High Priority</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('overdue')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeFilter === 'overdue'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-red-400 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>Overdue</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('has_subtasks')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeFilter === 'has_subtasks'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Checklist</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('has_comments')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeFilter === 'has_comments'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-purple-400 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>Comments</span>
          </button>
        </div>
      </div>

      {/* Main Kanban Board Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <KanbanBoard
          columns={filteredColumns}
          onColumnsChange={setColumns}
          onAddTask={(colId, colName) => setActiveColumnForTask({ id: colId, name: colName })}
          onQuickTaskCreated={(newTask) => {
            setColumns(
              columns.map((col) =>
                col.id === newTask.columnId
                  ? { ...col, tasks: [...(col.tasks || []), { ...newTask, priority: newTask.priority || 'MEDIUM', labels: newTask.labels || [] }] }
                  : col,
              ),
            );
          }}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setIsEditTaskOpen(true);
          }}
          onColumnUpdated={(updatedCol) => {
            setColumns(columns.map((c) => (c.id === updatedCol.id ? { ...c, name: updatedCol.name } : c)));
          }}
          onColumnDeleted={(colId) => {
            setColumns(columns.filter((c) => c.id !== colId));
          }}
          renderAddColumn={addColumnRender}
        />
      </div>

      {/* Share Board Modal */}
      <ShareBoardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        board={board}
        onMembersUpdated={fetchBoard}
      />

      {/* Create Task Modal */}
      {activeColumnForTask && (
        <CreateTaskModal
          isOpen={!!activeColumnForTask}
          onClose={() => setActiveColumnForTask(null)}
          columnId={activeColumnForTask.id}
          columnName={activeColumnForTask.name}
          onTaskCreated={(newTask) => {
            setColumns(
              columns.map((col) =>
                col.id === newTask.columnId
                  ? { ...col, tasks: [...(col.tasks || []), newTask] }
                  : col,
              ),
            );
          }}
        />
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditTaskOpen}
        onClose={() => {
          setIsEditTaskOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskUpdated={(updatedTask) => {
          setColumns(
            columns.map((col) => ({
              ...col,
              tasks: (col.tasks || []).map((t) => (t.id === updatedTask.id ? updatedTask : t)),
            })),
          );
        }}
        onTaskDeleted={(deletedTaskId) => {
          setColumns(
            columns.map((col) => ({
              ...col,
              tasks: (col.tasks || []).filter((t) => t.id !== deletedTaskId),
            })),
          );
        }}
      />
    </div>
  );
}
