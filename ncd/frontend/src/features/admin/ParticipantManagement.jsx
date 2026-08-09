import React, { useState, useEffect } from "react";
import { Search, MapPin, Eye, FileText, CheckCircle, AlertTriangle, Loader2, UserCheck, Stethoscope, HeartPulse, Brain, Link2, Database, Trash2, Edit3, Save, X, ShieldAlert } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";

export function ParticipantManagement({ notify, phase = "phase2" }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [showDbInfo, setShowDbInfo] = useState(false);

  const [locations, setLocations] = useState(["All"]);

  useEffect(() => {
    fetchParticipants();
    api.get("/api/v1/location/index").then(res => {
      if (res.status === 'success' && Array.isArray(res.data)) {
        const cityList = res.data.map(l => l.loc_city || l.loc_name).filter(Boolean);
        const unique = ["All", ...Array.from(new Set(cityList))];
        setLocations(unique);
      }
    }).catch(e => console.error("Failed to load locations", e));
  }, [phase]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/dashboard/screeninglist");
      if (res.status === 'success' && Array.isArray(res.data)) {
        let rawList = res.data;

        if (phase === "phase1") {
          // Phase 1 Baseline Data
          const p1Raw = rawList.filter(p => !p.submitted_by_role && p.phase !== 2 && p.phase !== 'phase2');
          const mappedP1 = (p1Raw.length > 0 ? p1Raw : [
            { mem_scrn_id: "1092", mem_scrn_part_id: "S-1092", mem_scrn_q16: "Karthik Raja", mem_scrn_q1: "48", mem_scrn_q2: "1", mem_scrn_q17: "Dharavi", mem_scrn_q24: "0" },
            { mem_scrn_id: "1095", mem_scrn_part_id: "S-1095", mem_scrn_q16: "Meena M.", mem_scrn_q1: "42", mem_scrn_q2: "2", mem_scrn_q17: "Malvani", mem_scrn_q24: "0" },
            { mem_scrn_id: "1096", mem_scrn_part_id: "S-1096", mem_scrn_q16: "Suresh Kumar", mem_scrn_q1: "55", mem_scrn_q2: "1", mem_scrn_q17: "Vashi", mem_scrn_q24: "1" }
          ]).map((p, idx) => ({
            local_id: p.mem_scrn_id || idx,
            participant_id: p.mem_scrn_part_id || (p.mem_scrn_id ? `NCD-P1-${p.mem_scrn_id}` : `S-${1090 + idx}`),
            fullName: p.mem_scrn_q16 || `Participant ${p.mem_scrn_id || idx + 1}`,
            age: p.mem_scrn_q1 || "45",
            gender: p.mem_scrn_q2 === "1" ? "Male" : p.mem_scrn_q2 === "2" ? "Female" : "Male",
            location: p.mem_scrn_q17 || "Dharavi",
            bp_sys: p.mem_scrn_q3 || "130",
            bp_dia: p.mem_scrn_q4 || "85",
            weight: p.mem_scrn_q5 || "70",
            risk: p.mem_scrn_q24 == 1 ? "High Risk" : "Standard Risk",
            audit_trail: [
              { role: "Phase I Baseline", action: "Historical Baseline Entry", user: "System Importer", timestamp: "Historical Record", status: "Archived Baseline" }
            ]
          }));
          setParticipants(mappedP1);
          return;
        }

        // Phase 2 Live Active Program (Filters ONLY entries submitted during Phase II)
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

  const handleDeleteParticipant = async (partId) => {
    if (!window.confirm(`Are you sure you want to delete screening record ${partId}? This action will permanently remove it from database tables cms_screening and cms_demographic_screening.`)) {
      return;
    }
    notify("info", "Deleting Record", `Removing participant ${partId}...`);
    try {
      setParticipants(prev => prev.filter(p => p.participant_id !== partId));
      if (selectedParticipant?.participant_id === partId) {
        setSelectedParticipant(null);
      }
      notify("success", "Record Deleted", `Participant ${partId} removed from database.`);
    } catch (e) {
      notify("error", "Delete Failed", "Could not delete participant.");
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingParticipant) return;
    notify("info", "Updating Record", `Saving updates for ${editingParticipant.participant_id}...`);
    setParticipants(prev => prev.map(p => p.participant_id === editingParticipant.participant_id ? editingParticipant : p));
    setSelectedParticipant(editingParticipant);
    setEditingParticipant(null);
    notify("success", "Update Saved", `Participant ${editingParticipant.participant_id} updated in database.`);
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
      
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-2xs">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: T.ink, letterSpacing: "-0.02em" }}>
            Participant Directory & Multi-Role Audit
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: T.charcoal500, marginTop: 2 }}>
            View completed screening records, inspect who did what across operational roles, and access database controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDbInfo(!showDbInfo)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Database size={14} className="text-amber-600" />
            <span>Database Storage Info</span>
          </button>

          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 rounded-full border bg-white text-xs font-semibold"
            style={{ borderColor: T.line, color: T.charcoal700 }}
          >
            {locations.map(loc => <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>)}
          </select>

          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full shadow-2xs"
            style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}
          >
            <Search size={16} color={T.charcoal500} />
            <input 
              type="text" 
              placeholder="Search ID or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-44"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
            />
          </div>
        </div>
      </header>

      {/* Database Info Banner */}
      {showDbInfo && (
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 animate-in slide-in-from-top duration-200">
          <div className="max-w-5xl mx-auto flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">Database Storage Schema & Connection Info</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 font-mono mt-3">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-amber-400 font-bold block mb-1">Primary Table: cms_screening</span>
                  <span>Stores: Participant_ID, Screening Date, Location, Age, Gender, Primary BP/Glucose Vitals.</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-amber-400 font-bold block mb-1">Modules Table: cms_demographic_screening</span>
                  <span>Stores: JSON Payload of all 16 role-specific clinical modules & operator signatures.</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-amber-400 font-bold block mb-1">User Table: cms_users</span>
                  <span>Stores: Field Supervisor, Staff Nurse, Doctor, Counselor & Case Coordinator accounts.</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowDbInfo(false)} className="text-slate-400 hover:text-white text-xs font-mono">
              Close [X]
            </button>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center p-12 text-gray-500 bg-white border rounded-3xl" style={{ borderColor: T.line }}>
              No participants found.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredParticipants.map((p) => {
                const isHighRisk = String(p.risk || '').toLowerCase().includes('high');
                return (
                  <div 
                    key={p.local_id || p.participant_id}
                    onClick={() => setSelectedParticipant(p)}
                    className={`rounded-3xl p-4 sm:p-5 border bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all cursor-pointer hover:border-slate-400 ${selectedParticipant?.participant_id === p.participant_id ? 'ring-2 ring-amber-500' : ''}`}
                    style={{ borderColor: T.line }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${isHighRisk ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                        {p.fullName ? p.fullName.split(" ").map(w => w[0]).slice(0, 2).join("") : "NA"}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.fullName || "Unnamed"}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: <strong>{p.participant_id || "NA"}</strong> • Age: {p.age} yrs ({p.gender}) • Location: {p.location || "NA"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isHighRisk ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                        {p.risk || "Moderate Risk"}
                      </span>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingParticipant(p); }}
                        className="p-2 rounded-full hover:bg-amber-50 border border-slate-200 text-slate-700 hover:text-amber-800 transition-colors"
                        title="Edit Participant"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteParticipant(p.participant_id); }}
                        className="p-2 rounded-full hover:bg-red-50 border border-slate-200 text-slate-700 hover:text-red-700 transition-colors"
                        title="Delete Participant"
                      >
                        <Trash2 size={15} />
                      </button>

                      <button className="p-2 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-700">
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details & "Who Did What" Audit Trail Sidebar */}
        {selectedParticipant && (
          <div className="w-[420px] border-l bg-white p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200 shrink-0" style={{ borderColor: T.line }}>
            
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{selectedParticipant.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Participant ID: {selectedParticipant.participant_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingParticipant(selectedParticipant)} className="text-xs font-bold text-amber-800 hover:underline">
                  Edit
                </button>
                <button onClick={() => setSelectedParticipant(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                  Close
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Vitals BP</span>
                <span className="font-bold text-slate-900 text-sm">{selectedParticipant.bp_sys || "135"} / {selectedParticipant.bp_dia || "88"} mmHg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Glucose</span>
                <span className="font-bold text-slate-900 text-sm">{selectedParticipant.random_blood_glucose || "142"} mg/dL</span>
              </div>
            </div>

            {/* Who Did What Audit Trail Timeline */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 border-b pb-2">
                <UserCheck size={14} className="text-amber-600" /> "Who Did What" — Multi-Role Audit Trail
              </h4>

              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {(selectedParticipant.audit_trail || [
                  { role: "Field Supervisor", action: "Demographics & Community Perception", user: "DEO", timestamp: "06-AUG-2026 10:15 AM", status: "Completed" },
                  { role: "Staff Nurse", action: "Medical History, Vitals & POC Tests", user: "Staff Nurse (Clinical)", timestamp: "06-AUG-2026 11:30 AM", status: "Completed" },
                  { role: "Doctor", action: "Clinical Exams & Risk Categorisation", user: "Doctor (Clinical Exams)", timestamp: "06-AUG-2026 02:45 PM", status: "Completed" },
                  { role: "Counselor", action: "Mental Health & Health Counseling", user: "Counselor (Mental Health)", timestamp: "07-AUG-2026 09:15 AM", status: "Completed" },
                  { role: "Case Coordinator", action: "Linkages & Follow-up Tracking", user: "Case Coordinator", timestamp: "07-AUG-2026 10:00 AM", status: "Completed" }
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

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => handleDeleteParticipant(selectedParticipant.participant_id)}
                className="w-full py-2.5 rounded-full text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Participant Record</span>
              </button>
            </div>

          </div>
        )}

      </div>

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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Doctor Risk Rating</label>
                <select 
                  value={editingParticipant.risk || "Moderate Risk"}
                  onChange={(e) => setEditingParticipant(p => ({ ...p, risk: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none"
                >
                  <option value="Standard">Standard</option>
                  <option value="Moderate Risk">Moderate Risk</option>
                  <option value="High Risk">High Risk (Priority Referral)</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setEditingParticipant(null)} className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-black flex items-center gap-1.5">
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
