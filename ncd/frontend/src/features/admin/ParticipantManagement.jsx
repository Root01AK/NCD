import React, { useState, useEffect } from "react";
import { Search, MapPin, Eye, FileText, CheckCircle, AlertTriangle, Loader2, UserCheck, Stethoscope, HeartPulse, Brain, Link2, Trash2, Edit3, Save, X, Plus, Code, RefreshCw, SlidersHorizontal, Settings, Download, CheckCircle2, HelpCircle } from "lucide-react";
import { T } from "../../lib/theme";
import { api } from "../../lib/api";
import { getQueue, deleteFromQueue } from "../../lib/db";
import phase2Questions from "./phase2_questions.json";

import { generateNextParticipantID } from "../../lib/participantIdGenerator";

/**
 * GenderBadge Component - Displays standard Male, Female, and Transgender icons
 */
export function GenderBadge({ gender, showText = true, className = "" }) {
  const g = String(gender || "").toLowerCase().trim();
  
  if (g.includes("female") || g.includes("woman") || g === "2") {
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-xs text-purple-700 font-mono ${className}`} title="Female">
        <svg className="w-3.5 h-3.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="9" r="5" />
          <path d="M12 14v7M9 18h6" strokeLinecap="round" />
        </svg>
        {showText && <span>Female</span>}
      </span>
    );
  }
  
  if (g.includes("trans") || g === "3" || g === "4") {
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-xs text-amber-700 font-mono ${className}`} title="Transgender">
        <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 8V2M9 5h6M15 9l5-5M16 4h4v4M9 15l-5 5M4 16v4h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {showText && <span>{gender && !["3", "4"].includes(g) ? gender : "Transgender"}</span>}
      </span>
    );
  }
  
  // Default to Male
  return (
    <span className={`inline-flex items-center gap-1 font-bold text-xs text-sky-700 font-mono ${className}`} title="Male">
      <svg className="w-3.5 h-3.5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <circle cx="10" cy="14" r="5" />
        <path d="M19 5l-5.5 5.5M14 5h5v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showText && <span>Male</span>}
    </span>
  );
}

const SECTION_ROLES_MAP = {
  1: "Field Supervisor",
  2: "Staff Nurse",
  3: "Staff Nurse",
  4: "Staff Nurse",
  5: "Staff Nurse",
  6: "Staff Nurse",
  7: "Staff Nurse",
  8: "Counselor",
  9: "Staff Nurse",
  10: "Staff Nurse",
  11: "Staff Nurse",
  12: "Medical Officer / Doctor",
  13: "Medical Officer / Doctor",
  14: "Case Management Coordinator",
  15: "Counselor",
  16: "Field Supervisor"
};

/**
 * Universal Answer Resolver: maps stored values to questions across all 117 items
 */
