import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Lock, Mail, ArrowRight, Compass } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/projects';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from === '/login' ? '/projects' : from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-canvas flex flex-col justify-between min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl border border-white/40 bg-white/10 flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-inner">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-serif text-xl font-normal tracking-wide text-white">
            Rebalance<span className="italic font-light opacity-90">X</span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs text-white/80 hover:text-white transition px-3.5 py-1.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5"
        >
          &larr; Back to Overview
        </Link>
      </div>

      {/* Main Form Center */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md my-auto z-10 py-6">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-8 rounded-3xl border border-white/40 shadow-2xl space-y-6">
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#202724]/10 text-[#202724] border border-[#202724]/15">
              Secure Access
            </span>
            <h1 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
              Sign in to <span className="italic font-light">RebalanceX</span>
            </h1>
            <p className="text-xs text-slate-600">
              Enter your work email and password to access authorized projects.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-slate-800 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-between p-2 pl-4 pr-2 bg-[#202724] hover:bg-[#2D3732] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign in to Workspace'}</span>
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Role permissions and project allocations are verified at sign in.
            </p>
          </div>
        </div>
      </div>

      {/* Footer descriptor */}
      <div className="text-center text-xs text-white/60 z-10">
        RebalanceX &bull; Autonomous Team Formation & Critical Path Recovery
      </div>
    </div>
  );
}

