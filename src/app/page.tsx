'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  AlignLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Columns,
  Cpu,
  Eye,
  Filter,
  Flag,
  Globe,
  GripVertical,
  ImageIcon,
  Layers,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Radio,
  Search,
  Share2,
  Shield,
  Sparkles,
  Tag,
  UploadCloud,
  Users,
  Zap,
} from 'lucide-react';

const DEMO_USERS = [
  {
    name: 'Parves Mosarof',
    email: 'parves@trello.com',
    role: 'Lead Full-Stack Dev',
    color: 'from-blue-600 to-indigo-600',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    board: '🚀 E-Commerce Platform V2',
  },
  {
    name: 'Rahim Ahmed',
    email: 'rahim@trello.com',
    role: 'Senior Mobile Dev',
    color: 'from-purple-600 to-pink-600',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    board: '📱 Mobile Application',
  },
  {
    name: 'Sarah Jenkins',
    email: 'sarah@trello.com',
    role: 'Lead UI/UX Designer',
    color: 'from-amber-500 to-rose-500',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    board: '🎨 Brand Redesign & Marketing',
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
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'checklist'>('all');

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
        A state-of-the-art Trello alternative built with Next.js 15, NestJS, and PostgreSQL. Features real-time WebSockets synchronization, atomic multi-column drag-and-drop, interactive subtask checklists, and team collaboration.
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

      {/* 1-CLICK INSTANT DEMO LOGIN SECTION */}
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

      {/* INTERACTIVE LIVE KANBAN BOARD PREVIEW */}
      <div className="mt-14 w-full max-w-6xl text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Columns className="w-5 h-5 text-blue-400" />
              Live Interactive Kanban Showcase
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Real-Time Preview
            </span>
          </div>

          {/* Filter Pills Demo */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('high')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'high'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-orange-400'
              }`}
            >
              🔥 High
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'checklist'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
              }`}
            >
              ☑️ Subtasks
            </button>
          </div>
        </div>

        {/* Board Simulation Window */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
          {/* Header toolbar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-white text-base">🚀 E-Commerce Platform V2</h3>
              <span className="text-[11px] px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-medium">
                6 Tasks
              </span>
              <span className="text-[11px] px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Sync Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-slate-900 text-white flex items-center justify-center text-[10px] font-bold">P</div>
                <div className="w-7 h-7 rounded-full bg-purple-600 border-2 border-slate-900 text-white flex items-center justify-center text-[10px] font-bold">R</div>
                <div className="w-7 h-7 rounded-full bg-rose-600 border-2 border-slate-900 text-white flex items-center justify-center text-[10px] font-bold">S</div>
              </div>
            </div>
          </div>

          {/* 3 Interactive Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: To Do */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">To Do</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">2</span>
                </div>
              </div>

              {/* Task 1 */}
              {(activeTab === 'all' || activeTab === 'high' || activeTab === 'checklist') && (
                <div className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl space-y-2.5 shadow-md group transition-all">
                  <div className="relative h-28 w-full rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
                      alt="Product Card"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-200">
                      Attachment
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5 fill-orange-400" /> HIGH
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> In 2 days
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    Design high-converting Product Card UI
                  </h4>

                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-700/40 text-[10px] text-slate-300">Design</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-700/40 text-[10px] text-slate-300">UI/UX</span>
                  </div>

                  {/* Checklist progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium"><CheckSquare className="w-3 h-3 text-blue-400" /> Checklist</span>
                      <span className="text-slate-300 font-semibold">2/3</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full w-[66%]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Sarah Jenkins</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-slate-500" /> 2</span>
                  </div>
                </div>
              )}

              {/* Task 2 */}
              {(activeTab === 'all' || activeTab === 'high') && (
                <div className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl space-y-2.5 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5 fill-red-400" /> URGENT
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Tomorrow
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    Implement Multi-step Checkout with Stripe
                  </h4>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Parves Mosarof</span>
                    <span className="text-slate-500">Backend</span>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: In Progress */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">In Progress</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">2</span>
                </div>
              </div>

              {/* Task 3 */}
              {(activeTab === 'all' || activeTab === 'high' || activeTab === 'checklist') && (
                <div className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl space-y-2.5 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5 fill-orange-400" /> HIGH
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    Build Drag & Drop Kanban Reordering Engine
                  </h4>

                  {/* 100% completed checklist */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-emerald-400"><CheckSquare className="w-3 h-3 text-emerald-400" /> Checklist</span>
                      <span className="text-emerald-400 font-semibold">3/3 Done</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Rahim Ahmed</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-slate-500" /> 1</span>
                  </div>
                </div>
              )}

              {/* Task 4 */}
              {activeTab === 'all' && (
                <div className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl space-y-2.5 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5" /> MEDIUM
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    Setup Cloudinary CDN Image Attachment Pipeline
                  </h4>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Parves Mosarof</span>
                    <span className="text-slate-500">DevOps</span>
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Review & QA */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Review & QA</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">1</span>
                </div>
              </div>

              {/* Task 5: Overdue showcase */}
              {activeTab === 'all' && (
                <div className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-red-500/30 rounded-2xl space-y-2.5 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30 flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5" /> LOW
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Overdue
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    PostgreSQL Database Indexing & Query Tuning
                  </h4>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Alex Chen</span>
                    <span className="text-slate-500">Review</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6 KEY ARCHITECTURE & ENTERPRISE PILLARS */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full text-left">
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
