import React, { useState, useEffect } from "react";
import { FileText, ChevronLeft, Check, Calendar, Phone, User, ShieldCheck, ArrowRight, Save, MapPin, Activity, Stethoscope, HeartPulse, Brain, Link2, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import { T } from "../../lib/theme";
import { saveToQueue } from "../../lib/db";
import { api } from "../../lib/api";

// Helper to format Date to DD-MMM-YYYY
function formatDateDDMMMYYYY(dateObj) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const d = dateObj.getDate();
  const m = months[dateObj.getMonth()];
  const y = dateObj.getFullYear();
  return `${d < 10 ? '0' + d : d}-${m}-${y}`;
}

export function DynamicSurveyForm({ participant, onCancel, onSubmit, notify }) {
  const [step, setStep] = useState(0); 

  // Auto Participant ID & Current Date
  const autoParticipantId = `NCD-MUM-${Math.floor(10000 + Math.random() * 90000)}`;
  const currentDateFormatted = formatDateDDMMMYYYY(new Date());

  const [availableParticipants, setAvailableParticipants] = useState([
    { id: "NCD-MUM-84920", name: "Rajesh Sharma", age: 48, gender: "Male", location: "Dharavi", status: "Demographics Completed", bp: "135/88", glucose: "142" },
    { id: "NCD-MUM-84921", name: "Ananya Patil", age: 42, gender: "Female", location: "Dharavi", status: "Demographics Completed", bp: "120/80", glucose: "110" },
    { id: "NCD-MUM-84922", name: "Suresh Pawar", age: 55, gender: "Male", location: "Dharavi", status: "Vitals Completed", bp: "148/95", glucose: "195" },
    { id: "NCD-MUM-84925", name: "Meena M. Iyer", age: 39, gender: "Female", location: "Dharavi", status: "Demographics Completed", bp: "118/76", glucose: "105" }
  ]);
  
  const [data, setData] = useState({
    participant_id: autoParticipantId,
    screening_date: currentDateFormatted,
    raw_date: new Date().toISOString().split('T')[0],
    contact_number: "",
    fullName: "",
    age: "",
    gender: "Male",
    marital_status: "Single",
    education: "High School",
    occupation: "Daily wage labourer",
    housing_type: "Slum",
    location: "Dharavi",
    address: "",
    community_perception: "",
    user_name: "",
    user_role: "Field Supervisor",
    
    // Staff Nurse Modules
    medical_history: ["Hypertension"],
    tobacco_use: "Non-user",
    alcohol_use: "Occasional",
    substance_use: "None",
    diet_activity: "Moderate physical activity",
    symptoms: "Occasional headache",
    height_cm: "168",
    weight_kg: "72",
    bmi: "25.5",
    bp_systolic: "135",
    bp_diastolic: "88",
    pulse_rate: "78",
    random_blood_glucose: "142",
    fasting_glucose: "110",
    hba1c: "6.8",
    total_cholesterol: "195",

    // Doctor Modules
    cvd_risk_assessment: "Moderate (10-20% 10-year risk)",
    retinopathy_exam: "Normal",
    oral_exam: "Normal mucosa",
    breast_cervical_exam: "No palpable lumps",
    overall_risk_rating: "Moderate Risk",
    referral_hospital: "KEM Hospital, Parel",

    // Counselor Modules
    phq9_depression_score: "Minimal depression (Score: 4)",
    gad7_anxiety_score: "Mild anxiety (Score: 5)",
    health_counseling_notes: "Counselled on dietary salt reduction, daily 30-min walking, and medication compliance.",

    // Case Coordinator Modules
    referral_confirmation_date: currentDateFormatted,
    opd_appointment_date: currentDateFormatted,
    treatment_adherence_status: "Regular Adherence"
  });

  const [submitting, setSubmitting] = useState(false);
  const [customQuestions, setCustomQuestions] = useState([]);

  useEffect(() => {
    // Parse custom survey questions if available from Admin Survey Builder
    let loadedQs = null;
    if (participant && participant.sur_url) {
      try {
        const parsed = JSON.parse(participant.sur_url);
        if (Array.isArray(parsed) && parsed.length > 0) loadedQs = parsed;
      } catch (e) {}
    }
    if (!loadedQs) {
      const activeStr = localStorage.getItem('ncd_active_survey_questions');
      if (activeStr) {
        try {
          const parsed = JSON.parse(activeStr);
          if (Array.isArray(parsed) && parsed.length > 0) loadedQs = parsed;
        } catch (e) {}
      }
    }
    if (loadedQs) {
      setCustomQuestions(loadedQs);
    }
  }, [participant]);

  useEffect(() => {
    const userString = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
    if (userString) {
      try {
        const u = JSON.parse(userString);
        const role = u.role_name || "Field Supervisor";
        setData(d => ({
          ...d,
          user_name: u.username || "DEO",
          user_role: role,
          location: u.assigned_location || "Dharavi"
        }));
      } catch (e) {}
    }

    // Fetch active backend list
    api.get("/api/v1/dashboard/screeninglist").then(res => {
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(r => {
          let rawPayload = {};
          if (r.mem_scrn_q30) {
            try { rawPayload = JSON.parse(r.mem_scrn_q30); } catch (e) {}
          }
          return {
            id: r.mem_scrn_part_id || r.id || `NCD-MUM-${r.mem_scrn_id}`,
            name: rawPayload.fullName || r.mem_scrn_q16 || 'Participant',
            age: rawPayload.age || r.mem_scrn_q1 || 45,
            gender: rawPayload.gender || (r.mem_scrn_q2 == "1" ? "Male" : "Female"),
            location: rawPayload.location || r.mem_scrn_q17 || "Dharavi",
            status: "Demographics Completed",
            bp: rawPayload.bp_systolic ? `${rawPayload.bp_systolic}/${rawPayload.bp_diastolic}` : "130/84",
            glucose: rawPayload.random_blood_glucose || "135",
            rawPayload
          };
        });
        setAvailableParticipants(mapped);
      }
    }).catch(e => console.error("Failed to load participant list", e));
  }, []);

  const loggedInUserStr = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
  const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
  
  let userPrivileges = loggedInUser?.privileges;
  if (typeof userPrivileges === 'string') {
    try { userPrivileges = JSON.parse(userPrivileges); } catch (e) { userPrivileges = null; }
  }
  if (!Array.isArray(userPrivileges) || userPrivileges.length === 0) {
    const rLower = (data.user_role || "").toLowerCase();
    userPrivileges = rLower.includes("nurse") ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : rLower.includes("doctor") ? [12, 13]
      : rLower.includes("counselor") ? [8, 15]
      : rLower.includes("coordinator") ? [14]
      : rLower.includes("admin") ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      : [1, 16];
  }

  const hasPrivilege = (modId) => userPrivileges.includes(modId);
  const isExistingParticipant = Boolean(data.participant_id && availableParticipants.some(p => p.id === data.participant_id));
  
  let secTracker = 1;
  const activeCustomQuestions = (customQuestions || []).filter(q => {
    if (q.type === 'section_header' || (q.title && q.title.toLowerCase().startsWith('section '))) {
      const match = q.title.match(/Section\s*(\d+)/i);
      if (match) secTracker = parseInt(match[1]);
      else if (q.section) secTracker = parseInt(q.section);
    }
    const secId = q.section ? parseInt(q.section) : secTracker;
    if (secId === 16 && !isExistingParticipant) {
      return false; // Hide Section 16 during initial creation
    }
    return hasPrivilege(secId);
  });
  const hasCustomQuestions = activeCustomQuestions.length > 0;

  const roleNameLower = (data.user_role || "Field Supervisor").toLowerCase();
  const isSupervisor = roleNameLower.includes("supervisor") || roleNameLower.includes("field");
  const isNurse = roleNameLower.includes("nurse");
  const isDoctor = roleNameLower.includes("doctor");
  const isCounselor = roleNameLower.includes("counselor");
  const isCoordinator = roleNameLower.includes("coordinator");

  const set = (k) => (v) => setData((d) => ({ ...d, [k]: v }));

  const updateCustomField = (q, val) => {
    setData(d => {
      const next = { ...d, [q.id]: val, [`custom_${q.id}`]: val };
      const titleLower = (q.title || "").toLowerCase();
      if (titleLower.includes("name") || titleLower.includes("full name")) next.fullName = val;
      if (titleLower.includes("age")) next.age = val;
      if (titleLower.includes("gender")) next.gender = val;
      if (titleLower.includes("site") || titleLower.includes("location")) next.location = val;
      return next;
    });
  };

  const handleDateChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal) {
      const dt = new Date(rawVal);
      setData(d => ({
        ...d,
        raw_date: rawVal,
        screening_date: formatDateDDMMMYYYY(dt)
      }));
    }
  };

  const handleParticipantSelect = (partId) => {
    const found = availableParticipants.find(p => p.id === partId);
    if (found) {
      setData(d => ({
        ...d,
        ...(found.rawPayload || {}),
        participant_id: found.id,
        fullName: found.name,
        age: String(found.age),
        gender: found.gender,
        location: found.location
      }));
      notify("info", "Participant Selected", `Loaded details for ${found.name} (${found.id})`);
    }
  };

  const handleProceedNext = (e) => {
    e.preventDefault();
    if (!data.participant_id) {
      notify("error", "Required", "Please select or enter a Participant ID.");
      return;
    }
    setStep(1);
  };

  const handleSubmitRoleForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    notify("info", "Submitting", `Saving ${data.user_role} clinical module entry...`);

    try {
      const payload = {
        ...data,
        mem_scrn_part_id: data.participant_id,
        mem_scrn_q16: data.fullName,
        mem_scrn_q1: parseInt(data.age) || 0,
        mem_scrn_q2: data.gender === "Male" ? "1" : "2",
        mem_scrn_q17: data.location,
        submitted_by_role: data.user_role,
        submitted_at: new Date().toISOString()
      };

      await saveToQueue(payload);

      if (navigator.onLine) {
        try {
          await api.post("/api/v1/screening/submit", payload);
        } catch (apiErr) {
          console.warn("API submission deferred to queue", apiErr);
        }
      }

      notify("success", "Section Completed", `Participant ${data.participant_id} updated under ${data.user_role}.`);
      onSubmit();
    } catch (err) {
      console.error(err);
      notify("error", "Save Failed", "Could not save section entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Top Fixed Header */}
      <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 sm:px-8 py-3 sm:py-3.5 bg-white border-b border-slate-200 shrink-0 shadow-2xs gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="rounded-full p-2 hover:bg-slate-100 transition-colors border border-slate-200 shrink-0">
            <ChevronLeft size={18} className="text-slate-700" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                {participant?.sur_code || "NCD-MUM-2026"}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">{data.user_role} Entry</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {participant?.sur_title || "MUMBAI’S NCD SURVEY — PHASE II"}
            </h1>
          </div>
        </div>

        {/* Assigned Location Pill & Exit Button */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono shadow-2xs">
            <MapPin size={12} className="text-amber-600" /> Center: {data.location || "Dharavi"}
          </span>

          <span className="hidden sm:inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Operator: <strong>{data.user_name}</strong>
          </span>

          <button 
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <span>Exit Survey</span>
          </button>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-slate-100 border-b border-slate-200 px-8 py-3 flex items-center justify-center gap-8 text-xs font-bold font-mono">
        <div className={`flex items-center gap-2 ${step >= 0 ? 'text-slate-900' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white'}`}>
            1
          </span>
          <span>PARTICIPANT SELECTION</span>
        </div>
        <span className="text-slate-300">───</span>
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 text-slate-600'}`}>
            2
          </span>
          <span>{data.user_role.toUpperCase()} CLINICAL MODULES</span>
        </div>
      </div>

      {/* Main Form Body */}
      <main className="flex-1 overflow-y-auto px-8 py-8 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* STEP 0: PARTICIPANT SELECTION & INITIAL HEADER */}
          {step === 0 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {isSupervisor ? "Initial Participant Screening" : `${data.user_role} — Select Participant ID`}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isSupervisor 
                      ? "Verify auto-generated Participant ID, screening date, and optional contact details before proceeding to Demographics."
                      : "Select a participant completed by Field Supervisor to load their clinical screening modules."
                    }
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono shadow-2xs">
                  <MapPin size={13} className="text-amber-600" /> Center: {data.location || "Dharavi"}
                </span>
              </div>

              {/* NON-SUPERVISOR PARTICIPANT DROPDOWN SELECTOR */}
              {!isSupervisor && (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider font-mono text-amber-900 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-amber-700" /> Select Participant ID *
                  </label>
                  <select 
                    value={data.participant_id} 
                    onChange={(e) => handleParticipantSelect(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-amber-300 text-sm font-bold text-slate-900 font-mono outline-none shadow-2xs cursor-pointer focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">-- Choose Participant ID (Demographics Completed) --</option>
                    {availableParticipants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name} ({p.age} yrs, {p.gender}) [{p.location}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Light Mode 3-Column Initial Screening Card */}
              <div className="border border-slate-200 rounded-2xl bg-slate-50/80 text-slate-900 p-6 shadow-2xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  
                  {/* Column 1: Participant ID */}
                  <div className="pr-0 md:pr-4 pt-2 md:pt-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                      <User size={13} className="text-amber-600" /> Participant ID *
                    </label>
                    <input 
                      type="text" 
                      value={data.participant_id} 
                      onChange={(e) => set("participant_id")(e.target.value)}
                      readOnly={!isSupervisor}
                      className={`w-full bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm outline-none px-3.5 py-2 rounded-xl shadow-2xs ${!isSupervisor ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'focus:border-amber-500'}`}
                      placeholder="NCD-MUM-XXXXX"
                    />
                  </div>

                  {/* Column 2: Screening Date */}
                  <div className="pt-4 md:pt-0 pl-0 md:pl-6 pr-0 md:pr-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                      <Calendar size={13} className="text-amber-600" /> Screening Date *
                    </label>
                    <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl px-3.5 py-2 shadow-2xs relative">
                      <span className="text-slate-900 font-mono font-bold text-sm tracking-wide">
                        {data.screening_date}
                      </span>
                      <div className="relative">
                        <input 
                          type="date"
                          value={data.raw_date}
                          onChange={handleDateChange}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        />
                        <button type="button" className="p-1 rounded text-slate-600 hover:bg-slate-100 transition-colors">
                          <Calendar size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Contact Number */}
                  <div className="pt-4 md:pt-0 pl-0 md:pl-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Phone size={13} className="text-amber-600" /> Contact Number
                      </label>
                      <span className="text-slate-400 text-[10px] font-mono">(Optional)</span>
                    </div>
                    <input 
                      type="tel" 
                      value={data.contact_number} 
                      onChange={(e) => set("contact_number")(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full bg-white border border-slate-300 text-slate-900 font-mono text-sm outline-none px-3.5 py-2 rounded-xl shadow-2xs"
                    />
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button 
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Exit Survey
                </button>
                <button 
                  onClick={handleProceedNext}
                  className="px-7 py-3 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-black transition-colors flex items-center gap-2.5 shadow-xs cursor-pointer"
                >
                  <span>Proceed to {data.user_role} Modules</span>
                  <ArrowRight size={15} className="text-amber-400" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 1: ROLE SPECIFIC MODULES */}
          {step === 1 && (
            <form onSubmit={handleSubmitRoleForm} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
              
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {isSupervisor ? "Field Supervisor Screening & Demographics Form" : `${data.user_role} Clinical Entry Form`}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {data.fullName ? (
                      <>Participant: <strong>{data.fullName}</strong> ({data.participant_id}) {data.age ? `• Age: ${data.age}` : ''} {data.gender ? `• ${data.gender}` : ''}</>
                    ) : (
                      <>Initiating Participant Screening ({data.participant_id})</>
                    )}
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white font-mono">
                  Role: {data.user_role}
                </span>
              </div>

              {/* Dynamic Survey Builder Questions Renderer */}
              {(() => {
                const isExistingParticipant = Boolean(data.participant_id && availableParticipants.some(p => p.id === data.participant_id));
                let currentSecId = 1;
                const filteredCustomQuestions = (customQuestions || []).filter(q => {
                  if (q.type === 'section_header' || (q.title && q.title.toLowerCase().startsWith('section '))) {
                    const match = q.title.match(/Section\s*(\d+)/i);
                    if (match) currentSecId = parseInt(match[1]);
                    else if (q.section) currentSecId = parseInt(q.section);
                  }
                  const secId = q.section ? parseInt(q.section) : currentSecId;
                  if (secId === 16 && !isExistingParticipant) {
                    return false; // Hide Section 16 during initial creation
                  }
                  return hasPrivilege(secId);
                });

                if (filteredCustomQuestions.length === 0) return null;

                return (
                  <div className="space-y-5 p-5 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-2xs">
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono border-b border-amber-200/80 pb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} className="text-amber-700" /> Admin Custom Survey Questions ({filteredCustomQuestions.length} Questions)
                      </span>
                      <span className="text-[10px] bg-amber-200/70 text-amber-950 px-2 py-0.5 rounded font-mono font-bold">LIVE ADMIN SYNC</span>
                    </div>
                    {filteredCustomQuestions.map((q, idx) => {
                      const qType = q.type || 'short_text';
                      const opts = Array.isArray(q.options) ? q.options : [];
                      
                      if (qType === 'section_header') {
                        return (
                          <div key={q.id || idx} className="pt-3 pb-1 border-b border-amber-200">
                            <h3 className="text-sm font-black text-amber-950 tracking-tight uppercase font-mono">{q.title}</h3>
                          </div>
                        );
                      }

                    return (
                      <div key={q.id || idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <label className="block text-xs font-bold text-slate-900">
                          {idx + 1}. {q.title} {q.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {(qType === 'short_text') && (
                          <input 
                            type="text" 
                            placeholder="Enter text response..." 
                            value={data[`custom_${q.id}`] || data[q.id] || ''} 
                            onChange={(e) => updateCustomField(q, e.target.value)} 
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-amber-500" 
                          />
                        )}

                        {(qType === 'number') && (
                          <input 
                            type="number" 
                            placeholder="Enter numerical value..." 
                            value={data[`custom_${q.id}`] || data[q.id] || ''} 
                            onChange={(e) => updateCustomField(q, e.target.value)} 
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-amber-500" 
                          />
                        )}

                        {(qType === 'dropdown') && (
                          <select 
                            value={data[`custom_${q.id}`] || data[q.id] || ''} 
                            onChange={(e) => updateCustomField(q, e.target.value)} 
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none bg-white cursor-pointer focus:border-amber-500"
                          >
                            <option value="">-- Select Option --</option>
                            {opts.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {(qType === 'single_choice' || qType === 'radio') && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {opts.map((opt, oIdx) => {
                              const isSel = (data[`custom_${q.id}`] || data[q.id]) === opt;
                              return (
                                <label 
                                  key={oIdx} 
                                  onClick={() => updateCustomField(q, opt)} 
                                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${isSel ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                >
                                  <input type="radio" checked={isSel} onChange={() => {}} className="text-amber-600 focus:ring-0 cursor-pointer" />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {(qType === 'multi_choice' || qType === 'checkbox') && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {opts.map((opt, oIdx) => {
                              const curVal = data[`custom_${q.id}`] || data[q.id];
                              const curArr = Array.isArray(curVal) ? curVal : [];
                              const isChecked = curArr.includes(opt);
                              const toggleOpt = () => {
                                if (isChecked) {
                                  updateCustomField(q, curArr.filter(x => x !== opt));
                                } else {
                                  updateCustomField(q, [...curArr, opt]);
                                }
                              };
                              return (
                                <label 
                                  key={oIdx} 
                                  onClick={toggleOpt} 
                                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${isChecked ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                >
                                  <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded text-amber-600 focus:ring-0 cursor-pointer" />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                );
              })()}



              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button type="button" onClick={() => setStep(0)} className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                  Back to Selection
                </button>
                <button type="submit" disabled={submitting} className="px-8 py-3 rounded-full text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer">
                  <Save size={16} />
                  <span>{submitting ? "Submitting..." : `Submit ${data.user_role} Clinical Entry`}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-8 py-3 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/yrg-logo.png" alt="YRG Care" className="w-5 h-5 object-contain" />
          <span>YRGMERF &copy; 2026 • NCD Healthcare Screening Platform v2.4</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
          <span>Role: {data.user_role}</span>
          <span>•</span>
          <span>Center: {data.location || "Dharavi"}</span>
        </div>
      </footer>

    </div>
  );
}
