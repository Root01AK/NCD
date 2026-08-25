import React, { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Loader2, MapPin } from "lucide-react";
import { T } from "../../lib/theme";
import { Mark } from "../../components/ui/Mark";

export function Login({ goLanding, notify, onLoginSuccess }) {
  const [role, setRole] = useState("admin");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Dharavi");
  const [locationsList, setLocationsList] = useState(["Dharavi", "Malvani", "Vashi"]);

  useEffect(() => {
    fetchLocationsMaster();
  }, []);

  const fetchLocationsMaster = async () => {
    try {
      const response = await fetch('/api/v1/location/index');
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
        const dynamicLocs = data.data.map(l => l.loc_name || l.loc_city).filter(Boolean);
        const uniqueLocs = Array.from(new Set(dynamicLocs));
        setLocationsList(uniqueLocs);
        if (uniqueLocs.length > 0) setSelectedLocation(uniqueLocs[0]);
      }
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter both your username and password to continue.");
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

      const responseText = await response.text();
      let data = {};
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch (jsonErr) {
        throw new Error(`Server Response Error (HTTP ${response.status})`);
      }

      if (response.ok && data.status === 'success') {
        const u = data.user || {};
        const isAdminUser = u.role_id === 1 || u.role_id === '1' || String(u.role_name || '').toLowerCase() === 'admin' || String(u.role || '').toLowerCase() === 'admin';

        if (role === "admin" && !isAdminUser) {
          const errMsg = "Access Denied: DEO staff credentials cannot be used to log in to the Admin Portal. Please switch to the DEO Portal tab to sign in.";
          setError(errMsg);
          notify("error", "Access Denied", "DEO staff credentials cannot log in to Admin Portal.");
          setSubmitting(false);
          return;
        }

        if (role === "deo" && isAdminUser) {
          const errMsg = "Access Denied: Administrator credentials cannot be used to log in to the DEO Portal. Please switch to the Admin Portal tab to sign in.";
          setError(errMsg);
          notify("error", "Access Denied", "Admin credentials cannot log in to DEO Portal.");
          setSubmitting(false);
          return;
        }

        notify("success", "Authentication Successful", `Signed in as ${data.user.username}`);
        if (role === "deo") {
          data.user.location = selectedLocation;
          localStorage.setItem('ncd_active_location', selectedLocation);
        }
        localStorage.setItem('ncd_token', data.token);
        localStorage.setItem('ncd_user', JSON.stringify(data.user));
        localStorage.setItem('icc_token', data.token);
        localStorage.setItem('icc_user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else {
        const msg = data.message || 'Login failed. Please check your credentials.';
        setError(msg);
        notify("error", "Sign in failed", msg);
      }
    } catch (err) {
      const errMsg = err.message || 'Could not connect to the API. Ensure backend server is running.';
      setError(errMsg);
      notify("error", "Connection error", errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative font-sans text-slate-900 p-6">
      
      {/* Subtle mesh background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
           style={{ background: 'radial-gradient(circle at 15% 50%, rgba(14, 165, 233, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(14, 165, 233, 0.1), transparent 25%)' }} />

      {/* Back to Home Link */}
      <button 
        onClick={goLanding} 
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors z-20 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-2xs cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Back to home</span>
      </button>

      {/* Glassmorphic Floating Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80">
        
        {/* Logo & Brand Name Side-by-Side Proper Placement */}
        <div className="flex items-center justify-center gap-3 mb-6 pb-2">
          <img src="/yrg-logo.png" alt="YRG Care" className="w-10 h-10 object-contain shrink-0" />
          <div className="h-6 w-px bg-slate-200" />
          <Mark size={24} showSub={false} />
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <h2 className="text-center" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: T.ink, letterSpacing: "-0.02em" }}>
            Sign In to NCD Portal
          </h2>
          <p className="mt-1.5 mb-6 text-center text-xs text-slate-500 font-medium" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            Select portal role and enter your staff credentials.
          </p>

          {/* Role Toggle Switcher: Admin Portal | DEO Portal */}
          <div className="flex justify-center mb-6">
            <div className="flex rounded-full p-1 bg-slate-100 border border-slate-200 w-full max-w-xs shadow-inner">
              {[
                { id: "admin", label: "Admin Portal" },
                { id: "deo", label: "DEO Portal" },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);
                    setError("");
                  }}
                  className="flex-1 rounded-full py-2 text-xs font-extrabold transition-all cursor-pointer text-center"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: role === r.id ? T.ink : "transparent",
                    color: role === r.id ? '#ffffff' : '#64748b',
                    boxShadow: role === r.id ? '0 2px 4px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
             <div className="mb-5 rounded-xl p-3 text-xs text-center font-medium shadow-2xs border border-red-200 bg-red-50 text-red-700 animate-in fade-in duration-150">
               {error}
             </div>
          )}

          <div className="space-y-4">
            {role === "deo" && (
              <div className="animate-in fade-in duration-150">
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-slate-600 font-mono">
                  Assigned Location / Center
                </label>
                <div className="flex items-center gap-3 rounded-xl px-4 bg-white border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-2xs">
                  <MapPin size={16} className="text-amber-600 shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full py-3 bg-transparent text-xs font-extrabold text-slate-900 outline-none cursor-pointer"
                  >
                    {locationsList.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-slate-600 font-mono">
                Username
              </label>
              <div className="flex items-center gap-3 rounded-xl px-4 bg-white border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-2xs">
                <User size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full py-3 text-xs outline-none bg-transparent font-bold text-slate-900"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-slate-600 font-mono">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl px-4 bg-white border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-2xs">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full py-3 text-xs outline-none bg-transparent font-bold text-slate-900"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="mt-7 w-full rounded-full py-3.5 text-xs font-extrabold uppercase tracking-wider transition-all active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: T.gold,
              color: T.ink,
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin text-slate-900" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to {role === "admin" ? "Admin" : "DEO"} Portal</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            Secured Research-Grade Health Platform • Phase II
          </p>
        </div>
      </div>
    </div>
  );
}
