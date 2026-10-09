import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Users,
  CalendarDays,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  GitBranch,
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/projects');
    } else {
      navigate('/login');
    }
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Build team',
      description: 'Match skills & availability',
      icon: Users,
      link: '/team-formation',
    },
    {
      step: '02',
      title: 'Plan work',
      description: 'CPM schedule & dependencies',
      icon: CalendarDays,
      link: '/task-planning',
    },
    {
      step: '03',
      title: 'Test changes',
      description: 'Simulate what-if disruptions',
      icon: Sliders,
      link: '/recovery',
    },
    {
      step: '04',
      title: 'Review recovery',
      description: 'Inspect diff & approve plan',
      icon: CheckCircle2,
      link: '/recovery',
    },
  ];

  return (
    <div className="landing-canvas text-white selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">
      {/* 1. Minimal Top Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-6 flex items-center justify-between z-20">
        {/* Brand Logo & Wordmark */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur-md shadow-xs group-hover:border-white/50 transition">
            <Compass className="w-4 h-4 text-amber-300" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white font-sans">
            RebalanceX
          </span>
        </NavLink>

        {/* Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-100">
          <a href="#overview" className="hover:text-amber-300 transition">Overview</a>
          <span className="text-white/40 text-[10px]">&bull;</span>
          <a href="#features" className="hover:text-amber-300 transition">Features</a>
          <span className="text-white/40 text-[10px]">&bull;</span>
          <a href="#workflow" className="hover:text-amber-300 transition">Workflow</a>
          <span className="text-white/40 text-[10px]">&bull;</span>
          {isAuthenticated ? (
            <NavLink to="/projects" className="text-amber-300 font-bold hover:text-amber-200 transition">
              Workspace
            </NavLink>
          ) : (
            <NavLink to="/login" className="hover:text-amber-300 transition font-semibold">
              Sign in
            </NavLink>
          )}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <NavLink
              to="/projects"
              className="px-4 py-1.5 rounded-full border border-white/30 bg-white/15 hover:bg-white/25 text-xs font-bold text-white backdrop-blur-md transition shadow-sm"
            >
              Open Projects &rarr;
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-1.5 rounded-full border border-white/30 bg-white/15 hover:bg-white/25 text-xs font-bold text-white backdrop-blur-md transition shadow-sm"
            >
              Sign in
            </NavLink>
          )}
        </div>
      </header>

      {/* 2. Hero Section: Split Left Copy / Right Architectural 3D Pavilion */}
      <section id="overview" className="max-w-7xl mx-auto w-full px-6 sm:px-8 pt-4 pb-12 lg:pt-8 lg:pb-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Supporting Text, Off-White CTA, and Workflow Tiles */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            
            {/* Factual Product Descriptor */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F1C16]/70 border border-white/25 text-xs font-medium text-slate-100 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Team Matching & Autonomous Resource Rebalancing</span>
            </div>

            {/* Large White Serif Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-medium tracking-tight text-white font-editorial leading-[1.15] drop-shadow-sm">
              Build the right team. <br />
              <span className="italic font-medium text-amber-200">Keep projects on track.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-100 max-w-lg leading-relaxed font-sans font-normal">
              Match people to the work, plan tasks around real availability, and review recovery options when plans change.
            </p>

            {/* Off-White Hero CTA with Dark Compact Icon Segment */}
            <div>
              <button
                onClick={handleCtaClick}
                className="hero-cta-btn group"
                aria-label={isAuthenticated ? 'Open RebalanceX Workspace' : 'Sign in to RebalanceX'}
              >
                <div className="w-8 h-8 rounded-xl bg-[#1C2420] text-amber-300 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 pr-1">
                  {isAuthenticated ? 'Open Project Workspace' : 'Sign in to RebalanceX'}
                </span>
              </button>
            </div>

            {/* 4 Subtle Outlined Workflow Tiles */}
            <div className="pt-6 sm:pt-8 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {workflowSteps.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.step}
                      className="workflow-tile p-3.5 flex flex-col justify-between min-h-[96px] cursor-pointer hover:border-amber-300/50"
                      onClick={() => navigate(isAuthenticated ? item.link : '/login')}
                      title={`Go to ${item.title}`}
                    >
                      <div className="flex items-center justify-between text-white">
                        <Icon className="w-4 h-4 text-amber-300 stroke-[2.2]" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-white tracking-wide">{item.title}</div>
                        <div className="text-xs text-slate-200 mt-0.5 leading-snug">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step numbers below tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-1 text-xs font-mono font-bold text-amber-300/80">
                <div>01</div>
                <div>02</div>
                <div>03</div>
                <div>04</div>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural 3D Project Command Pavilion */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Floating Architectural Visual Render */}
              <img
                src="/images/rebalancex_pavilion.jpg"
                alt="RebalanceX Modular Project Command Pavilion 3D architectural visual with warm interior lighting"
                className="w-full h-auto object-contain rounded-3xl drop-shadow-2xl hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features & Capabilities Section */}
      <section id="features" className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-16 border-t border-white/20">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white font-editorial mt-1.5 drop-shadow-sm">
            Adaptive intelligence built for mission delivery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="workflow-tile p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-sm">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Smart Team Formation</h3>
            <p className="text-sm text-slate-100 font-normal leading-relaxed">
              Multi-objective optimization balances skill levels, domain expertise, and candidate availability to assemble balanced project rosters.
            </p>
          </div>

          <div className="workflow-tile p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-sky-400/20 border border-sky-300/40 flex items-center justify-center text-sky-300 shadow-sm">
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Critical Path Scheduling</h3>
            <p className="text-sm text-slate-100 font-normal leading-relaxed">
              Calculates topological dependency chains, zero-slack bottlenecks, and start/finish milestones to ensure strict deadline compliance.
            </p>
          </div>

          <div className="workflow-tile p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shadow-sm">
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Autonomous Rebalancing</h3>
            <p className="text-sm text-slate-100 font-normal leading-relaxed">
              Simulates developer outages and compressed deadlines, automatically generating least-perturbation recovery plans with full diff reviews.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Workflow Step Explanations */}
      <section id="workflow" className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-16 border-t border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Delivery Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white font-editorial mt-1.5 drop-shadow-sm">
              From formation to autonomous recovery
            </h2>
          </div>
          <button
            onClick={handleCtaClick}
            className="btn-primary text-xs self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-white font-bold border border-white/20 px-5 py-2.5 rounded-xl shadow-md"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0F1C16]/60 backdrop-blur-md border border-white/20 space-y-2.5 shadow-md">
            <div className="text-xs font-mono font-bold text-amber-300">Step 01</div>
            <h4 className="text-base font-bold text-white">Form Specialists</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Evaluate candidate talent pool and confirm project team assignments.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1C16]/60 backdrop-blur-md border border-white/20 space-y-2.5 shadow-md">
            <div className="text-xs font-mono font-bold text-amber-300">Step 02</div>
            <h4 className="text-base font-bold text-white">Schedule Deliverables</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Define work breakdown structure and compute CPM Gantt timeline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1C16]/60 backdrop-blur-md border border-white/20 space-y-2.5 shadow-md">
            <div className="text-xs font-mono font-bold text-amber-300">Step 03</div>
            <h4 className="text-base font-bold text-white">Simulate Disruption</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Test what-if scenarios in sandbox without affecting live project baseline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1C16]/60 backdrop-blur-md border border-white/20 space-y-2.5 shadow-md">
            <div className="text-xs font-mono font-bold text-amber-300">Step 04</div>
            <h4 className="text-base font-bold text-white">Review & Approve</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Inspect reassigned tasks, verify schedule impact, and approve updates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Minimal Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-200 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-300" />
          <span className="font-medium text-slate-200">RebalanceX &bull; Multi-Objective Optimization & Autonomous Resource Rebalancing</span>
        </div>
        <div>
          <span className="font-medium text-slate-300">&copy; {new Date().getFullYear()} RebalanceX. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
