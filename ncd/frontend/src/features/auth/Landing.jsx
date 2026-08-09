import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronRight, ClipboardList, ShieldCheck, Activity, Users, Lock } from "lucide-react";
import { T } from "../../lib/theme";
import { Mark } from "../../components/ui/Mark";

function RecordTrail() {
  const stages = [
    "Demographics (Field Supervisor)",
    "Vitals & POC Tests (Staff Nurse)",
    "Clinical Exam & Referral (Doctor)",
    "Follow-up & Verification (Admin)"
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % stages.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-1">
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs uppercase font-bold tracking-wider"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: T.charcoal500,
          }}
        >
          Participant Record #NCD-9042 · Live Workflow
        </p>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live System
        </span>
      </div>
      <div className="relative pl-2 mt-2">
        <div
          className="absolute left-[13px] top-3 bottom-3 w-px bg-slate-200"
        />
        {stages.map((s, i) => {
          const done = i < active;
          const isActive = i === active;
          return (
            <div key={s} className="relative flex items-center gap-4 py-2.5">
              <span
                className="relative z-10 rounded-full shrink-0 transition-colors duration-300 flex items-center justify-center"
                style={{
                  width: 14,
                  height: 14,
                  background: done || isActive ? T.goldDeep : '#e2e8f0',
                  boxShadow: isActive ? `0 0 0 4px ${T.goldTint}` : "none",
                }}
              />
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? T.ink : T.charcoal500,
                  transition: "color 300ms ease",
                }}
              >
                {s}
              </span>
              {isActive && (
                <span
                  className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-2xs"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: T.goldTint,
                    color: T.goldDeep,
                  }}
                >
                  active
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <div
      className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-xs border border-slate-200/90 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-105"
          style={{ width: 44, height: 44, background: T.goldTint }}
        >
          <Icon size={22} color={T.goldDeep} />
        </div>
        <div>
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 16.5,
              color: T.ink,
            }}
          >
            {title}
          </h3>
          <p
            className="mt-1 leading-relaxed text-slate-600"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5 }}
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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F8F9FA] font-sans text-slate-900 relative">
      
      {/* Subtle premium mesh background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-50" 
        style={{ 
          background: 'radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.08), transparent 30%), radial-gradient(circle at 90% 80%, rgba(15, 23, 42, 0.05), transparent 35%)' 
        }} 
      />

      {/* Header */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <img src="/yrg-logo.png" alt="YRG Care" className="w-9 h-9 object-contain" />
          <Mark size={22} />
        </div>
        <button
          onClick={goLogin}
          className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          <Lock size={13} /> Sign In
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Hero Section */}
          <div className="flex flex-col items-start">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-5 border border-amber-200/90 shadow-2xs"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.goldTint, color: T.goldDeep, letterSpacing: "0.02em" }}
            >
              <Activity size={14} /> NCD · NON-COMMUNICABLE DISEASE PLATFORM - Phase II
            </span>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
                color: T.ink,
                letterSpacing: "-0.03em",
                lineHeight: 1.12,
              }}
            >
              A comprehensive survey & health screening application.
            </h1>
            <p
              className="mt-5 text-base leading-relaxed text-slate-600"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", maxWidth: 520 }}
            >
              Empowering research-grade screening for Non-Communicable Diseases (NCD). Designed for multi-role clinical workflows across Field Supervisors, Staff Nurses, Doctors, and Case Coordinators.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={goLogin}
                className="rounded-full px-7 py-3.5 text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.gold, color: T.ink }}
              >
                Go to portal <ChevronRight size={17} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right: Feature Cards & Workflow */}
          <div className="grid gap-4">
            <FeatureCard
              icon={ClipboardList}
              title="Offline Field & Clinical Screening"
              body="Capture vitals, medical history, anthropometry, and POC tests offline with automatic background sync upon connection."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Role-Based Clinical Workflows"
              body="Tailored modules for Field Supervisors (Demographics), Staff Nurses, Doctors, Counselors, and Case Coordinators."
            />
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-xs border border-slate-200/90 mt-1">
              <RecordTrail />
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-3.5 flex items-center justify-between border-t border-slate-200/80 bg-white/60 backdrop-blur-sm text-slate-500 text-xs font-medium">
        <span>
          © {new Date().getFullYear()} YRG MERF · NCD (Non-Communicable Disease) Platform
        </span>
      </footer>
    </div>
  );
}
