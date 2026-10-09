import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Lock,
  Mail,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Briefcase,
  Server,
  Settings2,
  CheckCircle2,
  Wifi,
  RefreshCw,
  X
} from 'lucide-react';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  testConnection,
  DEFAULT_HOST_IP,
  DEFAULT_PORT,
  isNativeApp
} from '../api/client';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Server Endpoint Configuration State
  const [currentApiUrl, setCurrentApiUrl] = useState(() => getApiBaseUrl());
  const [customUrlInput, setCustomUrlInput] = useState(() => getApiBaseUrl());
  const [showServerModal, setShowServerModal] = useState(false);
  const [pingStatus, setPingStatus] = useState(null); // { checking: bool, success: bool, message: string }

  const from = location.state?.from?.pathname || '/projects';

  useEffect(() => {
    setCurrentApiUrl(getApiBaseUrl());
    setCustomUrlInput(getApiBaseUrl());
  }, []);

  const handleTestAndSaveServer = async (targetUrl) => {
    const urlToTest = (targetUrl !== undefined ? targetUrl : customUrlInput).trim();
    setPingStatus({ checking: true, success: null, message: 'Testing connection to backend...' });

    const result = await testConnection(urlToTest);
    if (result.success) {
      setApiBaseUrl(urlToTest);
      setCurrentApiUrl(getApiBaseUrl());
      setCustomUrlInput(getApiBaseUrl());
      setPingStatus({
        checking: false,
        success: true,
        message: 'Connected successfully to backend API!',
      });
      setErrorMessage('');
    } else {
      setPingStatus({
        checking: false,
        success: false,
        message: result.message || 'Cannot reach backend. Check IP, port 8000, and Wi-Fi.',
      });
    }
  };

  const applyQuickServer = async (url) => {
    setCustomUrlInput(url);
    await handleTestAndSaveServer(url);
  };

  const executeLogin = async (targetEmail, targetPass) => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(targetEmail, targetPass);
      navigate(from === '/login' ? '/projects' : from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Please enter your work email address or use Fast Login below.');
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

    await executeLogin(email, password);
  };

  const handleFastLogin = async (fastEmail, fastPass) => {
    setEmail(fastEmail);
    setPassword(fastPass);
    await executeLogin(fastEmail, fastPass);
  };

  const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                         errorMessage.toLowerCase().includes('cannot reach backend') ||
                         errorMessage.toLowerCase().includes('fetch');

  return (
    <div className="landing-canvas flex flex-col justify-between min-h-screen py-6 px-4 sm:px-6 lg:px-8 font-sans relative overflow-x-hidden">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl border border-white/40 bg-white/10 flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-inner">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="font-sans font-bold text-xl tracking-tight text-white block leading-none">
              Ryzen Matrix
            </span>
            <span className="text-[9px] font-medium text-amber-200 tracking-wider uppercase block mt-0.5">
              Adaptive Workspace
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Server Config Button */}
          <button
            type="button"
            onClick={() => {
              setShowServerModal(true);
              setPingStatus(null);
            }}
            className="text-xs text-white/90 hover:text-white transition px-3 py-1.5 rounded-full border border-white/25 hover:border-white/50 bg-white/10 backdrop-blur-sm flex items-center gap-1.5 shadow-xs"
            title="Configure Backend Server IP"
          >
            <Server className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline font-mono text-[11px]">
              {currentApiUrl ? currentApiUrl.replace(/^https?:\/\//, '') : 'Backend Server'}
            </span>
            <span className="sm:hidden text-[11px]">Server</span>
            <Settings2 className="w-3 h-3 text-white/70" />
          </button>

          <Link
            to="/"
            className="text-xs text-white/80 hover:text-white transition px-3 py-1.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5"
          >
            &larr; <span className="hidden sm:inline">Back to Overview</span><span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* Main Form Center */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md my-auto z-10 py-4">
        <div className="bg-white/95 backdrop-blur-md py-7 px-5 sm:px-8 rounded-3xl border border-white/40 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-900 border border-amber-300/40">
              ⚡ Team Ryzen Matrix
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign in to Ryzen Matrix
            </h1>
            <p className="text-xs text-slate-600">
              Enter your work email and password to access authorized projects.
            </p>
          </div>

          {/* Error Message with Quick Network Recovery Actions */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-red-800 space-y-2.5 animate-fadeIn">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>

              {isNetworkError && (
                <div className="pt-2 border-t border-red-200/80 space-y-2">
                  <div className="text-[11px] font-semibold text-red-900 flex items-center justify-between">
                    <span>⚡ Quick Fix for Phone on Wi-Fi:</span>
                    <button
                      type="button"
                      onClick={() => setShowServerModal(true)}
                      className="underline hover:text-red-950 font-bold"
                    >
                      Settings ⚙️
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyQuickServer(`http://${DEFAULT_HOST_IP}:${DEFAULT_PORT}`)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <Wifi className="w-3 h-3" />
                      <span>Use PC Wi-Fi ({DEFAULT_HOST_IP})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickServer('http://10.0.2.2:8000')}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-medium transition"
                    >
                      Emulator (10.0.2.2)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
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
                  placeholder="admin@rebalancex.io"
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

            <div className="pt-1">
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

          {/* Fast Login Role Buttons */}
          <div className="pt-3 border-t border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Fast Role Login
              </span>
              <span className="text-[10px] text-slate-400">One-tap demo</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleFastLogin('admin@rebalancex.io', 'admin123')}
                disabled={isSubmitting}
                className="py-1.5 px-2 bg-slate-50 hover:bg-[#202724] text-slate-700 hover:text-white rounded-lg text-xs font-medium border border-slate-200 hover:border-[#202724] transition-all flex items-center justify-center gap-1"
                title="Sign in as Admin (Aarav Sharma - Bengaluru)"
              >
                <Shield className="w-3 h-3 text-amber-500" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('manager@rebalancex.io', 'manager123')}
                disabled={isSubmitting}
                className="py-1.5 px-2 bg-slate-50 hover:bg-[#202724] text-slate-700 hover:text-white rounded-lg text-xs font-medium border border-slate-200 hover:border-[#202724] transition-all flex items-center justify-center gap-1"
                title="Sign in as Delivery Manager (Priya Patel - Mumbai)"
              >
                <Briefcase className="w-3 h-3 text-blue-500" />
                <span>Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('member@rebalancex.io', 'member123')}
                disabled={isSubmitting}
                className="py-1.5 px-2 bg-slate-50 hover:bg-[#202724] text-slate-700 hover:text-white rounded-lg text-xs font-medium border border-slate-200 hover:border-[#202724] transition-all flex items-center justify-center gap-1"
                title="Sign in as Senior Engineer (Rohan Verma - Hyderabad)"
              >
                <Users className="w-3 h-3 text-emerald-500" />
                <span>Member</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Server Configuration Modal / Drawer */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Backend Server Connection</h3>
                  <p className="text-[11px] text-slate-500">Configure host for phone or emulator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  API Base Endpoint
                </label>
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder={`http://${DEFAULT_HOST_IP}:${DEFAULT_PORT}`}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Preset Chips */}
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  1-Tap Preset Connections:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyQuickServer(`http://${DEFAULT_HOST_IP}:${DEFAULT_PORT}`)}
                    className="p-2 rounded-xl bg-[#F7FAF8] hover:bg-emerald-50 border border-[#DCE4DF] hover:border-emerald-300 text-left transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PC Wi-Fi (Physical Phone)</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        http://{DEFAULT_HOST_IP}:{DEFAULT_PORT}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Recommended
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyQuickServer('http://10.0.2.2:8000')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-blue-600" />
                        <span>Android Studio Emulator</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        http://10.0.2.2:8000
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyQuickServer('')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-slate-600" />
                        <span>Web Browser (Same Origin / Dev Proxy)</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        Relative path ('' or http://127.0.0.1:8000)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {pingStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    pingStatus.checking
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : pingStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {pingStatus.checking ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600 flex-shrink-0" />
                  ) : pingStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span className="leading-tight">{pingStatus.message}</span>
                </div>
              )}

              {/* Helpful Tips */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">💡 How to connect your phone:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  <li>Keep both PC and Phone connected to the <strong>same Wi-Fi</strong> network.</li>
                  <li>Run the FastAPI backend bound to <code>0.0.0.0</code>:
                    <br />
                    <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-[10px]">
                      uvicorn app.main:app --host 0.0.0.0 --port 8000
                    </code>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={pingStatus?.checking}
                onClick={() => handleTestAndSaveServer(customUrlInput)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#202724] hover:bg-[#2D3732] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {pingStatus?.checking && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Test &amp; Save Endpoint</span>
              </button>
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer descriptor */}
      <div className="text-center text-xs text-white/60 z-10 py-2">
        RebalanceX &bull; Autonomous Team Formation & Critical Path Recovery
      </div>
    </div>
  );
}
