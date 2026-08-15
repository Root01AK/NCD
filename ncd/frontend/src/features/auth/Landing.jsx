import React from "react";
import { ChevronRight, ClipboardList, ShieldCheck, Activity, Users, Lock, Database, Cpu, Layers } from "lucide-react";
import { T } from "../../lib/theme";
import { Mark } from "../../components/ui/Mark";

function FeatureCard({ icon: Icon, title, body, badge }) {
  return (
    <div
      className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-200/90 hover:border-amber-400 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/40 to-transparent rounded-bl-full pointer-events-none group-hover:from-amber-200/60 transition-colors" />

      <div className="flex items-start gap-4 relative z-10">
        <div
          className="flex items-center justify-center rounded-2xl shrink-0 transition-transform group-hover:scale-110 shadow-xs"
          style={{ width: 50, height: 50, background: T.goldTint, border: `1px solid ${T.goldSoft}` }}
        >
          <Icon size={24} color={T.goldDeep} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 17,
                color: T.ink,
              }}
            >
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                {badge}
              </span>
            )}
          </div>
          <p
            className="leading-relaxed text-slate-600 text-xs sm:text-sm"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
          >
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Landing({ goLogin, notify }) {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden flex flex-col bg-[#FDFBF7] font-sans text-slate-900 relative">

      {/* High-end radial background glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 10% 15%, rgba(245, 158, 11, 0.12), transparent 45%), radial-gradient(circle at 90% 85%, rgba(217, 119, 6, 0.08), transparent 50%)'
        }}
      />

      {/* Header - Clean UX with Single Sign In / Portal CTA & Brand Mark */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <img src="/yrg-logo.png" alt="YRG Care" className="w-9 h-9 object-contain" />
           <div className="h-6 w-px bg-slate-200" />
          <Mark size={24} showSub={false} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-12 py-8 sm:py-12">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Hero Section */}
          <div className="flex flex-col items-start">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6 border border-amber-300/90 shadow-2xs"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.goldTint, color: T.goldDeep, letterSpacing: "0.02em" }}
            >
              <Activity size={15} color={T.goldDeep} />
              <span>NCD · NON-COMMUNICABLE DISEASE PLATFORM · PHASE II</span>
            </div>

            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2.5rem, 4.8vw, 3.8rem)",
                color: T.ink,
                letterSpacing: "-0.035em",
                lineHeight: 1.1,
              }}
            >
              A comprehensive survey & health screening application.
            </h1>

            <p
              className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 font-normal"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", maxWidth: 540 }}
            >
              Empowering research-grade screening for Non-Communicable Diseases (NCD). Tailored multi-role clinical workflows for Field Supervisors, Staff Nurses, Doctors, and Case Coordinators.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={goLogin}
                className="rounded-full px-9 py-4 text-base font-extrabold flex items-center gap-3 transition-all hover:scale-[1.03] shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif", background: T.gold, color: T.ink }}
              >
                <span>Sign In / Sign Up</span>
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid gap-5">
            <FeatureCard
              icon={ClipboardList}
              title="Offline Field & Clinical Screening"
              body="Capture vitals, medical history, anthropometry, and POC tests offline with automatic background sync upon connection."
              badge="Offline Ready"
            />

            <FeatureCard
              icon={ShieldCheck}
              title="Role-Based Clinical Workflows"
              body="Tailored modules for Field Supervisors (Demographics), Staff Nurses, Doctors, Counselors, and Case Coordinators."
              badge="Multi-Role Audit"
            />

            <FeatureCard
              icon={Layers}
              title="Dynamic Schema & Real-Time Sync"
              body="Admin custom survey questions sync live to operational field queues across Dharavi, Malvani, Vashi, and project locations."
              badge="Live Admin Sync"
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-8 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 bg-white/80 backdrop-blur-md text-slate-500 text-xs font-medium gap-2">
        <div className="flex items-center gap-2">
          <Mark size={18} showSub={false} />
          <span>© {new Date().getFullYear()} YRG MERF</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">NCD - Phase II</span>
      </footer>
    </div>
  );
}
