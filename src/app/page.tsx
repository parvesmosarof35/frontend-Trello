'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ArrowRight,
  CheckSquare,
  Columns,
  Filter,
  Loader2,
  Radio,
  Shield,
  Sparkles,
  UploadCloud,
  Zap,
} from 'lucide-react';

const DEMO_USERS = [
  {
    name: 'Parves Mosarof',
    email: 'parves@trello.com',
    role: 'Lead Full-Stack Dev',
    color: 'from-blue-600 to-indigo-600',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    board: 'E-Commerce Platform V2',
  },
  {
    name: 'Rahim Ahmed',
    email: 'rahim@trello.com',
    role: 'Senior Mobile Dev',
    color: 'from-purple-600 to-pink-600',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    board: 'Mobile Application',
  },
  {
    name: 'Sarah Jenkins',
    email: 'sarah@trello.com',
    role: 'Lead UI/UX Designer',
    color: 'from-amber-500 to-rose-500',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    board: 'Brand Redesign & Marketing',
  },
  {
    name: 'Alex Chen',
    email: 'alex@trello.com',
    role: 'DevOps & Cloud Engineer',
    color: 'from-emerald-600 to-teal-600',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    board: 'Collaborator across all boards',
  },
];

export default function Home() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [loggingInUser, setLoggingInUser] = useState<string | null>(null);

  const handleQuickDemoLogin = async (email: string) => {
    setLoggingInUser(email);
    try {
      await login(email, 'password123');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Demo login failed');
    } finally {
      setLoggingInUser(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center px-4 py-12 sm:py-16 text-center max-w-7xl mx-auto overflow-hidden">
      {/* Top Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>Enterprise Kanban Suite with Real-Time WebSockets Sync</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
        Collaborate, organize, and{' '}
        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          ship projects faster
        </span>
      </h1>

      {/* Subheading */}
      <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
        A state-of-the-art Trello alternative built with Next.js 15, NestJS, and PostgreSQL. Features real-time WebSockets synchronization, atomic multi-column drag-and-drop, interactive subtask checklists, and granular role permissions.
      </p>

      {/* Primary Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
        {user ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 transition-all text-sm group"
          >
            <span>Go to My Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <>
            <Link
              href="/register"
              className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 transition-all text-sm group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold rounded-2xl transition-colors text-sm shadow-md"
            >
              Sign In with Email
            </Link>
          </>
        )}
      </div>

      {/* 1-CLICK INSTANT DEMO LOGIN BAR */}
      <div className="mt-12 w-full max-w-4xl p-6 bg-slate-900/90 border border-slate-800/90 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-left border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-blue-400" />
              1-Click Instant Demo Login
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any pre-configured team account to test live boards instantly without registering:
            </p>
          </div>
          <span className="text-[11px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full shrink-0 border border-slate-700">
            Password: <code className="text-blue-300 font-mono">password123</code>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          {DEMO_USERS.map((u) => {
            const isLoggingIn = loggingInUser === u.email;
            return (
              <button
                key={u.email}
                type="button"
                onClick={() => handleQuickDemoLogin(u.email)}
                disabled={!!loggingInUser}
                className="flex items-center gap-3 p-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-2xl transition-all group disabled:opacity-50"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${u.color} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md`}>
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                      {u.name}
                    </p>
                    {isLoggingIn && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6 KEY ARCHITECTURE & ENTERPRISE PILLARS */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full text-left">
        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl hover:border-blue-500/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1.5">WebSockets Live Sync</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time multi-user synchronization powered by Socket.io. Any change made by your teammates reflects immediately without page reloads.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl hover:border-indigo-500/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
            <Columns className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1.5">Smooth Drag & Drop</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built with @dnd-kit and transactional PostgreSQL moves. Supports desktop mouse drag, touch hold-and-drag, and 1-tap quick move menus.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl hover:border-emerald-500/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1.5">Interactive Subtasks</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Break large tasks into checklist items with animated live progress bars and instant completion percentages right on the cards.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl hover:border-purple-500/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1.5">Cloudinary CDN Attachments</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct unsigned image cover uploads with automatic CDN optimization, glassmorphic badges, and zoom preview micro-animations.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl hover:border-amber-500/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1.5">1-Click Filter Pills</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instantly filter cards by High Priority, Overdue Deadlines, Checklists, or Comments with 1 click alongside real-time search.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl hover:border-rose-500/40 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1.5">JWT & Role-Based Access</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bcrypt hashed security with granular board member roles (OWNER, MEMBER, VIEWER) and strict backend authorization guards.
          </p>
        </div>
      </div>
    </div>
  );
}
