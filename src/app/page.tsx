'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Columns, Shield, Sparkles, Users } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-4 py-16 text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8 animate-fade-in">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Modern Agile Kanban Experience</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
        Collaborate, organize, and{' '}
        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ship projects faster
        </span>
      </h1>

      <p className="mt-6 text-lg text-slate-400 max-w-xl">
        A seamless Kanban board designed for speed, order consistency, team sharing, and intuitive drag-and-drop workflow management.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/register"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all group"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-medium rounded-xl transition-colors"
        >
          Sign In
        </Link>
      </div>

      {/* Feature Pills */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full text-left">
        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
            <Columns className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-base mb-1">Smooth Drag & Drop</h3>
          <p className="text-sm text-slate-400">
            Powered by dnd-kit for seamless multi-column task reordering and instant atomic updates.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-base mb-1">Team Collaboration</h3>
          <p className="text-sm text-slate-400">
            Share boards with teammates via email and manage permissions with granular access control.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-base mb-1">Robust Security</h3>
          <p className="text-sm text-slate-400">
            Enforced JWT authentication, bcrypt password hashing, and strict backend authorization.
          </p>
        </div>
      </div>
    </div>
  );
}
