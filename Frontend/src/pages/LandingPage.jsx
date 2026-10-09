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
    <div className="landing-canvas text-[#FFFBF4] selection:bg-[#D8CFBC] selection:text-[#11120D] flex flex-col justify-between">
      {/* 1. Minimal Top Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-6 flex items-center justify-between z-20">
        {/* Brand Logo & Wordmark */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div>
            <span className="font-bold text-lg tracking-tight text-[#FFFBF4] font-sans block leading-none">
              Ryzen Matrix
            </span>
            <span className="text-[9px] font-medium text-[#D8CFBC] tracking-wider uppercase block mt-0.5">
              Adaptive Intelligence
            </span>
          </div>
        </NavLink>

        {/* Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#D8CFBC]/90">
          <a href="#overview" className="hover:text-[#FFFBF4] transition">Overview</a>
          <span className="text-[#565449] text-[10px]">&bull;</span>
          <a href="#features" className="hover:text-[#FFFBF4] transition">Features</a>
          <span className="text-[#565449] text-[10px]">&bull;</span>
          <a href="#workflow" className="hover:text-[#FFFBF4] transition">Workflow</a>
          <span className="text-[#565449] text-[10px]">&bull;</span>
          {isAuthenticated ? (
            <NavLink to="/projects" className="text-[#D8CFBC] font-bold hover:text-[#FFFBF4] transition">
              Workspace
            </NavLink>
          ) : (
            <NavLink to="/login" className="hover:text-[#FFFBF4] transition font-semibold">
              Sign in
            </NavLink>
          )}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <NavLink
              to="/projects"
              className="px-4 py-1.5 rounded-full border border-[#565449]/50 bg-[#11120D]/60 hover:bg-[#11120D]/80 text-xs font-bold text-[#FFFBF4] backdrop-blur-md transition shadow-sm"
            >
              Open Projects &rarr;
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-1.5 rounded-full border border-[#565449]/50 bg-[#11120D]/60 hover:bg-[#11120D]/80 text-xs font-bold text-[#FFFBF4] backdrop-blur-md transition shadow-sm"
            >
              Sign in
            </NavLink>
          )}
        </div>
      </header>

      {/* 2. Hero Section: Split Left Copy / Right 2D Architectural Image */}
      <section id="overview" className="max-w-7xl mx-auto w-full px-6 sm:px-8 pt-4 pb-12 lg:pt-8 lg:pb-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Supporting Text, Off-White CTA, and Workflow Tiles */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            
            {/* Factual Product Descriptor */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11120D]/80 border border-[#565449]/40 text-xs font-medium text-[#FFFBF4] backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D8CFBC]" />
              <span>Team Ryzen Matrix &bull; Autonomous Resource Rebalancing</span>
            </div>

            {/* Large White Serif Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-medium tracking-tight text-[#FFFBF4] font-editorial leading-[1.15] drop-shadow-sm">
              Build the right team. <br />
              <span className="italic font-medium text-[#D8CFBC]">Keep projects on track.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-[#D8CFBC]/90 max-w-md leading-relaxed font-sans font-normal">
              Match talent to workloads and recover instantly when plans change.
            </p>

            {/* Hero CTA */}
            <div>
              <button
                onClick={handleCtaClick}
                className="hero-cta-btn group py-3 px-6 inline-flex items-center gap-2"
                aria-label={isAuthenticated ? 'Open RebalanceX Workspace' : 'Sign in to RebalanceX'}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#11120D]">
                  {isAuthenticated ? 'Open Project Workspace' : 'Sign in to RebalanceX'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#11120D] group-hover:translate-x-1 transition-transform" />
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
                      className="workflow-tile p-3.5 flex flex-col justify-between min-h-[96px] cursor-pointer hover:border-[#D8CFBC]/60"
                      onClick={() => navigate(isAuthenticated ? item.link : '/login')}
                      title={`Go to ${item.title}`}
                    >
                      <div className="flex items-center justify-between text-[#FFFBF4]">
                        <Icon className="w-4 h-4 text-[#D8CFBC] stroke-[2.2]" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-[#FFFBF4] tracking-wide">{item.title}</div>
                        <div className="text-xs text-[#D8CFBC]/80 mt-0.5 leading-snug">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step numbers below tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-1 text-xs font-mono font-bold text-[#D8CFBC]/80">
                <div>01</div>
                <div>02</div>
                <div>03</div>
                <div>04</div>
              </div>
            </div>
          </div>

          {/* Right Column: 2D Architectural Image Render */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="relative w-full max-w-lg lg:max-w-none group">
              <div className="rounded-3xl overflow-hidden border border-[#565449]/40 shadow-2xl bg-[#11120D]/60 backdrop-blur-md transition-all duration-500 hover:border-[#D8CFBC]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img
                  src="/images/rebalancex_pavilion.jpg"
                  alt="Ryzen Matrix Project Command Pavilion"
                  className="w-full h-auto object-cover rounded-3xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features & Capabilities Section */}
      <section id="features" className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-16 border-t border-[#565449]/30">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D8CFBC]">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#FFFBF4] font-editorial mt-1.5 drop-shadow-sm">
            Adaptive intelligence built for mission delivery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="workflow-tile p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-[#D8CFBC]/15 border border-[#D8CFBC]/30 flex items-center justify-center text-[#D8CFBC] shadow-sm">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-[#FFFBF4] tracking-tight">Smart Team Formation</h3>
            <p className="text-sm text-[#D8CFBC]/85 font-normal leading-relaxed">
              Multi-objective optimization balances skill levels, domain expertise, and candidate availability to assemble balanced project rosters.
            </p>
          </div>

          <div className="workflow-tile p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-[#D8CFBC]/15 border border-[#D8CFBC]/30 flex items-center justify-center text-[#D8CFBC] shadow-sm">
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-[#FFFBF4] tracking-tight">Critical Path Scheduling</h3>
            <p className="text-sm text-[#D8CFBC]/85 font-normal leading-relaxed">
              Calculates topological dependency chains, zero-slack bottlenecks, and start/finish milestones to ensure strict deadline compliance.
            </p>
          </div>

          <div className="workflow-tile p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-[#D8CFBC]/15 border border-[#D8CFBC]/30 flex items-center justify-center text-[#D8CFBC] shadow-sm">
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-[#FFFBF4] tracking-tight">Autonomous Rebalancing</h3>
            <p className="text-sm text-[#D8CFBC]/85 font-normal leading-relaxed">
              Simulates developer outages and compressed deadlines, automatically generating least-perturbation recovery plans with full diff reviews.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Workflow Step Explanations */}
      <section id="workflow" className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-16 border-t border-[#565449]/30">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D8CFBC]">
              Delivery Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#FFFBF4] font-editorial mt-1.5 drop-shadow-sm">
              From formation to autonomous recovery
            </h2>
          </div>
          <button
            onClick={handleCtaClick}
            className="btn-primary text-xs self-start sm:self-auto bg-[#11120D] hover:bg-[#262820] text-[#FFFBF4] font-bold border border-[#565449]/50 px-5 py-2.5 rounded-xl shadow-md"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4 text-[#D8CFBC]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#11120D]/60 backdrop-blur-md border border-[#565449]/40 space-y-2.5 shadow-md">
            <div className="text-xs font-mono font-bold text-[#D8CFBC]">Step 01</div>
            <h4 className="text-base font-bold text-[#FFFBF4]">Form Specialists</h4>
            <p className="text-xs text-[#D8CFBC]/80 leading-relaxed">
              Evaluate candidate talent pool and confirm project team assignments.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11120D]/60 backdrop-blur-md border border-[#565449]/40 space-y-2.5 shadow-md">
            <div className="text-xs font-mono font-bold text-[#D8CFBC]">Step 02</div>
            <h4 className="text-base font-bold text-[#FFFBF4]">Schedule Deliverables</h4>
            <p className="text-xs text-[#D8CFBC]/80 leading-relaxed">
              Define work breakdown structure and compute CPM Gantt timeline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11120D]/60 backdrop-blur-md border border-[#565449]/40 space-y-2.5 shadow-md">
            <div className="text-xs font-mono font-bold text-[#D8CFBC]">Step 03</div>
            <h4 className="text-base font-bold text-[#FFFBF4]">Simulate Disruption</h4>
            <p className="text-xs text-[#D8CFBC]/80 leading-relaxed">
              Test what-if scenarios in sandbox without affecting live project baseline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11120D]/60 backdrop-blur-md border border-[#565449]/40 space-y-2.5 shadow-md">
            <div className="text-xs font-mono font-bold text-[#D8CFBC]">Step 04</div>
            <h4 className="text-base font-bold text-[#FFFBF4]">Review & Approve</h4>
            <p className="text-xs text-[#D8CFBC]/80 leading-relaxed">
              Inspect reassigned tasks, verify schedule impact, and approve updates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Minimal Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-8 border-t border-[#565449]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D8CFBC]/80 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D8CFBC]" />
          <span className="font-medium text-[#D8CFBC]/90">RebalanceX &bull; Developed with precision by <strong>Team Ryzen Matrix</strong></span>
        </div>
        <div>
          <span className="font-medium text-[#D8CFBC]/70">&copy; {new Date().getFullYear()} Team Ryzen Matrix. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
