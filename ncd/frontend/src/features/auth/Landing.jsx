import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronRight, ClipboardList, ShieldCheck, Radio } from "lucide-react";
import { T } from "../../lib/theme";
import { Mark } from "../../components/ui/Mark";

function RecordTrail() {
  const stages = ["Captured in field", "Reviewed by DEO", "Verified by admin"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % stages.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-2">
      <p
        className="text-xs mb-4 uppercase font-bold"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: T.charcoal500,
          letterSpacing: "0.08em",
        }}
      >
        record #A-10482 · live status
      </p>
      <div className="relative pl-2">
        <div
          className="absolute left-[13px] top-3 bottom-3 w-px bg-slate-200"
        />
        {stages.map((s, i) => {
          const done = i < active;
          const isActive = i === active;
          return (
            <div key={s} className="relative flex items-center gap-4 py-3.5">
              <span
                className="relative z-10 rounded-full shrink-0 transition-colors duration-300"
                style={{
                  width: 12,
                  height: 12,
                  background: done || isActive ? T.goldDeep : '#e2e8f0',
                  boxShadow: isActive ? `0 0 0 4px ${T.goldTint}` : "none",
                }}
              />
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? T.ink : T.charcoal500,
                  transition: "color 300ms ease",
                }}
              >
                {s}
              </span>
              {isActive && (
                <span
                  className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: T.goldTint,
                    color: T.goldDeep,
                  }}
                >
                  now
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
      className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group"
    >
      <div
        className="flex items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-110"
        style={{ width: 44, height: 44, background: T.goldTint }}
      >
        <Icon size={22} color={T.goldDeep} />
      </div>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: T.ink,
        }}
      >
        {title}
      </h3>
      <p
        className="mt-2 leading-relaxed"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14.5, color: T.charcoal600 }}
      >
        {body}
      </p>
    </div>
  );
}

export function Landing({ goLogin, notify }) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F7F6F2] font-sans text-slate-900 relative">
      
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 bg-[#F7F6F2]/90 backdrop-blur-xl border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <img src="/yrg-logo.png" alt="YRG Care" className="w-10 h-10 object-contain" />
          <div className="flex items-baseline">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: T.ink, letterSpacing: "-0.02em" }}>
              icc<span style={{ color: T.gold }}>+</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Hero Section */}
          <div className="flex flex-col items-start">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-xs font-bold mb-6 border border-amber-200"
              style={{ fontFamily: "'IBM Plex Mono', monospace", background: T.goldTint, color: T.goldDeep, letterSpacing: "0.03em" }}
            >
              integrated care coordination
            </span>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2.5rem, 5vw, 3.8rem)",
                color: T.ink,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              A comprehensive survey & health screening application.
            </h1>
            <p
              className="mt-6 text-lg leading-relaxed text-slate-600"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", maxWidth: 520 }}
            >
              ICC+ is how YRG CARE's data entry operators conduct surveys and capture screenings offline, while admins verify, manage, and export data — one unified platform built for research-grade accuracy.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <button
                onClick={goLogin}
                className="rounded-full px-6 py-3.5 text-sm font-semibold flex items-center gap-2 transition-transform hover:scale-105 shadow-md hover:shadow-lg"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.gold, color: T.ink }}
              >
                Go to portal <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid gap-5">
            <FeatureCard
              icon={ClipboardList}
              title="Field-ready screening forms"
              body="DEOs capture vitals and history offline; records sync the moment a connection is back."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Role-based access"
              body="Admins and DEOs see only what their role needs — enforced at the API, not just the UI."
            />
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-200 mt-2">
              <RecordTrail />
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-10 px-8 py-4 flex items-center justify-between border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: T.charcoal500 }}>
          © {new Date().getFullYear()} YRG CARE · ICC+
        </span>
      </footer>
    </div>
  );
}
