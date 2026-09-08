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
        const timeoutPromise = new Promise(res => setTimeout(() => res(null), 800));
        const res = await Promise.race([apiPromise, timeoutPromise]);
        if (res && res.status === 'success') {
          apiResponded = true;
          if (Array.isArray(res.data)) {
            apiList = res.data;
          }
        }
      } catch (err) {}

      // If backend DB screening tables are truncated/cleared (0 items returned), purge stale local storage cache!
      if (apiResponded && apiList.length === 0) {
        localStorage.removeItem('ncd_local_initiated_participants');
        localInitiated = [];
      }

      const combinedList = [...localInitiated, ...idbQueue, ...apiList];
      const seenIds = new Set();
      const mappedList = [];

      combinedList.forEach((p, idx) => {
        let extra = {};
        if (p.mem_scrn_q30) {
          try { extra = typeof p.mem_scrn_q30 === 'string' ? JSON.parse(p.mem_scrn_q30) : p.mem_scrn_q30; } catch(e) {}
        }
        const realPId = p.participant_id || p.mem_scrn_part_id || extra.participant_id;
        const hasData = Boolean(p.fullName || extra.fullName || p.mem_scrn_q16 || p.age || p.mem_scrn_q1 || extra.age);

        // Exclude unpopulated empty DB stubs
        if (!realPId && !hasData) return;
        const pId = realPId || (p.mem_scrn_id ? `DH-MUM-${p.mem_scrn_id}` : `P-${idx + 1}`);
        
        if (!pId || seenIds.has(pId)) return;
        seenIds.add(pId);

        const roleName = p.submitted_by_role || extra.submitted_by_role || p.user_role || "Data Entry Operator";
        const userName = p.submitted_by_user || extra.user_name || p.user_name || p.user_code || "Staff User";
        const dateStr = p.screening_date || extra.screening_date || (p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : new Date().toLocaleDateString());

        const isFsSec1Done = true; // Section 1 Demographics completed when initiated
        const isNurseDone = Boolean(p.sections_2_8_completed || extra.sections_2_8_completed || extra.medical_history || extra.bp_systolic || p.mem_scrn_q9 || p.bp_sys || extra.q9);
        const isDoctorDone = Boolean(p.sections_9_15_completed || extra.sections_9_15_completed || extra.cvd_risk_assessment || extra.overall_risk_rating || extra.q93);
        const isSec16Done = Boolean(p.section_16_completed || p.sec_16_done || p.community_perception_completed || extra.section_16_completed || extra.sec_16_done || extra.community_perception || extra.q112);

        let currentPendingQueue = "With Staff Nurse Queue";
        let currentRole = "Staff Nurse";

        if (isSec16Done && isDoctorDone && isNurseDone) {
          currentPendingQueue = "Completed (All 16 Sections Done)";
          currentRole = "Completed";
        } else if (isDoctorDone && isNurseDone) {
          currentPendingQueue = "With Field Supervisor (Pending Section 16)";
          currentRole = "Field Supervisor";
        } else if (isNurseDone) {
          currentPendingQueue = "With Doctor Queue (Pending Clinical Exam)";
          currentRole = "Doctor";
        } else {
          currentPendingQueue = "With Staff Nurse Queue (Pending Vitals & History)";
          currentRole = "Staff Nurse";
        }

        mappedList.push({
          ...extra,
          local_id: p.mem_scrn_id || p.local_id || idx,
          participant_id: pId,
          fullName: (p.fullName && p.fullName !== "Unnamed Participant") ? p.fullName : (extra.fullName || p.mem_scrn_q16 || pId),
          age: p.age || p.mem_scrn_q1 || extra.age || "-",
          gender: p.gender || (p.mem_scrn_q2 === "1" ? "Male" : p.mem_scrn_q2 === "2" ? "Female" : extra.gender || "-"),
          location: p.location || p.mem_scrn_q17 || extra.location || "-",
          contact_number: p.contact_number || extra.contact_number || "-",
          date_of_survey: dateStr,
          created_by_role: roleName,
          created_by_user: userName,
          current_stage: currentPendingQueue,
          current_user_role: currentRole,
          is_fs_done: isFsSec1Done,
          is_nurse_done: isNurseDone,
          is_doctor_done: isDoctorDone,
          is_sec16_done: isSec16Done,
          risk: extra.overall_risk_rating || (p.mem_scrn_q24 == 1 ? "High Risk" : "Standard Risk"),
          raw_payload: p.mem_scrn_q30 || p,
          audit_trail: [
            { role: "Field Supervisor", action: "Initiated Participant & Completed Section 1 Demographics", user: userName, timestamp: dateStr, status: "Section 1 Completed" },
            isNurseDone && { role: "Staff Nurse", action: "Completed Vitals, Medical History & PHQ-9 Mental Health", user: extra.nurse_user || "Staff Nurse", timestamp: "Completed", status: "Sections 2-8 Completed" },
            isDoctorDone && { role: "Doctor", action: "Completed Clinical Exam, Diagnostics & CVD Risk Rating", user: extra.doctor_user || "Doctor Account", timestamp: "Completed", status: "Sections 9-15 Completed" },
            isSec16Done && { role: "Field Supervisor", action: "Completed Section 16 Community Perception Observations", user: extra.sec16_user || userName, timestamp: "Completed", status: "Section 16 Completed" }
          ].filter(Boolean)
        });
      });

      if (isMounted) setParticipants(mappedList);
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: T.ink, letterSpacing: "-0.02em" }}>
            Participant Directory & Multi-Role Audit
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal500, marginTop: 2 }}>
            Real-time directory capturing all initiated & completed screening responses with multi-role audit history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Overall Export Button */}
          <button 
            onClick={() => exportToCSV(participants, "ncd_participants_overall_all_centers.csv")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-2xs cursor-pointer font-mono"
            title="Export overall participant records across all centers to CSV"
          >
            <Download size={14} className="text-emerald-300" />
            <span>Export Overall (All Centers)</span>
          </button>

          {/* Location-Wise Export Button */}
          <button 
            onClick={() => {
              const locName = selectedLocation === "All" ? "Filtered" : selectedLocation;
              exportToCSV(filteredParticipants, `ncd_participants_${locName.toLowerCase()}_export.csv`);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-2xs cursor-pointer font-mono"
            title={`Export participant records for ${selectedLocation} to CSV`}
          >
            <Download size={14} className="text-amber-200" />
            <span>Export Location ({selectedLocation})</span>
          </button>

          {/* Create Participant Button */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-black transition-colors shadow-2xs cursor-pointer font-mono"
          >
            <Plus size={15} className="text-amber-400" />
            <span>Create Participant</span>
          </button>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white text-xs font-semibold font-mono" style={{ borderColor: T.line }}>
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
            className="flex items-center gap-2 px-4 py-2 rounded-full shadow-2xs"
            style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}
          >
            <Search size={16} color={T.charcoal500} />
            <input 
              type="text" 
              placeholder="Search ID, name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-44"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
            />
          </div>

          <button 
            onClick={fetchParticipants}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          
          {/* Location Filter Pills & Sort Dropdown Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs font-mono">
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
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${isSel ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs font-extrabold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
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
                className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
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
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center p-12 text-gray-500 bg-white border rounded-3xl" style={{ borderColor: T.line }}>
              No participant records found matching selected location or search query.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredParticipants.map((p) => {
                const isHighRisk = String(p.risk || '').toLowerCase().includes('high');
                return (
                  <div 
                    key={p.local_id || p.participant_id}
                    className={`rounded-3xl p-4 sm:p-5 border bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${selectedParticipant?.participant_id === p.participant_id ? 'ring-2 ring-amber-500 shadow-md' : 'hover:border-slate-400 shadow-2xs'}`}
                    style={{ borderColor: T.line }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${isHighRisk ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                        {p.fullName ? p.fullName.split(" ").map(w => w[0]).slice(0, 2).join("") : "NA"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.fullName || "Unnamed"}</h4>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                            {p.location || "Dharavi"}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                            {p.current_stage || "Pending Nurse"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          ID: <strong className="text-slate-900">{p.participant_id || "NA"}</strong> • Age: {p.age || "48"} yrs ({p.gender || "Female"}) • Date: <strong className="text-slate-800">{p.date_of_survey || "Today"}</strong> • Initiated by: <strong className="text-slate-900">{p.created_by_user || "FS001 (Field Supervisor)"}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isHighRisk ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                        {p.risk || "Standard Risk"}
                      </span>

                      {/* Select / View Details Button */}
                      <button 
                        onClick={() => setSelectedParticipant(p)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye size={14} className="text-amber-400" />
                        <span>Select & View Response</span>
                      </button>
                      
                      {/* Edit Button */}
                      <button 
                        onClick={() => setEditingParticipant(p)}
                        className="p-2 rounded-full hover:bg-amber-50 border border-slate-200 text-slate-700 hover:text-amber-800 transition-colors cursor-pointer"
                        title="Edit Participant"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteParticipant(p.participant_id, p.local_id)}
                        className="p-2 rounded-full hover:bg-red-50 border border-slate-200 text-slate-700 hover:text-red-700 transition-colors cursor-pointer"
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

        {/* Selected Participant Response Data & Multi-Role Audit Drawer */}
        {selectedParticipant && (
          <div className="w-[440px] border-l bg-white p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200 shrink-0 shadow-xl" style={{ borderColor: T.line }}>
            
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{selectedParticipant.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Participant ID: {selectedParticipant.participant_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingParticipant(selectedParticipant)} className="text-xs font-bold text-amber-800 hover:underline cursor-pointer">
                  Edit
                </button>
                <button onClick={() => setSelectedParticipant(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
                  Close [X]
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Vitals BP</span>
                <span className="font-bold text-slate-900 text-sm">{selectedParticipant.bp_sys || "120"} / {selectedParticipant.bp_dia || "80"} mmHg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Center Location</span>
                <span className="font-bold text-slate-900 text-sm">{selectedParticipant.location || "Dharavi"}</span>
              </div>
            </div>

            {/* Response Data JSON Inspector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Code size={14} className="text-amber-600" /> Captured Response Data JSON
                </h4>
                <button 
                  onClick={() => setShowRawJson(!showRawJson)} 
                  className="text-[11px] font-bold text-amber-700 hover:underline font-mono cursor-pointer"
                >
                  {showRawJson ? "Hide Raw JSON" : "Expand Raw JSON"}
                </button>
              </div>

              {showRawJson ? (
                <pre className="bg-slate-900 text-amber-300 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800 shadow-inner">
                  {typeof selectedParticipant.raw_payload === 'string' 
                    ? selectedParticipant.raw_payload 
                    : JSON.stringify(selectedParticipant, null, 2)}
                </pre>
              ) : (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Demographics Status:</span>
                    <span className="font-bold text-slate-900">Initiated & Saved</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Location:</span>
                    <span className="font-bold text-slate-900">{selectedParticipant.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Overall Risk Rating:</span>
                    <span className="font-bold text-amber-900">{selectedParticipant.risk}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section-Wise Answer Tracker */}
            <SectionWiseAnswerTracker participant={selectedParticipant} />

            {/* Multi-Role Audit Trail */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 border-b pb-2">
                <UserCheck size={14} className="text-amber-600" /> "Who Did What" — Multi-Role Audit Trail
              </h4>

              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {(selectedParticipant.audit_trail || [
                  { role: "Field Supervisor", action: "Demographics & Community Perception", user: "DEO", timestamp: "Active Entry", status: "Completed" }
                ]).map((at, idx) => (
                  <div key={idx} className="relative pl-8 text-xs space-y-0.5">
                    <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-[9px] font-black">
                      ✓
                    </div>
                    <p className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{at.role}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">{at.timestamp}</span>
                    </p>
                    <p className="text-[11px] text-slate-600">{at.action}</p>
                    <p className="text-[10px] text-slate-400 font-mono">By Operator: <strong>{at.user}</strong></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => handleDeleteParticipant(selectedParticipant.participant_id, selectedParticipant.local_id)}
                className="w-full py-2.5 rounded-full text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Participant Record</span>
              </button>
            </div>

          </div>
        )}

      </div>

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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Gender</label>
                  <select 
                    value={newParticipant.gender}
                    onChange={(e) => setNewParticipant(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
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
                    onChange={(e) => setNewParticipant(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                  >
                    <option value="Dharavi">Dharavi</option>
                    <option value="Malvani">Malvani</option>
                    <option value="Vashi">Vashi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Initial Risk Rating</label>
                <select 
                  value={newParticipant.risk}
                  onChange={(e) => setNewParticipant(p => ({ ...p, risk: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                >
                  <option value="Standard Risk">Standard Risk</option>
                  <option value="Moderate Risk">Moderate Risk</option>
                  <option value="High Risk">High Risk (Priority Referral)</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-black flex items-center gap-1.5 cursor-pointer">
                  <Save size={14} />
                  <span>Create & Capture</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit / Update Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Admin Edit — {editingParticipant.participant_id}</h3>
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

function SectionWiseAnswerTracker({ participant }) {
  const [activeSectionTab, setActiveSectionTab] = useState("sec_1");

  if (!participant) return null;

  let raw = {};
  if (participant.raw_payload) {
    try {
      raw = typeof participant.raw_payload === 'string' ? JSON.parse(participant.raw_payload) : participant.raw_payload;
    } catch (e) {}
  }
  const data = { ...participant, ...raw };

  const sectionsConfig = [
    {
      id: "sec_1",
      title: "Section 1: Demographics",
      role: "Field Supervisor",
      isCompleted: true,
      fields: [
        { label: "Participant ID", val: data.participant_id || data.mem_scrn_part_id },
        { label: "Full Name", val: data.fullName || data.mem_scrn_q16 },
        { label: "Age", val: data.age || data.mem_scrn_q1 },
        { label: "Gender", val: data.gender || (data.mem_scrn_q2 == "1" ? "Male" : "Female") },
        { label: "Center Location", val: data.location || data.mem_scrn_q17 },
        { label: "Contact Number", val: data.contact_number || data.mem_scrn_q18 },
        { label: "Education Level", val: data.education || data.mem_scrn_q3 },
        { label: "Marital Status", val: data.marital_status || data.mem_scrn_q4 }
      ]
    },
    {
      id: "sec_2",
      title: "Section 2: Medical History",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.medical_history || data.mem_scrn_q9 || data.q9),
      fields: [
        { label: "Known Diabetes", val: data.q9 || data.diabetes_history },
        { label: "Known Hypertension", val: data.q10 || data.hypertension_history },
        { label: "Family Medical History", val: data.q11 || data.family_history },
        { label: "Past CVD Events", val: data.q12 || data.cvd_history }
      ]
    },
    {
      id: "sec_3",
      title: "Section 3: Tobacco Use",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.tobacco_use || data.q17),
      fields: [
        { label: "Smokeless Tobacco", val: data.q17 || data.smokeless_tobacco },
        { label: "Smoking Status", val: data.q18 || data.smoking_status },
        { label: "Frequency", val: data.q19 || data.tobacco_frequency }
      ]
    },
    {
      id: "sec_4",
      title: "Section 4: Alcohol Use (AUDIT-C)",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.audit_c_score || data.q30),
      fields: [
        { label: "Q27 Alcohol Frequency", val: data.q27 },
        { label: "Q28 Typical Quantity", val: data.q28 },
        { label: "Q29 Binge Frequency", val: data.q29 },
        { label: "Q30 AUDIT-C Total Score", val: data.q30 || data.audit_c_score }
      ]
    },
    {
      id: "sec_5_7",
      title: "Sections 5-7: Vitals & Exam",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.bp_sys || data.height),
      fields: [
        { label: "Systolic BP", val: data.bp_sys ? `${data.bp_sys} mmHg` : null },
        { label: "Diastolic BP", val: data.bp_dia ? `${data.bp_dia} mmHg` : null },
        { label: "Pulse Rate", val: data.pulse_rate ? `${data.pulse_rate} bpm` : null },
        { label: "Height", val: data.height ? `${data.height} cm` : null },
        { label: "Weight", val: data.weight ? `${data.weight} kg` : null },
        { label: "BMI", val: data.bmi }
      ]
    },
    {
      id: "sec_8",
      title: "Section 8: Mental Health (PHQ-9 / GAD-7)",
      role: "Staff Nurse",
      isCompleted: Boolean(data.sections_2_8_completed || data.phq9_score || data.q65 || data.q61),
      fields: [
        { label: "Q58/Q63 Depression Screen", val: data.q63 || data.q58 },
        { label: "Q64 PHQ-9 Matrix", val: data.phq9_matrix ? "Matrix Recorded" : null },
        { label: "Q65 PHQ-9 Total Score", val: data.phq9_score || data.q65 },
        { label: "Q59 Anxiety Screen", val: data.q59 },
        { label: "Q61 GAD-7 Total Score", val: data.gad7_score || data.q61 }
      ]
    },
    {
      id: "sec_9_13",
      title: "Sections 9-13: Clinical Diagnostics & Risk",
      role: "Doctor",
      isCompleted: Boolean(data.sections_9_15_completed || data.overall_risk_rating || data.q93),
      fields: [
        { label: "Random Blood Sugar (RBS)", val: data.rbs ? `${data.rbs} mg/dL` : null },
        { label: "HbA1c Level", val: data.hba1c ? `${data.hba1c} %` : null },
        { label: "Total Cholesterol", val: data.cholesterol ? `${data.cholesterol} mg/dL` : null },
        { label: "WHO CVD Risk Rating", val: data.overall_risk_rating || data.risk },
        { label: "Medication Prescribed", val: data.medication_prescribed },
        { label: "Follow-up Date (Q93)", val: data.q93 }
      ]
    },
    {
      id: "sec_14_15",
      title: "Sections 14-15: Linkages & Counseling",
      role: "Counselor / Doctor",
      isCompleted: Boolean(data.sections_9_15_completed || data.counseling_notes || data.referral_center),
      fields: [
        { label: "Referral Health Center", val: data.referral_center },
        { label: "Counseling Notes", val: data.counseling_notes }
      ]
    },
    {
      id: "sec_16",
      title: "Section 16: Community Perception",
      role: "Field Supervisor",
      isCompleted: Boolean(data.section_16_completed || data.sec_16_done || data.q112 || data.q113),
      fields: [
        { label: "Q112 Major Health Issues", val: Array.isArray(data.q112) ? data.q112.join(", ") : data.q112 },
        { label: "Q113 Water & Sanitation", val: data.q113 },
        { label: "Q114 Camp Barriers", val: Array.isArray(data.q114) ? data.q114.join(", ") : data.q114 },
        { label: "Q115 Info Preferences", val: Array.isArray(data.q115) ? data.q115.join(", ") : data.q115 }
      ]
    }
  ];

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
          <FileText size={14} className="text-amber-600" /> Section-Wise Answer Tracker
        </h4>
        <span className="text-[10px] font-mono font-bold text-slate-500">
          16 Sections
        </span>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
        {sectionsConfig.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSectionTab(sec.id)}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeSectionTab === sec.id
                ? 'bg-amber-400 text-slate-950 shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{sec.id.toUpperCase().replace('_', ' ')}</span>
            {sec.isCompleted ? (
              <span className="text-[9px] text-emerald-700 font-extrabold">✓</span>
            ) : (
              <span className="text-[9px] text-slate-400">•</span>
            )}
          </button>
        ))}
      </div>

      {/* Active Section Details */}
      {(() => {
        const currentSec = sectionsConfig.find(s => s.id === activeSectionTab) || sectionsConfig[0];
        const populatedFields = currentSec.fields.filter(f => f.val !== undefined && f.val !== null && String(f.val).trim() !== "");

        return (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div>
                <h5 className="text-xs font-extrabold text-slate-900">{currentSec.title}</h5>
                <span className="text-[10px] font-mono font-semibold text-slate-500">Assigned Role: {currentSec.role}</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                currentSec.isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                {currentSec.isCompleted ? '✓ Completed' : 'Pending Entry'}
              </span>
            </div>

            {populatedFields.length > 0 ? (
              <div className="space-y-2">
                {populatedFields.map((f, i) => (
                  <div key={i} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1.5 last:border-0 font-mono">
                    <span className="text-slate-500 font-medium text-[11px]">{f.label}:</span>
                    <span className="font-bold text-slate-900 text-right max-w-[200px] break-words">{String(f.val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono italic text-center py-2">
                {currentSec.isCompleted 
                  ? "Section marked complete." 
                  : `No answers recorded for ${currentSec.title} yet.`}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
