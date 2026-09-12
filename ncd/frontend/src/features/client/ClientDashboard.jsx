import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, FileText, ArrowRight, LogOut, Loader2, Home, FolderSync, ClipboardCheck, UserCircle2, RefreshCw, MapPin, Database, Award, Shield, UserCheck, CheckCircle2, AlertCircle, Search, Download, Eye, X, Menu, Trash2, Calendar, Filter, Activity, Heart, Stethoscope, User, AlertTriangle, Check, ChevronRight } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { getQueue, deleteFromQueue } from "../../lib/db";
import { Mark } from "../../components/ui/Mark";
import { GenderBadge } from "../admin/ParticipantManagement";

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
  const [selectedSyncLocation, setSelectedSyncLocation] = useState(
    () => localStorage.getItem('ncd_active_location') || "Dharavi"
  );
  const [syncAgeGroupFilter, setSyncAgeGroupFilter] = useState("All");
  const [syncGenderFilter, setSyncGenderFilter] = useState("All");
  const [selectedSyncIds, setSelectedSyncIds] = useState([]);
  const [selectedQaModalItem, setSelectedQaModalItem] = useState(null);

  // States for Completed Screening Records Redesign
  const [completedSearch, setCompletedSearch] = useState("");
  const [completedRiskFilter, setCompletedRiskFilter] = useState("All");
  const [completedStatusFilter, setCompletedStatusFilter] = useState("All");
  const [selectedCompletedDetail, setSelectedCompletedDetail] = useState(null);

  const exportCompletedRecordsCSV = (recordsToExport) => {
    if (!recordsToExport || recordsToExport.length === 0) {
      if (notify) notify("error", "No Records", "No completed screening records available to export.");
      return;
    }
    const headers = ["Participant ID", "Full Name", "Age", "Gender", "Date", "Location", "Risk Level", "Status"];
    const rows = recordsToExport.map(r => [
      `"${r.participant_id || ''}"`,
      `"${r.fullName || ''}"`,
      r.age || '',
      `"${r.gender || ''}"`,
      `"${r.date || ''}"`,
      `"${r.location || ''}"`,
      `"${r.risk || 'Standard Risk'}"`,
      `"${r.status || 'Completed'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Completed_Screenings_${activeLocation || 'Dharavi'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (notify) notify("success", "Exported CSV", `Exported ${recordsToExport.length} completed screening records.`);
  };

  const exportSyncQueueCSV = (customList = null) => {
    let listToExport = customList;
    
    if (!listToExport) {
      if (selectedSyncIds.length > 0) {
        listToExport = syncQueue.filter(item => selectedSyncIds.includes(item.local_id));
      } else {
        listToExport = syncQueue;
      }
    }

    if (!listToExport || listToExport.length === 0) {
      notify("error", "No Records Found", "No offline queue records available to export.");
      return;
    }
    
    const headers = ["Local ID", "Participant ID", "Full Name", "Age", "Gender", "Location", "Screening Date", "Contact Number", "Saved Timestamp"];
    const rows = listToExport.map(item => {
      let raw = {};
      if (item.mem_scrn_q30) {
        try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
      }
      return [
        item.local_id || "",
        `"${item.participant_id || item.mem_scrn_part_id || raw.participant_id || ''}"`,
        `"${item.fullName || raw.fullName || item.mem_scrn_q16 || ''}"`,
        item.age || raw.age || item.mem_scrn_q1 || "",
        `"${item.gender || raw.gender || (item.mem_scrn_q2 == '1' ? 'Male' : 'Female')}"`,
        `"${item.location || raw.location || item.mem_scrn_q17 || localStorage.getItem('ncd_active_location') || ''}"`,
        `"${item.screening_date || raw.screening_date || ''}"`,
        `"${item.contact_number || raw.contact_number || ''}"`,
        `"${item.timestamp || ''}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ncd_offline_sync_queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("success", "Export Completed", `Exported ${listToExport.length} offline queue records to CSV.`);
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
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    // Fetch live user record directly from database
    api.get('/api/v1/auth/me').then(res => {
      if (res && res.status === 'success' && res.user) {
        setDbUser(res.user);
        localStorage.setItem('ncd_user', JSON.stringify(res.user));
      }
    }).catch(e => console.error("Could not fetch DB user profile", e));
  }, []);

  const user = dbUser || parsedUser || { username: 'DEO', role_name: 'Field Supervisor', role_id: 2, assigned_location: 'Dharavi' };
  const dbLocation = user.assigned_location || user.location || user.tenant_name || user.loc_name || "Dharavi";
  const [activeLocation, setActiveLocation] = useState(
    () => localStorage.getItem('ncd_active_location') || dbLocation || "Dharavi"
  );

  // Dynamic user privilege configuration
  let rawPrivileges = user.privileges;
  if (typeof rawPrivileges === 'string') {
    try { rawPrivileges = JSON.parse(rawPrivileges); } catch (e) { rawPrivileges = null; }
  }
  let userPrivileges = Array.isArray(rawPrivileges) ? rawPrivileges : null;
  if (userPrivileges === null) {
    const rLower = String(user?.role_name || "").toLowerCase();
    userPrivileges = rLower.includes("nurse") ? [2, 3, 4, 5, 6, 7, 9, 10, 11]
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
        notify("success", "Sync complete", "All records successfully synchronized with the central database.");
      } catch (err) {
        notify("error", "Sync failed", err.message || "An error occurred during sync.");
      } finally {
        setSyncing(false);
      }
    }, 1200);
  };

  // Completed records for assigned center (fetches from IndexedDB queue, LocalStorage, and Server API)
  const [completedRecords, setCompletedRecords] = useState([]);

  useEffect(() => {
    const loadSubmitted = async () => {
      const recordMap = new Map();

      const addCandidate = (item) => {
        if (!item) return;
        let raw = {};
        if (item.mem_scrn_q30) {
          try {
            raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30;
          } catch (e) {}
        }
        const full = { ...item, ...raw };
        const pid = full.participant_id || full.mem_scrn_part_id || item.participant_id || item.mem_scrn_part_id;
        if (!pid || pid === 'N/A') return;

        // Check if this record is completed by current role (or general completed)
        const isNurseDone = Boolean(
          full.staff_nurse_completed === true || 
          full.completed_by_staff_nurse === true || 
          Boolean(full.nurse_timestamp) ||
          (full.bp_sys && String(full.bp_sys) !== '0' && full.height)
        );

        const isDoctorDone = Boolean(
          full.doctor_completed === true || 
          full.completed_by_doctor === true || 
          Boolean(full.doctor_timestamp) ||
          Boolean(full.doctor_user) ||
          (full.doctor_notes && String(full.doctor_notes).trim() !== "")
        );

        const isSec8Done = Boolean(
          full.counselor_section_completed === true || 
          full.counselor_sec8_completed === true ||
          (full.gad7_score !== undefined && String(full.gad7_score) !== "") ||
          (full.phq9_score !== undefined && String(full.phq9_score) !== "") ||
          (full.answers && (full.answers.q58 || full.answers.q61 || full.answers.q65))
        );

        const isCoordDone = Boolean(
          full.coordinator_completed === true || 
          full.completed_by_coordinator === true || 
          Boolean(full.coordinator_timestamp) ||
          (full.linkage_status && String(full.linkage_status).trim() !== "")
        );

        const isCounselDone = Boolean(
          full.counselor_sec15_completed === true || 
          full.completed_by_counselor === true || 
          Boolean(full.counselor_timestamp) ||
          (full.counseling_notes && String(full.counseling_notes).trim() !== "") ||
          isSec8Done
        );

        const isSec16Done = Boolean(
          (full.section_16_completed === true || full.completed_by_section16 === true || full.sec_16_done === true) &&
          isNurseDone && isDoctorDone && isCoordDone && isCounselDone
        );

        const prev = recordMap.get(pid);
        const merged = prev ? { ...prev.raw, ...full } : full;

        // Clean name resolution
        const rawName = merged.fullName || merged.mem_scrn_q16 || merged.full_name || merged.name || "";
        let cleanName = "";
        if (typeof rawName === 'string') {
          const t = rawName.trim();
          const l = t.toLowerCase();
          if (
            t.length > 0 &&
            l !== "participant record" &&
            l !== "participant" &&
            l !== "unnamed participant" &&
            l !== "unnamed" &&
            l !== "null" &&
            l !== "undefined" &&
            l !== "n/a" &&
            l !== "na" &&
            l !== "p"
          ) {
            cleanName = t;
          }
        }

        let statusText = "Field Supervisor Completed (Sec 1)";
        if (isSec16Done) statusText = "Fully Completed (All 16)";
        else if (isCounselDone && isSec8Done) statusText = "Counselor Completed (Sec 8, 15)";
        else if (isCounselDone) statusText = "Counselor Completed (Sec 15)";
        else if (isCoordDone) statusText = "Case Coordinator Completed (Sec 14)";
        else if (isDoctorDone) statusText = "Doctor Completed (Sec 12-13)";
        else if (isSec8Done) statusText = "Counselor Completed (Sec 8)";
        else if (isNurseDone) statusText = "Staff Nurse Completed (Sec 2-7, 9-11)";
        else statusText = "Field Supervisor Completed (Sec 1)";

        recordMap.set(pid, {
          participant_id: pid,
          cleanName: cleanName,
          fullName: cleanName || pid,
          age: String(merged.age || merged.mem_scrn_q1 || "45"),
          gender: merged.gender || (merged.mem_scrn_q2 === "1" ? "Male" : "Female"),
          date: merged.screening_date || (merged.record_date ? new Date(merged.record_date * 1000).toLocaleDateString() : new Date().toLocaleDateString()),
          location: merged.location || merged.mem_scrn_q17 || user.assigned_location || "Dharavi",
          status: statusText,
          risk: merged.overall_risk_rating || (merged.mem_scrn_q24 == 1 ? "High Risk Flagged" : "Standard Risk"),
          raw: merged
        });
      };

      // 1. IndexedDB local sync queue
      try {
        const queue = await getQueue();
        if (Array.isArray(queue)) queue.forEach(addCandidate);
      } catch (e) {}

      // 2. LocalStorage initiated / submitted records
      try {
        const localStr = localStorage.getItem('ncd_local_initiated_participants');
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (Array.isArray(parsed)) parsed.forEach(addCandidate);
        }
      } catch (e) {}

      // 3. API screening list & queue
      try {
        const res = await api.get("/api/v1/dashboard/screeninglist");
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          res.data.forEach(addCandidate);
        }
      } catch (e) {}

      try {
        const resQ = await api.get("/api/v1/screening/queue");
        if (resQ && resQ.status === 'success' && Array.isArray(resQ.data)) {
          resQ.data.forEach(addCandidate);
        }
      } catch (e) {}

      setCompletedRecords(Array.from(recordMap.values()));
    };

    loadSubmitted();
    const interval = setInterval(loadSubmitted, 5000);
    return () => clearInterval(interval);
  }, [user.role, user.role_name, user.assigned_location, syncQueue]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const matchesActiveCenter = (item) => {
    if (!activeLocation || activeLocation === "All") return true;
    let raw = {};
    if (item.mem_scrn_q30) {
      try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
    }
    const loc = item.location || raw.location || item.mem_scrn_q17 || "";
    const pId = item.participant_id || item.mem_scrn_part_id || raw.participant_id || raw.mem_scrn_part_id || "";

    const activeLocLower = String(activeLocation).toLowerCase().trim();
    const locLower = String(loc).toLowerCase().trim();
    const pIdUpper = String(pId).toUpperCase().trim();

    if (activeLocLower.includes("malvani") || activeLocLower.includes("ml")) {
      return locLower.includes("malvani") || locLower.includes("ml") || pIdUpper.includes("NCDML") || (pIdUpper.includes("ML") && !pIdUpper.includes("NCDDH") && !pIdUpper.includes("NCDVA"));
    }
    if (activeLocLower.includes("dharavi") || activeLocLower.includes("dh")) {
      return locLower.includes("dharavi") || locLower.includes("dh") || pIdUpper.includes("NCDDH") || (pIdUpper.includes("DH") && !pIdUpper.includes("NCDML") && !pIdUpper.includes("NCDVA"));
    }
    if (activeLocLower.includes("vashi") || activeLocLower.includes("va")) {
      return locLower.includes("vashi") || locLower.includes("va") || pIdUpper.includes("NCDVA") || (pIdUpper.includes("VA") && !pIdUpper.includes("NCDDH") && !pIdUpper.includes("NCDML"));
    }

    return locLower.includes(activeLocLower) || activeLocLower.includes(locLower);
  };

  const centerSyncQueueCount = syncQueue.filter(matchesActiveCenter).length;
  const centerCompletedCount = completedRecords.filter(matchesActiveCenter).length;

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
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-950 border border-amber-300 rounded-xl px-3 py-1 text-xs font-mono font-extrabold shadow-2xs">
              <MapPin size={12} className="text-amber-700 shrink-0" />
              <span>{activeLocation} Center</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl p-1 shadow-inner overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "completed", label: "Completed", icon: ClipboardCheck, badge: centerCompletedCount },
            { id: "sync", label: "Sync Queue", icon: FolderSync, badge: centerSyncQueueCount },
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

        {/* Right: Logout + Mobile Hamburger Button */}
        <div className="flex items-center gap-2">

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
              { id: "completed", label: "Completed", icon: ClipboardCheck, badge: centerCompletedCount },
              { id: "sync", label: "Sync Queue", icon: FolderSync, badge: centerSyncQueueCount },
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

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
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
          <div className="max-w-6xl mx-auto space-y-3.5 animate-in fade-in duration-200">
            
            {/* Clean Clinical Workstation Header with Dynamic Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                    Phase II Active
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Welcome, {user.full_name || user.username || (user.role_name ? user.role_name : "Clinical Staff")}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {user.role_name || "Operational Screening"} Workstation  •  Active Center: <strong className="text-slate-900 font-bold">{activeLocation} Center</strong>
                </p>
              </div>
            </div>

            {/* Perfectly Aligned 3-Card Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {(() => {
                const matchesActiveCenter = (item) => {
                  if (!activeLocation || activeLocation === "All") return true;
                  let raw = {};
                  if (item.mem_scrn_q30) {
                    try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
                  }
                  const loc = item.location || raw.location || item.mem_scrn_q17 || "";
                  const pId = item.participant_id || item.mem_scrn_part_id || raw.participant_id || "";

                  const activeLocLower = String(activeLocation).toLowerCase().trim();
                  const locLower = String(loc).toLowerCase().trim();
                  const pIdUpper = String(pId).toUpperCase().trim();

                  if (activeLocLower.includes("malvani") || activeLocLower.includes("ml")) {
                    return locLower.includes("malvani") || locLower.includes("ml") || pIdUpper.includes("NCDML") || pIdUpper.includes("ML");
                  }
                  if (activeLocLower.includes("dharavi") || activeLocLower.includes("dh")) {
                    return locLower.includes("dharavi") || locLower.includes("dh") || pIdUpper.includes("NCDDH") || pIdUpper.includes("DH");
                  }
                  if (activeLocLower.includes("vashi") || activeLocLower.includes("va")) {
                    return locLower.includes("vashi") || locLower.includes("va") || pIdUpper.includes("NCDVA") || pIdUpper.includes("VA");
                  }

                  return locLower.includes(activeLocLower) || activeLocLower.includes(locLower);
                };

                const centerSyncQueue = syncQueue.filter(matchesActiveCenter);
                const centerCompleted = completedRecords.filter(matchesActiveCenter);

                const pIds = new Set();
                centerSyncQueue.forEach(r => {
                  let raw = {};
                  if (r.mem_scrn_q30) { try { raw = typeof r.mem_scrn_q30 === 'string' ? JSON.parse(r.mem_scrn_q30) : r.mem_scrn_q30; } catch (e) {} }
                  const id = r.participant_id || r.mem_scrn_part_id || raw.participant_id;
                  if (id) pIds.add(String(id).toUpperCase().trim());
                });
                centerCompleted.forEach(r => {
                  let raw = {};
                  if (r.mem_scrn_q30) { try { raw = typeof r.mem_scrn_q30 === 'string' ? JSON.parse(r.mem_scrn_q30) : r.mem_scrn_q30; } catch (e) {} }
                  const id = r.participant_id || r.mem_scrn_part_id || raw.participant_id;
                  if (id) pIds.add(String(id).toUpperCase().trim());
                });
                const totalInitiatedCount = pIds.size;

                return (
                  <>
                    {/* Card 1: Initiated Surveys */}
                    <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-200 flex items-center gap-3.5 group">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Total Initiated ({activeLocation})</p>
                        <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{totalInitiatedCount}</p>
                        <span className="text-[9px] font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded font-mono inline-block">
                          Demographics Active
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Offline Pending Sync Queue */}
                    <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex items-center gap-3.5 group">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                        <FolderSync size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Pending Sync Queue ({activeLocation})</p>
                        <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{centerSyncQueue.length}</p>
                        <span className="text-[9px] font-bold text-blue-900 bg-blue-100/70 px-1.5 py-0.5 rounded font-mono inline-block">
                          {centerSyncQueue.length > 0 ? 'Offline Queue Ready' : 'All Local Synced'}
                        </span>
                      </div>
                    </div>

                    {/* Card 3: Completed & Synced */}
                    <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex items-center gap-3.5 group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Completed & Synced ({activeLocation})</p>
                        <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{centerCompleted.length}</p>
                        <span className="text-[9px] font-bold text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded font-mono inline-block">
                          Transmitted to Admin
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>

            {/* Doctor Dashboard: Participant Vitals & Clinical Inspection Card Grid */}
            {Boolean(user?.role_name?.toLowerCase().includes("doctor") || (user?.role_id === 4)) && (
              <DoctorVitalsCardGrid 
                syncQueue={syncQueue} 
                completedRecords={completedRecords}
                onOpenSurvey={openSurvey} 
              />
            )}

            {/* Active Screening Survey Program Suite */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Active Screening Program Suite
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Select a program to start participant screening &amp; demographics entry for {localStorage.getItem('ncd_active_location') || user?.assigned_location || "Dharavi"} Center.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="animate-spin text-slate-400" size={24} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {surveys.map((survey) => (
                    <div
                      key={survey.sur_id || survey.sur_code}
                      onClick={() => openSurvey(survey)}
                      className="bg-white hover:bg-amber-50/30 rounded-2xl p-4 shadow-2xs hover:shadow-md border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 group-hover:scale-105 transition-transform">
                            <FileText size={18} className="text-amber-600" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono border border-slate-200">
                            {survey.sur_code || "NCD-MUM-2026"}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-snug">
                          {survey.sur_title || "MUMBAI'S NCD SURVEY — PHASE II"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Non-Communicable Disease Screening for {localStorage.getItem('ncd_active_location') || user?.assigned_location || "Dharavi"} Center.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-amber-800 font-extrabold font-mono text-xs">
                          Start Assigned Screening Form
                        </span>
                        <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#f5d40b] flex items-center justify-center transition-colors">
                          <ArrowRight size={13} className="text-slate-600 group-hover:text-[#4a4a4c] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Forms Section: Field Supervisor Section 16 (Community Perception Entry) */}
            {Boolean(user?.role_name?.toLowerCase().includes("supervisor") || user?.role_id === 2 || (userPrivileges.includes(16) && !user?.role_name?.toLowerCase().includes("nurse") && !user?.role_name?.toLowerCase().includes("doctor") && !user?.role_name?.toLowerCase().includes("counselor") && !user?.role_name?.toLowerCase().includes("coordinator"))) && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Forms
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Field Supervisor observation forms &amp; Section 16 Community Perception entry.
                    </p>
                  </div>
                </div>

                <FieldSupervisorSection16Card
                  syncQueue={syncQueue}
                  completedRecords={completedRecords}
                  activeLocation={activeLocation}
                  onOpenSurvey={openSurvey}
                  notify={notify}
                />
              </div>
            )}

          </div>
        )}

        {/* Tab: Completed Records (Redesigned Modern Clinical Records Hub) */}
        {currentTab === "completed" && (() => {
          const centerRecords = completedRecords.filter(matchesActiveCenter);
          const totalCount = centerRecords.length;
          const highRiskCount = centerRecords.filter(r => r.risk && r.risk.includes('High')).length;
          const fullyCompletedCount = centerRecords.filter(r => 
            (r.status && (r.status.includes('Fully') || r.status.includes('16'))) || 
            (r.raw && (r.raw.section_16_completed || r.raw.sec_16_done))
          ).length;

          // Filter by search, risk, and status
          const filteredRecords = centerRecords.filter(r => {
            if (completedSearch.trim()) {
              const q = completedSearch.toLowerCase().trim();
              const pid = String(r.participant_id || "").toLowerCase();
              const name = String(r.fullName || "").toLowerCase();
              const loc = String(r.location || "").toLowerCase();
              const age = String(r.age || "").toLowerCase();
              const phone = String(r.raw?.contact_number || r.raw?.q5 || "").toLowerCase();
              if (!pid.includes(q) && !name.includes(q) && !loc.includes(q) && !age.includes(q) && !phone.includes(q)) {
                return false;
              }
            }
            if (completedRiskFilter !== "All") {
              if (completedRiskFilter === "High") {
                if (!r.risk || !r.risk.includes("High")) return false;
              } else if (completedRiskFilter === "Standard") {
                if (r.risk && r.risk.includes("High")) return false;
              }
            }
            if (completedStatusFilter !== "All") {
              if (completedStatusFilter === "FullyCompleted") {
                const isFull = (r.status && (r.status.includes('Fully') || r.status.includes('16'))) || (r.raw && (r.raw.section_16_completed || r.raw.sec_16_done));
                if (!isFull) return false;
              } else if (completedStatusFilter === "ScreeningDone") {
                const isFull = (r.status && (r.status.includes('Fully') || r.status.includes('16'))) || (r.raw && (r.raw.section_16_completed || r.raw.sec_16_done));
                if (isFull) return false;
              }
            }
            return true;
          });

          return (
            <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200">
              
              {/* Header & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1">
                      <CheckCircle2 size={11} /> Phase II Transmitted
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {activeLocation || user.assigned_location || "Dharavi"} Center
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Completed Screening Records
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Verified participant screening profiles, health vitals &amp; completed clinical sections for {activeLocation || user.assigned_location || "Dharavi"} Center.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => exportCompletedRecordsCSV(filteredRecords)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
                    title="Export currently filtered completed screening records to CSV"
                  >
                    <Download size={13} className="text-slate-500" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* 3-Card Summary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Total Completed</p>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{totalCount}</p>
                    <span className="text-[9px] font-bold text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded font-mono inline-block">
                      Screenings Recorded
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">High Risk Screenings</p>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{highRiskCount}</p>
                    <span className="text-[9px] font-bold text-rose-900 bg-rose-100/70 px-1.5 py-0.5 rounded font-mono inline-block">
                      Requires Priority Attention
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <Award size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Fully Completed</p>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{fullyCompletedCount}</p>
                    <span className="text-[9px] font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded font-mono inline-block">
                      All Modules Finished
                    </span>
                  </div>
                </div>
              </div>

              {/* Modern Filters & Search Bar */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={completedSearch}
                      onChange={(e) => setCompletedSearch(e.target.value)}
                      placeholder="Search by Participant ID (e.g. NCDDH0001), Name, Phone..."
                      className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all font-medium text-slate-800"
                    />
                    {completedSearch && (
                      <button
                        onClick={() => setCompletedSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                    {/* Risk Filter */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 font-mono">Risk:</span>
                      <button
                        onClick={() => setCompletedRiskFilter("All")}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${completedRiskFilter === 'All' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setCompletedRiskFilter("High")}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${completedRiskFilter === 'High' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'}`}
                      >
                        High Risk
                      </button>
                      <button
                        onClick={() => setCompletedRiskFilter("Standard")}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${completedRiskFilter === 'Standard' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
                      >
                        Standard
                      </button>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 font-mono">Status:</span>
                      <button
                        onClick={() => setCompletedStatusFilter("All")}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${completedStatusFilter === 'All' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setCompletedStatusFilter("FullyCompleted")}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${completedStatusFilter === 'FullyCompleted' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-50'}`}
                      >
                        Fully Done
                      </button>
                      <button
                        onClick={() => setCompletedStatusFilter("ScreeningDone")}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${completedStatusFilter === 'ScreeningDone' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-800 hover:bg-blue-50'}`}
                      >
                        In Pipeline
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                  <span>Showing <strong className="text-slate-800 font-bold">{filteredRecords.length}</strong> of <strong className="text-slate-800 font-bold">{totalCount}</strong> completed records</span>
                  {(completedSearch || completedRiskFilter !== "All" || completedStatusFilter !== "All") && (
                    <button
                      onClick={() => {
                        setCompletedSearch("");
                        setCompletedRiskFilter("All");
                        setCompletedStatusFilter("All");
                      }}
                      className="text-amber-700 hover:text-amber-800 font-bold text-[11px] hover:underline cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Records Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                {filteredRecords.length === 0 ? (
                  <div className="py-16 px-4 text-center space-y-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
                      <ClipboardCheck size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">No matching completed records found</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {totalCount === 0 
                          ? `No participant screening records have been completed for ${activeLocation || user.assigned_location || "Dharavi"} Center yet.`
                          : "Try adjusting your search query or filter tags to find the participant record."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-200 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-5 py-3.5 font-bold">Participant</th>
                          <th className="px-5 py-3.5 font-bold">Demographics</th>
                          <th className="px-5 py-3.5 font-bold">Date &amp; Location</th>
                          <th className="px-5 py-3.5 font-bold">Risk Assessment</th>
                          <th className="px-5 py-3.5 font-bold">Stage Status</th>
                          <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRecords.map((r, i) => {
                          const isHighRisk = r.risk && r.risk.includes('High');
                          const isFullyDone = r.status && r.status.includes('Fully Completed');
                          const isFemale = String(r.gender).toLowerCase().includes('female');
                          const isTrans = String(r.gender).toLowerCase().includes('trans');
                          
                          let seriesNumber = "";
                          if (r.participant_id) {
                            const match = String(r.participant_id).match(/(\d+)$/);
                            if (match) {
                              const num = parseInt(match[1], 10);
                              seriesNumber = String(num).padStart(2, '0');
                            }
                          }
                          if (!seriesNumber && r.cleanName) {
                            const parts = r.cleanName.split(/\s+/).filter(Boolean);
                            if (parts.length >= 2) seriesNumber = (parts[0][0] + parts[1][0]).toUpperCase();
                            else if (parts.length === 1) seriesNumber = parts[0].slice(0, 2).toUpperCase();
                          }
                          if (!seriesNumber) seriesNumber = String(i + 1).padStart(2, '0');

                          return (
                            <tr key={i} className="hover:bg-slate-50/70 transition-colors group">
                              
                              {/* Participant Name & ID */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs font-mono border ${
                                    isHighRisk
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : isFemale
                                        ? 'bg-purple-50 text-purple-800 border-purple-200/80'
                                        : isTrans
                                          ? 'bg-teal-50 text-teal-800 border-teal-200/80'
                                          : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {seriesNumber}
                                  </div>
                                  <div>
                                    {r.cleanName ? (
                                      <>
                                        <div className="font-bold text-slate-900 text-xs sm:text-[13px] group-hover:text-amber-800 transition-colors font-mono">
                                          {r.cleanName}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className="font-mono font-bold text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200/80">
                                            {r.participant_id}
                                          </span>
                                          {r.raw?.contact_number && (
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              • {r.raw.contact_number}
                                            </span>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="font-bold text-slate-900 text-xs sm:text-[13px] group-hover:text-amber-800 transition-colors font-mono">
                                          {r.participant_id}
                                        </div>
                                        {r.raw?.contact_number ? (
                                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                            • {r.raw.contact_number}
                                          </div>
                                        ) : (
                                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                            {r.location || activeLocation} Center
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Demographics */}
                              <td className="px-5 py-3.5">
                                <div className="space-y-0.5">
                                  <div className="font-medium text-slate-800 flex items-center gap-1.5 flex-wrap font-mono">
                                    <span>{r.age}y</span>
                                    <span>•</span>
                                    <GenderBadge gender={r.gender} />
                                  </div>
                                </div>
                              </td>

                              {/* Date & Location */}
                              <td className="px-5 py-3.5">
                                <div className="space-y-1 font-mono">
                                  <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                                    <Calendar size={11} className="text-slate-400" />
                                    <span>{r.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                    <MapPin size={10} className="text-slate-400" />
                                    <span>{r.location || activeLocation} Center</span>
                                  </div>
                                </div>
                              </td>

                              {/* Risk Assessment */}
                              <td className="px-5 py-3.5">
                                {isHighRisk ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    {r.risk || "High Risk Flagged"}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                    <Check size={11} className="text-slate-500" />
                                    {r.risk || "Standard Risk"}
                                  </span>
                                )}
                              </td>

                              {/* Stage Status */}
                              <td className="px-5 py-3.5 font-mono">
                                {isFullyDone ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                                    <Award size={11} className="text-amber-700" />
                                    <span>Fully Completed (All 16)</span>
                                  </span>
                                ) : r.status && r.status.includes('Staff Nurse') ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                    <CheckCircle2 size={11} className="text-blue-600" />
                                    <span>{r.status}</span>
                                  </span>
                                ) : r.status && r.status.includes('Doctor') ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                                    <CheckCircle2 size={11} className="text-purple-600" />
                                    <span>{r.status}</span>
                                  </span>
                                ) : r.status && r.status.includes('Coordinator') ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                                    <CheckCircle2 size={11} className="text-indigo-600" />
                                    <span>{r.status}</span>
                                  </span>
                                ) : r.status && r.status.includes('Counselor') ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-900 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
                                    <CheckCircle2 size={11} className="text-violet-600" />
                                    <span>{r.status}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 size={11} className="text-emerald-600" />
                                    <span>{r.status || "Field Supervisor Completed (Sec 1)"}</span>
                                  </span>
                                )}
                              </td>

                              {/* Action: View Modal */}
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => setSelectedCompletedDetail(r)}
                                  className="w-7 h-7 rounded-full bg-slate-900 text-[#f5d40b] hover:bg-black transition-colors inline-flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
                                  title="View Details"
                                >
                                  <Eye size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Detailed Participant Inspection Modal */}
              {selectedCompletedDetail && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                  <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                    
                    {/* Modal Header */}
                    <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/20 text-white border border-white/30">
                            {selectedCompletedDetail.participant_id}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">
                            {selectedCompletedDetail.location || activeLocation} Center
                          </span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-white font-mono">
                          {selectedCompletedDetail.cleanName || selectedCompletedDetail.participant_id}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-1 font-mono">
                          <span>{selectedCompletedDetail.age}y</span>
                          <span>•</span>
                          <GenderBadge gender={selectedCompletedDetail.gender} className="text-purple-300" />
                          <span>•</span>
                          <span>Screened on {selectedCompletedDetail.date}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCompletedDetail(null)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Modal Scrollable Body */}
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                      
                      {/* Vitals Summary Strip */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                          <Activity size={13} className="text-amber-500" />
                          Screening Vitals &amp; Key Measurements
                        </h4>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {/* BP */}
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Blood Pressure</span>
                            <span className="text-base font-black text-slate-900 font-mono">
                              {selectedCompletedDetail.raw?.bp_sys || selectedCompletedDetail.raw?.bp_systolic || selectedCompletedDetail.raw?.mem_scrn_q3 || "--"} / {selectedCompletedDetail.raw?.bp_dia || selectedCompletedDetail.raw?.bp_diastolic || selectedCompletedDetail.raw?.mem_scrn_q4 || "--"}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-medium">mmHg</span>
                          </div>

                          {/* BMI / Weight */}
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">BMI &amp; Weight</span>
                            <span className="text-base font-black text-slate-900 font-mono">
                              {selectedCompletedDetail.raw?.bmi || "--"} <span className="text-xs font-normal text-slate-500">({selectedCompletedDetail.raw?.weight || selectedCompletedDetail.raw?.mem_scrn_q5 || "--"}kg)</span>
                            </span>
                            <span className="text-[10px] text-slate-500 block font-medium">kg/m²</span>
                          </div>

                          {/* Glucose */}
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Blood Glucose</span>
                            <span className="text-base font-black text-slate-900 font-mono">
                              {selectedCompletedDetail.raw?.blood_glucose || selectedCompletedDetail.raw?.rbs || selectedCompletedDetail.raw?.mem_scrn_q6 || "--"}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-medium">mg/dL</span>
                          </div>

                          {/* Risk Classification */}
                          <div className={`p-3 rounded-2xl border ${
                            selectedCompletedDetail.risk && selectedCompletedDetail.risk.includes('High')
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-emerald-50 border-emerald-200'
                          }`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Risk Flag</span>
                            <span className={`text-xs font-black block mt-0.5 ${
                              selectedCompletedDetail.risk && selectedCompletedDetail.risk.includes('High')
                                ? 'text-rose-700'
                                : 'text-emerald-700'
                            }`}>
                              {selectedCompletedDetail.risk || "Standard Risk"}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-medium">Phase II Evaluated</span>
                          </div>
                        </div>
                      </div>

                      {/* Clinical Pipeline Stage Checklist */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                          <ClipboardCheck size={13} className="text-blue-500" />
                          Survey Module Completion Status
                        </h4>

                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2 text-xs">
                          {/* Module 1 */}
                          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                            <span className="font-medium text-slate-800">Section 1: Demographics &amp; Consent</span>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                              <CheckCircle2 size={12} /> Completed (Field Supervisor)
                            </span>
                          </div>

                          {/* Module 2-11 */}
                          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                            <span className="font-medium text-slate-800">Sections 2–11: Clinical Screening &amp; Vitals</span>
                            <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                              selectedCompletedDetail.raw?.staff_nurse_completed || selectedCompletedDetail.raw?.sections_2_8_completed || selectedCompletedDetail.raw?.bp_sys
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}>
                              {selectedCompletedDetail.raw?.staff_nurse_completed || selectedCompletedDetail.raw?.sections_2_8_completed || selectedCompletedDetail.raw?.bp_sys ? (
                                <><CheckCircle2 size={12} /> Completed (Staff Nurse)</>
                              ) : (
                                <>Pending Nurse Screening</>
                              )}
                            </span>
                          </div>

                          {/* Module 12-13 */}
                          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                            <span className="font-medium text-slate-800">Sections 12–13: Clinical Diagnosis &amp; Risk Categorisation</span>
                            <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                              selectedCompletedDetail.raw?.doctor_completed || selectedCompletedDetail.raw?.q89 !== undefined
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}>
                              {selectedCompletedDetail.raw?.doctor_completed || selectedCompletedDetail.raw?.q89 !== undefined ? (
                                <><CheckCircle2 size={12} /> Completed (Medical Officer)</>
                              ) : (
                                <>Pending Doctor Review</>
                              )}
                            </span>
                          </div>

                          {/* Module 14 */}
                          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                            <span className="font-medium text-slate-800">Section 14: Linkages &amp; Referral Follow-up</span>
                            <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                              selectedCompletedDetail.raw?.coordinator_completed || selectedCompletedDetail.raw?.q97 !== undefined
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}>
                              {selectedCompletedDetail.raw?.coordinator_completed || selectedCompletedDetail.raw?.q97 !== undefined ? (
                                <><CheckCircle2 size={12} /> Completed (Case Coordinator)</>
                              ) : (
                                <>Pending Linkages</>
                              )}
                            </span>
                          </div>

                          {/* Module 15 */}
                          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                            <span className="font-medium text-slate-800">Section 15: Health Counseling &amp; Lifestyle Guidance</span>
                            <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                              selectedCompletedDetail.raw?.counselor_sec15_completed || selectedCompletedDetail.raw?.q107 !== undefined
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}>
                              {selectedCompletedDetail.raw?.counselor_sec15_completed || selectedCompletedDetail.raw?.q107 !== undefined ? (
                                <><CheckCircle2 size={12} /> Completed (Counselor)</>
                              ) : (
                                <>Pending Counseling</>
                              )}
                            </span>
                          </div>

                          {/* Module 16 */}
                          <div className="flex items-center justify-between py-1">
                            <span className="font-medium text-slate-800">Section 16: Community Perception &amp; Exit Feedback</span>
                            <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                              selectedCompletedDetail.raw?.section_16_completed || selectedCompletedDetail.raw?.sec_16_done || selectedCompletedDetail.raw?.q112 !== undefined
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}>
                              {selectedCompletedDetail.raw?.section_16_completed || selectedCompletedDetail.raw?.sec_16_done || selectedCompletedDetail.raw?.q112 !== undefined ? (
                                <><CheckCircle2 size={12} /> Completed (Field Supervisor)</>
                              ) : (
                                <>Ready for Section 16</>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => setSelectedCompletedDetail(null)}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                      >
                        Close Details
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* Tab: Sync Queue */}
        {currentTab === "sync" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Offline Sync Queue</h2>
                <p className="text-xs text-slate-500 mt-0.5">Records stored locally while offline that need server synchronization.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {selectedSyncIds.length > 0 && (
                  <>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete ${selectedSyncIds.length} selected offline records?`)) {
                          for (const id of selectedSyncIds) {
                            await deleteFromQueue(id);
                          }
                          setSelectedSyncIds([]);
                          await loadQueue();
                          notify("info", "Records Deleted", `Removed ${selectedSyncIds.length} selected records.`);
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-red-700 bg-red-100 border border-red-300 hover:bg-red-200 transition-all shadow-2xs cursor-pointer"
                    >
                      <Trash2 size={13} className="text-red-700" />
                      <span>Delete Selected ({selectedSyncIds.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        const targetList = syncQueue.filter(item => selectedSyncIds.includes(item.local_id));
                        exportSyncQueueCSV(targetList);
                      }}
                      className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-300 border border-amber-400 hover:bg-amber-400 transition-all shadow-2xs cursor-pointer"
                    >
                      <Download size={13} className="text-amber-950" />
                      <span>Export Selected ({selectedSyncIds.length}) CSV</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => exportSyncQueueCSV()}
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
                  <span>{syncing ? "Sync Now..." : "Sync Now"}</span>
                </button>
              </div>
            </div>

            {/* Location-Wise Filter Pills & Age / Gender Dropdown Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs font-mono">
              
              {/* Active Assigned Center Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 bg-amber-50 text-amber-950 border border-amber-300 rounded-xl px-3 py-1.5 font-mono shadow-2xs">
                  <MapPin size={14} className="text-amber-700" /> Assigned Center: <strong className="font-extrabold">{activeLocation} Center</strong>
                </span>
              </div>

              {/* Age & Gender Dropdown Filters */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold">
                  <span className="text-slate-500 uppercase text-[10px]">Gender:</span>
                  <select
                    value={syncGenderFilter}
                    onChange={(e) => setSyncGenderFilter(e.target.value)}
                    className="bg-transparent text-slate-900 outline-none cursor-pointer font-bold"
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold">
                  <span className="text-slate-500 uppercase text-[10px]">Age:</span>
                  <select
                    value={syncAgeGroupFilter}
                    onChange={(e) => setSyncAgeGroupFilter(e.target.value)}
                    className="bg-transparent text-slate-900 outline-none cursor-pointer font-bold"
                  >
                    <option value="All">All Ages</option>
                    <option value="under_30">Under 30 yrs</option>
                    <option value="30_50">30 - 50 yrs</option>
                    <option value="over_50">50+ yrs</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Search Bar for Sync Queue */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={syncSearch}
                onChange={(e) => setSyncSearch(e.target.value)}
                placeholder="Search offline queue by Participant ID, Center, Phone..."
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

            {(() => {
              const queueToRender = syncQueue.filter(item => {
                let raw = {};
                if (item.mem_scrn_q30) {
                  try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
                }

                const pid = item.participant_id || item.mem_scrn_part_id || raw.participant_id || raw.mem_scrn_part_id || '';
                const pidUpper = String(pid).toUpperCase().trim();
                const loc = item.location || raw.location || item.mem_scrn_q17 || "";
                const locLower = String(loc).toLowerCase().trim();

                let matchesLoc = selectedSyncLocation === "All";
                if (!matchesLoc) {
                  const selLower = String(selectedSyncLocation).toLowerCase().trim();
                  if (selLower.includes("malvani") || selLower.includes("ml")) {
                    matchesLoc = locLower.includes("malvani") || locLower.includes("ml") || pidUpper.includes("NCDML") || (pidUpper.includes("ML") && !pidUpper.includes("NCDDH") && !pidUpper.includes("NCDVA"));
                  } else if (selLower.includes("dharavi") || selLower.includes("dh")) {
                    matchesLoc = locLower.includes("dharavi") || locLower.includes("dh") || pidUpper.includes("NCDDH") || (pidUpper.includes("DH") && !pidUpper.includes("NCDML") && !pidUpper.includes("NCDVA"));
                  } else if (selLower.includes("vashi") || selLower.includes("va")) {
                    matchesLoc = locLower.includes("vashi") || locLower.includes("va") || pidUpper.includes("NCDVA") || (pidUpper.includes("VA") && !pidUpper.includes("NCDDH") && !pidUpper.includes("NCDML"));
                  } else {
                    matchesLoc = locLower.includes(selLower) || selLower.includes(locLower);
                  }
                }

                const gender = item.gender || raw.gender || (item.mem_scrn_q2 == "1" ? "Male" : "Female");
                const matchesGender = syncGenderFilter === "All" || String(gender).toLowerCase().includes(syncGenderFilter.toLowerCase());

                const ageNum = parseInt(item.age || raw.age || item.mem_scrn_q1 || 0);
                let matchesAge = true;
                if (syncAgeGroupFilter === "under_30") matchesAge = ageNum > 0 && ageNum < 30;
                else if (syncAgeGroupFilter === "30_50") matchesAge = ageNum >= 30 && ageNum <= 50;
                else if (syncAgeGroupFilter === "over_50") matchesAge = ageNum > 50;

                const phone = item.contact_number || raw.contact_number || "";
                
                const matchesSearch = !syncSearch || (
                  String(pid || "").toLowerCase().includes(String(syncSearch).toLowerCase()) ||
                  String(loc || "").toLowerCase().includes(String(syncSearch).toLowerCase()) ||
                  String(phone || "").toLowerCase().includes(String(syncSearch).toLowerCase())
                );

                return matchesLoc && matchesGender && matchesAge && matchesSearch;
              });

              const allVisibleSelected = queueToRender.length > 0 && queueToRender.every(i => selectedSyncIds.includes(i.local_id));

              if (queueToRender.length === 0) {
                return (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <FolderSync size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-bold text-slate-800">
                      {syncSearch || selectedSyncLocation !== "All" || syncGenderFilter !== "All" || syncAgeGroupFilter !== "All" ? "No Matching Offline Records" : "All Caught Up!"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      No pending offline survey entries match the selected filters or search query.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {/* Select All Checkbox & Export Filtered Button Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const visIds = queueToRender.map(i => i.local_id).filter(Boolean);
                            setSelectedSyncIds(prev => Array.from(new Set([...prev, ...visIds])));
                          } else {
                            const visIdsSet = new Set(queueToRender.map(i => i.local_id));
                            setSelectedSyncIds(prev => prev.filter(id => !visIdsSet.has(id)));
                          }
                        }}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                      />
                      <span>Select All Filtered Records ({queueToRender.length})</span>
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to delete ALL participant records from queue & database and reset sequence to 0001?")) {
                            try {
                              await api.post("/api/v1/screening/reset-all");
                            } catch(e) {}
                            localStorage.removeItem('ncd_offline_queue');
                            localStorage.removeItem('ncd_local_initiated_participants');
                            localStorage.removeItem('ncd_used_participant_ids');
                            localStorage.removeItem('ncd_participant_seq_DH');
                            localStorage.removeItem('ncd_participant_seq_ML');
                            localStorage.removeItem('ncd_participant_seq_VA');
                            localStorage.removeItem('ncd_participant_seq_OT');
                            setSyncQueue([]);
                            setCompletedRecords([]);
                            setSelectedSyncIds([]);
                            notify("success", "Records Reset", "All participant records deleted! Next Participant ID will start from 0001.");
                          }
                        }}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold cursor-pointer text-xs"
                      >
                        <Trash2 size={12} />
                        <span>Reset Sequence to 0001</span>
                      </button>

                      <button
                        onClick={() => exportSyncQueueCSV(queueToRender)}
                        className="flex items-center gap-1 text-amber-900 hover:text-amber-950 font-bold cursor-pointer text-xs"
                      >
                        <Download size={12} />
                        <span>Export Filtered ({queueToRender.length})</span>
                      </button>
                    </div>
                  </div>

                  {queueToRender.map((item, index) => {
                    let raw = {};
                    if (item.mem_scrn_q30) {
                      try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
                    }
                    const pid = item.participant_id || item.mem_scrn_part_id || raw.participant_id || raw.mem_scrn_part_id || 'N/A';
                    const age = item.age || raw.age || item.mem_scrn_q1 || "";
                    const gender = item.gender || raw.gender || (item.mem_scrn_q2 == "1" ? "Male" : "Female");
                    const loc = item.location || raw.location || item.mem_scrn_q17 || localStorage.getItem('ncd_active_location') || 'Dharavi';
                    const phone = item.contact_number || raw.contact_number || "N/A";

                    const isChecked = selectedSyncIds.includes(item.local_id);

                    const locShortCode = (() => {
                      const l = String(loc).trim().toLowerCase();
                      if (l.includes("dharavi")) return "DH";
                      if (l.includes("malvani")) return "ML";
                      if (l.includes("vashi")) return "VA";
                      if (l.includes("kurla")) return "KR";
                      if (l.includes("ghatkopar")) return "GK";
                      return String(loc).substring(0, 2).toUpperCase();
                    })();

                    let surData = {};
                    if (item.survey_data) {
                      try {
                        surData = typeof item.survey_data === 'string' ? JSON.parse(item.survey_data) : item.survey_data;
                      } catch (e) {}
                    }

                    const statusStr = String(item.status || raw.status || surData.status || "Demographics Completed");
                    const isSec8CounselorQueue = statusStr.toLowerCase().includes("counselor queue for section 8") || (surData.counselor_section_required && !surData.counselor_section_completed);
                    const isSec15CounselorQueue = statusStr.toLowerCase().includes("sec 15") || statusStr.toLowerCase().includes("section 14 completed") || (surData.counselor_sec15_required && !surData.counselor_sec15_completed);
                    const isSec8Completed = surData.counselor_section_completed || statusStr.toLowerCase().includes("counseling completed");

                    let queueBadgeText = "Field Supervisor Queue";
                    let queueBadgeClass = "bg-blue-50 text-blue-900 border-blue-200 font-bold";

                    if (isSec8CounselorQueue) {
                      queueBadgeText = "🟡 Counselor Queue (Sec 8 Pending)";
                      queueBadgeClass = "bg-amber-100 text-amber-950 border-amber-300 font-black";
                    } else if (isSec15CounselorQueue) {
                      queueBadgeText = "🟧 Counselor Queue (Sec 15 Pending)";
                      queueBadgeClass = "bg-orange-100 text-orange-950 border-orange-300 font-black";
                    } else if (isSec8Completed) {
                      queueBadgeText = "🟢 Staff Nurse Queue (Ready for Sec 9)";
                      queueBadgeClass = "bg-emerald-100 text-emerald-950 border-emerald-300 font-black";
                    } else if (statusStr.toLowerCase().includes("coordinator")) {
                      queueBadgeText = "📂 Coordinator Queue (Sec 14)";
                      queueBadgeClass = "bg-sky-100 text-sky-950 border-sky-300 font-bold";
                    } else if (statusStr.toLowerCase().includes("nurse")) {
                      queueBadgeText = "🩺 Staff Nurse Queue";
                      queueBadgeClass = "bg-emerald-50 text-emerald-900 border-emerald-200 font-bold";
                    } else if (statusStr.toLowerCase().includes("doctor")) {
                      queueBadgeText = "🩺 Doctor Queue";
                      queueBadgeClass = "bg-purple-50 text-purple-900 border-purple-200 font-bold";
                    }

                    return (
                      <div key={item.local_id || index} className={`bg-white rounded-2xl p-4 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${isChecked ? 'border-amber-400 ring-2 ring-amber-400 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300 shadow-2xs'}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSyncIds(prev => [...prev, item.local_id]);
                              } else {
                                setSelectedSyncIds(prev => prev.filter(id => id !== item.local_id));
                              }
                            }}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer mt-1"
                          />

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900 text-sm font-mono">
                                {pid}
                              </p>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-mono flex items-center gap-1">
                                <MapPin size={10} className="text-amber-600" />
                                <span>{loc} ({locShortCode})</span>
                              </span>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-mono ${queueBadgeClass}`}>
                                {queueBadgeText}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                                Pending Sync
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono flex-wrap">
                              <span>Center: <strong className="text-slate-800">{loc}</strong></span>
                              {age && (
                                <>
                                  <span>•</span>
                                  <span>Age: <strong className="text-slate-800">{age} yrs</strong></span>
                                </>
                              )}
                              {gender && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">Gender: <GenderBadge gender={gender} /></span>
                                </>
                              )}
                              {phone && phone !== "N/A" && (
                                <>
                                  <span>•</span>
                                  <span>Phone: <strong className="text-slate-800">{phone}</strong></span>
                                </>
                              )}
                            </div>
                            {item.timestamp && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                Saved: {new Date(item.timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedQaModalItem({ ...item, pid, age, gender, loc, phone, raw })}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-2xs"
                          title="View Question & Answer Details"
                        >
                          <Eye size={13} className="text-slate-600" />
                          <span>View Q&A</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete participant record ${pid}?`)) {
                              if (item.local_id) {
                                await deleteFromQueue(item.local_id);
                              }
                              try {
                                await api.post("/api/v1/screening/delete", { participant_id: pid, mem_scrn_part_id: pid });
                              } catch (e) {}
                              await loadQueue();
                              notify("info", "Record Removed", `Deleted ${pid} from queue and database.`);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all border border-red-200 cursor-pointer shadow-2xs"
                          title="Delete record from local queue and database"
                        >
                          <Trash2 size={13} className="text-red-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* View Q&A Modal (Read Only) */}
      {selectedQaModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Offline Sync Queue Detail
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1 font-mono">
                  {selectedQaModalItem.pid || selectedQaModalItem.participant_id || "Participant Record"}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedQaModalItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-slate-800">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Participant ID</span>
                  <span className="font-extrabold text-slate-900">{selectedQaModalItem.pid || selectedQaModalItem.participant_id || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Screening Date</span>
                  <span className="font-extrabold text-slate-900">{selectedQaModalItem.screening_date || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Number</span>
                  <span className="font-extrabold text-slate-900">{selectedQaModalItem.contact_number || selectedQaModalItem.phone || "N/A"}</span>
                </div>
              </div>

              <h4 className="text-xs font-extrabold uppercase font-mono tracking-wider text-slate-400 pt-2 border-t border-slate-100">
                Recorded Questions & Answers
              </h4>

              {/* Dynamic Q&A List */}
              <div className="space-y-2">
                {(() => {
                  const LABEL_MAP = {
                    q1: "Q1. Age", q_0: "Q1. Age", custom_q1: "Q1. Age", custom_q_0: "Q1. Age",
                    q2: "Q2. Gender", q_1: "Q2. Gender", custom_q2: "Q2. Gender", custom_q_1: "Q2. Gender",
                    q3: "Q3. Site", q_2: "Q3. Site", custom_q3: "Q3. Site", custom_q_2: "Q3. Site",
                    q4: "Q4. Primary Occupation", q_3: "Q4. Primary Occupation", custom_q4: "Q4. Primary Occupation", custom_q_3: "Q4. Primary Occupation",
                    q5: "Q5. Education Level", q_4: "Q5. Education Level", custom_q5: "Q5. Education Level", custom_q_4: "Q5. Education Level",
                    q6: "Q6. Monthly Household Income", q_5: "Q6. Monthly Household Income", custom_q6: "Q6. Monthly Household Income", custom_q_5: "Q6. Monthly Household Income",
                    q7: "Q7. Type of Housing", q_6: "Q7. Type of Housing", custom_q7: "Q7. Type of Housing", custom_q_6: "Q7. Type of Housing",
                    q8: "Q8. Residence Duration", q_7: "Q8. Residence Duration", custom_q8: "Q8. Residence Duration", custom_q_7: "Q8. Residence Duration"
                  };

                  const hiddenKeys = [
                    "local_id", "timestamp", "status", "fullName", "NAME", "RAW", 
                    "rawPayload", "Q23", "Q30", "q23", "q30", "custom_q23", "custom_q30",
                    "mem_scrn_q16", "AMBER_REVIEW_DATE", "custom_amber_review_date",
                    "user_name", "user_role", "pid", "loc", "phone", "raw",
                    "participant_id", "PARTICIPANT_ID", "screening_date", "SCREENING_DATE",
                    "raw_date", "RAW_DATE", "contact_number", "CONTACT_NUMBER",
                    "location", "LOCATION", "age", "AGE", "gender", "GENDER",
                    "mem_scrn_part_id", "mem_scrn_q1", "mem_scrn_q2", "mem_scrn_q17",
                    "submitted_by_role", "submitted_at"
                  ];

                  const seenLabels = new Set();
                  const entries = Object.entries(selectedQaModalItem)
                    .filter(([key, val]) => {
                      if (hiddenKeys.includes(key)) return false;
                      if (val === "N/A" || val === null || val === undefined || val === "") return false;
                      const displayLabel = LABEL_MAP[key.toLowerCase()] || (key.startsWith("custom_") ? `Field (${key.replace("custom_", "")})` : key.toUpperCase());
                      if (seenLabels.has(displayLabel)) return false;
                      seenLabels.add(displayLabel);
                      return true;
                    })
                    .map(([key, value]) => {
                      const displayLabel = LABEL_MAP[key.toLowerCase()] || (key.startsWith("custom_") ? `Field (${key.replace("custom_", "")})` : key.toUpperCase());
                      const formatVal = (val) => {
                        if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? (v.label || JSON.stringify(v)) : String(v)).join(", ");
                        if (typeof val === 'object' && val !== null) return val.label || JSON.stringify(val);
                        return String(val);
                      };
                      return { label: displayLabel, valStr: formatVal(value) };
                    });

                  return entries.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between gap-1 text-xs">
                      <span className="font-bold text-slate-700 font-mono shrink-0">{item.label}:</span>
                      <span className="font-black text-slate-900 font-mono break-all text-right">{item.valStr}</span>
                    </div>
                  ));
                })()}
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

function FieldSupervisorSection16Card({ syncQueue = [], completedRecords = [], activeLocation = "Dharavi", onOpenSurvey, notify }) {
  const [selectedPid, setSelectedPid] = useState("");
  const [serverRecords, setServerRecords] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.get("/api/v1/dashboard/screeninglist").then(res => {
      if (mounted && res && res.status === 'success' && Array.isArray(res.data)) {
        setServerRecords(res.data);
      }
    }).catch(() => {
      api.get("/api/v1/screening/queue").then(qRes => {
        if (mounted && qRes && qRes.status === 'success' && Array.isArray(qRes.data)) {
          setServerRecords(qRes.data);
        }
      }).catch(() => {});
    });
    return () => { mounted = false; };
  }, []);

  const getPendingSec16Participants = () => {
    const candidateMap = new Map();
    let localCompletedSet = new Set();
    try {
      const cStr = localStorage.getItem('ncd_sec16_completed_pids');
      if (cStr) {
        const arr = JSON.parse(cStr);
        if (Array.isArray(arr)) localCompletedSet = new Set(arr.map(x => String(x).toUpperCase().trim()));
      }
    } catch (e) {}

    const mergeCandidate = (item) => {
      if (!item) return;
      let raw = {};
      if (item.mem_scrn_q30) {
        try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
      }
      let surData = {};
      if (item.survey_data) {
        try { surData = typeof item.survey_data === 'string' ? JSON.parse(item.survey_data) : item.survey_data; } catch (e) {}
      } else if (raw.survey_data) {
        try { surData = typeof raw.survey_data === 'string' ? JSON.parse(raw.survey_data) : raw.survey_data; } catch (e) {}
      }

      const pId = String(item.participant_id || item.mem_scrn_part_id || raw.participant_id || raw.mem_scrn_part_id || "").trim();
      if (!pId || pId === "N/A" || pId.includes("undefined")) return;

      const pIdKey = pId.toUpperCase();
      const existing = candidateMap.get(pIdKey) || {};
      const merged = { ...existing, ...item, ...raw, ...surData };
      merged.participant_id = pId;
      candidateMap.set(pIdKey, merged);
    };

    // Merge from all sources: Server records -> Completed records -> Sync Queue -> Local Initiated
    serverRecords.forEach(mergeCandidate);
    completedRecords.forEach(mergeCandidate);
    syncQueue.forEach(mergeCandidate);
    try {
      const locStr = localStorage.getItem('ncd_local_initiated_participants');
      if (locStr) {
        const locArr = JSON.parse(locStr);
        if (Array.isArray(locArr)) locArr.forEach(mergeCandidate);
      }
    } catch (e) {}

    const list = [];
    candidateMap.forEach((merged, pIdKey) => {
      // 1. Location match check for active center
      const loc = merged.location || merged.mem_scrn_q17 || "";
      const locLower = String(loc).toLowerCase();
      const activeLocLower = String(activeLocation).toLowerCase().trim();
      let matchLoc = true;
      if (activeLocLower && activeLocLower !== "all") {
        if (activeLocLower.includes("malvani") || activeLocLower.includes("ml")) {
          matchLoc = locLower.includes("malvani") || locLower.includes("ml") || pIdKey.includes("ML");
        } else if (activeLocLower.includes("dharavi") || activeLocLower.includes("dh")) {
          matchLoc = locLower.includes("dharavi") || locLower.includes("dh") || pIdKey.includes("DH");
        } else if (activeLocLower.includes("vashi") || activeLocLower.includes("va")) {
          matchLoc = locLower.includes("vashi") || locLower.includes("va") || pIdKey.includes("VA");
        } else {
          matchLoc = locLower.includes(activeLocLower) || activeLocLower.includes(locLower);
        }
      }
      if (!matchLoc) return;

      // 2. EXCLUSION: If Section 16 is completed, do NOT show in dropdown
      const isSec16Completed = Boolean(
        localCompletedSet.has(pIdKey) ||
        merged.section_16_completed === true ||
        merged.completed_by_section16 === true ||
        merged.sec_16_done === true ||
        merged.community_perception_completed === true ||
        merged.community_perception === true ||
        merged.mem_scrn_q16_done === true ||
        merged.status === "Completed (All 16 Sections Done)" ||
        merged.status === "Section 16 Completed" ||
        merged.current_stage === "Fully Completed" ||
        merged.current_queue === "Completed" ||
        merged.q112 !== undefined ||
        merged.q113 !== undefined ||
        merged.q114 !== undefined ||
        merged.q115 !== undefined ||
        merged.custom_q112 !== undefined
      );

      if (isSec16Completed) return;

      const rawName = merged.fullName || merged.mem_scrn_q16 || merged.full_name || merged.name || "";
      let cleanName = "";
      if (typeof rawName === 'string') {
        const t = rawName.trim();
        const l = t.toLowerCase();
        if (
          t.length > 0 &&
          l !== "participant record" &&
          l !== "participant" &&
          l !== "unnamed participant" &&
          l !== "unnamed" &&
          l !== "null" &&
          l !== "undefined" &&
          l !== "n/a" &&
          l !== "na" &&
          l !== "p"
        ) {
          cleanName = t;
        }
      }
      const fullName = cleanName || `Participant ${pIdKey}`;
      const age = merged.age || merged.mem_scrn_q1 || "";
      const rawGender = merged.gender || merged.mem_scrn_q2;
      let cleanGender = "Male";
      if (rawGender) {
        const gStr = String(rawGender).toLowerCase().trim();
        if (gStr.includes("female") || gStr === "2") cleanGender = "Female";
        else if (gStr.includes("trans") || gStr === "3") cleanGender = "Transgender";
        else if (gStr.includes("male") || gStr === "1") cleanGender = "Male";
        else cleanGender = String(rawGender);
      }

      list.push({
        ...merged,
        participant_id: merged.participant_id,
        fullName,
        cleanName,
        age,
        gender: cleanGender,
        location: loc || activeLocation
      });
    });

    return list;
  };

  const pendingParticipants = getPendingSec16Participants();

  const handleStartSection16 = () => {
    if (!selectedPid) {
      if (notify) notify("error", "Select Participant", "Please select a Participant ID from the dropdown to start Section 16.");
      return;
    }

    const targetPart = pendingParticipants.find(p => p.participant_id === selectedPid);
    if (!targetPart) return;

    onOpenSurvey({
      ...targetPart,
      participant_id: selectedPid,
      start_section: 16,
      section_16_mode: true
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-200 font-sans my-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Icon & Title/Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Section 16 — Community Perception Entry
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                Field Supervisor
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select an initiated participant to enter Section 16 observations. Completed participants are hidden.
            </p>
          </div>
        </div>

        {/* Right: Inline Dropdown & Start Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedPid}
            onChange={(e) => setSelectedPid(e.target.value)}
            className="flex-1 md:w-72 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-2xs font-mono cursor-pointer"
          >
            <option value="">-- Select Participant ID --</option>
            {pendingParticipants.map((p) => (
              <option key={p.participant_id} value={p.participant_id}>
                {p.participant_id} {p.cleanName ? `— ${p.cleanName}` : ''} ({p.gender || 'Participant'}{p.age ? `, ${p.age}y` : ''})
              </option>
            ))}
          </select>

          <button
            onClick={handleStartSection16}
            disabled={!selectedPid || pendingParticipants.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-black font-mono transition-all flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap ${
              selectedPid
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 hover:scale-[1.02] cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <span>Start Section 16</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function extractCandidateData(item, depth = 0) {
  if (!item || typeof item !== 'object' || depth > 3) return {};
  let extra = {};
  if (item.mem_scrn_q30) {
    try {
      extra = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : (item.mem_scrn_q30 || {});
    } catch (e) {}
  }
  let surveyData = {};
  if (item.survey_data) {
    try {
      surveyData = typeof item.survey_data === 'string' ? JSON.parse(item.survey_data) : (item.survey_data || {});
    } catch (e) {}
  }
  let payloadData = (item.data && typeof item.data === 'object') ? item.data : {};
  let payloadInner = (item.payload && typeof item.payload === 'object') ? item.payload : {};
  let rawData = (item.raw && typeof item.raw === 'object') ? item.raw : {};
  let rawPayload = (item.rawPayload && typeof item.rawPayload === 'object') ? item.rawPayload : {};
  let formData = (item.formData && typeof item.formData === 'object') ? item.formData : {};
  let computedScores = (item._computed_scores && typeof item._computed_scores === 'object') ? item._computed_scores : {};
  let skipLogic = (item._skip_logic_evaluation && typeof item._skip_logic_evaluation === 'object') ? item._skip_logic_evaluation : {};

  const nestedExtra = (typeof extra === 'object' && extra) ? extractCandidateData(extra, depth + 1) : {};
  const nestedSurvey = (typeof surveyData === 'object' && surveyData) ? extractCandidateData(surveyData, depth + 1) : {};
  const nestedPayloadData = (typeof payloadData === 'object' && payloadData) ? extractCandidateData(payloadData, depth + 1) : {};
  const nestedPayloadInner = (typeof payloadInner === 'object' && payloadInner) ? extractCandidateData(payloadInner, depth + 1) : {};
  const nestedRawPayload = (typeof rawPayload === 'object' && rawPayload) ? extractCandidateData(rawPayload, depth + 1) : {};

  return {
    ...item,
    ...(typeof extra === 'object' && extra ? extra : {}),
    ...nestedExtra,
    ...(typeof surveyData === 'object' && surveyData ? surveyData : {}),
    ...nestedSurvey,
    ...(typeof payloadData === 'object' && payloadData ? payloadData : {}),
    ...nestedPayloadData,
    ...(typeof payloadInner === 'object' && payloadInner ? payloadInner : {}),
    ...nestedPayloadInner,
    ...(typeof rawData === 'object' && rawData ? rawData : {}),
    ...(typeof rawPayload === 'object' && rawPayload ? rawPayload : {}),
    ...nestedRawPayload,
    ...(typeof formData === 'object' && formData ? formData : {}),
    ...(typeof computedScores === 'object' && computedScores ? computedScores : {}),
    ...(typeof skipLogic.computed_scores === 'object' && skipLogic.computed_scores ? skipLogic.computed_scores : {})
  };
}

function DoctorVitalsCardGrid({ syncQueue = [], completedRecords = [], onOpenSurvey }) {
  const [selectedPid, setSelectedPid] = useState("");
  const [serverRecords, setServerRecords] = useState([]);
  const [loadingServer, setLoadingServer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedDetails, setFetchedDetails] = useState({});
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchLiveRecords = async () => {
    setLoadingServer(true);
    try {
      const res = await api.get("/api/v1/dashboard/screeninglist");
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        setServerRecords(res.data);
      } else {
        const qRes = await api.get("/api/v1/screening/queue");
        if (qRes && qRes.status === 'success' && Array.isArray(qRes.data)) {
          setServerRecords(qRes.data);
        }
      }
    } catch (e) {
      try {
        const qRes = await api.get("/api/v1/screening/queue");
        if (qRes && qRes.status === 'success' && Array.isArray(qRes.data)) {
          setServerRecords(qRes.data);
        }
      } catch (err) {}
    } finally {
      setLoadingServer(false);
    }
  };

  useEffect(() => {
    fetchLiveRecords();
  }, []);

  const participantsList = React.useMemo(() => {
    const map = new Map();

    const addCandidate = (rawItem) => {
      if (!rawItem || typeof rawItem !== 'object') return;
      const merged = extractCandidateData(rawItem);
      const pidRaw = merged.participant_id || merged.mem_scrn_part_id || merged.pid || rawItem.participant_id || rawItem.mem_scrn_part_id || rawItem.mem_scrn_id;
      if (!pidRaw) return;

      const pid = String(pidRaw).toUpperCase().trim();
      const name = merged.fullName || merged.full_name || merged.name || merged.mem_scrn_q16 || rawItem.fullName || "Participant";
      const age = merged.age || merged.mem_scrn_q1 || rawItem.age || "—";
      const gender = merged.gender || (merged.mem_scrn_q2 == '1' ? 'Male' : merged.mem_scrn_q2 == '2' ? 'Female' : merged.mem_scrn_q2 == '3' ? 'Transgender' : '—') || "—";
      const loc = merged.location || merged.mem_scrn_loc || merged.mem_scrn_q17 || rawItem.location || localStorage.getItem('ncd_active_location') || "Dharavi";

      if (map.has(pid)) {
        const existing = map.get(pid);
        map.set(pid, {
          ...existing,
          name: (existing.name === "Participant" && name !== "Participant") ? name : existing.name,
          age: (existing.age === "—" && age !== "—") ? age : existing.age,
          gender: (existing.gender === "—" && gender !== "—") ? gender : existing.gender,
          loc: existing.loc || loc,
          data: { ...existing.data, ...merged },
          item: { ...existing.item, ...rawItem }
        });
      } else {
        map.set(pid, {
          pid,
          name,
          age,
          gender,
          loc,
          data: merged,
          item: rawItem
        });
      }
    };

    (syncQueue || []).forEach(addCandidate);
    (completedRecords || []).forEach(addCandidate);
    (serverRecords || []).forEach(addCandidate);

    try {
      const locStr = localStorage.getItem('ncd_local_initiated_participants');
      if (locStr) {
        const locArr = JSON.parse(locStr);
        if (Array.isArray(locArr)) locArr.forEach(addCandidate);
      }
    } catch (e) {}

    try {
      const offStr = localStorage.getItem('ncd_offline_queue');
      if (offStr) {
        const offArr = JSON.parse(offStr);
        if (Array.isArray(offArr)) offArr.forEach(addCandidate);
      }
    } catch (e) {}

    return Array.from(map.values());
  }, [syncQueue, completedRecords, serverRecords]);

  const filteredParticipants = React.useMemo(() => {
    if (!searchQuery.trim()) return participantsList;
    const q = searchQuery.toLowerCase().trim();
    return participantsList.filter(p => 
      String(p.pid || "").toLowerCase().includes(q) || 
      String(p.name || "").toLowerCase().includes(q) || 
      String(p.loc || "").toLowerCase().includes(q)
    );
  }, [participantsList, searchQuery]);

  useEffect(() => {
    if (!selectedPid && filteredParticipants.length > 0) {
      setSelectedPid(filteredParticipants[0].pid);
    }
  }, [filteredParticipants, selectedPid]);

  // Fetch full detailed participant record from server whenever selectedPid changes
  useEffect(() => {
    if (!selectedPid) return;
    let isCancelled = false;

    const loadDetail = async () => {
      try {
        setLoadingDetail(true);
        const res = await api.get(`/api/v1/screening/detail?id=${encodeURIComponent(selectedPid)}`);
        if (!isCancelled && res && res.status === 'success' && res.data) {
          setFetchedDetails(prev => ({
            ...prev,
            [selectedPid.toUpperCase().trim()]: res.data
          }));
        }
      } catch (err) {
        // Fallback silently if offline or cached
      } finally {
        if (!isCancelled) setLoadingDetail(false);
      }
    };

    loadDetail();
    return () => { isCancelled = true; };
  }, [selectedPid]);

  const selectedParticipant = filteredParticipants.find(p => p.pid === selectedPid) || filteredParticipants.find(p => p.pid.toUpperCase() === String(selectedPid).toUpperCase()) || filteredParticipants[0];
  const fetchedData = selectedParticipant ? (fetchedDetails[selectedParticipant.pid] || fetchedDetails[selectedParticipant.pid.toUpperCase()] || {}) : {};

  // Deep merged dictionary for the selected participant
  const combinedData = React.useMemo(() => {
    if (!selectedParticipant) return {};
    const baseItemData = extractCandidateData(selectedParticipant.item);
    const participantData = extractCandidateData(selectedParticipant.data);
    const fetchedExtracted = extractCandidateData(fetchedData);
    return {
      ...(selectedParticipant.data || {}),
      ...participantData,
      ...baseItemData,
      ...fetchedData,
      ...fetchedExtracted
    };
  }, [selectedParticipant, fetchedData]);

  // Resilient value extraction helper
  const getVal = (dict, ...keys) => {
    if (!dict || typeof dict !== 'object') return null;
    const allDictKeys = Object.keys(dict);

    for (const k of keys) {
      if (k === undefined || k === null) continue;

      if (dict[k] !== undefined && dict[k] !== null && dict[k] !== "" && dict[k] !== "—") {
        return dict[k];
      }

      const variants = [
        String(k).toLowerCase(),
        String(k).toUpperCase(),
        `custom_${k}`,
        `custom_${String(k).toLowerCase()}`,
        `custom_${String(k).toUpperCase()}`,
        `mem_scrn_${k}`,
        `mem_scrn_${String(k).toLowerCase()}`,
        `mem_scrn_${String(k).toUpperCase()}`,
        `q_${k}`,
        `q${k}`
      ];

      for (const v of variants) {
        if (dict[v] !== undefined && dict[v] !== null && dict[v] !== "" && dict[v] !== "—") {
          return dict[v];
        }
      }

      const cleanTarget = String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanTarget) {
        const foundKey = allDictKeys.find(dk => {
          const cleanDk = dk.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanDk === cleanTarget ||
                 cleanDk === `custom${cleanTarget}` ||
                 cleanDk === `memscrn${cleanTarget}` ||
                 cleanDk === `q${cleanTarget}`;
        });
        if (foundKey && dict[foundKey] !== undefined && dict[foundKey] !== null && dict[foundKey] !== "" && dict[foundKey] !== "—") {
          return dict[foundKey];
        }
      }
    }
    return null;
  };

  const getFloat = (dict, ...keys) => {
    const val = getVal(dict, ...keys);
    if (val === null || val === undefined) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const getInt = (dict, ...keys) => {
    const val = getVal(dict, ...keys);
    if (val === null || val === undefined) return 0;
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  };

  // Header display details
  const displayPid = selectedParticipant?.pid || getVal(combinedData, "participant_id", "mem_scrn_part_id") || "—";
  const displayName = getVal(combinedData, "fullName", "full_name", "name", "mem_scrn_q16") || selectedParticipant?.name || "Participant";
  const displayAge = getVal(combinedData, "age", "mem_scrn_q1") || selectedParticipant?.age || "—";
  const displayGenderRaw = getVal(combinedData, "gender", "mem_scrn_q2");
  const displayGender = (displayGenderRaw == '1' || displayGenderRaw === 'Male') ? 'Male' : (displayGenderRaw == '2' || displayGenderRaw === 'Female') ? 'Female' : (displayGenderRaw == '3' || displayGenderRaw === 'Transgender') ? 'Transgender' : (selectedParticipant?.gender || '—');
  const displayLoc = getVal(combinedData, "location", "mem_scrn_loc", "mem_scrn_q17") || selectedParticipant?.loc || "Dharavi";

  // Anthropometry & BMI
  const height = getFloat(combinedData, "q67", "height", "ht", "height_cm", "ht_cm", "custom_q67", "q67_height", "Q67");
  const weight = getFloat(combinedData, "q68", "weight", "wt", "weight_kg", "wt_kg", "custom_q68", "q68_weight", "q5", "mem_scrn_q5", "Q68");
  let bmi = getFloat(combinedData, "q69", "bmi", "calculated_bmi", "custom_bmi", "custom_q69", "q69_bmi", "Q69");
  if (bmi === 0 && height > 0 && weight > 0) {
    const hM = height / 100;
    bmi = parseFloat((weight / (hM * hM)).toFixed(1));
  }

  // Abdominal Obesity & WHR
  const waist = getFloat(combinedData, "q70", "waist", "waist_cm", "waist_circumference", "custom_q70", "q70_waist", "Q70");
  const hip = getFloat(combinedData, "q71", "hip", "hip_cm", "hip_circumference", "custom_q71", "q71_hip", "Q71");
  let whr = getFloat(combinedData, "q72", "whr", "waist_hip_ratio", "custom_whr", "custom_q72", "q72_whr", "Q72");
  if (whr === 0 && waist > 0 && hip > 0) {
    whr = parseFloat((waist / hip).toFixed(2));
  }

  // Hemodynamics & Vitals
  const pulse = getFloat(combinedData, "q74", "pulse", "pulse_rate", "heart_rate", "pr", "custom_q74", "Q74");
  const sys1 = getFloat(combinedData, "sys_bp_1", "q75_sys", "sys_bp", "systolic", "sbp", "sbp1", "custom_sys_bp", "q3", "mem_scrn_q3", "bp_sys", "Q75_SYS");
  const dia1 = getFloat(combinedData, "dia_bp_1", "q75_dia", "dia_bp", "diastolic", "dbp", "dbp1", "custom_dia_bp", "q4", "mem_scrn_q4", "bp_dia", "Q75_DIA");
  const sys2 = getFloat(combinedData, "sys_bp_2", "q76_sys", "sbp2", "Q76_SYS");
  const dia2 = getFloat(combinedData, "dia_bp_2", "q76_dia", "dbp2", "Q76_DIA");
  let avgSys = getFloat(combinedData, "avg_sys_bp", "average_sys_bp", "avg_sys", "sys_bp_avg", "avg_bp_sys", "q77_sys");
  let avgDia = getFloat(combinedData, "avg_dia_bp", "average_dia_bp", "avg_dia", "dia_bp_avg", "avg_bp_dia", "q77_dia");

  if (avgSys === 0) {
    if (sys1 > 0 && sys2 > 0) {
      avgSys = Math.round((sys1 + sys2) / 2);
    } else if (sys1 > 0) {
      avgSys = sys1;
    }
  }
  if (avgDia === 0) {
    if (dia1 > 0 && dia2 > 0) {
      avgDia = Math.round((dia1 + dia2) / 2);
    } else if (dia1 > 0) {
      avgDia = dia1;
    }
  }

  const spo2 = getFloat(combinedData, "q78", "spo2", "oxygen_saturation", "oximeter", "custom_q78", "Q78");

  // Point-of-Care Lab Tests
  const rbs = getFloat(combinedData, "q79", "rbs", "blood_sugar", "random_blood_sugar", "custom_rbs", "custom_q79", "sugar", "Q79");
  const hb = getFloat(combinedData, "q80", "hb", "haemoglobin", "hemoglobin", "custom_hb", "custom_q80", "Q80");

  // Psychosocial & Addiction Risk Scores
  let phq9 = getInt(combinedData, "phq9", "phq_9", "phq9_score", "phq_score", "q64", "custom_q64", "q64_score", "phq_total", "phq9_total", "Q64");
  let gad7 = getInt(combinedData, "gad7", "gad_7", "gad7_score", "gad_score", "q61", "custom_q61", "q61_score", "gad_total", "gad7_total", "Q61");
  let hsi = getInt(combinedData, "hsi", "hsi_score", "nicotine_hsi", "q23", "custom_q23", "q23_score", "hsi_total", "Q23");

  // Dynamic sum computation if direct total scores aren't present
  if (phq9 === 0) {
    let sumPhq = 0;
    let foundAny = false;
    for (let i = 1; i <= 9; i++) {
      const v = getInt(combinedData, `q64_phq9_q${i}`, `q64_${i}`, `phq9_q${i}`, `phq_${i}`, `q62_${i}`);
      if (v > 0) {
        sumPhq += v;
        foundAny = true;
      }
    }
    if (foundAny) phq9 = sumPhq;
  }

  if (gad7 === 0) {
    let sumGad = 0;
    let foundAny = false;
    for (let i = 1; i <= 7; i++) {
      const v = getInt(combinedData, `q60_gad7_q${i}`, `q61_gad7_q${i}`, `q60_${i}`, `q61_${i}`, `gad7_q${i}`, `gad_${i}`);
      if (v > 0) {
        sumGad += v;
        foundAny = true;
      }
    }
    if (foundAny) gad7 = sumGad;
  }

  if (hsi === 0) {
    const q21 = getInt(combinedData, "q21", "custom_q21", "q21_time_to_first");
    const q22 = getInt(combinedData, "q22", "custom_q22", "q22_cigarettes_per_day");
    if (q21 > 0 || q22 > 0) {
      hsi = Math.min(Math.max(q21 + q22, 0), 6);
    }
  }
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-purple-200/90 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-purple-100 bg-gradient-to-r from-purple-50/60 via-purple-50/20 to-white -mx-3.5 -mt-3.5 p-3.5 px-4 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs text-sm">
            🩺
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-purple-950 font-sans tracking-tight">
                Doctor Participant Vitals &amp; Clinical Inspection Card Grid
              </h3>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-300 font-mono whitespace-nowrap shrink-0">
                Doctor Module
              </span>
              {loadingDetail && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 animate-pulse font-mono">
                  Loading Vitals...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium font-mono mt-0.5">
              Select any participant below to inspect historical Section 1–11 vitals &amp; anthropometry before Section 12 exam.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-auto flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchLiveRecords}
            disabled={loadingServer}
            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-mono whitespace-nowrap shrink-0"
            title="Refresh Participant Screening List"
          >
            <RefreshCw size={12} className={`text-purple-700 ${loadingServer ? 'animate-spin' : ''}`} />
            <span>{loadingServer ? 'Fetching...' : 'Refresh Queue'}</span>
          </button>

          <div className="relative flex-1 sm:w-40 min-w-[130px]">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Search ID/Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 rounded-lg border border-purple-200 bg-white text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-400 font-mono"
            />
          </div>

          <select
            value={selectedPid}
            onChange={(e) => setSelectedPid(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1 rounded-lg border border-purple-300 bg-white text-xs font-bold text-purple-950 font-mono outline-none cursor-pointer focus:ring-2 focus:ring-purple-400 shadow-2xs max-w-xs"
          >
            {filteredParticipants.length === 0 ? (
              <option value="">-- No Participants Found --</option>
            ) : (
              filteredParticipants.map(p => (
                <option key={p.pid} value={p.pid}>
                  {p.pid} — {p.name} ({p.gender}, {p.age} yrs - {p.loc})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedParticipant ? (
        <div className="space-y-3">
          <div className="p-2.5 px-3 rounded-xl bg-purple-50/70 border border-purple-200/90 flex flex-wrap items-center justify-between gap-2 font-mono text-xs shadow-2xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-black text-purple-950 bg-white px-2.5 py-0.5 rounded-lg border border-purple-300 shadow-2xs">
                ID: {displayPid}
              </span>
              <span className="font-extrabold text-slate-900">
                Name: {displayName}
              </span>
              <span className="text-slate-700 font-bold">
                Demographics: {displayGender}, {displayAge} yrs
              </span>
              <span className="text-slate-700 font-bold">
                Center: {displayLoc}
              </span>
            </div>

            {onOpenSurvey && (
              <button
                type="button"
                onClick={() => onOpenSurvey({ sur_id: 1, participant_id: displayPid })}
                className="px-3 py-1 rounded-lg bg-purple-900 hover:bg-black text-white font-extrabold transition-colors text-xs flex items-center gap-1 cursor-pointer shadow-2xs font-sans"
              >
                <span>Proceed to Section 12 Exam →</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Card 1: Anthropometry & BMI */}
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1">
                  📏 Anthropometry &amp; BMI
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                  Sec 9
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                <div>
                  <span className="text-[9px] text-slate-500 block">Q67 Height:</span>
                  <span className="font-bold text-slate-900">{height > 0 ? `${height} cm` : '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Q68 Weight:</span>
                  <span className="font-bold text-slate-900">{weight > 0 ? `${weight} kg` : '—'}</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-amber-800 font-bold block">Q69 Calculated BMI:</span>
                  <span className="text-lg font-black text-amber-950">{bmi > 0 ? bmi : '—'} <span className="text-[10px] font-bold text-slate-500">kg/m²</span></span>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${
                  bmi === 0 ? 'bg-slate-100 text-slate-600 border-slate-200' :
                  bmi < 18.5 ? 'bg-blue-100 text-blue-900 border-blue-300' :
                  bmi <= 22.9 ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                  bmi <= 24.9 ? 'bg-amber-100 text-amber-950 border-amber-300' :
                  'bg-red-100 text-red-950 border-red-300 animate-pulse'
                }`}>
                  {bmi === 0 ? '—' : bmi < 18.5 ? 'Underweight' : bmi <= 22.9 ? 'Normal' : bmi <= 24.9 ? 'Overweight' : 'Obese'}
                </span>
              </div>
            </div>

            {/* Card 2: Abdominal Obesity & WHR */}
            <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200 space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-orange-950 flex items-center gap-1">
                  📐 Abdominal Obesity &amp; WHR
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-950 border border-orange-300">
                  Sec 9
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                <div>
                  <span className="text-[9px] text-slate-500 block">Q70 Waist:</span>
                  <span className="font-bold text-slate-900">{waist > 0 ? `${waist} cm` : '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Q71 Hip:</span>
                  <span className="font-bold text-slate-900">{hip > 0 ? `${hip} cm` : '—'}</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-orange-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-orange-800 font-bold block">Q72 Waist-Hip Ratio:</span>
                  <span className="text-lg font-black text-orange-950">{whr > 0 ? whr : '—'}</span>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${
                  whr === 0 ? 'bg-slate-100 text-slate-600 border-slate-200' :
                  whr >= 0.90 ? 'bg-red-100 text-red-950 border-red-300 font-black' :
                  'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}>
                  {whr === 0 ? '—' : whr >= 0.90 ? 'High WHR Risk' : 'Normal WHR'}
                </span>
              </div>
            </div>

            {/* Card 3: Hemodynamics & Vitals */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1">
                  ❤️ Vitals, Pulse &amp; BP
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300">
                  Sec 10
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                <div>
                  <span className="text-[9px] text-slate-500 block">Q74 Pulse Rate:</span>
                  <span className="font-bold text-slate-900">{pulse > 0 ? `${pulse} bpm` : '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Q78 SpO₂:</span>
                  <span className="font-bold text-slate-900">{spo2 > 0 ? `${spo2} %` : '—'}</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-emerald-800 font-bold block">Q77 Average Blood Pressure:</span>
                  <span className="text-base font-black text-emerald-950">
                    {avgSys > 0 && avgDia > 0 ? `${avgSys} / ${avgDia}` : (sys1 > 0 && dia1 > 0 ? `${sys1} / ${dia1}` : '—')} <span className="text-[9px] font-normal">mmHg</span>
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-lg border ${
                  avgSys >= 140 || avgDia >= 90 ? 'bg-red-100 text-red-950 border-red-300 font-black' :
                  avgSys >= 130 || avgDia >= 80 ? 'bg-amber-100 text-amber-950 border-amber-300' :
                  avgSys > 0 ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {avgSys >= 140 || avgDia >= 90 ? 'Stage 2 HTN' : avgSys >= 130 || avgDia >= 80 ? 'Stage 1 HTN' : avgSys > 0 ? 'Normal BP' : '—'}
                </span>
              </div>
            </div>

            {/* Card 4: Point-of-Care Lab Tests */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-rose-950 flex items-center gap-1.5">
                  🩸 POC Lab Investigations
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-100 text-rose-950 border border-rose-300">
                  Sec 11
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">Q79 Random Blood Sugar:</span>
                  <span className="text-base font-black text-rose-950">{rbs > 0 ? rbs : '—'} <span className="text-[10px] font-normal">mg/dL</span></span>
                  <span className={`text-[9px] font-bold block ${rbs >= 200 ? 'text-red-700' : rbs >= 140 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {rbs >= 200 ? 'Diabetic Range' : rbs >= 140 ? 'Pre-Diabetic Range' : rbs > 0 ? 'Normal RBS' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Q80 Haemoglobin (Hb):</span>
                  <span className="text-base font-black text-rose-950">{hb > 0 ? hb : '—'} <span className="text-[10px] font-normal">g/dL</span></span>
                  <span className={`text-[9px] font-bold block ${hb < 11 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {hb < 11 && hb > 0 ? 'Anemic' : hb > 0 ? 'Normal Hb' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 5: Psychosocial & Addiction Risk */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2 font-mono md:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-purple-950 flex items-center gap-1.5">
                  🧠 Mental Health &amp; Nicotine Risk Scores
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-100 text-purple-950 border border-purple-300">
                  Sec 3 &amp; Sec 8
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                  <span className="text-[10px] text-slate-500 block">Q64 PHQ-9 Depression:</span>
                  <span className="text-lg font-black text-purple-950">{phq9} <span className="text-xs font-normal text-slate-400">/ 27</span></span>
                  <span className="text-[10px] font-bold text-purple-800 block">{phq9 >= 10 ? 'Clinically Significant' : 'Low Depression Risk'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                  <span className="text-[10px] text-slate-500 block">Q61 GAD-7 Anxiety:</span>
                  <span className="text-lg font-black text-purple-950">{gad7} <span className="text-xs font-normal text-slate-400">/ 21</span></span>
                  <span className="text-[10px] font-bold text-purple-800 block">{gad7 >= 10 ? 'Clinically Significant' : 'Low Anxiety Risk'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                  <span className="text-[10px] text-slate-500 block">Q23 Nicotine HSI Index:</span>
                  <span className="text-lg font-black text-purple-950">{hsi} <span className="text-xs font-normal text-slate-400">/ 6</span></span>
                  <span className="text-[10px] font-bold text-purple-800 block">{hsi >= 4 ? 'High Dependence' : 'Low/Mod Dependence'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-purple-50/40 rounded-2xl border border-purple-200/80 space-y-3 font-sans">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-xl font-bold shadow-2xs">
            🩺
          </div>
          <div>
            <h4 className="text-sm font-black text-purple-950 font-sans">
              No Participant Records Available for Inspection
            </h4>
            <p className="text-xs text-slate-500 font-medium font-mono mt-1 max-w-md mx-auto">
              No participant screening records match your filter query or have been submitted for clinical examination yet.
            </p>
          </div>
          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={fetchLiveRecords}
              className="px-4 py-2 rounded-xl bg-purple-900 text-white font-bold hover:bg-black transition-colors text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs font-sans"
            >
              <RefreshCw size={13} className={loadingServer ? 'animate-spin' : ''} />
              <span>Fetch Live Records 🔄</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
