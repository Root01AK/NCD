import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Filter, Settings, UserCircle2, ArrowUpRight, CheckCircle2, AlertCircle, LogOut, MapPin, Grid, Layers, PieChart, Bell, Download, Loader2, Users, Menu, X, Lock, Unlock, Database, PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight } from "lucide-react";
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
import { DatabaseMastery } from "./DatabaseMastery";

export function AdminDashboard({ notify, logout }) {
  const getInitialTab = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "queue") return "dashboard";
    return hash || "dashboard";
  };

  const [navTab, setNavTab] = useState(getInitialTab());
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar Minimize State (persisted across sessions)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('ncd_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('ncd_sidebar_collapsed', String(next));
      return next;
    });
  };

  const [selectedSurveyState, setSelectedSurveyState] = useState(() => {
    try {
      const saved = localStorage.getItem('ncd_selected_survey');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return null;
  });

  const setSelectedSurvey = (survey) => {
    setSelectedSurveyState(survey);
    if (survey) {
      localStorage.setItem('ncd_selected_survey', JSON.stringify(survey));
    } else {
      localStorage.removeItem('ncd_selected_survey');
    }
  };

  const selectedSurvey = selectedSurveyState;
  
  // Phase 1 Lock System State
  const [phase1Unlocked, setPhase1Unlocked] = useState(() => {
    return localStorage.getItem('ncd_phase1_unlocked') === 'true';
  });
  const [selectedPhase, setSelectedPhase] = useState(() => {
    const isUnlocked = localStorage.getItem('ncd_phase1_unlocked') === 'true';
    return isUnlocked ? (localStorage.getItem('ncd_selected_phase') || "phase2") : "phase2";
  });
  const [selectedAdminLocation, setSelectedAdminLocation] = useState("All");

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
      <aside className={`${sidebarCollapsed ? "w-[84px]" : "w-64"} p-3.5 hidden md:flex flex-col z-50 shrink-0 transition-all duration-300 ease-in-out`}>
        <div className={`flex-1 flex flex-col rounded-3xl ${sidebarCollapsed ? "p-3 items-center" : "p-5"} shadow-sm transition-all duration-300 ease-in-out`} style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
          
          {/* Header & Minimize/Expand Button */}
          {sidebarCollapsed ? (
            <div className="mb-6 flex flex-col items-center gap-3">
              <img src="/yrg-logo.png" alt="YRG Care" className="w-8 h-8 object-contain shrink-0" />
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200 shadow-2xs group relative"
                title="Expand Sidebar"
              >
                <PanelLeftOpen size={16} />
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-sans">
                  Expand Sidebar
                </div>
              </button>
            </div>
          ) : (
            <div className="mb-8 px-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/yrg-logo.png" alt="YRG Care" className="w-8 h-8 object-contain shrink-0" />
                <div>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: T.ink, letterSpacing: "-0.02em" }}>
                    NCD
                  </span>
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: T.charcoal500, letterSpacing: "0.05em", marginTop: -2 }}>
                    ADMIN PORTAL
                  </p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Minimize Sidebar"
              >
                <PanelLeftClose size={17} />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <nav className={`flex-1 space-y-1.5 ${sidebarCollapsed ? "w-full flex flex-col items-center" : ""}`}>
            {navigationItems.map((n) => {
              const isActive = n.id === navTab || (n.id === "surveys" && navTab === "survey-builder");
              const Icon = n.icon;
              return sidebarCollapsed ? (
                <button
                  key={n.id}
                  onClick={() => setNavTab(n.id)}
                  className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all cursor-pointer relative group ${
                    isActive ? "shadow-sm scale-105" : "hover:bg-slate-100/80"
                  }`}
                  style={{
                    background: isActive ? T.ink : "transparent",
                  }}
                  title={n.label}
                >
                  <Icon size={19} color={isActive ? T.gold : T.charcoal500} className="shrink-0" />
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-sans">
                    {n.label}
                  </div>
                </button>
              ) : (
                <button
                  key={n.id}
                  onClick={() => setNavTab(n.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    isActive ? "shadow-sm scale-[1.02]" : "hover:bg-slate-50"
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

          {/* Footer Area */}
          <div className={`mt-auto pt-4 border-t flex flex-col items-center gap-3 ${sidebarCollapsed ? "w-full" : ""}`} style={{ borderColor: T.line }}>
            {sidebarCollapsed ? (
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-11 h-11 flex items-center justify-center rounded-2xl transition-all hover:bg-red-50 text-slate-600 hover:text-red-700 cursor-pointer group relative"
                title="Sign out"
              >
                <LogOut size={18} className="shrink-0" />
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-red-950 text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-sans">
                  Sign out
                </div>
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all hover:bg-red-50 text-slate-700 hover:text-red-700 cursor-pointer group"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                  <LogOut size={17} className="text-slate-500 group-hover:text-red-600 shrink-0" />
                  <span>Sign out</span>
                </button>
                <div className="text-center">
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.charcoal500 }}>
                    YRGMERF &copy; 2026
                  </p>
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.charcoal500 }}>
                    NCD Platform v2.4
                  </p>
                </div>
              </>
            )}
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
      </main>
    </div>
  );
}
