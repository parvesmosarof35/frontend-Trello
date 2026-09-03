'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, LogOut, Trello, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-2.5 font-bold text-lg sm:text-xl text-white tracking-tight group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Trello className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Mini Trello
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="hidden sm:block h-5 w-[1px] bg-slate-800" />

            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/80 pl-1.5 pr-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-slate-700/50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] md:max-w-[150px] truncate" title={user.name}>
                {user.name}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md shadow-blue-500/20 transition-colors whitespace-nowrap"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
