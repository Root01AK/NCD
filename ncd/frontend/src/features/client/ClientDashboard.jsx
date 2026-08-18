import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, FileText, ArrowRight, LogOut, Loader2, Home, FolderSync, ClipboardCheck, UserCircle2, RefreshCw, MapPin, Database, Award, Shield, UserCheck, CheckCircle2, AlertCircle, Search, Download, Eye, X, Menu } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { getQueue, deleteFromQueue } from "../../lib/db";
import { Mark } from "../../components/ui/Mark";

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
  const [syncSearch, setSyncSearch] = useState("");
  const [selectedQaModalItem, setSelectedQaModalItem] = useState(null);

  const exportSyncQueueCSV = () => {
    if (!syncQueue || syncQueue.length === 0) return;
    
    const headers = ["Local ID", "Participant ID", "Full Name", "Age", "Gender", "Location", "Screening Date", "Contact Number", "Saved Timestamp"];
    const rows = syncQueue.map(item => [
      item.local_id || "",
      `"${item.participant_id || ''}"`,
      `"${item.fullName || ''}"`,
      item.age || "",
      `"${item.gender || ''}"`,
      `"${item.location || user.assigned_location || ''}"`,
      `"${item.screening_date || ''}"`,
      `"${item.contact_number || ''}"`,
      `"${item.timestamp || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ncd_offline_sync_queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("success", "Export Completed", "Offline sync queue exported to CSV.");
  };

  const filteredSyncQueue = syncQueue.filter(item => {
    if (!syncSearch.trim()) return true;
    const q = syncSearch.toLowerCase().trim();
    const pid = String(item.participant_id || "").toLowerCase();
    const name = String(item.fullName || "").toLowerCase();
    const loc = String(item.location || "").toLowerCase();
    const age = String(item.age || "").toLowerCase();
    return pid.includes(q) || name.includes(q) || loc.includes(q) || age.includes(q);
  });

  // Load active user & role details safely
  const getUserSafely = () => {
    try {
      const userString = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
      if (!userString || userString === 'undefined' || userString === 'null') return null;
      const parsed = JSON.parse(userString);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  };

  const parsedUser = getUserSafely();
  const user = parsedUser || { username: 'DEO', role_name: 'Field Supervisor', role_id: 2, assigned_location: 'Dharavi' };

  // Dynamic user privilege configuration
  let userPrivileges = user.privileges;
  if (typeof userPrivileges === 'string') {
    try { userPrivileges = JSON.parse(userPrivileges); } catch (e) { userPrivileges = null; }
  }
  if (!Array.isArray(userPrivileges) || userPrivileges.length === 0) {
    const rLower = String(user?.role_name || "").toLowerCase();
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
            sur_title: "MUMBAI’S NCD SURVEY — PHASE II",
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
          sur_title: "MUMBAI’S NCD SURVEY — PHASE II",
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Sleek, Modern, Mobile-Responsive DEO Portal Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs gap-4 shrink-0">
        
        {/* Left: YRG Logo + Mark + Clean Role & Center Badge */}
        <div className="flex items-center gap-3">
          <img src="/yrg-logo.png" alt="YRG Care" className="w-8 h-8 object-contain shrink-0" />
          <div className="h-5 w-px bg-slate-200" />
          <Mark size={20} showSub={false} />

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs font-extrabold text-slate-900 font-mono tracking-tight">
              {user.role_name || "DEO Portal"}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono shadow-2xs">
              <MapPin size={11} className="text-amber-600 shrink-0" /> {user.assigned_location || "Dharavi"}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl p-1 shadow-inner overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "completed", label: "Completed", icon: ClipboardCheck, badge: completedRecords.length },
            { id: "sync", label: "Sync Queue", icon: FolderSync, badge: syncQueue.length },
            { id: "profile", label: "Profile", icon: UserCircle2 }
          ].map((n) => {
            const Icon = n.icon;
            const isActive = currentTab === n.id;
            return (
              <button 
                key={n.id} 
                onClick={() => setCurrentTab(n.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all text-xs font-extrabold cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive ? 'bg-[#f5d40b] text-[#4a4a4c] font-black shadow-2xs border border-[#e5c40a]' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#4a4a4c]' : 'text-slate-400'} />
                <span>{n.label}</span>
                {n.badge > 0 && (
                  <span className={`inline-flex items-center justify-center text-[9px] font-black rounded-md px-1.5 py-0.5 ml-1 min-w-[16px] h-4 ${isActive ? 'bg-[#4a4a4c] text-[#f5d40b]' : 'bg-[#f5d40b]/20 text-[#4a4a4c] border border-[#f5d40b]'}`}>
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Network Status + Logout + Mobile Hamburger Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnline(!online)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs border"
            style={{
              background: online ? '#ecfdf5' : '#fef2f2',
              color: online ? '#065f46' : '#991b1b',
              borderColor: online ? '#a7f3d0' : '#fecaca'
            }}
            title={online ? "Live Online Sync Active" : "Offline Storage Mode"}
          >
            {online ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span className="font-mono text-[11px]">{online ? "Online" : "Offline"}</span>
          </button>

          <button
            onClick={logout}
            className="hidden sm:flex p-2 rounded-xl text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 transition-colors shadow-2xs cursor-pointer ml-1"
            title="Logout"
          >
            <LogOut size={14} />
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-md z-30">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: Home },
              { id: "completed", label: "Completed", icon: ClipboardCheck, badge: completedRecords.length },
              { id: "sync", label: "Sync Queue", icon: FolderSync, badge: syncQueue.length },
              { id: "profile", label: "Profile", icon: UserCircle2 }
            ].map((n) => {
              const Icon = n.icon;
              const isActive = currentTab === n.id;
              return (
                <button 
                  key={n.id} 
                  onClick={() => {
                    setCurrentTab(n.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer border ${
                    isActive ? 'bg-[#f5d40b] text-[#4a4a4c] font-black border-[#e5c40a]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={15} />
                    <span>{n.label}</span>
                  </div>
                  {n.badge > 0 && (
                    <span className={`text-[10px] font-black rounded-md px-1.5 py-0.5 ${isActive ? 'bg-[#4a4a4c] text-[#f5d40b]' : 'bg-slate-200 text-slate-800'}`}>
                      {n.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setOnline(!online)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border"
              style={{
                background: online ? '#ecfdf5' : '#fef2f2',
                color: online ? '#065f46' : '#991b1b',
                borderColor: online ? '#a7f3d0' : '#fecaca'
              }}
            >
              {online ? <Wifi size={13} /> : <WifiOff size={13} />}
              <span className="font-mono text-[11px]">{online ? "Live Online" : "Offline Mode"}</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 border border-red-200 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 pb-20">
        
        {/* Tab: Dashboard */}
        {currentTab === "dashboard" && (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
            
            {/* Light Mode Header Metrics for Assigned Center */}
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              
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

            {/* Active Screening Survey Program Card */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Active Screening Program
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Initiate participant screening & Demographics recording for {user.assigned_location || "Dharavi"} Center.</p>
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
                Total Completed: {completedRecords.length} {completedRecords.length === 1 ? 'Record' : 'Records'}
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
                  {completedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-mono font-medium">
                        No completed screening records found for {user.assigned_location || "Dharavi"} Center yet.
                      </td>
                    </tr>
                  ) : (
                    completedRecords.map((r, i) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Sync Queue */}
        {currentTab === "sync" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Offline Sync Queue</h2>
                <p className="text-xs text-slate-500 mt-0.5">Records stored locally while offline that need server synchronization.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <button
                  onClick={exportSyncQueueCSV}
                  disabled={syncQueue.length === 0}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-2xs cursor-pointer"
                  title="Export offline queue records to CSV"
                >
                  <Download size={13} className="text-slate-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleSync}
                  disabled={syncing || syncQueue.length === 0}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-2xs cursor-pointer"
                >
                  <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                  <span>{syncing ? "Syncing..." : "Sync Now"}</span>
                </button>
              </div>
            </div>

            {/* Search Bar for Sync Queue */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={syncSearch}
                onChange={(e) => setSyncSearch(e.target.value)}
                placeholder="Search offline queue by Participant ID, Name, Center..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
              />
              {syncSearch && (
                <button 
                  onClick={() => setSyncSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {filteredSyncQueue.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <FolderSync size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-800">
                  {syncSearch ? "No Matching Offline Records" : "All Caught Up!"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {syncSearch ? `No records found matching "${syncSearch}".` : `No pending offline survey entries for ${user.assigned_location || "Dharavi"}.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSyncQueue.map((item, index) => {
                  let raw = {};
                  if (item.mem_scrn_q30) {
                    try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
                  }
                  const pid = item.participant_id || item.mem_scrn_part_id || raw.participant_id || raw.mem_scrn_part_id || 'N/A';
                  const name = (item.fullName && item.fullName !== "Unnamed Participant") ? item.fullName : (raw.fullName || item.mem_scrn_q16 || pid);
                  const age = item.age || raw.age || item.mem_scrn_q1 || "45";
                  const gender = item.gender || raw.gender || (item.mem_scrn_q2 == "1" ? "Male" : "Female");
                  const loc = item.location || raw.location || item.mem_scrn_q17 || user.assigned_location || 'Dharavi';
                  const phone = item.contact_number || raw.contact_number || "N/A";

                  return (
                    <div key={item.local_id || index} className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs hover:border-slate-300 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm font-mono">
                            {name}
                          </p>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                            Pending Sync
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          ID: <span className="font-bold text-slate-800">{pid}</span>
                          {age ? ` • Age: ${age} yrs` : ''} 
                          {gender ? ` • Gender: ${gender}` : ''}
                          {phone && phone !== 'N/A' ? ` • Phone: ${phone}` : ''}
                          • Center: <span className="font-bold text-slate-800">{loc}</span>
                        </p>
                        {item.timestamp && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            Saved: {new Date(item.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedQaModalItem({ ...item, pid, name, age, gender, loc, phone, raw })}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-2xs"
                          title="View Question & Answer Details"
                        >
                          <Eye size={13} className="text-slate-600" />
                          <span>View Q&A</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {/* View Q&A Modal (Read Only) */}
      {selectedQaModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-amber-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    {selectedQaModalItem.fullName || selectedQaModalItem.participant_id || "Participant Q&A"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Participant ID: {selectedQaModalItem.participant_id || "N/A"} • Location: {selectedQaModalItem.location || user.assigned_location || "Dharavi"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedQaModalItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Primary Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Participant ID</span>
                  <span className="font-extrabold text-slate-900">{selectedQaModalItem.participant_id || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Screening Date</span>
                  <span className="font-extrabold text-slate-900">{selectedQaModalItem.screening_date || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Number</span>
                  <span className="font-extrabold text-slate-900">{selectedQaModalItem.contact_number || "Optional / None"}</span>
                </div>
              </div>

              <h4 className="text-xs font-extrabold uppercase font-mono tracking-wider text-slate-400 pt-2 border-t border-slate-100">
                Recorded Questions & Answers ({Object.keys(selectedQaModalItem).filter(k => k.startsWith("custom_") || k.startsWith("q")).length} Fields)
              </h4>

              {/* Dynamic Q&A List */}
              <div className="space-y-2">
                {Object.entries(selectedQaModalItem)
                  .filter(([key]) => key !== "local_id" && key !== "timestamp" && key !== "status")
                  .map(([key, value], idx) => {
                    const formatVal = (val) => {
                      if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? (v.label || JSON.stringify(v)) : String(v)).join(", ");
                      if (typeof val === 'object' && val !== null) return val.label || JSON.stringify(val);
                      return String(val || "N/A");
                    };

                    const labelName = key.startsWith("custom_") ? `Custom Field (${key.replace("custom_", "")})` : key.toUpperCase();

                    return (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between gap-1 text-xs">
                        <span className="font-bold text-slate-700 font-mono shrink-0">{labelName}:</span>
                        <span className="font-black text-slate-900 font-mono break-all text-right">{formatVal(value)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedQaModalItem(null)}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

        {/* Tab: Profile (Admin-aligned UI Style) */}
        {currentTab === "profile" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            
            {/* Admin-styled Hero Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
              
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg font-mono border-2 border-amber-300 shrink-0">
                    {String(user?.username || "DEO").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl font-black tracking-tight text-white">{user.username}</h2>
                      <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#f5d40b] text-[#4a4a4c] font-mono shadow-2xs">
                        {user.role_name || "Field Supervisor"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      YRGMERF Non-Communicable Disease Clinical Screening Platform
                    </p>
                    <p className="text-[11px] text-amber-400 font-mono flex items-center gap-1.5 pt-1">
                      <MapPin size={13} /> Center: Mumbai - {user.assigned_location || "Dharavi"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    <UserCheck size={14} /> Active Verified User
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Grid Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-slate-400 block">User ID / Code</span>
                <p className="text-sm font-extrabold text-slate-900 font-mono">{user.username || "FS001"}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-slate-400 block">Assigned Role</span>
                <p className="text-sm font-extrabold text-slate-900">{user.role_name || "Field Supervisor"}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-slate-400 block">Assigned Center</span>
                <p className="text-sm font-extrabold text-slate-900 font-mono">Mumbai - {user.assigned_location || "Dharavi"}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-slate-400 block">Access Status</span>
                <p className="text-sm font-extrabold text-emerald-700 font-mono flex items-center gap-1">
                  <CheckCircle2 size={14} /> {userPrivileges.length} Sections Enabled
                </p>
              </div>
            </div>

            {/* Minimal UI Module Access & Privileges Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-amber-600 shrink-0" />
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800">
                    Assigned Role Privileges & Enabled Survey Modules ({userPrivileges.length} Sections)
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {userPrivileges.map(secId => (
                  <div 
                    key={secId} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-mono shadow-2xs"
                  >
                    <span>{SECTION_NAMES[secId] || `Section ${secId}`}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Simple Clean Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 sm:px-8 py-3 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/yrg-logo.png" alt="YRG Care" className="w-5 h-5 object-contain" />
          <span>YRGMERF &copy; {new Date().getFullYear()} • NCD Platform</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Confidential Clinical System
        </span>
      </footer>

    </div>
  );
}
