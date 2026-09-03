'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Board } from '@/types';
import Link from 'next/link';
import CreateBoardModal from '@/components/modals/CreateBoardModal';
import {
  Columns,
  FolderPlus,
  LayoutDashboard,
  Loader2,
  Plus,
  Shield,
  Sparkles,
  Users,
  Rocket,
  Smartphone,
  Palette,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const getBoardIcon = (name: string) => {
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

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchBoards = async () => {
    try {
      const { data } = await api.get<Board[]>('/boards');
      setBoards(data);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBoards();
    }
  }, [user]);

  if (authLoading || (!user && isLoading)) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const ownedBoards = boards.filter((b) => b.ownerId === user?.id);
  const sharedBoards = boards.filter((b) => b.ownerId !== user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {user?.name}</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your project boards and collaborate with your team.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Board</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Boards</p>
            <p className="text-2xl font-bold text-white">{boards.length}</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Boards</p>
            <p className="text-2xl font-bold text-white">{ownedBoards.length}</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shared Boards</p>
            <p className="text-2xl font-bold text-white">{sharedBoards.length}</p>
          </div>
        </div>
      </div>

      {/* Boards Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Owned Boards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">My Boards ({ownedBoards.length})</h2>
            </div>

            {ownedBoards.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
                <FolderPlus className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-300">You haven't created any boards yet</p>
                <p className="text-xs text-slate-500 mt-1">Get started by creating your first Kanban workspace</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-colors"
                >
                  + Create Board
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ownedBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between h-44"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getBoardIcon(board.name)}
                          <h3 className="font-semibold text-white group-hover:text-blue-400 text-base transition-colors line-clamp-1">
                            {board.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0">
                          Owner
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {board.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Columns className="w-3.5 h-3.5 text-slate-500" />
                        <span>{board._count?.columns || 0} columns</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{1 + (board.members?.length || 0)} members</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Shared Boards */}
          {sharedBoards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Shared with Me ({sharedBoards.length})</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sharedBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between h-44"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getBoardIcon(board.name)}
                          <h3 className="font-semibold text-white group-hover:text-purple-400 text-base transition-colors line-clamp-1">
                            {board.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full shrink-0">
                          Shared
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {board.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <span className="text-slate-400">
                        Owner: <strong className="text-slate-300">{board.owner?.name}</strong>
                      </span>
                      <span>{formatDate(board.updatedAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBoardCreated={(newBoard) => {
          setBoards([newBoard, ...boards]);
          router.push(`/boards/${newBoard.id}`);
        }}
      />
    </div>
  );
}
