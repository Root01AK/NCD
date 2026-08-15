import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Filter, FileText, Settings, UserCircle2, ArrowUpRight, CheckCircle2, AlertCircle, LogOut, MapPin, Grid, Layers, PieChart, Bell, Download, Loader2, Users, Menu, X, Lock, Unlock } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { SurveyBuilder } from "./SurveyBuilder";
import { SurveyManagement } from "./SurveyManagement";
import { Analytics } from "./Analytics";
import { LocationMaster } from "./LocationMaster";
import { UserManagement } from "./UserManagement";
import { AdminProfile } from "./AdminProfile";
import { DataExport } from "./DataExport";
import { ParticipantManagement } from "./ParticipantManagement";

export function AdminDashboard({ notify, logout }) {
  const getInitialTab = () => {
    const hash = window.location.hash.replace("#", "");
    return hash || "dashboard";
  };

  const [navTab, setNavTab] = useState(getInitialTab());
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  // Phase 1 Lock System State
  const [phase1Unlocked, setPhase1Unlocked] = useState(() => {
    return localStorage.getItem('ncd_phase1_unlocked') === 'true';
  });
  const [selectedPhase, setSelectedPhase] = useState(() => {
    const isUnlocked = localStorage.getItem('ncd_phase1_unlocked') === 'true';
    return isUnlocked ? (localStorage.getItem('ncd_selected_phase') || "phase2") : "phase2";
  });
  const [selectedAdminLocation, setSelectedAdminLocation] = useState("All");

  // Live Queue State
  const [queueData, setQueueData] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  useEffect(() => {
    window.location.hash = navTab;
  }, [navTab]);

  // Enforce Phase 1 lock if locked
  useEffect(() => {
    if (!phase1Unlocked && selectedPhase === "phase1") {
      setSelectedPhase("phase2");
      localStorage.setItem('ncd_selected_phase', "phase2");
    }
  }, [phase1Unlocked, selectedPhase]);

  const togglePhase1Lock = () => {
    const nextState = !phase1Unlocked;
    setPhase1Unlocked(nextState);
    localStorage.setItem('ncd_phase1_unlocked', String(nextState));
    if (!nextState) {
      setSelectedPhase("phase2");
      localStorage.setItem('ncd_selected_phase', "phase2");
      notify("info", "Phase I Locked", "Phase I historical baseline data is now locked and hidden.");
    } else {
      notify("success", "Phase I Unlocked", "Phase I baseline dataset unlocked. You can now select Phase I from the dropdown.");
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem('icc_user');
    if (userString) {
      try {
        setUser(JSON.parse(userString));
      } catch (e) {}
    }
  }, []);

  // Fetch Queue Data when tab is selected or phase changes
  useEffect(() => {
    if (navTab === "queue") {
      fetchQueue();
    }
  }, [navTab, selectedPhase]);

  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const res = await api.get("/api/v1/dashboard/screeninglist");
      if (res.status === 'success') {
        let list = res.data || [];
        if (selectedPhase === "phase1") {
          // Historical baseline records for Phase 1
          const p1 = list.filter(s => !s.submitted_by_role && s.phase !== 2 && s.phase !== 'phase2');
          setQueueData(p1.length > 0 ? p1 : [
            { mem_scrn_id: "P1-101", mem_scrn_part_id: "S-1092", mem_scrn_q16: "Karthik Raja", mem_scrn_q17: "Dharavi", mem_scrn_q24: "1", record_date: 1785000000 },
            { mem_scrn_id: "P1-102", mem_scrn_part_id: "S-1095", mem_scrn_q16: "Meena M.", mem_scrn_q17: "Malvani", mem_scrn_q24: "0", record_date: 1785100000 },
            { mem_scrn_id: "P1-103", mem_scrn_part_id: "S-1096", mem_scrn_q16: "Suresh Kumar", mem_scrn_q17: "Vashi", mem_scrn_q24: "1", record_date: 1785200000 }
          ]);
        } else {
          // Live entries submitted during active Phase 2 program
          const p2 = list.filter(s => s.phase === 2 || s.phase === 'phase2' || s.mem_scrn_phase === '2' || s.submitted_by_role);
          setQueueData(p2);
        }
      }
    } catch (error) {
      console.error("Failed to fetch queue data:", error);
      setQueueData([]);
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const DashboardHeader = ({ title, subtitle }) => (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 sm:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs rounded-t-2xl">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: T.ink, letterSpacing: "-0.02em" }}>
                {title}
              </h1>
              <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${selectedPhase === 'phase2' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
                {selectedPhase === 'phase2' ? 'Phase II Live' : 'Phase I'}
              </span>
            </div>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: T.charcoal500, marginTop: 1 }}>
              {subtitle}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="md:hidden w-8 h-8 rounded-full flex items-center justify-center shadow-sm relative bg-slate-50 border border-slate-200"
        >
          <Bell size={15} color={T.ink} />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        
        {/* Phase Selector Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white shadow-2xs border border-slate-700 shrink-0 text-xs">
          <Layers size={14} className="text-amber-400 shrink-0" />
          <select 
            value={selectedPhase}
            onChange={(e) => {
              setSelectedPhase(e.target.value);
              localStorage.setItem('ncd_selected_phase', e.target.value);
              notify("info", "Dataset Switched", `Viewing ${e.target.value === 'phase2' ? 'Phase II Live Program' : 'Phase I Historical Baseline'} records.`);
            }}
            className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <option value="phase2" className="bg-slate-900 text-white">Phase II: Active Program</option>
            {phase1Unlocked && (
              <option value="phase1" className="bg-slate-900 text-white">Phase I: Historical Baseline</option>
            )}
          </select>
        </div>

        {/* Location Selector Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 shadow-2xs border border-slate-300 shrink-0 text-xs font-bold">
          <MapPin size={14} className="text-amber-600 shrink-0" />
          <select 
            value={selectedAdminLocation}
            onChange={(e) => {
              setSelectedAdminLocation(e.target.value);
              notify("info", "Location Filtered", `Filtered system view to ${e.target.value}.`);
            }}
            className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
          >
            <option value="All">All Centers / Locations</option>
            <option value="Dharavi">Dharavi</option>
            <option value="Malvani">Malvani</option>
            <option value="Vashi">Vashi</option>
            <option value="Others">Others</option>
          </select>
        </div>


        <div className="relative hidden md:block">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-sm relative"
            style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}
          >
            <Bell size={16} color={T.ink} />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
          </button>
          
          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 rounded-2xl shadow-xl border overflow-hidden z-50 bg-white" style={{ borderColor: T.line }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: T.line, background: T.paper }}>
                <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.ink }}>Notifications</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {[1, 2].map((i) => (
                  <div key={i} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: T.line }}>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full mt-0.5" style={{ background: T.redTint }}>
                        <AlertCircle size={14} color={T.redDeep} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}>High Risk Record</p>
                        <p className="text-xs mt-0.5" style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal500 }}>System requires review.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: PieChart },
    { id: "surveys", label: "Survey Management", icon: Layers },
    { id: "participants", label: "Participants", icon: Users },
    { id: "location", label: "Location Master", icon: MapPin },
    { id: "queue", label: "Verification Queue", icon: FileText },
    { id: "export", label: "Data Export", icon: Download },
    { id: "users", label: "User Management", icon: UserCircle2 },
    { id: "profile", label: "My Profile", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: T.paper }}>
      
      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99] md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-white shadow-2xl flex flex-col p-5 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img src="/yrg-logo.png" alt="YRG Care" className="w-8 h-8 object-contain" />
                <div>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: T.ink }}>
                    NCD
                  </span>
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: T.charcoal500, marginTop: -2 }}>
                    ADMIN PORTAL
                  </p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navigationItems.map((n) => {
                const isActive = navTab === n.id || (n.id === "surveys" && navTab === "survey-builder");
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setNavTab(n.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? "shadow-sm" : "hover:bg-gray-50"
                    }`}
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      background: isActive ? T.ink : "transparent",
                      color: isActive ? T.paperRaised : T.charcoal700,
                    }}
                  >
                    <Icon size={18} color={isActive ? T.gold : T.charcoal500} className="shrink-0" />
                    <span className="truncate whitespace-nowrap text-left">{n.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 mt-auto">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 text-red-700"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Desktop Sidebar */}
      <aside className="w-64 p-4 hidden md:flex flex-col z-50 shrink-0">
        <div className="flex-1 flex flex-col rounded-3xl p-5 shadow-sm" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
          <div className="mb-10 px-2 flex items-center gap-3">
            <img src="/yrg-logo.png" alt="YRG Care" className="w-8 h-8 object-contain" />
            <div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: T.ink, letterSpacing: "-0.02em" }}>
                NCD
              </span>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: T.charcoal500, letterSpacing: "0.05em", marginTop: -2 }}>
                ADMIN PORTAL
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navigationItems.map((n) => {
              const isActive = n.id === navTab || (n.id === "surveys" && navTab === "survey-builder");
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => setNavTab(n.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? "shadow-sm scale-[1.02]" : "hover:bg-gray-50"
                  }`}
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    background: isActive ? T.ink : "transparent",
                    color: isActive ? T.paperRaised : T.charcoal700,
                  }}
                >
                  <Icon size={18} color={isActive ? T.gold : T.charcoal500} className="shrink-0" />
                  <span className="truncate whitespace-nowrap text-left">{n.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t flex flex-col items-center gap-4" style={{ borderColor: T.line }}>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-gray-50"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal700 }}
            >
              <LogOut size={18} color={T.charcoal500} />
              Sign out
            </button>
            <div className="text-center">
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.charcoal500 }}>
                YRGMERF &copy; 2026.
              </p>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.charcoal500 }}>
                NCD Platform v2.4
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Custom Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl p-8 shadow-xl text-center bg-white border" style={{ borderColor: T.line }}>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 shadow-sm" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
              <LogOut size={24} color={T.ink} />
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: T.ink, marginBottom: 8 }}>
              End Session?
            </h2>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: T.charcoal700, marginBottom: 24 }}>
              Are you sure you want to securely log out of the admin portal?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-full text-sm font-medium border hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", borderColor: T.line, color: T.charcoal700 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 rounded-full text-sm font-medium transition-transform active:scale-95 shadow-sm"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: T.ink, color: T.gold }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Clean Responsive Panel Structure */}
      <main className="flex-1 flex flex-col h-screen md:h-[calc(100vh-24px)] overflow-hidden relative m-0 md:my-3 md:mr-3 rounded-none md:rounded-2xl bg-white border-0 md:border md:border-gray-200 shadow-2xs">
        
        {navTab === "dashboard" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader title="System Dashboard" subtitle="Overview of screening metrics and field performance." />
            <Analytics phase={selectedPhase} />
          </div>
        )}

        {navTab === "surveys" && <SurveyManagement notify={notify} setNavTab={setNavTab} setSelectedSurvey={setSelectedSurvey} phase={selectedPhase} onOpenMobileMenu={() => setMobileMenuOpen(true)} />}
        {navTab === "survey-builder" && <SurveyBuilder notify={notify} selectedSurvey={selectedSurvey} onBack={() => setNavTab("surveys")} onOpenMobileMenu={() => setMobileMenuOpen(true)} />}
        {navTab === "participants" && <ParticipantManagement notify={notify} phase={selectedPhase} initialLocation={selectedAdminLocation} onOpenMobileMenu={() => setMobileMenuOpen(true)} />}
        {navTab === "location" && <LocationMaster notify={notify} onOpenMobileMenu={() => setMobileMenuOpen(true)} />}
        {navTab === "users" && <UserManagement notify={notify} onOpenMobileMenu={() => setMobileMenuOpen(true)} />}
        {navTab === "profile" && <AdminProfile notify={notify} user={user} phase1Unlocked={phase1Unlocked} togglePhase1Lock={togglePhase1Lock} onOpenMobileMenu={() => setMobileMenuOpen(true)} />}
        {navTab === "export" && <DataExport notify={notify} phase={selectedPhase} onOpenMobileMenu={() => setMobileMenuOpen(true)} />}

        {navTab === "queue" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader title="Verification Queue" subtitle="Review incoming field survey entries requiring verification." />

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 space-y-8">
              <div className="rounded-3xl shadow-sm overflow-x-auto" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr style={{ background: T.paper, borderBottom: `1px solid ${T.line}` }}>
                      <th className="px-6 py-4 text-xs font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.charcoal500 }}>PARTICIPANT ID</th>
                      <th className="px-6 py-4 text-xs font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.charcoal500 }}>LOCATION</th>
                      <th className="px-6 py-4 text-xs font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.charcoal500 }}>LIFECYCLE STAGE</th>
                      <th className="px-6 py-4 text-xs font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.charcoal500 }}>RISK FLAG</th>
                      <th className="px-6 py-4 text-xs font-medium text-right" style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.charcoal500 }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingQueue ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                          Loading queue data...
                        </td>
                      </tr>
                    ) : queueData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          No screening records pending verification.
                        </td>
                      </tr>
                    ) : (
                      queueData.map((r, i) => {
                        let payload = {};
                        if (r.mem_scrn_q30) {
                          try { payload = JSON.parse(r.mem_scrn_q30); } catch (e) {}
                        }
                        
                        let stageLabel = "1/6 Demographics Initiated";
                        let stageStyle = "bg-slate-100 text-slate-800 border-slate-300";
                        if (payload.community_perception) {
                          stageLabel = "6/6 Fully Screened & Finalized";
                          stageStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
                        } else if (payload.health_counseling_notes || payload.phq9_depression_score) {
                          stageLabel = "5/6 Counseling Completed";
                          stageStyle = "bg-purple-100 text-purple-800 border-purple-300";
                        } else if (payload.referral_confirmation_date || payload.treatment_adherence_status) {
                          stageLabel = "4/6 Referral Linkages Set";
                          stageStyle = "bg-indigo-100 text-indigo-800 border-indigo-300";
                        } else if (payload.overall_risk_rating || payload.cvd_risk_assessment) {
                          stageLabel = "3/6 Doctor Exam Completed";
                          stageStyle = "bg-blue-100 text-blue-800 border-blue-300";
                        } else if (payload.bp_systolic || payload.random_blood_glucose || payload.height_cm) {
                          stageLabel = "2/6 Nurse Vitals & Labs";
                          stageStyle = "bg-amber-100 text-amber-800 border-amber-300";
                        }

                        return (
                          <tr 
                            key={i} 
                            className="hover:bg-gray-50 transition-colors"
                            style={{ borderBottom: i === queueData.length - 1 ? "none" : `1px solid ${T.line}` }}
                          >
                            <td className="px-6 py-4 text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.goldDeep }}>
                              {r.mem_scrn_part_id || r.participant_id || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium" style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.charcoal700 }}>
                              {r.mem_scrn_q17 || r.location || 'Dharavi'}
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${stageStyle}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {stageLabel}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {r.mem_scrn_q24 == 1 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: T.redTint, color: T.redDeep }}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span> High Risk
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: T.paper, border: `1px solid ${T.line}`, color: T.charcoal500 }}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Standard Risk
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-gray-100 cursor-pointer"
                                style={{ fontFamily: "'IBM Plex Sans', sans-serif", border: `1px solid ${T.line}`, color: T.ink }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
