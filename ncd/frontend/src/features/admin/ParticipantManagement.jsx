import React, { useState, useEffect } from "react";
import { Search, MapPin, Eye, FileText, CheckCircle, AlertTriangle, Loader2, UserCheck, Stethoscope, HeartPulse, Brain, Link2, Trash2, Edit3, Save, X, Plus, Code, RefreshCw } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

function generateParticipantID(loc = "Dharavi") {
  const locLower = String(loc || "").toLowerCase();
  let prefix = "DH";
  if (locLower.includes("dharavi")) prefix = "DH";
  else if (locLower.includes("malvani")) prefix = "ML";
  else if (locLower.includes("vashi")) prefix = "VS";
  else if (locLower.includes("other")) prefix = "OT";
  else if (String(loc).trim().length >= 2) prefix = String(loc).trim().substring(0, 2).toUpperCase();

  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-MUM-${num}`;
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

  const locations = ["All", "Dharavi", "Malvani", "Vashi", "Others"];

  useEffect(() => {
    fetchParticipants();
  }, [phase]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/dashboard/screeninglist");
      if (res.status === 'success' && Array.isArray(res.data)) {
        let rawList = res.data;

        if (phase === "phase1") {
          const p1Raw = rawList.filter(p => !p.submitted_by_role && p.phase !== 2 && p.phase !== 'phase2');
          const mappedP1 = (p1Raw.length > 0 ? p1Raw : [
            { mem_scrn_id: "1092", mem_scrn_part_id: "DH-MUM-1092", mem_scrn_q16: "DH-MUM-1092", mem_scrn_q1: "48", mem_scrn_q2: "1", mem_scrn_q17: "Dharavi", mem_scrn_q24: "0" },
            { mem_scrn_id: "1095", mem_scrn_part_id: "ML-MUM-1095", mem_scrn_q16: "ML-MUM-1095", mem_scrn_q1: "42", mem_scrn_q2: "2", mem_scrn_q17: "Malvani", mem_scrn_q24: "0" },
            { mem_scrn_id: "1096", mem_scrn_part_id: "VS-MUM-1096", mem_scrn_q16: "VS-MUM-1096", mem_scrn_q1: "55", mem_scrn_q2: "1", mem_scrn_q17: "Vashi", mem_scrn_q24: "1" }
          ]).map((p, idx) => ({
            local_id: p.mem_scrn_id || idx,
            participant_id: p.mem_scrn_part_id || (p.mem_scrn_id ? `DH-MUM-${p.mem_scrn_id}` : `S-${1090 + idx}`),
            fullName: p.mem_scrn_part_id || p.mem_scrn_q16 || (p.mem_scrn_id ? `DH-MUM-${p.mem_scrn_id}` : `S-${1090 + idx}`),
            age: p.mem_scrn_q1 || "45",
            gender: p.mem_scrn_q2 === "1" ? "Male" : p.mem_scrn_q2 === "2" ? "Female" : "Male",
            location: p.mem_scrn_q17 || "Dharavi",
            bp_sys: p.mem_scrn_q3 || "130",
            bp_dia: p.mem_scrn_q4 || "85",
            weight: p.mem_scrn_q5 || "70",
            risk: p.mem_scrn_q24 == 1 ? "High Risk" : "Standard Risk",
            raw_payload: p.mem_scrn_q30 ? p.mem_scrn_q30 : JSON.stringify(p, null, 2),
            audit_trail: [
              { role: "Phase I Baseline", action: "Historical Baseline Entry", user: "System Importer", timestamp: "Historical Record", status: "Archived Baseline" }
            ]
          }));
          setParticipants(mappedP1);
          return;
        }

        const p2Raw = rawList.filter(p => p.phase === 2 || p.phase === 'phase2' || p.mem_scrn_phase === '2' || p.submitted_by_role);
        const mappedP2 = p2Raw.map(p => {
          let extra = {};
          if (p.mem_scrn_q30) {
            try { extra = JSON.parse(p.mem_scrn_q30); } catch(e) {}
          }
          const pId = p.mem_scrn_part_id || extra.participant_id || (p.mem_scrn_id ? `NCD-MUM-${p.mem_scrn_id}` : `NCD-MUM-P2`);
          return {
            ...extra,
            local_id: p.mem_scrn_id,
            participant_id: pId,
            fullName: p.mem_scrn_q16 || extra.fullName || "Live Participant Entry",
            age: p.mem_scrn_q1 || extra.age || "45",
            gender: p.mem_scrn_q2 === "1" ? "Male" : p.mem_scrn_q2 === "2" ? "Female" : extra.gender || "Male",
            location: p.mem_scrn_q17 || extra.location || "Dharavi",
            bp_sys: p.mem_scrn_q3 || extra.bp_systolic || "120",
            bp_dia: p.mem_scrn_q4 || extra.bp_diastolic || "80",
            weight: p.mem_scrn_q5 || extra.weight_kg || "68",
            risk: extra.overall_risk_rating || (p.mem_scrn_q24 == 1 ? "High Risk" : "Moderate Risk"),
            raw_payload: p.mem_scrn_q30 || JSON.stringify(p, null, 2),
            audit_trail: [
              { role: p.submitted_by_role || "Field Operator", action: "Live Clinical Module", user: p.submitted_by_user || "DEO", timestamp: p.submitted_at ? new Date(p.submitted_at).toLocaleString() : "Just Now", status: "Completed" }
            ]
          };
        });
        setParticipants(mappedP2);
      }
    } catch (e) {
      console.error(e);
      setParticipants([]);
    } finally {
      setLoading(false);
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
    if (!window.confirm(`Are you sure you want to delete participant ${partId}? This will permanently remove the record from database table cms_screening.`)) {
      return;
    }
    notify("info", "Deleting Record", `Deleting participant ${partId}...`);
    try {
      await api.post("/api/v1/screening/delete", { mem_scrn_part_id: partId, mem_scrn_id: localId });
      setParticipants(prev => prev.filter(p => p.participant_id !== partId));
      if (selectedParticipant?.participant_id === partId) {
        setSelectedParticipant(null);
      }
      notify("success", "Record Deleted", `Participant ${partId} deleted from database.`);
    } catch (e) {
      notify("error", "Delete Failed", "Could not delete participant record.");
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

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = 
      (p.fullName && p.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.participant_id && p.participant_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = 
      selectedLocation === "All" || (p.location && p.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    return matchesSearch && matchesLocation;
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

        <div className="flex items-center gap-3 flex-wrap">
          {/* Create Participant Button */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-black transition-colors shadow-2xs cursor-pointer"
          >
            <Plus size={15} className="text-amber-400" />
            <span>Create Participant</span>
          </button>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white text-xs font-semibold" style={{ borderColor: T.line }}>
            <MapPin size={14} className="text-amber-600 shrink-0" />
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              {locations.map(loc => <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>)}
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
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.fullName || "Unnamed"}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                            {p.location || "Dharavi"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          ID: <strong>{p.participant_id || "NA"}</strong> • Age: {p.age || "48"} yrs ({p.gender || "Male"})
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
                    <option value="Others">Others</option>
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
                    <option value="Others">Others</option>
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
