import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, FileText, ArrowRight, LogOut, Loader2, Home, FolderSync, ClipboardCheck, UserCircle2, RefreshCw, MapPin, Database, Award, Shield, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { getQueue, deleteFromQueue } from "../../lib/db";

export const SECTION_NAMES = {
  1: "Demographics (Sec 1)",
  2: "Medical History (Sec 2)",
  3: "Tobacco Use (Sec 3)",
  4: "Alcohol Use (Sec 4)",
  5: "Other Substance Use (Sec 5)",
  6: "Diet & Physical Activity (Sec 6)",
  7: "Symptom Screening (Sec 7)",
  8: "Mental Health (Sec 8)",
  9: "Anthropometry (Sec 9)",
  10: "Vitals (Sec 10)",
  11: "POC Tests (Sec 11)",
  12: "Clinical Exams (Sec 12)",
  13: "Risk Categorisation (Sec 13)",
  14: "Linkages & Follow-up (Sec 14)",
  15: "Health Counseling (Sec 15)",
  16: "Community Perception (Sec 16)"
};

export function ClientDashboard({ notify, openSurvey, logout }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [currentTab, setCurrentTab] = useState("dashboard"); // dashboard, completed, sync, verified, profile
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncQueue, setSyncQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);

  // Load active user & role details
  const userString = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
  const user = userString ? JSON.parse(userString) : { username: 'DEO', role_name: 'Field Supervisor', role_id: 2, assigned_location: 'Dharavi' };

  // Dynamic user privilege configuration
  let userPrivileges = user.privileges;
  if (typeof userPrivileges === 'string') {
    try { userPrivileges = JSON.parse(userPrivileges); } catch (e) { userPrivileges = null; }
  }
  if (!Array.isArray(userPrivileges) || userPrivileges.length === 0) {
    const rLower = (user.role_name || "").toLowerCase();
    userPrivileges = rLower.includes("nurse") ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : rLower.includes("doctor") ? [12, 13]
      : rLower.includes("counselor") ? [8, 15]
      : rLower.includes("coordinator") ? [14]
      : rLower.includes("admin") ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      : [1, 16];
  }

  const privilegesText = userPrivileges.length === 16 
    ? "Full Access (All 16 Sections Enabled)"
    : userPrivileges.map(id => SECTION_NAMES[id] || `Section ${id}`).join(", ");

  const workstationTitle = `${user.role_name || "Data Entry"} Workstation`;
  const surveyTitle = `MUMBAI’S NCD SURVEY — ${(user.role_name || "SCREENING").toUpperCase()} PROGRAM`;

  // Load offline queue & status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    fetchSurveys();
    loadQueue();
    
    const interval = setInterval(loadQueue, 5000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const loadQueue = async () => {
    try {
      const q = await getQueue();
      setSyncQueue(q);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/surveymaster/index");
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        setSurveys(res.data);
      } else {
        setSurveys([
          {
            sur_id: 1,
            sur_code: "NCD-MUM-2026",
            sur_title: roleConfig.surveyTitle,
            location: user.assigned_location || "Dharavi",
            assigned_role: user.role_name || "Field Supervisor"
          }
        ]);
      }
    } catch (e) {
      console.error(e);
      setSurveys([
        {
          sur_id: 1,
          sur_code: "NCD-MUM-2026",
          sur_title: roleConfig.surveyTitle,
          location: user.assigned_location || "Dharavi",
          assigned_role: user.role_name || "Field Supervisor"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!online) {
      notify("error", "You're offline", "Reconnect to sync records with server.");
      return;
    }
    if (syncQueue.length === 0) {
      notify("success", "Fully synced", "All offline records are synced.");
      return;
    }
    setSyncing(true);
    notify("info", "Syncing Queue", "Transmitting offline survey records to Admin...");
    
    setTimeout(async () => {
      try {
        for (const rec of syncQueue) {
          const payload = {
            mem_scrn_part_id: rec.participant_id,
            mem_scrn_q16: rec.fullName || "",
            mem_scrn_q1: parseInt(rec.age) || 0,
            mem_scrn_q2: rec.gender === "Male" ? "1" : rec.gender === "Female" ? "2" : rec.gender === "Transgender" ? "3" : "0",
            mem_scrn_q17: rec.location || user.assigned_location || "Dharavi",
            mem_scrn_q3: parseInt(rec.bp_sys) || 0,
            mem_scrn_q4: parseInt(rec.bp_dia) || 0,
            mem_scrn_q5: parseInt(rec.weight) || 0,
            mem_scrn_q30: JSON.stringify(rec),
            mem_scrn_status: "1"
          };
          await api.post("/api/v1/screening/submit", payload);
          await deleteFromQueue(rec.local_id);
        }
        await loadQueue();
        notify("success", "Sync complete", "All records successfully transmitted to Admin verification queue.");
      } catch (err) {
        notify("error", "Sync failed", err.message || "An error occurred during sync.");
      } finally {
        setSyncing(false);
      }
    }, 1200);
  };

  // Completed Phase II records for assigned center (fresh & clean)
  const [completedRecords, setCompletedRecords] = useState([]);

  useEffect(() => {
    // Fetch live submitted Phase II records for assigned center
    api.get("/api/v1/dashboard/screeninglist").then(res => {
      if (res.status === 'success' && Array.isArray(res.data)) {
        // Filter strictly Phase 2 live entries submitted during active Phase II program
        const phase2List = res.data.filter(p => p.phase === 2 || p.phase === 'phase2' || p.mem_scrn_phase === '2' || p.submitted_by_role);
        
        const mapped = phase2List.map(p => ({
          participant_id: p.mem_scrn_part_id || (p.mem_scrn_id ? `NCD-MUM-${p.mem_scrn_id}` : `NCD-MUM-P2`),
          fullName: p.mem_scrn_q16 || "Participant Record",
          age: p.mem_scrn_q1 || "45",
          gender: p.mem_scrn_q2 === "1" ? "Male" : "Female",
          date: p.record_date ? new Date(p.record_date * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
          location: p.mem_scrn_q17 || user.assigned_location || "Dharavi",
          status: "Synced to Admin",
          risk: p.mem_scrn_q24 == 1 ? "High Risk Flagged" : "Standard Risk"
        }));
        setCompletedRecords(mapped);
      }
    }).catch(e => console.error("Error loading completed records", e));
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Redesigned Header in Light Theme */}
      <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 sm:px-8 py-3 sm:py-3.5 bg-white border-b border-slate-200 shrink-0 shadow-2xs gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/yrg-logo.png" alt="YRG Care" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1">
                  <Shield size={11} className="text-amber-500" /> {workstationTitle}
                </span>
                {/* Operator Specific Assigned Location Pill */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono shadow-2xs">
                  <MapPin size={11} className="text-amber-600" /> Center: {user.assigned_location || "Dharavi"}
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {user.username}
              </p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setOnline(!online)}
              className="p-2 rounded-full text-xs font-semibold shadow-2xs border cursor-pointer"
              style={{
                background: online ? '#ecfdf5' : '#fef2f2',
                color: online ? '#065f46' : '#991b1b',
                borderColor: online ? '#a7f3d0' : '#fecaca'
              }}
              title={online ? "Online" : "Offline"}
            >
              {online ? <Wifi size={14} /> : <WifiOff size={14} />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full text-slate-700 bg-white border border-slate-200 cursor-pointer"
              title="Logout"
            >
              <LogOut size={14} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Navigation Bar / Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-full p-1 shadow-2xs shrink-0 overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "completed", label: "Completed Records", icon: ClipboardCheck, badge: completedRecords.length },
            { id: "sync", label: "Sync Queue", icon: FolderSync, badge: syncQueue.length },
            { id: "profile", label: "Profile", icon: UserCircle2 }
          ].map((n) => {
            const Icon = n.icon;
            const isActive = currentTab === n.id;
            return (
              <button 
                key={n.id} 
                onClick={() => setCurrentTab(n.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full transition-all text-xs font-bold cursor-pointer shrink-0 whitespace-nowrap ${isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
              >
                <Icon size={14} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                <span>{n.label}</span>
                {n.badge > 0 && (
                  <span className={`inline-flex items-center justify-center text-[9px] font-black rounded-full px-1.5 py-0.5 ml-1 min-w-[16px] h-4 ${n.id === 'sync' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-800'}`}>
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Actions & Network Status */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setOnline(!online)}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            style={{
              background: online ? '#ecfdf5' : '#fef2f2',
              color: online ? '#065f46' : '#991b1b',
              border: `1px solid ${online ? '#a7f3d0' : '#fecaca'}`
            }}
          >
            {online ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{online ? "Online (Live Sync)" : "Offline Mode"}</span>
          </button>
          
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all shadow-2xs cursor-pointer"
          >
            <LogOut size={13} className="text-slate-500" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24">
        
        {/* Tab: Dashboard */}
        {currentTab === "dashboard" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
            
            {/* Light Mode Header Metrics for Assigned Center */}
            <div className="grid md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Database size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Center Total Completions</p>
                  <p className="text-2xl font-black text-slate-900">{completedRecords.length} Records</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Synced to Admin Queue</p>
                  <p className="text-2xl font-black text-slate-900">{completedRecords.length} Synced</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <MapPin size={22} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Assigned Location</p>
                  <p className="text-lg font-bold text-slate-900">
                    Mumbai - {user.assigned_location || "Dharavi"} Center
                  </p>
                </div>
              </div>

            </div>

            {/* Active Screening Survey Program Cards */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Active Screening Program
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Click to initiate participant screening & Demographics recording.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <UserCheck size={13} /> Privileges: {privilegesText}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-slate-400" size={32} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {surveys.map((survey) => (
                    <div
                      key={survey.sur_id || survey.sur_code}
                      onClick={() => openSurvey(survey)}
                      className="bg-white hover:bg-amber-50/40 rounded-3xl p-6 shadow-2xs border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 border border-amber-200 group-hover:scale-105 transition-transform">
                            <FileText size={22} className="text-amber-800" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-mono">
                            {survey.sur_code || "NCD-MUM-2026"}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-snug">
                          {survey.sur_title || surveyTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Non-Communicable Disease Screening for {user.assigned_location || "Dharavi"} Center.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                          Start Assigned Screening Form
                        </span>
                        <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab: Completed Records (Shows Completed Screenings & Details) */}
        {currentTab === "completed" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Completed Screening Records</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Completed participant screenings recorded for {user.assigned_location || "Dharavi"} Center.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white font-mono shadow-2xs">
                Total Completed: 18 Records
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Participant ID</th>
                    <th className="px-6 py-4 font-bold">Participant Name</th>
                    <th className="px-6 py-4 font-bold">Age / Gender</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Location</th>
                    <th className="px-6 py-4 font-bold">Risk Level</th>
                    <th className="px-6 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{r.participant_id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{r.fullName}</td>
                      <td className="px-6 py-4 text-slate-600">{r.age} yrs • {r.gender}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{r.date}</td>
                      <td className="px-6 py-4 text-slate-700">{r.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.risk.includes('High') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                          {r.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 size={12} /> {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Sync Queue */}
        {currentTab === "sync" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Offline Sync Queue</h2>
                <p className="text-xs text-slate-500 mt-0.5">Records stored locally while offline that need server synchronization.</p>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing || syncQueue.length === 0}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-2xs cursor-pointer"
              >
                <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                <span>{syncing ? "Syncing..." : "Sync Now"}</span>
              </button>
            </div>

            {syncQueue.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <FolderSync size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-800">All Caught Up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending offline survey entries for {user.assigned_location || "Dharavi"}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {syncQueue.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl p-4 border border-slate-200 flex justify-between items-center shadow-2xs">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.fullName || "Unnamed Participant"}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {item.participant_id} • Age: {item.age} • Center: {item.location || user.assigned_location || 'Dharavi'}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Sync
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Profile */}
        {currentTab === "profile" && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xl font-extrabold shadow-2xs">
                DEO
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{user.username}</h3>
                <p className="text-xs text-slate-500 font-medium">Field Supervisor · Mumbai {user.assigned_location || "Dharavi"} Center</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono">Assigned Role</span>
                <span className="font-bold text-slate-800">Field Supervisor</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono">Module Privileges</span>
                <span className="font-bold text-slate-800">Demographics & Community Perception</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono">Assigned Center</span>
                <span className="font-bold text-slate-800 font-mono">Mumbai - {user.assigned_location || "Dharavi"}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-8 py-3.5 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/yrg-logo.png" alt="YRG Care" className="w-5 h-5 object-contain" />
          <span>YRGMERF &copy; 2026 • NCD Healthcare Screening Platform v2.4</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
          <span>Operator: {user.username}</span>
          <span>•</span>
          <span>Center: {user.assigned_location || "Dharavi"}</span>
          <span>•</span>
          <span>Confidential Clinical System</span>
        </div>
      </footer>

    </div>
  );
}
