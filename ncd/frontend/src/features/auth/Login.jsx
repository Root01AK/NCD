import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { T } from "../../lib/theme";

export function Login({ goLanding, notify, onLoginSuccess }) {
  const [role, setRole] = useState("admin");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Enter both your username and password to continue.");
      return;
    }
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        notify("success", "Welcome back", `Signed in as ${data.user.username}`);
        localStorage.setItem('ncd_token', data.token);
        localStorage.setItem('ncd_user', JSON.stringify(data.user));
        localStorage.setItem('icc_token', data.token);
        localStorage.setItem('icc_user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        notify("error", "Sign in failed", data.message || "Invalid credentials");
      }
    } catch (err) {
      setError('Could not connect to the API. Ensure backend server is running.');
      notify("error", "Connection error", "Could not connect to the NCD API.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative font-sans text-slate-900 p-6">
      
      {/* Subtle mesh background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
           style={{ background: 'radial-gradient(circle at 15% 50%, rgba(14, 165, 233, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(14, 165, 233, 0.1), transparent 25%)' }} />

      <button onClick={goLanding} className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors z-20">
        <ArrowLeft size={16} /> Back to home
      </button>

      {/* Glassmorphic floating login card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white/70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-xl border border-white">
        
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-3">
            <img src="/yrg-logo.png" alt="YRG Care" className="w-12 h-12 object-contain" />
            <div className="flex items-baseline gap-1">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: T.ink, letterSpacing: "-0.02em" }}>
                icc<span style={{ color: T.gold }}>+</span>
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <h2 className="text-center" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: T.ink }}>
            Welcome back
          </h2>
          <p className="mt-2 mb-8 text-center" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14.5, color: T.charcoal600 }}>
            Choose your portal, then enter your credentials.
          </p>

          {/* Role toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex rounded-full p-1.5 shadow-sm border border-slate-200" style={{ background: '#f8fafc' }}>
              {[
                { id: "admin", label: "Admin", user: "admin_user", pass: "admin123" },
                { id: "deo", label: "Data entry", user: "DEO", pass: "DEO" },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);
                    setUsername(r.user);
                    setPassword(r.pass);
                  }}
                  className="rounded-full px-5 py-2 text-sm font-semibold transition-all"
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    background: role === r.id ? T.ink : "transparent",
                    color: role === r.id ? '#ffffff' : T.charcoal600,
                    boxShadow: role === r.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
             <div className="mb-6 rounded-xl p-3 text-sm text-center font-medium shadow-sm border border-red-100" style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: '#fef2f2', color: '#b91c1c' }}>
               {error}
             </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-500" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                Username
              </label>
              <div className="flex items-center gap-3 rounded-xl px-4 bg-white border border-slate-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all shadow-sm">
                <User size={16} className="text-slate-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "admin" ? "admin.chennai" : "deo.field01"}
                  className="w-full py-3.5 text-sm outline-none bg-transparent"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-500" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl px-4 bg-white border border-slate-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all shadow-sm">
                <Lock size={16} className="text-slate-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full py-3.5 text-sm outline-none bg-transparent"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="mt-8 w-full rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              background: T.gold,
              color: T.ink,
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