function resolveQuestionAnswer(q, data) {
  if (!q || !data) return null;

  const qCode = q.q_code || "";
  const qNum = parseInt(qCode.replace(/\D/g, ""), 10);
  const qCodeLower = qCode.toLowerCase();
  const qId = q.id;

  let rawObj = {};
  if (data.raw_payload) {
    if (typeof data.raw_payload === "string") {
      try { rawObj = JSON.parse(data.raw_payload); } catch (e) {}
    } else if (typeof data.raw_payload === "object") {
      rawObj = data.raw_payload;
    }
  }

  const answersDict = data.answers || rawObj.answers || {};
  const sec16Dict = data.sec16_answers || rawObj.sec16_answers || {};

  const getFromObj = (obj) => {
    if (!obj || typeof obj !== "object") return undefined;
    if (qId && obj[qId] !== undefined && obj[qId] !== null && obj[qId] !== "") return obj[qId];
    if (qCodeLower && obj[qCodeLower] !== undefined && obj[qCodeLower] !== null && obj[qCodeLower] !== "") return obj[qCodeLower];
    if (qCode && obj[qCode] !== undefined && obj[qCode] !== null && obj[qCode] !== "") return obj[qCode];
    if (qCodeLower && obj[`custom_${qCodeLower}`] !== undefined && obj[`custom_${qCodeLower}`] !== null && obj[`custom_${qCodeLower}`] !== "") return obj[`custom_${qCodeLower}`];
    return undefined;
  };

  let val = getFromObj(data);
  if (val === undefined) val = getFromObj(answersDict);
  if (val === undefined) val = getFromObj(sec16Dict);
  if (val === undefined) val = getFromObj(rawObj);

  // Specific aliases for Section 1 Demographics and other key clinical questions
  if (val === undefined || val === null || val === "") {
    if (qNum === 1) val = data.age || data.mem_scrn_q1 || rawObj.age || rawObj.mem_scrn_q1;
    else if (qNum === 2) val = data.gender || data.mem_scrn_q2 || rawObj.gender || rawObj.mem_scrn_q2;
    else if (qNum === 3) val = data.location || data.site || data.mem_scrn_q17 || rawObj.location || rawObj.site;
    else if (qNum === 4) val = data.occupation || data.mem_scrn_q4 || rawObj.occupation || rawObj.mem_scrn_q4;
    else if (qNum === 5) val = data.education || data.mem_scrn_q5 || rawObj.education || rawObj.mem_scrn_q5;
    else if (qNum === 6) val = data.income || data.household_income || data.mem_scrn_q6 || rawObj.income || rawObj.mem_scrn_q6;
    else if (qNum === 7) val = data.housing || data.housing_type || data.mem_scrn_q7 || rawObj.housing || rawObj.mem_scrn_q7;
    else if (qNum === 8) val = data.stay_length || data.residence_duration || data.mem_scrn_q8 || rawObj.stay_length || rawObj.mem_scrn_q8;
    else if (qNum === 9) val = data.known_diabetes || data.diabetes;
    else if (qNum === 10) val = data.known_hypertension || data.hypertension;
    else if (qNum === 27) val = data.alcohol_frequency;
    else if (qNum === 30 || qNum === 32) val = data.audit_c_score !== undefined ? data.audit_c_score : data.audit_score;
    else if (qNum === 61) val = data.gad7_score !== undefined ? data.gad7_score : data.gad_7;
    else if (qNum === 65) val = data.phq9_score !== undefined ? data.phq9_score : data.phq_9;
    else if (qNum === 67) val = data.height ? `${data.height} cm` : undefined;
    else if (qNum === 68) val = data.weight ? `${data.weight} kg` : undefined;
    else if (qNum === 69) val = data.bmi ? `${data.bmi} kg/m²` : undefined;
    else if (qNum === 70) val = data.waist_circumference || data.waist ? `${data.waist_circumference || data.waist} cm` : undefined;
    else if (qNum === 73 || qNum === 74) val = data.bp_sys || data.bp_systolic ? `${data.bp_sys || data.bp_systolic} mmHg` : undefined;
    else if (qNum === 75) val = data.bp_dia || data.bp_diastolic ? `${data.bp_dia || data.bp_diastolic} mmHg` : undefined;
    else if (qNum === 76) val = data.pulse_rate || data.pulse ? `${data.pulse_rate || data.pulse} bpm` : undefined;
    else if (qNum === 79) val = data.rbs ? `${data.rbs} mg/dL` : undefined;
    else if (qNum === 80) val = data.fbs ? `${data.fbs} mg/dL` : undefined;
    else if (qNum === 90) val = data.cvd_risk_assessment || data.doctor_cvd_risk || data.q90;
    else if (qNum === 91) val = data.referral_reason || data.q91;
    else if (qNum === 92) val = data.referral_center || data.referral_facility || data.q92;
    else if (qNum === 93) val = data.doctor_notes || data.diagnosis || data.q93;
    else if (qNum === 97) val = data.referral_center || data.referral_facility;
  }

  if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
    return null;
  }

  // Format array results (multi choice questions like Q112, Q114, Q115, Q117)
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    return val.map(item => {
      const itemStr = String(item).trim();
      if (q.options && q.options.length > 0) {
        const found = q.options.find(opt => {
          const optStr = typeof opt === 'object' ? String(opt.label || opt.text || opt.value || '') : String(opt);
          if (optStr.toLowerCase() === itemStr.toLowerCase()) return true;
          const optPrefix = optStr.split(" ")[0];
          return optPrefix === itemStr;
        });
        if (found) return typeof found === 'object' ? (found.label || found.text || found.value || itemStr) : found;
      }
      return itemStr;
    });
  }

  // Format single choice numeric code or string to full label
  const valStr = String(val).trim();
  if (q.options && q.options.length > 0) {
    const found = q.options.find(opt => {
      const optStr = typeof opt === 'object' ? String(opt.label || opt.text || opt.value || '') : String(opt);
      if (optStr.toLowerCase() === valStr.toLowerCase()) return true;
      const optPrefix = optStr.split(" ")[0];
      return optPrefix === valStr;
    });
    if (found) return typeof found === 'object' ? (found.label || found.text || found.value || valStr) : found;
  }

  return valStr;
}

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
        const res = await api.get("/api/v1/dashboard/screeninglist");
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
        const userName = combined.submitted_by_user || combined.user_name || "FS001";
        const dateStr = combined.screening_date || (combined.record_date ? new Date(combined.record_date * 1000).toLocaleDateString() : new Date().toLocaleDateString());

        // 1. Resolve real participant name cleanly (strip generic fallbacks like "Participant Record", "PR", "Unnamed")
        const rawName = combined.fullName || combined.mem_scrn_q16 || combined.full_name || combined.name || "";
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
        const displayName = cleanName || pId;

        // 2. Avatar Initials
        let avatarInitials = "P";
        if (cleanName) {
          const parts = cleanName.split(/\s+/).filter(Boolean);
          if (parts.length >= 2) avatarInitials = (parts[0][0] + parts[1][0]).toUpperCase();
          else if (parts.length === 1 && parts[0].length >= 1) avatarInitials = parts[0].slice(0, 2).toUpperCase();
        } else if (pId) {
          const cleanId = String(pId).toUpperCase().replace(/[^A-Z0-9]/g, '');
          avatarInitials = cleanId.length >= 2 ? cleanId.slice(-2) : "P";
        }

        // 3. REAL Section / Module Completion Checks based strictly on actual data
        // Section 1: Demographics (Field Supervisor)
        const isSec1Done = Boolean(
          combined.demographics_completed === true ||
          combined.mem_scrn_q1 !== undefined ||
          combined.age !== undefined ||
          pId
        );

        // Section 2-7, 9-11: Clinical Screening, Medical History, Vitals & POC Tests (Staff Nurse)
        const isNurseDone = Boolean(
          combined.staff_nurse_completed === true || 
          combined.completed_by_staff_nurse === true || 
          (combined.bp_sys && String(combined.bp_sys) !== '0') ||
          (combined.bp_systolic && String(combined.bp_systolic) !== '0') ||
          Boolean(combined.nurse_timestamp) ||
          (combined.answers && (combined.answers.q9 || combined.answers.q67 || combined.answers.q73))
        );

        // Section 8 & 15: Mental Health Screen (GAD-7, PHQ-9) & Health Counseling (Counselor)
        const isSec8Done = Boolean(
          combined.counselor_section_completed === true || 
          combined.counselor_sec8_completed === true ||
          (combined.gad7_score !== undefined && String(combined.gad7_score) !== "") ||
          (combined.phq9_score !== undefined && String(combined.phq9_score) !== "") ||
          (combined.answers && (combined.answers.q58 || combined.answers.q61 || combined.answers.q65))
        );
        const isSec15Done = Boolean(
          combined.counselor_sec15_completed === true || 
          combined.completed_by_counselor === true || 
          Boolean(combined.counselor_timestamp) ||
          (combined.counseling_notes && String(combined.counseling_notes).trim() !== "") ||
          (combined.answers && (combined.answers.q107 || combined.answers.q108))
        );
        const isCounselorDone = Boolean(isSec8Done || isSec15Done);

        // Section 12-13: Clinical Diagnosis, Exams & CVD Risk (Medical Officer / Doctor)
        const isDoctorDone = Boolean(
          combined.doctor_completed === true || 
          combined.completed_by_doctor === true || 
          Boolean(combined.doctor_timestamp) ||
          Boolean(combined.doctor_user) ||
          (combined.doctor_notes && String(combined.doctor_notes).trim() !== "") ||
          (combined.answers && (combined.answers.q81 || combined.answers.q88 || combined.answers.q89 || combined.answers.q91 || combined.answers.q92)) ||
          (combined.cvd_risk_assessment && String(combined.cvd_risk_assessment).trim() !== "" && combined.cvd_risk_assessment !== "Standard Risk")
        );

        // Section 14: Healthcare Linkages & Referral Follow-up (Case Coordinator)
        const isCoordinatorDone = Boolean(
          combined.coordinator_completed === true || 
          combined.completed_by_coordinator === true || 
          Boolean(combined.coordinator_timestamp) ||
          (combined.linkage_status && String(combined.linkage_status).trim() !== "") ||
          (combined.answers && (combined.answers.q97 || combined.answers.q98))
        );

        // Section 16: Community Perception Survey (Field Supervisor)
        const isSec16Done = Boolean(
          combined.section_16_completed === true || 
          combined.completed_by_section16 === true || 
          combined.sec_16_done === true || 
          Boolean(combined.sec16_timestamp) ||
          (combined.sec16_answers && Object.keys(combined.sec16_answers).length > 0) ||
          (combined.answers && (combined.answers.q112 || combined.answers.q113 || combined.answers.q116 || combined.answers.q117))
        );

        // 4. Real Pipeline Stage & Next Pending Queue
        let currentPendingQueue = "With Staff Nurse (Pending Sec 2–7, 9–11 Screening)";
        let currentRole = "Staff Nurse";
        let isFullyCompleted = false;

        if (isNurseDone && isDoctorDone && isCoordinatorDone && isCounselorDone && isSec16Done) {
          isFullyCompleted = true;
          currentPendingQueue = "Fully Completed (All 16 Sections Verified)";
          currentRole = "Completed";
        } else if (!isNurseDone) {
          if (isSec16Done) {
            currentPendingQueue = "With Staff Nurse (Pending Sec 2–7, 9–11 Screening • Sec 16 Done)";
          } else {
            currentPendingQueue = "With Staff Nurse (Pending Sec 2–7, 9–11 Screening)";
          }
          currentRole = "Staff Nurse";
        } else if (!isDoctorDone) {
          currentPendingQueue = "With Doctor (Pending Clinical Exam Sec 12–13)";
          currentRole = "Doctor";
        } else if (!isCoordinatorDone) {
          currentPendingQueue = "With Case Coordinator (Pending Section 14 Linkages)";
          currentRole = "Case Management Coordinator";
        } else if (!isCounselorDone) {
          currentPendingQueue = "With Counselor (Pending Section 8 & 15 Counseling)";
          currentRole = "Counselor";
        } else if (!isSec16Done) {
          currentPendingQueue = "With Field Supervisor (Pending Section 16 Exit Perception)";
          currentRole = "Field Supervisor";
        }

        // Real Module Breakdown List
        const completedModuleBadges = [
          isSec1Done && "Sec 1",
          isNurseDone && "Sec 2–7, 9–11",
          isCounselorDone && "Sec 8, 15",
          isDoctorDone && "Sec 12–13",
          isCoordinatorDone && "Sec 14",
          isSec16Done && "Sec 16"
        ].filter(Boolean);

        const totalModulesCount = 6;
        const completedCount = completedModuleBadges.length;
        const progressPercent = Math.round((completedCount / totalModulesCount) * 100);

        const flowSteps = [
          { code: "FS", role: "Field Supervisor", section: "Sec 1", done: isSec1Done },
          { code: "SN", role: "Staff Nurse", section: "Sec 2–7, 9–11", done: isNurseDone },
          { code: "CO", role: "Counselor", section: "Sec 8, 15", done: isCounselorDone },
          { code: "DR", role: "Doctor", section: "Sec 12–13", done: isDoctorDone },
          { code: "CMC", role: "Case Coordinator", section: "Sec 14", done: isCoordinatorDone },
          { code: "FS", role: "Field Supervisor Exit", section: "Sec 16", done: isSec16Done }
        ];

        const moduleStatus = [
          { key: "sec1", label: "Sec 1", fullLabel: "Demographics", role: "Field Supervisor", done: isSec1Done },
          { key: "nurse", label: "Sec 2–7, 9–11", fullLabel: "Clinical Screening & Vitals", role: "Staff Nurse", done: isNurseDone },
          { key: "counselor", label: "Sec 8, 15", fullLabel: "Mental Health & Counseling", role: "Counselor", done: isCounselorDone },
          { key: "doctor", label: "Sec 12–13", fullLabel: "Doctor Examination", role: "Doctor", done: isDoctorDone },
          { key: "coord", label: "Sec 14", fullLabel: "Linkages & Referrals", role: "Case Coordinator", done: isCoordinatorDone },
          { key: "sec16", label: "Sec 16", fullLabel: "Community Perception", role: "Field Supervisor", done: isSec16Done }
        ];

        // Real Audit Trail
        const auditTrail = [];
        if (isSec1Done) {
          auditTrail.push({
            role: "Field Supervisor",
            action: "Initiated Participant & Completed Section 1 Demographics",
            user: combined.submitted_by_user || combined.user_name || userName,
            timestamp: dateStr,
            status: "Section 1 Completed"
          });
        }
        if (isNurseDone) {
          auditTrail.push({
            role: "Staff Nurse",
            action: "Completed Vitals, Medical History & POC Screening (Sec 2–7, 9–11)",
            user: combined.nurse_user || "Staff Nurse (SN001)",
            timestamp: combined.nurse_timestamp || "Completed",
            status: "Sections 2–7, 9–11 Completed"
          });
        }
        if (isSec8Done || isSec15Done) {
          auditTrail.push({
            role: "Counselor",
            action: isSec8Done && isSec15Done 
              ? "Completed Mental Health & Health Counseling (Sec 8, 15)"
              : isSec8Done 
                ? "Completed Mental Health Assessment GAD-7 & PHQ-9 (Sec 8)"
                : "Completed Health & Lifestyle Counseling (Sec 15)",
            user: combined.counselor_user || "Counselor (CO001)",
            timestamp: combined.counselor_timestamp || "Completed",
            status: isSec8Done && isSec15Done ? "Sections 8, 15 Completed" : isSec8Done ? "Section 8 Completed" : "Section 15 Completed"
          });
        }
        if (isDoctorDone) {
          auditTrail.push({
            role: "Medical Officer / Doctor",
            action: "Completed Clinical Diagnosis & CVD Risk Categorisation (Sec 12–13)",
            user: combined.doctor_user || "Medical Officer (D001)",
            timestamp: combined.doctor_timestamp || "Completed",
            status: "Sections 12–13 Completed"
          });
        }
        if (isCoordinatorDone) {
          auditTrail.push({
            role: "Case Management Coordinator",
            action: "Completed Healthcare Linkages & Referral Tracking (Sec 14)",
            user: combined.coordinator_user || "Case Coordinator (CMC001)",
            timestamp: combined.coordinator_timestamp || "Completed",
            status: "Section 14 Completed"
          });
        }
        if (isSec16Done) {
          auditTrail.push({
            role: "Field Supervisor",
            action: "Completed Final Section 16 Community Perception Survey",
            user: combined.sec16_user || combined.submitted_by_user || combined.user_name || userName,
            timestamp: combined.sec16_timestamp || dateStr,
            status: "Section 16 Completed"
          });
        }

        recordMap.set(pId, {
          ...combined,
          local_id: combined.mem_scrn_id || idx,
          participant_id: pId,
          fullName: displayName,
          cleanName: cleanName,
          avatarInitials: avatarInitials,
          age: String(combined.age || combined.mem_scrn_q1 || "45"),
          gender: combined.gender || (combined.mem_scrn_q2 === "1" ? "Male" : "Female"),
          location: combined.location || combined.mem_scrn_q17 || "Dharavi",
          contact_number: combined.contact_number || combined.mem_scrn_q18 || "-",
          date_of_survey: dateStr,
          created_by_role: roleName,
          created_by_user: userName,
          current_stage: currentPendingQueue,
          current_user_role: currentRole,
          is_fully_completed: isFullyCompleted,
          completed_modules_count: completedCount,
          total_modules_count: totalModulesCount,
          completed_module_badges: completedModuleBadges,
          module_status: moduleStatus,
          flow_steps: flowSteps,
          progress_percent: progressPercent,
          is_fs_done: isSec1Done,
          is_nurse_done: isNurseDone,
          is_doctor_done: isDoctorDone,
          is_coordinator_done: isCoordinatorDone,
          is_counselor_done: isCounselorDone,
          is_sec16_done: isSec16Done,
          risk: combined.overall_risk_rating || (combined.mem_scrn_q24 == 1 ? "High Risk" : "Standard Risk"),
          raw_payload: combined,
          raw: combined,
          audit_trail: auditTrail
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
      const q = searchTerm ? String(searchTerm).toLowerCase().trim() : "";
      const matchesSearch = 
        !q ||
        (p.fullName && String(p.fullName).toLowerCase().includes(q)) ||
        (p.participant_id && String(p.participant_id).toLowerCase().includes(q)) ||
        (p.location && String(p.location).toLowerCase().includes(q));
      const selLoc = selectedLocation ? String(selectedLocation).toLowerCase().trim() : "all";
      const matchesLocation = 
        selLoc === "all" || (p.location && String(p.location).toLowerCase().includes(selLoc));
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
                const count = loc === "All" ? participants.length : participants.filter(p => String(p.location || "").toLowerCase().includes(String(loc).toLowerCase())).length;
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
                    className="rounded-2xl px-4 py-2.5 border bg-white flex flex-col gap-2 transition-all hover:border-slate-300 hover:shadow-2xs"
                    style={{ borderColor: T.line }}
                  >
                    {/* Main Row: Identity, Key Demographics, Risk & Action Buttons */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                      
                      {/* Left: Avatar + Details in Single Clean Line */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 bg-slate-800 text-white border border-slate-900 shadow-2xs">
                          {p.avatarInitials || "P"}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-xs font-mono truncate">
                              {p.cleanName || p.participant_id}
                            </h4>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 font-mono shrink-0">
                              {p.location || "Dharavi"}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono shrink-0 border ${
                              p.is_fully_completed
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {p.is_fully_completed ? 'Fully Completed' : p.current_user_role || 'Staff Nurse'}
                            </span>
                            
                            {/* Inline Metadata Details */}
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <span className="text-xs text-slate-500 font-mono">
                              {p.age || "48"}y
                            </span>
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <GenderBadge gender={p.gender} />
                            <span className="text-slate-300 hidden md:inline">•</span>
                            <span className="text-xs text-slate-400 font-mono hidden md:inline">
                              {p.date_of_survey || "Today"}
                            </span>
                            <span className="text-slate-300 hidden lg:inline">•</span>
                            <span className="text-xs text-slate-400 font-mono hidden lg:inline">
                              By <strong className="text-slate-600">{p.created_by_user || "FS001"}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Risk Badge & Compact Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono whitespace-nowrap ${
                          isHighRisk ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {p.risk || "Standard Risk"}
                        </span>

                        <button 
                          onClick={() => setSelectedParticipant(p)}
                          className="w-7 h-7 rounded-full bg-slate-900 text-[#f5d40b] hover:bg-black transition-colors flex items-center justify-center cursor-pointer shadow-2xs font-mono shrink-0"
                          title="View Responses"
                        >
                          <Eye size={13} />
                        </button>
                        
                        <button 
                          onClick={() => setEditingParticipant(p)}
                          className="w-7 h-7 rounded-full hover:bg-amber-50 border border-slate-200 text-slate-600 hover:text-amber-800 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                          title="Edit Participant"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button 
                          onClick={() => handleDeleteParticipant(p.participant_id, p.local_id)}
                          className="w-7 h-7 rounded-full hover:bg-red-50 border border-slate-200 text-slate-600 hover:text-red-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                    </div>

                    {/* Bottom: Progressive Bar with User Flow with codes FS, SN, CO, DR, CMC, FS */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flow:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {(p.flow_steps || [
                            { code: "FS", role: "Field Supervisor", section: "Sec 1", done: Boolean(p.is_fs_done) },
                            { code: "SN", role: "Staff Nurse", section: "Sec 2–7, 9–11", done: Boolean(p.is_nurse_done) },
                            { code: "CO", role: "Counselor", section: "Sec 8, 15", done: Boolean(p.is_counselor_done) },
                            { code: "DR", role: "Doctor", section: "Sec 12–13", done: Boolean(p.is_doctor_done) },
                            { code: "CMC", role: "Case Coordinator", section: "Sec 14", done: Boolean(p.is_coordinator_done) },
                            { code: "FS", role: "Field Supervisor", section: "Sec 16", done: Boolean(p.is_sec16_done) }
                          ]).map((step, sIdx, arr) => (
                            <React.Fragment key={step.code + sIdx}>
                              <span 
                                title={`${step.code}: ${step.role} (${step.section}) — ${step.done ? '✓ Completed' : 'Pending'}`}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                                  step.done 
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs' 
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}
                              >
                                <span>{step.code}</span>
                                {step.done ? <span className="text-[9px] text-emerald-600 font-black">✓</span> : null}
                              </span>
                              {sIdx < arr.length - 1 && (
                                <span className={`text-[10px] select-none ${step.done ? 'text-emerald-500 font-bold' : 'text-slate-300'}`}>
                                  →
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Module Progress Bar & Summary */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 hidden sm:block">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all" 
                            style={{ width: `${p.progress_percent !== undefined ? p.progress_percent : Math.round(((p.completed_modules_count || 1) / 6) * 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          p.is_fully_completed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {p.completed_modules_count || 1}/6 Done ({p.progress_percent !== undefined ? p.progress_percent : Math.round(((p.completed_modules_count || 1) / 6) * 100)}%)
                        </span>
                      </div>
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
 * Displays all 16 Sections and all 117 Questions (Q1 to Q117) dynamically against recorded responses.
 */
function ParticipantResponseModal({ participant, onClose, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState("sections"); // "sections", "audit", "raw"
  const [activeSectionId, setActiveSectionId] = useState("sec_1");
  const [questionSearch, setQuestionSearch] = useState("");

  if (!participant) return null;

  let raw = {};
  if (participant.raw_payload) {
    try {
      raw = typeof participant.raw_payload === "string" ? JSON.parse(participant.raw_payload) : participant.raw_payload;
    } catch (e) {}
  }
  const data = { ...participant, ...raw };

  const isHighRisk = String(data.risk || data.overall_risk_rating || "").toLowerCase().includes("high");

  // Dynamically build all 16 sections from phase2Questions
  const allSections = React.useMemo(() => {
    const list = [];
    let cur = null;
    (phase2Questions || []).forEach(item => {
      if (item.type === "section_header") {
        if (cur) list.push(cur);
        cur = {
          id: item.id || `sec_${item.section}`,
          num: item.section,
          title: item.title,
          role: SECTION_ROLES_MAP[item.section] || "Screening Staff",
          questions: []
        };
      } else if (item.q_code) {
        if (!cur) {
          cur = {
            id: `sec_${item.section || 1}`,
            num: item.section || 1,
            title: `Section ${item.section || 1}`,
            role: SECTION_ROLES_MAP[item.section || 1] || "Screening Staff",
            questions: []
          };
        }
        cur.questions.push(item);
      }
    });
    if (cur) list.push(cur);
    return list;
  }, []);

  const sectionsWithStatus = React.useMemo(() => {
    return allSections.map(sec => {
      const qsWithAnswers = sec.questions.map(q => {
        const ans = resolveQuestionAnswer(q, data);
        return {
          ...q,
          resolvedAnswer: ans,
          hasAnswer: ans !== null && ans !== undefined
        };
      });

      const answeredCount = qsWithAnswers.filter(q => q.hasAnswer).length;

      let isDone = false;
      if (sec.num === 1) {
        isDone = true;
      } else if (sec.num >= 2 && sec.num <= 11) {
        isDone = Boolean(data.staff_nurse_completed || data.completed_by_staff_nurse || Boolean(data.nurse_timestamp) || (answeredCount > 0 && qsWithAnswers.some(q => q.hasAnswer)));
      } else if (sec.num >= 12 && sec.num <= 13) {
        isDone = Boolean(data.doctor_completed || data.completed_by_doctor || Boolean(data.doctor_timestamp) || (answeredCount > 0 && qsWithAnswers.some(q => q.hasAnswer)));
      } else if (sec.num === 14) {
        isDone = Boolean(data.coordinator_completed || data.completed_by_coordinator || Boolean(data.coordinator_timestamp) || (answeredCount > 0 && qsWithAnswers.some(q => q.hasAnswer)));
      } else if (sec.num === 15) {
        isDone = Boolean(data.counselor_sec15_completed || data.completed_by_counselor || Boolean(data.counselor_timestamp) || (answeredCount > 0 && qsWithAnswers.some(q => q.hasAnswer)));
      } else if (sec.num === 16) {
        isDone = Boolean(data.section_16_completed || data.completed_by_section16 || data.sec_16_done || Boolean(data.sec16_timestamp) || (answeredCount > 0 && qsWithAnswers.some(q => q.hasAnswer)));
      } else {
        isDone = answeredCount > 0;
      }

      return {
        ...sec,
        questionsWithAnswers: qsWithAnswers,
        answeredCount,
        totalCount: sec.questions.length,
        isCompleted: isDone
      };
    });
  }, [allSections, data]);

  const currentSection = sectionsWithStatus.find(s => s.id === activeSectionId) || sectionsWithStatus[0];

  // Search/filter questions inside active section
  const displayQuestions = (currentSection.questionsWithAnswers || []).filter(q => {
    if (!questionSearch.trim()) return true;
    const term = questionSearch.toLowerCase();
    const qCode = String(q.q_code || "").toLowerCase();
    const qTitle = String(q.title || "").toLowerCase();
    const qAns = Array.isArray(q.resolvedAnswer) ? q.resolvedAnswer.join(" ").toLowerCase() : String(q.resolvedAnswer || "").toLowerCase();
    return qCode.includes(term) || qTitle.includes(term) || qAns.includes(term);
  });

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
              <span className={`text-xs font-bold px-3 py-0.5 rounded-full font-mono ${isHighRisk ? "bg-red-500 text-white" : "bg-emerald-600 text-white"}`}>
                {data.risk || "Standard Risk"}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 font-mono mt-1.5">
              <span>Age: <strong className="text-white">{data.age || "48"} yrs</strong></span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">Gender: <GenderBadge gender={data.gender} className="text-purple-300" /></span>
              <span>•</span>
              <span>Date: <strong className="text-white">{data.date_of_survey || "Today"}</strong></span>
              <span>•</span>
              <span>Current Stage: <strong className="text-[#f5d40b]">{data.current_stage || "Pending Nurse"}</strong></span>
            </div>
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
              <span>Survey Responses (All 16 Sections • 117 Questions)</span>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: ALL 16 SECTIONS RESPONSES (Q1 to Q117) */}
          {activeTab === "sections" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
              
              {/* Left Column: 16 Section Selector Pills */}
              <div className="md:col-span-4 lg:col-span-4 xl:col-span-3 space-y-1.5 overflow-y-auto pr-1">
                <div className="flex items-center justify-between px-2 pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    16 Screening Sections
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                    117 Qs Total
                  </span>
                </div>

                {sectionsWithStatus.map(sec => {
                  const isSelected = activeSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveSectionId(sec.id);
                        setQuestionSearch("");
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                        isSelected 
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/20" 
                          : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs font-black truncate">{sec.title}</p>
                        <p className={`text-[10px] font-mono mt-0.5 flex items-center gap-1.5 ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                          <span>{sec.role}</span>
                          <span>•</span>
                          <span>{sec.answeredCount}/{sec.totalCount} Qs</span>
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                        sec.isCompleted 
                          ? isSelected ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-500"
                      }`}>
                        {sec.isCompleted ? "✓ Done" : "Pending"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Active Section Details & Question Inspector */}
              <div className="md:col-span-8 lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-5">
                  
                  {/* Section Top Header & Search Bar */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-black text-slate-900">{currentSection.title}</h4>
                        <span className={`text-xs font-bold px-3 py-0.5 rounded-xl font-mono border ${
                          currentSection.isCompleted 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : "bg-amber-50 text-amber-900 border-amber-200"
                        }`}>
                          {currentSection.isCompleted ? "✓ Recorded & Completed" : "Pending Entry"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        Assigned Role: <strong className="text-slate-800">{currentSection.role}</strong> • Status: <strong className="text-slate-800">{currentSection.answeredCount} of {currentSection.totalCount} Questions Answered</strong>
                      </p>
                    </div>

                    {/* Quick Question Filter */}
                    <div className="relative w-full lg:w-64 shrink-0">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                      <input 
                        type="text"
                        placeholder="Search question code / text..."
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-slate-800 bg-slate-50 focus:bg-white transition-all"
                      />
                      {questionSearch && (
                        <button 
                          onClick={() => setQuestionSearch("")}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SECTION 1 SPECIAL PROFILE OVERVIEW */}
                  {currentSection.num === 1 && (
                    <div className="bg-gradient-to-r from-amber-50/70 via-slate-50 to-amber-50/40 rounded-2xl p-4 sm:p-5 border border-amber-200/70 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <UserCheck size={14} className="text-amber-600" />
                            <span>Master Registration Profile</span>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-mono">
                            Field Supervisor Initiation
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          Recorded: <strong className="text-slate-800">{data.date_of_survey || data.screening_date || "Today"}</strong>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-bold">Participant ID</span>
                          <span className="font-black text-slate-900 text-xs">{data.participant_id || data.mem_scrn_part_id}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-bold">Full Name</span>
                          <span className="font-bold text-slate-900 text-xs truncate block">{data.fullName || data.mem_scrn_q16 || "Participant"}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-bold">Age & Gender</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-bold text-slate-900 text-xs">{data.age || "48"} yrs</span>
                            <GenderBadge gender={data.gender} />
                          </div>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-bold">Center Location</span>
                          <span className="font-bold text-slate-900 text-xs">{data.location || data.mem_scrn_q17 || "Dharavi"} Center</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-bold">Contact Number</span>
                          <span className="font-bold text-slate-900 text-xs">{data.contact_number || data.mem_scrn_q18 || "Not Provided"}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-bold">Family Status</span>
                          <span className="font-bold text-slate-900 text-xs">
                            {data.family_member_number ? (data.is_family_head ? "Head of Family" : `Member #${data.family_member_number}`) : "Individual / Head"}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-bold">Initiating Operator</span>
                          <span className="font-bold text-slate-900 text-xs truncate block">{data.created_by_user || "FS001 (Field Supervisor)"}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-bold">Overall Risk</span>
                          <span className={`font-black text-xs ${isHighRisk ? "text-rose-700" : "text-emerald-700"}`}>
                            {data.risk || "Standard Risk"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ALL QUESTIONS (Q1 to Q117) IN THE SECTION - COMPACT CODE & ANSWER ONLY */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 font-mono">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {currentSection.title} Items ({displayQuestions.length})
                      </h5>
                      <span className="text-[11px] font-mono text-slate-400">
                        {currentSection.answeredCount} / {currentSection.totalCount} Recorded
                      </span>
                    </div>

                    {displayQuestions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                        {displayQuestions.map((q) => {
                          const isAnswered = q.hasAnswer;
                          return (
                            <div 
                              key={q.id || q.q_code}
                              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                                isAnswered 
                                  ? "bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-2xs" 
                                  : "bg-white border-slate-200/60 opacity-80"
                              }`}
                            >
                              {/* Top: Question Number & Code */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-black text-xs shadow-2xs shrink-0">
                                    {q.q_code || "Q"}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                                    Code: {q.id || q.q_code}
                                  </span>
                                </div>
                                {q.required && (
                                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                    Required
                                  </span>
                                )}
                              </div>

                              {/* Bottom: Answer & Code Value */}
                              <div className="pt-0.5">
                                {isAnswered ? (
                                  Array.isArray(q.resolvedAnswer) ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {q.resolvedAnswer.map((ansItem, aIdx) => (
                                        <span 
                                          key={aIdx} 
                                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs font-black shadow-2xs flex items-center gap-1 break-words"
                                        >
                                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                          <span>{ansItem}</span>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-400 font-black text-xs shadow-2xs border border-slate-800 break-words flex items-center gap-1.5">
                                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                      <span>{String(q.resolvedAnswer)}</span>
                                    </div>
                                  )
                                ) : (
                                  <div className="px-3 py-1.5 rounded-xl bg-slate-100/70 border border-dashed border-slate-200 text-slate-400 text-xs italic">
                                    Not answered / Skipped
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 font-mono space-y-2">
                        <HelpCircle size={32} className="mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-bold">No questions matching "{questionSearch}" in {currentSection.title}.</p>
                      </div>
                    )}
                  </div>
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
