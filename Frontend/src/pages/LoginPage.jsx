import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return route if user was redirected from a protected page
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address (e.g. name@rebalancex.io).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      // Route appropriately: Team Members go to /my-workspace, Managers/Admins go to / or return route
      if (user.role === 'member') {
        navigate('/my-workspace', { replace: true });
      } else {
        navigate(from === '/login' ? '/' : from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('RebalanceX!2026');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-google-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-google-blue flex items-center justify-center text-white font-bold text-xl shadow-google-sm mx-auto mb-3">
          RX
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-google-text">
          Sign in to RebalanceX
        </h1>
        <p className="text-xs text-google-textSecondary mt-1">
          Adaptive Project Intelligence & Autonomous Resource Rebalancer
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-google-modal rounded-3xl border border-google-border sm:px-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-google-redSurface border border-google-red/30 text-xs text-google-red flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-google-textMuted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex.morgan@rebalancex.io"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary"
                >
                  Password
                </label>
                <span className="text-[11px] text-google-textMuted">
                  Secured & encrypted
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-google-textMuted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-google-textMuted hover:text-google-text"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full google-btn-primary py-2.5 text-xs font-bold rounded-full shadow-google-xs flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Authorized Persona Quick-Select */}
          <div className="pt-4 border-t border-google-border space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-google-textMuted block text-center">
              Quick Test Accounts by Role
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@rebalancex.io', 'admin')}
                className="p-2 bg-google-subtle hover:bg-google-blueSurface/60 rounded-xl border border-google-border text-[11px] font-semibold text-google-text transition"
              >
                <span className="block font-bold text-google-blue">Admin</span>
                <span className="text-[10px] text-google-textMuted font-normal truncate block">Sarah Chen</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('manager@rebalancex.io', 'manager')}
                className="p-2 bg-google-subtle hover:bg-google-tealSurface/60 rounded-xl border border-google-border text-[11px] font-semibold text-google-text transition"
              >
                <span className="block font-bold text-google-teal">Manager</span>
                <span className="text-[10px] text-google-textMuted font-normal truncate block">Elena R.</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('alex.morgan@rebalancex.io', 'member')}
                className="p-2 bg-google-subtle hover:bg-google-blueSurface/60 rounded-xl border border-google-border text-[11px] font-semibold text-google-text transition"
              >
                <span className="block font-bold text-google-text">Member</span>
                <span className="text-[10px] text-google-textMuted font-normal truncate block">Alex Morgan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
