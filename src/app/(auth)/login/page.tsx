'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2, Lock, Mail, Trello, Sparkles, User, ArrowRight } from 'lucide-react';

const DEMO_USERS = [
  {
    name: 'Parves Mosarof',
    email: 'parves@trello.com',
    password: 'password123',
    role: 'Full-Stack Lead',
    avatarColor: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    name: 'Rahim Ahmed',
    email: 'rahim@trello.com',
    password: 'password123',
    role: 'Senior Mobile Dev',
    avatarColor: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    name: 'Sarah Jenkins',
    email: 'sarah@trello.com',
    password: 'password123',
    role: 'Lead UI/UX Designer',
    avatarColor: 'from-purple-500 to-pink-600',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    name: 'Alex Chen',
    email: 'alex@trello.com',
    password: 'password123',
    role: 'DevOps & Cloud',
    avatarColor: 'from-sky-500 to-cyan-600',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserEmail, setLoadingUserEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    if (!loginEmail || !loginPass) return;

    setIsLoading(true);
    setError('');

    try {
      await login(loginEmail.trim(), loginPass);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingUserEmail(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  const handleQuickLogin = async (demoUser: (typeof DEMO_USERS)[0]) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setLoadingUserEmail(demoUser.email);
    await handleLogin(demoUser.email, demoUser.password);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <Trello className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your boards and tasks</p>
        </div>

        {/* Demo Accounts Quick Login */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Demo Accounts (1-Click Login)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_USERS.map((user) => {
              const isThisLoading = isLoading && loadingUserEmail === user.email;
              return (
                <button
                  key={user.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin(user)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-slate-600 transition-all text-left group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {user.role}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-1">
                    {isThisLoading ? (
                      <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 shrink-0">
            or sign in with email
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all mt-2"
          >
            {isLoading && !loadingUserEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

