import React, { useState, useEffect } from "react";
import { Search, MapPin, Eye, FileText, CheckCircle, AlertTriangle, Loader2, UserCheck, Stethoscope, HeartPulse, Brain, Link2, Trash2, Edit3, Save, X, Plus, Code, RefreshCw, SlidersHorizontal, Settings, Download } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { getQueue, deleteFromQueue } from "../../lib/db";

import { generateNextParticipantID } from "../../lib/participantIdGenerator";

function generateParticipantID(loc = "Dharavi") {
  return generateNextParticipantID(loc);
}

export function ParticipantManagement({ notify, phase = "phase2", initialLocation = "All" }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const [newParticipant, setNewParticipant] = useState({
    fullName: "",
    age: "48",
    gender: "Male",
    location: "Dharavi",
    risk: "Standard Risk",
    participant_id: generateParticipantID("Dharavi")
  });

  const [locationsList, setLocationsList] = useState(["All", "Dharavi", "Malvani", "Vashi"]);

  const exportToCSV = (dataList, filename) => {
    if (!dataList || dataList.length === 0) {
      notify("warning", "No Data to Export", "There are no participant records matching the export filter.");
      return;
    }

    const headers = [
      "Participant ID",
      "Full Name",
      "Age",
      "Gender",
      "Location Center",
      "Contact Number",
      "Date of Survey",
      "Initiated By Role",
      "Initiated By User",
      "Current Stage",
      "Overall Risk Rating"
    ];

    const rows = dataList.map(p => [
      `"${p.participant_id || ''}"`,
      `"${(p.fullName || '').replace(/"/g, '""')}"`,
      `"${p.age || ''}"`,
      `"${p.gender || ''}"`,
      `"${p.location || ''}"`,
      `"${p.contact_number || ''}"`,
      `"${p.date_of_survey || ''}"`,
      `"${p.created_by_role || ''}"`,
      `"${p.created_by_user || ''}"`,
      `"${p.current_stage || ''}"`,
      `"${p.risk || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify("success", "Export Complete", `Downloaded ${dataList.length} records into ${filename}`);
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchParticipants(isMounted),
          fetchLocationsMaster(isMounted)
        ]);
      } catch (e) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [phase]);

  const fetchLocationsMaster = async (isMounted = true) => {
    try {
      const apiPromise = api.get("/api/v1/location/index");
      const timeoutPromise = new Promise(res => setTimeout(() => res(null), 800));
      const res = await Promise.race([apiPromise, timeoutPromise]);
      if (isMounted && res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        const dynamicLocs = res.data.map(l => l.loc_name || l.loc_city).filter(Boolean);
        setLocationsList(["All", ...Array.from(new Set(dynamicLocs))]);
      }
    } catch (e) {}
  };

  const fetchParticipants = async (isMounted = true) => {
    try {
      let idbQueue = [];
      try { idbQueue = await getQueue(); } catch (err) {}

      let localInitiated = [];
      try {
        const initStr = localStorage.getItem('ncd_local_initiated_participants') || localStorage.getItem('ncd_offline_queue');
        if (initStr) {
          const parsed = JSON.parse(initStr);
          if (Array.isArray(parsed)) localInitiated = parsed;
        }
      } catch (e) {}

      let apiList = [];
      let apiResponded = false;
      try {
        const apiPromise = api.get("/api/v1/dashboard/screeninglist");
        const timeoutPromise = new Promise(res => setTimeout(() => res(null), 1000));
        const res = await Promise.race([apiPromise, timeoutPromise]);
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          apiResponded = true;
          apiList = res.data;
        }
      } catch (err) {}

      try {
        const resQ = await api.get("/api/v1/screening/queue");
        if (resQ && resQ.status === 'success' && Array.isArray(resQ.data)) {
          apiList = [...apiList, ...resQ.data];
        }
      } catch (err) {}

      const recordMap = new Map();

      const processRecord = (p, idx) => {
        if (!p) return;
        let extra = {};
        if (p.mem_scrn_q30) {
          try {
            extra = typeof p.mem_scrn_q30 === 'string' ? JSON.parse(p.mem_scrn_q30) : p.mem_scrn_q30;
          } catch(e) {}
        }
        let surData = {};
        if (extra.survey_data || p.survey_data) {
          try {
            const rawSur = extra.survey_data || p.survey_data;
            surData = typeof rawSur === 'string' ? JSON.parse(rawSur) : rawSur;
          } catch (e) {}
        }

        const merged = { ...extra, ...surData, ...p };
        const pId = merged.participant_id || merged.mem_scrn_part_id || (merged.mem_scrn_id ? `DH-MUM-${merged.mem_scrn_id}` : null);
        if (!pId) return;

        const prev = recordMap.get(pId);
        const combined = prev ? { ...prev.raw, ...merged } : merged;

        const roleName = combined.submitted_by_role || combined.user_role || "Field Supervisor";
        const userName = combined.submitted_by_user || combined.user_name || "Staff User";
        const dateStr = combined.screening_date || (combined.record_date ? new Date(combined.record_date * 1000).toLocaleDateString() : new Date().toLocaleDateString());

        const isNurseDone = Boolean(
          combined.staff_nurse_completed === true || 
          combined.completed_by_staff_nurse === true || 
          combined.sections_2_8_completed === true || 
          combined.current_queue === "Doctor Queue" ||
          combined.current_queue === "Case Coordinator Queue" ||
          combined.current_queue === "Counselor Queue" ||
          combined.current_queue === "Section 16 Queue" ||
          combined.current_queue === "Completed" ||
          combined.current_stage === "Doctor Review Queue (Sec 12-13)" ||
          combined.current_stage === "Case Coordinator Queue (Sec 14)" ||
          combined.current_stage === "Counselor Queue (Sec 15)" ||
          combined.current_stage === "Section 16 Queue (Field Supervisor)" ||
          combined.current_stage === "Fully Completed" ||
          combined.q9 !== undefined || 
          combined.q17 !== undefined ||
          combined.q25 !== undefined ||
          combined.bp_systolic !== undefined ||
          combined.bp_sys !== undefined
        );

        const isDoctorDone = Boolean(
          combined.doctor_completed === true || 
          combined.completed_by_doctor === true || 
          combined.sections_9_15_completed === true || 
          combined.current_queue === "Case Coordinator Queue" ||
          combined.current_queue === "Counselor Queue" ||
          combined.current_queue === "Section 16 Queue" ||
          combined.current_queue === "Completed" ||
          combined.current_stage === "Case Coordinator Queue (Sec 14)" ||
          combined.current_stage === "Counselor Queue (Sec 15)" ||
          combined.current_stage === "Section 16 Queue (Field Supervisor)" ||
          combined.current_stage === "Fully Completed" ||
          combined.q89 !== undefined ||
          combined.q90 !== undefined ||
          combined.q93 !== undefined ||
          combined.cvd_risk_assessment !== undefined
        );

        const isCoordinatorDone = Boolean(
          combined.coordinator_completed === true || 
          combined.completed_by_coordinator === true || 
          combined.current_queue === "Counselor Queue" ||
          combined.current_queue === "Section 16 Queue" ||
          combined.current_queue === "Completed" ||
          combined.current_stage === "Counselor Queue (Sec 15)" ||
          combined.current_stage === "Section 16 Queue (Field Supervisor)" ||
          combined.current_stage === "Fully Completed" ||
          combined.q97 !== undefined
        );

        const isCounselorDone = Boolean(
          combined.counselor_sec15_completed === true || 
          combined.completed_by_counselor === true || 
          combined.current_queue === "Section 16 Queue" ||
          combined.current_queue === "Completed" ||
          combined.current_stage === "Section 16 Queue (Field Supervisor)" ||
          combined.current_stage === "Fully Completed" ||
          combined.q107 !== undefined
        );

        const isSec16Done = Boolean(
          combined.section_16_completed === true || 
          combined.sec_16_done === true || 
          combined.current_queue === "Completed" ||
          combined.current_stage === "Fully Completed" ||
          combined.q112 !== undefined
        );

        let currentPendingQueue = "With Staff Nurse Queue";
        let currentRole = "Staff Nurse";

        if (isSec16Done) {
          currentPendingQueue = "Fully Completed (All 16 Sections Verified)";
          currentRole = "Completed";
        } else if (isCounselorDone) {
          currentPendingQueue = "With Field Supervisor (Pending Section 16)";
          currentRole = "Field Supervisor";
        } else if (isCoordinatorDone) {
          currentPendingQueue = "With Counselor (Pending Section 15)";
          currentRole = "Counselor";
        } else if (isDoctorDone) {
          currentPendingQueue = "With Case Coordinator (Pending Section 14)";
          currentRole = "Case Management Coordinator";
        } else if (isNurseDone) {
          currentPendingQueue = "With Doctor (Pending Clinical Exam Sec 12-13)";
          currentRole = "Doctor";
        } else {
          currentPendingQueue = "With Staff Nurse Queue (Pending Clinical Screening Sec 2-11)";
          currentRole = "Staff Nurse";
        }

        recordMap.set(pId, {
          ...combined,
          local_id: combined.mem_scrn_id || idx,
          participant_id: pId,
          fullName: (combined.fullName && combined.fullName !== "Unnamed Participant") ? combined.fullName : (combined.mem_scrn_q16 || pId),
          age: String(combined.age || combined.mem_scrn_q1 || "45"),
          gender: combined.gender || (combined.mem_scrn_q2 === "1" ? "Male" : "Female"),
          location: combined.location || combined.mem_scrn_q17 || "Dharavi",
          contact_number: combined.contact_number || combined.mem_scrn_q18 || "-",
          date_of_survey: dateStr,
          created_by_role: roleName,
          created_by_user: userName,
          current_stage: currentPendingQueue,
          current_user_role: currentRole,
          is_fs_done: true,
          is_nurse_done: isNurseDone,
          is_doctor_done: isDoctorDone,
          is_coordinator_done: isCoordinatorDone,
          is_counselor_done: isCounselorDone,
          is_sec16_done: isSec16Done,
          risk: combined.overall_risk_rating || (combined.mem_scrn_q24 == 1 ? "High Risk" : "Standard Risk"),
          raw_payload: combined,
          raw: combined,
          audit_trail: [
            { role: "Field Supervisor", action: "Initiated Participant & Completed Section 1 Demographics", user: userName, timestamp: dateStr, status: "Section 1 Completed" },
            isNurseDone && { role: "Staff Nurse", action: "Completed Vitals, Medical History & POC Tests (Sec 2-11)", user: combined.nurse_user || "SN001 (Staff Nurse)", timestamp: "Completed", status: "Sections 2-11 Completed" },
            isDoctorDone && { role: "Doctor", action: "Completed Clinical Exam & CVD Risk Categorisation (Sec 12-13)", user: combined.doctor_user || "D001 (Doctor)", timestamp: "Completed", status: "Sections 12-13 Completed" },
            isCoordinatorDone && { role: "Case Coordinator", action: "Completed Healthcare Linkages & Follow-up Tracking (Sec 14)", user: combined.coordinator_user || "CMC001 (Coordinator)", timestamp: "Completed", status: "Section 14 Completed" },
            isCounselorDone && { role: "Counselor", action: "Completed Health & Mental Health Counseling (Sec 15)", user: combined.counselor_user || "C001 (Counselor)", timestamp: "Completed", status: "Section 15 Completed" },
            isSec16Done && { role: "Field Supervisor", action: "Completed Final Section 16 Community Perception Survey", user: combined.sec16_user || userName, timestamp: "Completed", status: "Section 16 Completed" }
          ].filter(Boolean)
        });
      };

      [...idbQueue, ...localInitiated, ...apiList].forEach((item, idx) => processRecord(item, idx));

      if (isMounted) setParticipants(Array.from(recordMap.values()));
    } catch (e) {
      console.error(e);
      if (isMounted) setParticipants([]);
    }
  };

  const handleCreateParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipant.fullName) {
      notify("error", "Name Required", "Please enter full name.");
      return;
    }
    notify("info", "Creating Participant", `Saving ${newParticipant.participant_id}...`);
    try {
      const payload = {
        mem_scrn_part_id: newParticipant.participant_id,
        fullName: newParticipant.fullName,
        age: newParticipant.age,
        gender: newParticipant.gender,
        location: newParticipant.location,
        overall_risk_rating: newParticipant.risk,
        submitted_by_role: "Field Supervisor",
        submitted_by_user: "Admin Created",
        phase: 2
      };
      await api.post("/api/v1/screening/submit", payload);
      notify("success", "Participant Created", `Participant ${newParticipant.participant_id} created and captured in directory.`);
      setShowCreateModal(false);
      setNewParticipant({
        fullName: "",
        age: "48",
        gender: "Male",
        location: "Dharavi",
        risk: "Standard Risk",
        participant_id: `NCD-MUM-${Math.floor(10000 + Math.random() * 90000)}`
      });
      fetchParticipants();
    } catch (err) {
      notify("error", "Creation Failed", "Could not create participant in database.");
    }
  };

  const handleDeleteParticipant = async (partId, localId) => {
    if (!window.confirm(`Are you sure you want to delete participant ${partId}? This will permanently remove the record from database.`)) {
      return;
    }
    notify("info", "Deleting Record", `Deleting participant ${partId}...`);

    const removeLocalRecord = async () => {
      setParticipants(prev => prev.filter(p => p.participant_id !== partId && p.mem_scrn_part_id !== partId));
      if (selectedParticipant?.participant_id === partId) {
        setSelectedParticipant(null);
      }
      
      // 1. Purge from ncd_local_initiated_participants
      try {
        const initStr = localStorage.getItem('ncd_local_initiated_participants');
        if (initStr) {
          const parsed = JSON.parse(initStr);
          if (Array.isArray(parsed)) {
            const updated = parsed.filter(item => (item.participant_id || item.mem_scrn_part_id) !== partId);
            localStorage.setItem('ncd_local_initiated_participants', JSON.stringify(updated));
          }
        }
      } catch (err) {}

      // 2. Purge from ncd_offline_queue
      try {
        const offStr = localStorage.getItem('ncd_offline_queue');
        if (offStr) {
          const parsed = JSON.parse(offStr);
          if (Array.isArray(parsed)) {
            const updated = parsed.filter(item => (item.participant_id || item.mem_scrn_part_id) !== partId);
            localStorage.setItem('ncd_offline_queue', JSON.stringify(updated));
          }
        }
      } catch (err) {}

      // 3. Purge from IndexedDB sync_queue
      try {
        if (localId) await deleteFromQueue(localId);
        const idbQueue = await getQueue();
        if (Array.isArray(idbQueue)) {
          for (const item of idbQueue) {
            if ((item.participant_id || item.mem_scrn_part_id) === partId) {
              if (item.local_id) await deleteFromQueue(item.local_id);
            }
          }
        }
      } catch (err) {}
    };

    try {
      await api.post("/api/v1/screening/delete", { mem_scrn_part_id: partId, mem_scrn_id: localId });
      removeLocalRecord();
      notify("success", "Record Deleted", `Participant ${partId} deleted successfully.`);
    } catch (e) {
      removeLocalRecord();
      notify("success", "Record Deleted", `Participant ${partId} removed successfully.`);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingParticipant) return;
    notify("info", "Updating Record", `Saving updates for ${editingParticipant.participant_id}...`);
    try {
      const payload = {
        mem_scrn_part_id: editingParticipant.participant_id,
        fullName: editingParticipant.fullName,
        age: editingParticipant.age,
        gender: editingParticipant.gender,
        location: editingParticipant.location,
        overall_risk_rating: editingParticipant.risk,
        submitted_by_role: "System Admin",
        submitted_by_user: "Admin Editor"
      };
      await api.post("/api/v1/screening/submit", payload);
      setParticipants(prev => prev.map(p => p.participant_id === editingParticipant.participant_id ? editingParticipant : p));
      setSelectedParticipant(editingParticipant);
      setEditingParticipant(null);
      notify("success", "Update Saved", `Participant ${editingParticipant.participant_id} updated in database.`);
    } catch (err) {
      notify("error", "Update Failed", "Could not save participant updates.");
    }
  };

  const [sortBy, setSortBy] = useState("newest");
  const [enableResumeButton, setEnableResumeButton] = useState(() => localStorage.getItem('ncd_setting_enable_resume_button') !== 'false');
  const [phase1Unlocked, setPhase1Unlocked] = useState(() => localStorage.getItem('ncd_phase1_unlocked') === 'true');

  const filteredParticipants = participants
    .filter((p) => {
      const matchesSearch = 
        !searchTerm ||
        (p.fullName && p.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.participant_id && p.participant_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = 
        selectedLocation === "All" || (p.location && p.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === "location") return String(a.location || "").localeCompare(String(b.location || ""));
      if (sortBy === "participant_id") return String(a.participant_id || "").localeCompare(String(b.participant_id || ""));
      if (sortBy === "risk") {
        const isAHigh = String(a.risk || "").toLowerCase().includes("high");
        const isBHigh = String(b.risk || "").toLowerCase().includes("high");
        return isBHigh ? -1 : isAHigh ? 1 : 0;
      }
      if (sortBy === "oldest") return (a.local_id || 0) - (b.local_id || 0);
      return (b.local_id || 0) - (a.local_id || 0);
    });

  const handleReload = async () => {
    setLoading(true);
    try {
      await fetchParticipants();
      await fetchLocationsMaster();
      if (notify) notify("success", "Directory Refreshed", "Participant directory updated with latest records.");
    } catch (e) {
      if (notify) notify("error", "Refresh Failed", "Could not refresh directory records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF7F0]/40">
      
      {/* Brand Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: T.charcoal900, letterSpacing: "-0.02em" }}>
            Participant Directory & Multi-Role Audit
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal500, marginTop: 2 }}>
            Real-time directory capturing all initiated & completed screening responses with multi-role audit history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Create Participant Button (Brand Golden Action) */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#f5d40b] text-slate-950 hover:bg-[#e0c20a] transition-colors shadow-2xs cursor-pointer font-mono border border-[#e5c40a]"
          >
            <Plus size={15} className="text-slate-950 stroke-[2.5]" />
            <span>Create Participant</span>
          </button>

          {/* Overall Export Button */}
          <button 
            onClick={() => exportToCSV(participants, "ncd_participants_overall_all_centers.csv")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white transition-all shadow-2xs cursor-pointer font-mono"
            title="Export overall participant records across all centers to CSV"
          >
            <Download size={14} className="text-[#f5d40b]" />
            <span>Export Overall</span>
          </button>

          {/* Location-Wise Export Button */}
          <button 
            onClick={() => {
              const locName = selectedLocation === "All" ? "Filtered" : selectedLocation;
              exportToCSV(filteredParticipants, `ncd_participants_${locName.toLowerCase()}_export.csv`);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-all shadow-2xs cursor-pointer font-mono"
            title={`Export participant records for ${selectedLocation} to CSV`}
          >
            <Download size={14} className="text-slate-600" />
            <span>Export ({selectedLocation})</span>
          </button>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white text-xs font-semibold font-mono border-slate-300 shadow-2xs">
            <MapPin size={14} className="text-amber-600 shrink-0" />
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              {locationsList.map(loc => <option key={loc} value={loc}>{loc === "All" ? "All Locations" : `${loc} Center`}</option>)}
            </select>
          </div>

          {/* Search Input */}
          <div 
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 shadow-2xs"
          >
            <Search size={14} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ID, name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-xs w-40 font-mono text-slate-900"
            />
          </div>

          {/* Working Live Reload / Refresh Button */}
          <button 
            onClick={handleReload}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 transition-all cursor-pointer font-mono text-xs font-bold shadow-2xs disabled:opacity-50"
            title="Reload participant records from server and local queue"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-amber-600" : "text-slate-600"} />
            <span>{loading ? "Reloading..." : "Reload"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Participants Directory List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          
          {/* Location Filter Pills & Sort Dropdown Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs font-mono">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
              <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1 shrink-0 mr-1">
                <MapPin size={14} className="text-amber-600" /> Location:
              </span>
              {locationsList.map(loc => {
                const isSel = selectedLocation === loc;
                const count = loc === "All" ? participants.length : participants.filter(p => (p.location || "").toLowerCase().includes(loc.toLowerCase())).length;
                return (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      isSel 
                        ? 'bg-[#f5d40b] text-slate-950 border-[#e5c40a] shadow-2xs font-black' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {loc === "All" ? "All Locations" : loc} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <SlidersHorizontal size={13} className="text-slate-600" /> Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="newest">Date (Newest First)</option>
                <option value="oldest">Date (Oldest First)</option>
                <option value="location">Location Center (A-Z)</option>
                <option value="participant_id">Participant ID (A-Z)</option>
                <option value="risk">High Risk Flagged First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-3">
              <Loader2 className="animate-spin text-amber-600" size={32} />
              <p className="text-xs font-mono font-bold text-slate-500">Loading participant directory...</p>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center p-12 text-gray-500 bg-white border rounded-2xl font-mono text-xs" style={{ borderColor: T.line }}>
              No participant records found matching selected location or search query.
            </div>
          ) : (
            <div className="grid gap-3.5">
              {filteredParticipants.map((p) => {
                const isHighRisk = String(p.risk || '').toLowerCase().includes('high');
                return (
                  <div 
                    key={p.local_id || p.participant_id}
                    className="rounded-2xl p-4 sm:p-5 border bg-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-all hover:border-slate-400 shadow-2xs"
                    style={{ borderColor: T.line }}
                  >
                    {/* Left: Participant Info with Fixed Avatar */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs bg-slate-900 text-[#f5d40b] font-mono shrink-0 shadow-2xs">
                        {p.fullName ? p.fullName.split(" ").map(w => w[0]).slice(0, 2).join("") : "P"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base font-mono truncate">{p.fullName || "Unnamed"}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f5d40b]/15 text-slate-900 border border-[#f5d40b]/30 font-mono shrink-0">
                            {p.location || "Dharavi"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-mono shrink-0">
                            {p.current_stage || "Pending Nurse"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          ID: <strong className="text-slate-900">{p.participant_id || "NA"}</strong> • Age: {p.age || "48"} yrs ({p.gender || "Female"}) • Date: <strong className="text-slate-800">{p.date_of_survey || "Today"}</strong> • Initiated by: <strong className="text-slate-900">{p.created_by_user || "FS001 (Field Supervisor)"}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Right: Perfectly Aligned Fixed Horizontal Actions (No multi-line wrapping!) */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center flex-nowrap">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border font-mono whitespace-nowrap ${
                        isHighRisk ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {p.risk || "Standard Risk"}
                      </span>

                      {/* Select / View Details Button */}
                      <button 
                        onClick={() => setSelectedParticipant(p)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-2xs font-mono whitespace-nowrap"
                      >
                        <Eye size={14} className="text-[#f5d40b]" />
                        <span>Select & View Response</span>
                      </button>
                      
                      {/* Edit Button */}
                      <button 
                        onClick={() => setEditingParticipant(p)}
                        className="p-2 rounded-xl hover:bg-amber-50 border border-slate-200 text-slate-700 hover:text-amber-800 transition-colors cursor-pointer shrink-0"
                        title="Edit Participant"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteParticipant(p.participant_id, p.local_id)}
                        className="p-2 rounded-xl hover:bg-red-50 border border-slate-200 text-slate-700 hover:text-red-700 transition-colors cursor-pointer shrink-0"
                        title="Delete Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Spacious Full Response & Audit Inspector Modal */}
      {selectedParticipant && (
        <ParticipantResponseModal 
          participant={selectedParticipant} 
          onClose={() => setSelectedParticipant(null)} 
          onEdit={() => {
            const p = selectedParticipant;
            setSelectedParticipant(null);
            setEditingParticipant(p);
          }}
          onDelete={() => {
            const p = selectedParticipant;
            setSelectedParticipant(null);
            handleDeleteParticipant(p.participant_id, p.local_id);
          }}
        />
      )}

      {/* Admin "+ Create Participant" Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create New Participant Screening Entry</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateParticipant} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Participant ID *</label>
                <input 
                  type="text" 
                  value={newParticipant.participant_id} 
                  onChange={(e) => setNewParticipant(p => ({ ...p, participant_id: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold outline-none bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Full Name *</label>
                <input 
                  type="text" 
                  value={newParticipant.fullName} 
                  placeholder="e.g. Anita Patil"
                  onChange={(e) => setNewParticipant(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Age (Years) *</label>
                  <input 
                    type="number" 
                    value={newParticipant.age} 
                    onChange={(e) => setNewParticipant(p => ({ ...p, age: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Gender *</label>
                  <select 
                    value={newParticipant.gender} 
                    onChange={(e) => setNewParticipant(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Location *</label>
                  <select 
                    value={newParticipant.location} 
                    onChange={(e) => {
                      const newLoc = e.target.value;
                      setNewParticipant(p => ({ 
                        ...p, 
                        location: newLoc,
                        participant_id: generateParticipantID(newLoc)
                      }));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none bg-white"
                  >
                    <option value="Dharavi">Dharavi</option>
                    <option value="Malvani">Malvani</option>
                    <option value="Vashi">Vashi</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-black flex items-center gap-1.5 cursor-pointer">
                  <Save size={14} />
                  <span>Initiate Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Participant Details ({editingParticipant.participant_id})</h3>
              <button onClick={() => setEditingParticipant(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Full Name</label>
                <input 
                  type="text" 
                  value={editingParticipant.fullName || ""} 
                  onChange={(e) => setEditingParticipant(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Age (Years)</label>
                  <input 
                    type="number" 
                    value={editingParticipant.age || ""} 
                    onChange={(e) => setEditingParticipant(p => ({ ...p, age: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Location</label>
                  <select 
                    value={editingParticipant.location || "Dharavi"}
                    onChange={(e) => setEditingParticipant(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                  >
                    <option value="Dharavi">Dharavi</option>
                    <option value="Malvani">Malvani</option>
                    <option value="Vashi">Vashi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Overall Risk Rating</label>
                <select 
                  value={editingParticipant.risk || "Standard Risk"}
                  onChange={(e) => setEditingParticipant(p => ({ ...p, risk: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                >
                  <option value="Standard Risk">Standard Risk</option>
                  <option value="Moderate Risk">Moderate Risk</option>
                  <option value="High Risk">High Risk (Priority Referral)</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setEditingParticipant(null)} className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-black flex items-center gap-1.5 cursor-pointer">
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Full-Featured, Spacious Participant Response & Multi-Role Audit Modal
 */
function ParticipantResponseModal({ participant, onClose, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState("sections"); // "sections", "audit", "raw"
  const [activeSectionId, setActiveSectionId] = useState("sec_1");

  if (!participant) return null;

  let raw = {};
  if (participant.raw_payload) {
    try {
      raw = typeof participant.raw_payload === 'string' ? JSON.parse(participant.raw_payload) : participant.raw_payload;
    } catch (e) {}
  }
  const data = { ...participant, ...raw };

  const isHighRisk = String(data.risk || data.overall_risk_rating || '').toLowerCase().includes('high');

  const sectionsConfig = [
    {
      id: "sec_1",
      num: "1",
      title: "Section 1: Socio-Demographics",
      role: "Field Supervisor",
      isCompleted: true,
      items: [
        { label: "Participant ID", val: data.participant_id || data.mem_scrn_part_id },
        { label: "Full Name", val: data.fullName || data.mem_scrn_q16 },
        { label: "Age (Q1)", val: `${data.age || data.mem_scrn_q1 || "45"} years` },
        { label: "Gender (Q2)", val: data.gender || (data.mem_scrn_q2 == "1" ? "Male" : "Female") },
        { label: "Center Location (Q17)", val: `${data.location || data.mem_scrn_q17 || "Dharavi"} Center` },
        { label: "Contact Number (Q18)", val: data.contact_number || data.mem_scrn_q18 || "Not Provided" },
        { label: "Screening Date", val: data.date_of_survey || data.screening_date || "Today" },
        { label: "Initiating Operator", val: data.created_by_user || "FS001 (Field Supervisor)" }
      ]
    },
    {
      id: "sec_2",
      num: "2",
      title: "Section 2: Medical History & Chronic Conditions",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.staff_nurse_completed || data.q9 !== undefined),
      items: [
        { label: "Q9: Known Diabetes", val: data.q9 },
        { label: "Q10: Known Hypertension", val: data.q10 },
        { label: "Q11: Family History of NCDs", val: data.q11 },
        { label: "Q12: Past CVD Events (Heart Attack)", val: data.q12 },
        { label: "Q13: History of Stroke / TIA", val: data.q13 },
        { label: "Q14: Chronic Kidney Disease", val: data.q14 },
        { label: "Q15: Chronic Respiratory Condition", val: data.q15 },
        { label: "Q16: Other Chronic Illnesses", val: data.q16 }
      ]
    },
    {
      id: "sec_3",
      num: "3",
      title: "Section 3: Tobacco & Substance Use",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.staff_nurse_completed || data.q17 !== undefined),
      items: [
        { label: "Q17: Smokeless Tobacco Use", val: data.q17 },
        { label: "Q18: Smoking Tobacco (Beedi/Cigarettes)", val: data.q18 },
        { label: "Q19: Daily Frequency of Tobacco Use", val: data.q19 },
        { label: "Q20: Age of First Tobacco Use", val: data.q20 ? `${data.q20} yrs` : null },
        { label: "Q21: Past Year Quit Attempts", val: data.q21 }
      ]
    },
    {
      id: "sec_4",
      num: "4",
      title: "Section 4: Alcohol Consumption (AUDIT-C)",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.staff_nurse_completed || data.q30 !== undefined || data.q27 !== undefined),
      items: [
        { label: "Q27: Drinking Frequency", val: data.q27 },
        { label: "Q28: Typical Quantity (Standard Drinks)", val: data.q28 },
        { label: "Q29: Binge Drinking Frequency (6+ Drinks)", val: data.q29 },
        { label: "Q30: Total AUDIT-C Score", val: data.q30 !== undefined ? `${data.q30} Points` : data.audit_c_score ? `${data.audit_c_score} Points` : null },
        { label: "Alcohol Risk Categorisation", val: data.q30 >= 4 || data.audit_c_score >= 4 ? "Hazardous / High-Risk Drinking" : "Low Risk Drinking" }
      ]
    },
    {
      id: "sec_5_7",
      num: "5-7",
      title: "Sections 5-7: Physical Measurements & Vitals",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.staff_nurse_completed || data.bp_sys !== undefined || data.q75 !== undefined),
      items: [
        { label: "Systolic Blood Pressure (BP Sys)", val: data.bp_sys || data.bp_systolic ? `${data.bp_sys || data.bp_systolic} mmHg` : null },
        { label: "Diastolic Blood Pressure (BP Dia)", val: data.bp_dia || data.bp_diastolic ? `${data.bp_dia || data.bp_diastolic} mmHg` : null },
        { label: "Pulse Rate", val: data.pulse_rate ? `${data.pulse_rate} bpm` : null },
        { label: "Standing Height", val: data.height ? `${data.height} cm` : null },
        { label: "Body Weight", val: data.weight ? `${data.weight} kg` : null },
        { label: "Calculated Body Mass Index (BMI)", val: data.bmi ? `${data.bmi} kg/m²` : null },
        { label: "Waist Circumference", val: data.waist_circumference ? `${data.waist_circumference} cm` : null }
      ]
    },
    {
      id: "sec_8",
      num: "8",
      title: "Section 8: Mental Health (PHQ-9 & GAD-7)",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.staff_nurse_completed || data.phq9_score !== undefined || data.q65 !== undefined || data.q63 !== undefined),
      items: [
        { label: "Q63: PHQ-9 Depression Screener", val: data.q63 || data.q58 },
        { label: "Q64: PHQ-9 Item 1 (Little Interest)", val: data["q64_1"] || data.phq9_item_1 },
        { label: "Q64: PHQ-9 Item 2 (Feeling Down/Depressed)", val: data["q64_2"] || data.phq9_item_2 },
        { label: "Q64: PHQ-9 Item 3 (Sleep Issues)", val: data["q64_3"] || data.phq9_item_3 },
        { label: "Q64: PHQ-9 Item 4 (Low Energy)", val: data["q64_4"] || data.phq9_item_4 },
        { label: "Q64: PHQ-9 Item 5 (Poor Appetite)", val: data["q64_5"] || data.phq9_item_5 },
        { label: "Q64: PHQ-9 Item 6 (Feeling Bad About Self)", val: data["q64_6"] || data.phq9_item_6 },
        { label: "Q64: PHQ-9 Item 7 (Concentration Trouble)", val: data["q64_7"] || data.phq9_item_7 },
        { label: "Q64: PHQ-9 Item 8 (Slow/Restless Movement)", val: data["q64_8"] || data.phq9_item_8 },
        { label: "Q64: PHQ-9 Item 9 (Thoughts of Self-Harm)", val: data["q64_9"] || data.phq9_item_9 },
        { label: "Q65: PHQ-9 Total Depression Score", val: data.q65 !== undefined ? `${data.q65} / 27 Points` : data.phq9_score !== undefined ? `${data.phq9_score} / 27 Points` : null },
        { label: "Q59: GAD-7 Anxiety Screener", val: data.q59 },
        { label: "Q61: GAD-7 Total Anxiety Score", val: data.q61 !== undefined ? `${data.q61} / 21 Points` : data.gad7_score !== undefined ? `${data.gad7_score} / 21 Points` : null }
      ]
    },
    {
      id: "sec_9_13",
      num: "9-13",
      title: "Sections 9-13: Laboratory Tests & Doctor Examination",
      role: "Doctor",
      isCompleted: Boolean(data.doctor_completed || data.sections_9_15_completed || data.overall_risk_rating || data.q93 !== undefined),
      items: [
        { label: "Random Blood Sugar (RBS)", val: data.rbs ? `${data.rbs} mg/dL` : null },
        { label: "Fasting Blood Sugar (FBS)", val: data.fbs ? `${data.fbs} mg/dL` : null },
        { label: "Glycated Hemoglobin (HbA1c)", val: data.hba1c ? `${data.hba1c} %` : null },
        { label: "Total Serum Cholesterol", val: data.cholesterol ? `${data.cholesterol} mg/dL` : null },
        { label: "WHO Cardiovascular (CVD) Risk Rating", val: data.overall_risk_rating || data.cvd_risk_assessment || data.risk },
        { label: "Doctor Clinical Impression & Diagnosis", val: data.doctor_clinical_notes || data.diagnosis },
        { label: "Prescribed Anti-Hypertensive / Anti-Diabetic Drugs", val: data.medication_prescribed },
        { label: "Recommended Follow-up Visit Date (Q93)", val: data.q93 || data.followup_date }
      ]
    },
    {
      id: "sec_14",
      num: "14",
      title: "Section 14: Healthcare Linkages & Referral Tracking",
      role: "Case Management Coordinator",
      isCompleted: Boolean(data.coordinator_completed || data.q97 !== undefined),
      items: [
        { label: "Q97: Referral Health Center Facility", val: data.q97 || data.referral_center },
        { label: "Q98: Transportation Support Arranged", val: data.q98 },
        { label: "Q99: Referral Confirmation Date", val: data.q99 },
        { label: "Q104: Follow-up Status Tracking", val: data.q104 || data.linkage_status }
      ]
    },
    {
      id: "sec_15",
      num: "15",
      title: "Section 15: Health & Lifestyle Counseling",
      role: "Counselor",
      isCompleted: Boolean(data.counselor_sec15_completed || data.q107 !== undefined),
      items: [
        { label: "Q107: Dietary Salt & Oil Reduction Counseling", val: data.q107 },
        { label: "Q108: Daily Physical Activity Counseling", val: data.q108 },
        { label: "Q109: Tobacco & Alcohol Cessation Counseling", val: data.q109 },
        { label: "Q110: Medication Adherence Counseling", val: data.q110 },
        { label: "Counselor Notes & Next Action Plan", val: data.counseling_notes || data.counselor_plan }
      ]
    },
    {
      id: "sec_16",
      num: "16",
      title: "Section 16: Community Perception & Feedback",
      role: "Field Supervisor",
      isCompleted: Boolean(data.section_16_completed || data.sec_16_done || data.q112 !== undefined),
      items: [
        { label: "Q112: Top Priority Health Issues in Locality", val: Array.isArray(data.q112) ? data.q112.join(", ") : data.q112 },
        { label: "Q113: Water & Environmental Sanitation Rating", val: data.q113 },
        { label: "Q114: Community Barriers to Health Camp Access", val: Array.isArray(data.q114) ? data.q114.join(", ") : data.q114 },
        { label: "Q115: Preferred Health Communication Channels", val: Array.isArray(data.q115) ? data.q115.join(", ") : data.q115 }
      ]
    }
  ];

  const currentSection = sectionsConfig.find(s => s.id === activeSectionId) || sectionsConfig[0];
  const populatedItems = currentSection.items.filter(it => it.val !== undefined && it.val !== null && String(it.val).trim() !== "");

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-[96vw] xl:max-w-[94vw] 2xl:max-w-7xl w-full h-[95vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-[#f5d40b] text-slate-950 font-mono font-black text-xs shadow-2xs">
                {data.participant_id}
              </span>
              <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {data.fullName}
              </h3>
              <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {data.location || "Dharavi"} Center
              </span>
              <span className={`text-xs font-bold px-3 py-0.5 rounded-full font-mono ${isHighRisk ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
                {data.risk || "Standard Risk"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1.5">
              Age: <strong className="text-white">{data.age || "48"} yrs</strong> • Gender: <strong className="text-white">{data.gender || "Female"}</strong> • Date: <strong className="text-white">{data.date_of_survey || "Today"}</strong> • Current Stage: <strong className="text-[#f5d40b]">{data.current_stage || "Pending Nurse"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button 
              onClick={onEdit}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5 font-mono shadow-2xs"
            >
              <Edit3 size={14} />
              <span>Edit Record</span>
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 font-bold text-xs transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5 font-mono shadow-2xs"
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab("sections")}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "sections" ? "bg-white text-slate-950 shadow-xs border border-slate-200 font-extrabold" : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <FileText size={15} className="text-amber-600" />
              <span>Survey Responses (All 16 Sections)</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "audit" ? "bg-white text-slate-950 shadow-xs border border-slate-200 font-extrabold" : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <UserCheck size={15} className="text-emerald-600" />
              <span>Multi-Role Audit Trail</span>
            </button>

            <button
              onClick={() => setActiveTab("raw")}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "raw" ? "bg-white text-slate-950 shadow-xs border border-slate-200 font-extrabold" : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <Code size={15} className="text-purple-600" />
              <span>Raw JSON Inspector</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB 1: ALL 16 SECTIONS RESPONSES */}
          {activeTab === "sections" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
              
              {/* Left Column: Section Selector Pills */}
              <div className="md:col-span-4 lg:col-span-3 space-y-1.5 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block px-2 pb-1">
                  16 Screening Sections
                </span>
                {sectionsConfig.map(sec => {
                  const isSelected = activeSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                        isSelected 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs font-black truncate">{sec.title}</p>
                        <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                          Role: {sec.role}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono shrink-0 ${
                        sec.isCompleted 
                          ? isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {sec.isCompleted ? '✓ Done' : 'Pending'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Active Section Details Card (Wide 2-column layout!) */}
              <div className="md:col-span-8 lg:col-span-9 bg-white rounded-3xl p-7 border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{currentSection.title}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Assigned Screening Operator: <strong className="text-slate-800">{currentSection.role}</strong></p>
                    </div>
                    <span className={`text-xs font-bold px-3.5 py-1.5 rounded-xl font-mono border ${
                      currentSection.isCompleted 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      {currentSection.isCompleted ? '✓ Completed & Recorded' : 'Pending Entry'}
                    </span>
                  </div>

                  {populatedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {populatedItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 gap-2 font-mono">
                          <span className="font-bold text-slate-600 text-xs">{item.label}</span>
                          <span className="font-black text-slate-950 text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs break-words">
                            {String(item.val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 font-mono space-y-3">
                      <FileText size={40} className="mx-auto text-slate-300 stroke-1" />
                      <p className="text-sm font-bold">
                        {currentSection.isCompleted 
                          ? "Section completed with default screening indicators." 
                          : `No responses recorded for ${currentSection.title} yet.`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {currentSection.isCompleted ? "" : `This section will populate when ${currentSection.role} submits their modules.`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Participant Record: <strong>{data.participant_id}</strong></span>
                  <span>Center: <strong>{data.location || "Dharavi"}</strong></span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MULTI-ROLE AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-900 uppercase tracking-wider font-mono">
                    Participant Workflow Audit Trail
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Chronological record of multi-role screening progression.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-mono">
                  Active Workflow
                </span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {(data.audit_trail || [
                  { role: "Field Supervisor", action: "Initiated Participant & Completed Section 1 Demographics", user: data.created_by_user || "FS001 (Field Supervisor)", timestamp: data.date_of_survey || "Today", status: "Section 1 Completed" }
                ]).map((at, idx) => (
                  <div key={idx} className="relative pl-10 text-xs space-y-1">
                    <div className="absolute left-2 top-0.5 w-5 h-5 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shadow-xs">
                      ✓
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-black text-slate-900 text-sm">{at.role}</p>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{at.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{at.action}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Operator ID: <strong className="text-slate-800">{at.user}</strong> • Status: <span className="text-emerald-700 font-bold">{at.status}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RAW JSON INSPECTOR */}
          {activeTab === "raw" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 font-mono uppercase tracking-wider">
                  Raw JSON Payload Object (Database Representation)
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                    alert("JSON copied to clipboard!");
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-900 text-amber-300 font-bold text-xs font-mono cursor-pointer"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="bg-slate-900 text-amber-300 p-6 rounded-3xl text-xs font-mono overflow-auto max-h-[60vh] border border-slate-800 shadow-inner">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
          <button 
            onClick={onDelete}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <Trash2 size={14} />
            <span>Delete Record</span>
          </button>

          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-black transition-colors font-mono cursor-pointer"
          >
            Done Viewing
          </button>
        </div>

      </div>
    </div>
  );
}
