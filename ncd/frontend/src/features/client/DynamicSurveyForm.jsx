import React, { useState, useEffect } from "react";
import { FileText, ChevronLeft, ChevronDown, Check, Calendar, Phone, User, ShieldCheck, Shield, Clock, PlusCircle, ArrowRight, Save, MapPin, Activity, Stethoscope, HeartPulse, Brain, Link2, CheckCircle2, UserCheck, AlertCircle, LayoutGrid, CheckSquare, ListFilter, X, PauseCircle, Play, Trash2, Bookmark } from "lucide-react";
import { T } from "../../lib/theme";
import { saveToQueue, getQueue } from "../../lib/db";
import { api } from "../../lib/api";
import { Mark } from "../../components/ui/Mark";

import { isQuestionSkipped, getOptionCode, getOptionLabel } from "../../lib/logicEngine";

// Helper to format Date to DD-MMM-YYYY
function formatDateDDMMMYYYY(dateObj) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const d = dateObj.getDate();
  const m = months[dateObj.getMonth()];
  const y = dateObj.getFullYear();
  return `${d < 10 ? '0' + d : d}-${m}-${y}`;
}

export async function isContactNumberDuplicate(contactDigits, currentParticipantId) {
  if (!contactDigits || contactDigits.length !== 10) return false;

  // 1. Check localStorage registry
  try {
    const rawRegistry = localStorage.getItem('ncd_contact_number_registry');
    const registry = rawRegistry ? JSON.parse(rawRegistry) : {};
    if (registry[contactDigits] && registry[contactDigits] !== currentParticipantId) {
      return registry[contactDigits];
    }
  } catch (e) {}

  // 2. Check IndexedDB queue
  try {
    const queue = await getQueue();
    if (Array.isArray(queue)) {
      for (const item of queue) {
        let raw = {};
        if (item.mem_scrn_q30) {
          try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
        }
        const itemPid = item.participant_id || item.mem_scrn_part_id || raw.participant_id || 'N/A';
        const itemPhone = String(item.contact_number || raw.contact_number || "").replace(/\D/g, "");
        if (itemPhone === contactDigits && itemPid !== currentParticipantId) {
          return itemPid;
        }
      }
    }
  } catch (e) {}

  return false;
}

export function registerContactNumber(contactDigits, participantId) {
  if (!contactDigits || contactDigits.length !== 10) return;
  try {
    const rawRegistry = localStorage.getItem('ncd_contact_number_registry');
    const registry = rawRegistry ? JSON.parse(rawRegistry) : {};
    registry[contactDigits] = participantId;
    localStorage.setItem('ncd_contact_number_registry', JSON.stringify(registry));
  } catch (e) {}
}

export function getlocationPrefix(loc = "Dharavi") {
  const locLower = String(loc || "").toLowerCase().trim();
  let prefixMap = {
    dharavi: "DH",
    malvani: "ML",
    vashi: "VA",
    other: "OT"
  };

  try {
    const customPrefixes = localStorage.getItem('ncd_location_prefixes');
    if (customPrefixes) {
      const parsed = JSON.parse(customPrefixes);
      if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach(k => {
          if (k && parsed[k]) prefixMap[k.toLowerCase()] = String(parsed[k]).toUpperCase();
        });
      }
    }
  } catch (e) {}

  for (const [key, code] of Object.entries(prefixMap)) {
    if (locLower.includes(key)) return code;
  }

  const clean = locLower.replace(/[^a-z0-9]/gi, '');
  return clean.length >= 2 ? clean.substring(0, 2).toUpperCase() : "DH";
}

export function generateParticipantID(loc = "Dharavi") {
  const prefix = getlocationPrefix(loc);
  const counterKey = `ncd_participant_seq_${prefix}`;
  let currentSeq = parseInt(localStorage.getItem(counterKey) || "1", 10);
  if (isNaN(currentSeq) || currentSeq > 99999) currentSeq = 1;

  const usedSet = new Set();

  // 1. Check ncd_used_participant_ids
  try {
    const usedIdsRaw = localStorage.getItem('ncd_used_participant_ids');
    if (usedIdsRaw) {
      const parsed = JSON.parse(usedIdsRaw);
      if (Array.isArray(parsed)) parsed.forEach(id => usedSet.add(String(id).toUpperCase().trim()));
    }
  } catch (e) {}

  // 2. Check ncd_local_initiated_participants
  try {
    const initStr = localStorage.getItem('ncd_local_initiated_participants');
    if (initStr) {
      const parsed = JSON.parse(initStr);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          const id = item.participant_id || item.mem_scrn_part_id;
          if (id) usedSet.add(String(id).toUpperCase().trim());
        });
      }
    }
  } catch (e) {}

  // Find max sequence in usedSet for this location prefix
  const prefixPattern = new RegExp(`^NCD${prefix}(\\d+)$`, 'i');
  let maxSeq = 0;

  usedSet.forEach(id => {
    const m = id.match(prefixPattern);
    if (m) {
      const num = parseInt(m[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });

  let nextSeq = Math.max(currentSeq, maxSeq + 1);
  let candidateId = `NCD${prefix}${String(nextSeq).padStart(4, '0')}`;

  while (usedSet.has(candidateId)) {
    nextSeq++;
    candidateId = `NCD${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  localStorage.setItem(counterKey, String(nextSeq));
  return candidateId;
}

export function incrementParticipantIDCounter(loc = "Dharavi") {
  const prefix = getlocationPrefix(loc);
  const counterKey = `ncd_participant_seq_${prefix}`;
  const currentId = generateParticipantID(loc);
  
  // Register in used IDs list
  try {
    const usedIdsRaw = localStorage.getItem('ncd_used_participant_ids');
    const usedIds = usedIdsRaw ? JSON.parse(usedIdsRaw) : [];
    if (!usedIds.includes(currentId)) {
      usedIds.push(currentId);
      localStorage.setItem('ncd_used_participant_ids', JSON.stringify(usedIds));
    }
  } catch (e) {}

  const seqNum = parseInt(currentId.replace(`NCD${prefix}`, ''), 10);
  const nextSeq = isNaN(seqNum) ? 2 : seqNum + 1;
  localStorage.setItem(counterKey, String(nextSeq));
  
  return `NCD${prefix}${String(nextSeq).padStart(4, '0')}`;
}

const DEFAULT_SURVEY_QUESTIONS = [
  // Section 1: Demographics
  { id: "sec_1", title: "SECTION 1 · DEMOGRAPHICS — FIELD SUPERVISOR", type: "section_header", section: 1 },
  { id: "q1", title: "Q1. Age", type: "number", required: true, section: 1 },
  { id: "q2", title: "Q2. Gender", type: "single_choice", options: ["Male", "Female", "Transgender women", "Transgender man", "Prefer not to say"], required: true, section: 1 },
  { id: "q3", title: "Q3. Site", type: "dropdown", options: ["Dharavi", "Malvani", "Vashi"], required: true, section: 1 },
  { id: "q4", title: "Q4. Primary Occupation", type: "dropdown", options: ["Unemployed, seeking work", "Unemployed, not seeking work", "Daily wage labourer", "Construction worker", "Domestic worker", "Street vendor / hawker", "Shop assistant / retail", "Driver / transport worker", "Artisan / craft worker", "Tailor / garment worker", "Factory / industrial worker", "Waste picker / sanitation worker", "Security guard", "Cook / food service", "Salaried, private sector", "Salaried, government", "Self-employed / small business", "Housewife / home-based work", "Student", "Retired", "Unable to work due to illness or disability", "Sex work", "Not stated"], required: false, section: 1 },
  { id: "q5", title: "Q5. Education Level", type: "dropdown", options: ["No formal education", "Primary (classes 1 to 5)", "Middle (classes 6 to 8)", "Secondary (classes 9 to 10)", "Higher secondary (classes 11 to 12)", "ITI / diploma / vocational", "Graduate", "Postgraduate", "Not stated"], required: false, section: 1 },
  { id: "q6", title: "Q6. Current Monthly Household Income (₹)", type: "dropdown", options: ["No income", "10,000 or below", "10,001 to 20,000", "20,001 to 30,000", "Above 30,000", "Not stated"], required: false, section: 1 },
  { id: "q7", title: "Q7. Type of Housing", type: "dropdown", options: ["Pavement / open space", "Temporary shelter or tarpaulin structure", "Dormitory / shared labour accommodation", "Chawl room", "Single-room tenement, kutcha", "Single-room tenement, pucca", "Flat / apartment", "Individual house", "Hostel", "Institutional accommodation", "Not stated"], required: false, section: 1 },
  { id: "q8", title: "Q8. How long have you lived at this address?", type: "dropdown", options: ["Less than 6 months", "6 months to 2 years", "2 to 5 years", "More than 5 years", "Not stated"], required: false, section: 1 },

  // Section 2: Medical History
  { id: "sec_2", title: "SECTION 2 · MEDICAL HISTORY — STAFF NURSE", type: "section_header", section: 2 },
  { id: "q9", title: "Q9. Have you ever been told by a doctor that you have any of the following? (check all that apply)", type: "multi_choice", options: ["Diabetes", "Hypertension", "Heart disease", "Stroke / paralysis", "Chronic respiratory disease", "Chronic kidney disease", "Chronic liver disease", "Chronic gastrointestinal disease", "Thyroid disorder", "Tuberculosis", "Cancer", "Epilepsy / seizure disorder", "Arthritis / joint disease", "Anaemia", "Mental health condition", "None of the above"], required: true, section: 2 },
  { id: "q10", title: "Q10. If cancer, which type?", type: "dropdown", options: ["Oral / head and neck", "Breast", "Cervical", "Lung", "Stomach / oesophageal", "Colorectal", "Blood / lymphatic", "Other solid organs", "Not known to participant"], required: false, section: 2 },
  { id: "q11", title: "Q11. Family history of NCDs", type: "single_choice", options: ["Yes", "No", "Don't know"], required: false, section: 2 },
  { id: "q12", title: "Q12. If yes, which?", type: "multi_choice", options: ["Diabetes", "Hypertension", "Heart disease", "Stroke", "Chronic respiratory disease", "Chronic kidney disease", "Cancer", "Mental health condition", "Not known which"], required: false, section: 2 },
  { id: "q13", title: "Q13. Have you been told before that you have high blood pressure or high blood sugar?", type: "single_choice", options: ["Yes, blood pressure only", "Yes, blood sugar only", "Yes, both", "No", "Don't know"], required: false, section: 2 },
  { id: "q14", title: "Q14. Do you take any medication regularly?", type: "single_choice", options: ["Yes", "No"], required: false, section: 2 },
  { id: "q15", title: "Q15. If yes, for which conditions?", type: "multi_choice", options: ["Diabetes", "Blood pressure", "Heart", "Respiratory", "Cholesterol", "Obesity", "Corticosteroids", "Antacids / PPIs", "Thyroid", "Tuberculosis", "Mental health", "Pain relief", "Traditional or alternative medicine", "Not known to participant"], required: false, section: 2 },
  { id: "q16", title: "Q16. In the last month, have you missed your medication for more than three days together?", type: "single_choice", options: ["No", "Yes, cost", "Yes, medicine not available", "Yes, side effects", "Yes, felt better", "Yes, forgot", "Yes, could not reach facility", "Not stated"], required: false, section: 2 },

  // Section 3: Tobacco Use
  { id: "sec_3", title: "SECTION 3 · TOBACCO USE — STAFF NURSE", type: "section_header", section: 3 },
  { id: "q17", title: "Q17. Which best describes your tobacco use?", type: "single_choice", options: ["Never used", "Used in the past, stopped completely", "Currently use"], required: true, section: 3 },
  { id: "q18", title: "Q18. How long ago did you stop? (Former users only)", type: "dropdown", options: ["Less than 6 months", "6 to 12 months", "1 to 5 years", "More than 5 years"], required: false, section: 3 },
  { id: "q19", title: "Q19. For how many years did you use tobacco before stopping?", type: "dropdown", options: ["Less than 1 year", "1 to 5 years", "6 to 10 years", "11 to 20 years", "More than 20 years"], required: false, section: 3 },
  { id: "q20", title: "Q20. Which products do you currently use? (Current users only)", type: "multi_choice", options: ["Cigarette", "Bidi", "Hookah", "Cigar / pipe", "E-cigarette", "Gutkha", "Khaini", "Zarda", "Paan with tobacco", "Paan masala with tobacco", "Snuff", "Mishri / gul"], required: false, section: 3 },
  { id: "q21", title: "Q21. How soon after waking do you first use tobacco?", type: "dropdown", options: [{ label: "Within 5 minutes (3 pts)", code: "3" }, { label: "6 to 30 minutes (2 pts)", code: "2" }, { label: "31 to 60 minutes (1 pt)", code: "1" }, { label: "After 60 minutes (0 pts)", code: "0" }], required: false, section: 3 },
  { id: "q22", title: "Q22. How many times do you use tobacco in a day, all products together?", type: "dropdown", options: [{ label: "10 or fewer (0 pts)", code: "0" }, { label: "11 to 20 (1 pt)", code: "1" }, { label: "21 to 30 (2 pts)", code: "2" }, { label: "31 or more (3 pts)", code: "3" }], required: false, section: 3 },
  { id: "q23", title: "Q23. Heaviness of Smoking Index total (Q21 + Q22):", type: "number", required: false, section: 3 },
  { id: "q24", title: "Q24. Is anyone else in your household a current tobacco user?", type: "single_choice", options: ["Yes, smoked", "Yes, smokeless", "Yes, both", "No", "Don't know"], required: false, section: 3 },

  // Section 4: Alcohol Use
  { id: "sec_4", title: "Section 4 · Alcohol use (AUDIT-C, with full AUDIT on a positive screen)", type: "section_header", section: 4 },
  { id: "q25", title: "Q25. Which best describes your alcohol use?", type: "single_choice", options: ["Never consumed", "Consumed in the past, stopped completely", "Currently consume"], required: true, section: 4 },
  { id: "q26", title: "Q26. If you stopped, how long ago?", type: "dropdown", options: ["Less than 6 months", "6 to 12 months", "1 to 5 years", "More than 5 years"], required: false, section: 4 },
  { id: "q27", title: "Q27. How often do you have a drink containing alcohol?", type: "dropdown", options: [{ label: "Never (0 pts)", code: "0" }, { label: "Monthly or less (1 pt)", code: "1" }, { label: "Two to four times a month (2 pts)", code: "2" }, { label: "Two to three times a week (3 pts)", code: "3" }, { label: "Four or more times a week (4 pts)", code: "4" }], required: false, section: 4 },
  { id: "q28", title: "Q28. How many standard drinks on a typical drinking day?", type: "dropdown", options: [{ label: "1 or 2 (0 pts)", code: "0" }, { label: "3 or 4 (1 pt)", code: "1" }, { label: "5 or 6 (2 pts)", code: "2" }, { label: "7 to 9 (3 pts)", code: "3" }, { label: "10 or more (4 pts)", code: "4" }], required: false, section: 4 },
  { id: "q29", title: "Q29. How often do you have six or more standard drinks on one occasion?", type: "dropdown", options: [{ label: "Never (0 pts)", code: "0" }, { label: "Less than monthly (1 pt)", code: "1" }, { label: "Monthly (2 pts)", code: "2" }, { label: "Weekly (3 pts)", code: "3" }, { label: "Daily or almost daily (4 pts)", code: "4" }], required: false, section: 4 },
  { id: "q30", title: "Q30. AUDIT-C Total Score (Auto-calculated)", type: "number", required: false, section: 4 }
];



export function DynamicSurveyForm({ participant, onCancel, onSubmit, notify }) {
  const getUserSafely = () => {
    try {
      const userString = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
      if (!userString || userString === 'undefined' || userString === 'null') return null;
      return JSON.parse(userString);
    } catch (e) { return null; }
  };
  const activeUser = getUserSafely();
  const isSupervisor = String(activeUser?.role_name || "").toLowerCase().includes("supervisor");

  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [qPage, setQPage] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [viewModes, setViewModes] = useState({});
  const [openSingleDropdowns, setOpenSingleDropdowns] = useState({});
  const [openMultiDropdowns, setOpenMultiDropdowns] = useState({});

  const [resumeFeatureEnabled, setResumeFeatureEnabled] = useState(
    () => localStorage.getItem('ncd_setting_enable_resume_button') === 'true'
  );

  useEffect(() => {
    const handleSettingChange = () => {
      const isEn = localStorage.getItem('ncd_setting_enable_resume_button') === 'true';
      setResumeFeatureEnabled(isEn);
    };
    window.addEventListener('ncd_resume_setting_changed', handleSettingChange);
    window.addEventListener('storage', handleSettingChange);
    return () => {
      window.removeEventListener('ncd_resume_setting_changed', handleSettingChange);
      window.removeEventListener('storage', handleSettingChange);
    };
  }, []);

  // Auto Participant ID in DH-MUM-0001 format & Current Date
  const currentDateFormatted = formatDateDDMMMYYYY(new Date());

  const [availableParticipants, setAvailableParticipants] = useState([
    { id: "NCDDH0001", age: "20", gender: "Transgender man", location: "Dharavi" },
    { id: "NCDDH0002", age: "45", gender: "Male", location: "Dharavi" },
    { id: "NCDML0001", age: "42", gender: "Female", location: "Malvani" },
    { id: "NCDVA0001", age: "55", gender: "Male", location: "Vashi" }
  ]);

  // Dynamically load queued / completed participants from local sync queue & API
  useEffect(() => {
    const loadQueueParticipants = async () => {
      let list = [];
      try {
        const queue = await getQueue();
        if (Array.isArray(queue) && queue.length > 0) {
          queue.forEach(item => {
            let raw = {};
            if (item.mem_scrn_q30) {
              try { raw = typeof item.mem_scrn_q30 === 'string' ? JSON.parse(item.mem_scrn_q30) : item.mem_scrn_q30; } catch (e) {}
            }
            const pid = item.participant_id || item.mem_scrn_part_id || raw.participant_id || 'N/A';
            const age = item.age || raw.age || item.mem_scrn_q1 || "45";
            const gender = item.gender || raw.gender || (item.mem_scrn_q2 == "1" ? "Male" : "Female");
            const loc = item.location || raw.location || item.mem_scrn_q17 || "Dharavi";

            if (pid && pid !== 'N/A' && !list.some(x => x.id === pid)) {
              list.push({
                id: pid,
                age: String(age),
                gender: gender,
                location: loc,
                rawPayload: { ...item, ...raw }
              });
            }
          });
        }
      } catch (e) { console.error(e); }

      // Also try fetching from API queue endpoint
      try {
        const res = await api.get("/api/v1/screening/queue");
        if (res && res.status === "success" && Array.isArray(res.data)) {
          res.data.forEach(item => {
            const pid = item.participant_id || item.mem_scrn_part_id || 'N/A';
            if (pid && pid !== 'N/A' && !list.some(x => x.id === pid)) {
              list.push({
                id: pid,
                age: String(item.age || item.mem_scrn_q1 || "45"),
                gender: item.gender || (item.mem_scrn_q2 == "1" ? "Male" : "Female"),
                location: item.location || item.mem_scrn_q17 || "Dharavi",
                rawPayload: item
              });
            }
          });
        }
      } catch (e) {}

      if (list.length > 0) {
        setAvailableParticipants(list);
      }
    };

    loadQueueParticipants();
  }, []);
  
  const getActiveLocation = () => {
    try {
      const activeLoc = localStorage.getItem('ncd_active_location');
      if (activeLoc) return activeLoc;
      const userStr = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u && (u.location || u.loc_code)) return u.location || u.loc_code;
      }
    } catch (e) {}
    return "Dharavi";
  };

  const activeCenterLoc = getActiveLocation();
  
  const [data, setData] = useState({
    participant_id: generateParticipantID(activeCenterLoc),
    screening_date: currentDateFormatted,
    raw_date: new Date().toISOString().split('T')[0],
    contact_number: "",
    fullName: "",
    age: "",
    gender: "Male",
    location: activeCenterLoc,
    user_name: "",
    user_role: "Staff Nurse"
  });

  useEffect(() => {
    const loc = getActiveLocation();
    setData(prev => ({
      ...prev,
      location: loc,
      participant_id: generateParticipantID(loc)
    }));
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [activeDraft, setActiveDraft] = useState(null);
  const [isPausedModalOpen, setIsPausedModalOpen] = useState(false);

  // Check for saved paused draft session
  useEffect(() => {
    try {
      const draftStr = localStorage.getItem('ncd_active_survey_draft');
      if (draftStr) {
        const parsed = JSON.parse(draftStr);
        if (parsed && parsed.data && (parsed.participant_id === data.participant_id || !data.participant_id)) {
          setActiveDraft(parsed);
        }
      }
    } catch (e) {}
  }, [data.participant_id]);

  const handlePauseSession = (e) => {
    if (e) e.preventDefault();
    const draft = {
      participant_id: data.participant_id || "PARTICIPANT_DRAFT",
      page: qPage,
      data: data,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('ncd_active_survey_draft', JSON.stringify(draft));
    setActiveDraft(draft);
    setIsPausedModalOpen(true);
    if (notify) notify("info", `Survey session paused at Page ${qPage + 1}. Saved as draft.`);
  };

  const handleResumeDraft = () => {
    if (activeDraft && activeDraft.data) {
      setData(activeDraft.data);
      if (activeDraft.page !== undefined) setQPage(activeDraft.page);
      setActiveDraft(null);
      if (notify) notify("success", `Resumed survey draft session at Page ${activeDraft.page + 1}!`);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('ncd_active_survey_draft');
    setActiveDraft(null);
    if (notify) notify("info", "Draft survey session discarded.");
  };

  // Protected Mode: Tab reload & close warning listener during active survey session
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step === 1 && !submitting) {
        // Automatically autosave current session as draft before page reload/leave
        try {
          const draft = {
            participant_id: data.participant_id || "PARTICIPANT_DRAFT",
            page: qPage,
            data: data,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('ncd_active_survey_draft', JSON.stringify(draft));
        } catch (err) {}

        const warningMsg = "Protected Mode: You have an active survey session in progress. Progress has been autosaved as a draft. Are you sure you want to reload or leave?";
        e.preventDefault();
        e.returnValue = warningMsg;
        return warningMsg;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, submitting, data, qPage]);

  useEffect(() => {
    // 1. Check if participant has attached survey schema
    let loadedQs = null;
    if (participant && participant.sur_url) {
      try {
        const parsed = JSON.parse(participant.sur_url);
        if (Array.isArray(parsed) && parsed.length > 0) loadedQs = parsed;
      } catch (e) {}
    }
    // 2. Check localStorage active questions from Admin Survey Builder
    if (!loadedQs) {
      const activeStr = localStorage.getItem('ncd_active_survey_questions');
      if (activeStr) {
        try {
          const parsed = JSON.parse(activeStr);
          if (Array.isArray(parsed) && parsed.length > 0) loadedQs = parsed;
        } catch (e) {}
      }
    }

    if (loadedQs && loadedQs.length > 0) {
      setCustomQuestions(loadedQs);
    } else {
      // 3. Fetch active survey schema live from Admin backend API
      api.get('/api/v1/surveymaster/index').then(res => {
        if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
          const activeSur = res.data.find(s => s.status === '1') || res.data[0];
          if (activeSur && activeSur.sur_url) {
            try {
              const apiQs = JSON.parse(activeSur.sur_url);
              if (Array.isArray(apiQs) && apiQs.length > 0) {
                setCustomQuestions(apiQs);
                return;
              }
            } catch (e) {}
          }
        }
        setCustomQuestions(DEFAULT_SURVEY_QUESTIONS);
      }).catch(() => {
        setCustomQuestions(DEFAULT_SURVEY_QUESTIONS);
      });
    }
  }, [participant]);

  // Auto-capture Supervisor Location into Q3 (Site/Location) question
  useEffect(() => {
    if (customQuestions && customQuestions.length > 0 && data.location) {
      const q3 = customQuestions.find(q => {
        const titleLower = String(q.title || "").toLowerCase();
        return titleLower.startsWith("q3") || titleLower.includes("site") || titleLower.includes("location");
      });
      if (q3) {
        const customKey = `custom_${q3.id}`;
        setData(d => ({
          ...d,
          [customKey]: d[customKey] || d.location,
          [q3.id]: d[q3.id] || d.location
        }));
      }
    }
  }, [customQuestions, data.location]);

  // Auto-calculate 6 core clinical fields: BMI, WHR, Avg BP, HSI (Q23), AUDIT-C (Q30), Amber Review Date
  useEffect(() => {
    setData(d => {
      let updates = {};

      // 1. BMI Calculation: Q67 (Height in cm) & Q68 (Weight in kg) -> Q69 (BMI)
      const htCm = parseFloat(d.q67 || d.custom_q67 || d.height || 0);
      const wt = parseFloat(d.q68 || d.custom_q68 || d.weight || 0);
      if (wt > 0 && htCm > 0) {
        const htM = htCm / 100;
        const calcBmi = (wt / (htM * htM)).toFixed(2);
        if (d.bmi !== calcBmi || d.custom_q69 !== calcBmi) {
          updates.bmi = calcBmi;
          updates.custom_bmi = calcBmi;
          updates.q69 = calcBmi;
          updates.custom_q69 = calcBmi;
          const q69Key = Object.keys(d).find(k => k.toLowerCase().includes("q69")) || "q69";
          updates[q69Key] = calcBmi;
        }
      }

      // 2. Waist-Hip Ratio (WHR)
      const waist = parseFloat(d.waist || d.q70 || d.custom_q70 || 0);
      const hip = parseFloat(d.hip || d.q71 || d.custom_q71 || 0);
      if (waist > 0 && hip > 0) {
        const calcWhr = (waist / hip).toFixed(2);
        if (d.waist_hip_ratio !== calcWhr) {
          updates.waist_hip_ratio = calcWhr;
          updates.whr = calcWhr;
          updates.custom_whr = calcWhr;
          const q72Key = Object.keys(d).find(k => k.toLowerCase().includes("q72")) || "q72";
          updates[q72Key] = calcWhr;
        }
      }

      // 3. Average Blood Pressure (SBP & DBP)
      const sbp1 = parseFloat(d.sys_bp_1 || d.sbp1 || 0);
      const sbp2 = parseFloat(d.sys_bp_2 || d.sbp2 || 0);
      const dbp1 = parseFloat(d.dia_bp_1 || d.dbp1 || 0);
      const dbp2 = parseFloat(d.dia_bp_2 || d.dbp2 || 0);

      if (sbp1 > 0 && sbp2 > 0) {
        const avgSbp = Math.round((sbp1 + sbp2) / 2);
        if (d.avg_sys_bp !== avgSbp) {
          updates.avg_sys_bp = avgSbp;
          updates.sys_bp = avgSbp;
          updates.custom_sys_bp = avgSbp;
        }
      }
      if (dbp1 > 0 && dbp2 > 0) {
        const avgDbp = Math.round((dbp1 + dbp2) / 2);
        if (d.avg_dia_bp !== avgDbp) {
          updates.avg_dia_bp = avgDbp;
          updates.dia_bp = avgDbp;
          updates.custom_dia_bp = avgDbp;
        }
      }

      // 4. Heaviness of Smoking Index (HSI - Q23)
      let hsiScore = 0;
      const q21Val = d.q21 || d.custom_q21;
      const q22Val = d.q22 || d.custom_q22;

      if (q21Val) {
        const str = typeof q21Val === 'object' ? (q21Val.code || q21Val.label || '') : String(q21Val);
        const l = str.toLowerCase();
        if (l.includes("within 5") || l.includes("3 pts") || str === "3") hsiScore += 3;
        else if (l.includes("6 to 30") || l.includes("2 pts") || str === "2") hsiScore += 2;
        else if (l.includes("31 to 60") || l.includes("1 pt") || str === "1") hsiScore += 1;
      }
      if (q22Val) {
        const str = typeof q22Val === 'object' ? (q22Val.code || q22Val.label || '') : String(q22Val);
        const l = str.toLowerCase();
        if (l.includes("31 or more") || l.includes("3 pts") || str === "3") hsiScore += 3;
        else if (l.includes("21 to 30") || l.includes("2 pts") || str === "2") hsiScore += 2;
        else if (l.includes("11 to 20") || l.includes("1 pt") || str === "1") hsiScore += 1;
      }

      const q23Key = Object.keys(d).find(k => k.toLowerCase().includes("q23")) || "custom_q23";
      if (d[q23Key] !== hsiScore) {
        updates.q23 = hsiScore;
        updates.custom_q23 = hsiScore;
        updates[q23Key] = hsiScore;
        updates.route_cessation_q111 = hsiScore >= 4;
        updates.hsi_high_dependence = hsiScore >= 4;
      }

      // 5. AUDIT-C Total (Q30)
      let auditScore = 0;
      const q27Val = d.q27 || d.custom_q27;
      const q28Val = d.q28 || d.custom_q28;
      const q29Val = d.q29 || d.custom_q29;

      const parsePoints = (v) => {
        if (!v) return 0;
        const str = typeof v === 'object' ? (v.code ?? v.label ?? '') : String(v);
        const ptMatch = str.match(/(\d+)\s*pt/i) || str.match(/code\s*(\d+)/i) || str.match(/^(\d+)/);
        if (ptMatch) return parseInt(ptMatch[1], 10);
        const l = str.toLowerCase();
        if (l.includes("never") || l.includes("one or two") || l.includes("1 or 2")) return 0;
        if (l.includes("monthly or less") || l.includes("less than monthly") || l.includes("three or four") || l.includes("3 or 4")) return 1;
        if (l.includes("two to four") || l.includes("2 to 4") || l.includes("monthly") || l.includes("five or six") || l.includes("5 or 6")) return 2;
        if (l.includes("two to three") || l.includes("2 to 3") || l.includes("weekly") || l.includes("seven to nine") || l.includes("7 to 9")) return 3;
        if (l.includes("four or more") || l.includes("4 or more") || l.includes("daily") || l.includes("ten or more") || l.includes("10 or more")) return 4;
        return 0;
      };

      auditScore += parsePoints(q27Val);
      auditScore += parsePoints(q28Val);
      auditScore += parsePoints(q29Val);

      const q30Key = Object.keys(d).find(k => k.toLowerCase().includes("q30")) || "custom_q30";
      if (d[q30Key] !== auditScore) {
        updates.q30 = auditScore;
        updates.custom_q30 = auditScore;
        updates[q30Key] = auditScore;
      }

      // 6. Amber Review Date (+14 days from screening date)
      const baseDate = d.raw_date ? new Date(d.raw_date) : new Date();
      const amberDt = new Date(baseDate);
      amberDt.setDate(amberDt.getDate() + 14);
      const amberFormatted = formatDateDDMMMYYYY(amberDt);

      if (d.amber_review_date !== amberFormatted) {
        updates.amber_review_date = amberFormatted;
        updates.custom_amber_review_date = amberFormatted;
      }

      if (Object.keys(updates).length === 0) return d;
      return { ...d, ...updates };
    });
  }, [
    data.weight, data.height, data.custom_q67, data.custom_q68,
    data.waist, data.hip, data.custom_q70, data.custom_q71,
    data.sys_bp_1, data.sys_bp_2, data.dia_bp_1, data.dia_bp_2,
    data.q21, data.custom_q21, data.q22, data.custom_q22,
    data.q27, data.custom_q27, data.q28, data.custom_q28, data.q29, data.custom_q29,
    data.raw_date
  ]);

  useEffect(() => {
    const userString = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
    if (userString) {
      try {
        const u = JSON.parse(userString);
        const role = u.role_name || "Field Supervisor";
        const loc = u.assigned_location || "Dharavi";
        setData(d => ({
          ...d,
          user_name: u.username || "DEO",
          user_role: role,
          location: loc,
          participant_id: generateParticipantID(loc)
        }));
      } catch (e) {}
    }

    // Fetch active backend list & combine with local queue
    api.get("/api/v1/dashboard/screeninglist").then(res => {
      let rawList = [];
      if (res.status === 'success' && Array.isArray(res.data)) {
        rawList = res.data;
      }
      
      // Also check local offline queue
      let localQueue = [];
      try {
        const localStr = localStorage.getItem('ncd_offline_queue');
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (Array.isArray(parsed)) localQueue = parsed;
        }
      } catch (e) {}

      const allRecords = [...localQueue, ...rawList];
      const seenIds = new Set();
      const uniqueParticipants = [];

      allRecords.forEach((r, idx) => {
        let rawPayload = {};
        if (r.mem_scrn_q30) {
          try { rawPayload = JSON.parse(r.mem_scrn_q30); } catch (e) {}
        }

        const partId = r.participant_id || r.mem_scrn_part_id || (r.mem_scrn_id ? `NCD-MUM-${r.mem_scrn_id}` : (r.id ? `NCD-MUM-${r.id}` : null));
        
        // Ignore invalid / undefined / duplicate IDs
        if (!partId || partId.includes("undefined") || seenIds.has(partId)) {
          return;
        }

        seenIds.add(partId);

        const nameVal = rawPayload.fullName || r.fullName || r.mem_scrn_q16;
        const displayName = (nameVal && nameVal !== "Unnamed Participant") ? nameVal : partId;
        const ageVal = rawPayload.age || r.age || r.mem_scrn_q1 || "45";
        const genderVal = rawPayload.gender || r.gender || (r.mem_scrn_q2 == "1" ? "Male" : "Female");
        const locVal = rawPayload.location || r.location || r.mem_scrn_q17 || "Dharavi";

        uniqueParticipants.push({
          id: partId,
          name: displayName,
          age: ageVal,
          gender: genderVal,
          location: locVal,
          status: r.status || "Demographics Completed",
          bp: rawPayload.bp_systolic ? `${rawPayload.bp_systolic}/${rawPayload.bp_diastolic}` : "130/84",
          glucose: rawPayload.random_blood_glucose || "135",
          rawPayload
        });
      });

      if (uniqueParticipants.length > 0) {
        setAvailableParticipants(uniqueParticipants);
      }
    }).catch(e => console.error("Failed to load participant list", e));
  }, []);

  const getLoggedInUserSafely = () => {
    try {
      const str = localStorage.getItem('ncd_user') || localStorage.getItem('icc_user');
      if (!str || str === 'undefined' || str === 'null') return null;
      const parsed = JSON.parse(str);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  };
  const loggedInUser = getLoggedInUserSafely();
  
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
  
  const roleNameLower = (activeUser?.role_name || activeUser?.role || data.user_role || "Field Supervisor").toLowerCase();
  const isFieldSupervisor = roleNameLower.includes("field supervisor") || (roleNameLower.includes("supervisor") && !roleNameLower.includes("nurse") && !roleNameLower.includes("doctor") && !roleNameLower.includes("counselor") && !roleNameLower.includes("coordinator"));
  const isNurse = roleNameLower.includes("nurse");
  const isDoctor = roleNameLower.includes("doctor");
  const isCounselor = roleNameLower.includes("counselor");
  const isCoordinator = roleNameLower.includes("coordinator");

  let secTracker = 1;
  const activeCustomQuestions = (customQuestions || []).filter((q, idx) => {
    const titleStr = String(q.title || "").trim();
    const titleLower = titleStr.toLowerCase();
    const qMatch = titleStr.match(/^Q(\d+)/i);

    let qSec = q.section ? parseInt(q.section) : secTracker;

    if (qMatch) {
      const qNum = parseInt(qMatch[1], 10);
      if (qNum >= 1 && qNum <= 8) qSec = 1;
      else if (qNum >= 9 && qNum <= 16) qSec = 2;
      else if (qNum >= 17 && qNum <= 24) qSec = 3;
      else if (qNum >= 25 && qNum <= 32) qSec = 4;
      else if (qNum >= 33 && qNum <= 39) qSec = 5;
      else if (qNum >= 40 && qNum <= 47) qSec = 6;
      else if (qNum >= 48 && qNum <= 57) qSec = 7;
      else if (qNum >= 58 && qNum <= 65) qSec = 8;
      else if (qNum >= 66 && qNum <= 72) qSec = 9;
      else if (qNum >= 73 && qNum <= 80) qSec = 10;
      else if (qNum >= 81 && qNum <= 88) qSec = 11;
      else if (qNum >= 89 && qNum <= 93) qSec = 12;
      else if (qNum >= 94 && qNum <= 96) qSec = 13;
      else if (qNum >= 97 && qNum <= 106) qSec = 14;
      else if (qNum >= 107 && qNum <= 112) qSec = 15;
      else if (qNum >= 113) qSec = 16;
    } else if (
      idx < 8 ||
      titleLower.includes("age") || 
      titleLower.includes("gender") || 
      titleLower.includes("site") || 
      titleLower.includes("location") || 
      titleLower.includes("marital") || 
      titleLower.includes("education") || 
      titleLower.includes("occupation") || 
      titleLower.includes("housing") || 
      titleLower.includes("perception") || 
      titleLower.includes("demographic")
    ) {
      qSec = 1;
    }

    if (q.type === 'section_header' || titleLower.startsWith('section ')) {
      const match = titleStr.match(/Section\s*(\d+)/i);
      if (match) secTracker = parseInt(match[1]);
      else if (q.section) secTracker = parseInt(q.section);
      qSec = secTracker;
    }

    if (isQuestionSkipped(q, customQuestions, data)) {
      return false; // Dynamically skip Q10 or Q12 based on Q9 / Q11 responses!
    }

    if (isFieldSupervisor) {
      return qSec === 1; // Field Supervisor strictly sees only Section 1 questions (Q1 to Q8)
    }

    if (qSec === 16 && !isExistingParticipant) {
      return false; // Hide Section 16 during initial creation
    }

    return hasPrivilege(qSec);
  });
  const hasCustomQuestions = activeCustomQuestions.length > 0;

  const set = (k) => (v) => {
    setData((d) => ({ ...d, [k]: v }));
    setFieldErrors((prev) => {
      if (prev[k]) {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      }
      return prev;
    });
  };

  const isAgeQuestion = (q) => {
    if (!q) return false;
    const qIdLower = String(q.id || "").toLowerCase().trim();
    const titleLower = String(q.title || "").toLowerCase().trim();
    if (qIdLower === "q1" || qIdLower === "q_0" || qIdLower === "custom_q1" || qIdLower === "custom_q_0") return true;
    if (/^q1\.\s/i.test(titleLower) || /^q1\s/i.test(titleLower)) return true;
    if (/\bage\b/i.test(titleLower) && !titleLower.includes("dosage") && !titleLower.includes("triage")) return true;
    return false;
  };

  const updateCustomField = (q, val) => {
    const titleLower = (q.title || "").toLowerCase();
    const isAgeField = isAgeQuestion(q);

    if (isAgeField && val !== "" && val !== undefined && val !== null) {
      const ageNum = parseInt(val, 10);
      const strVal = String(val).trim();
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100 || strVal.length > 3) {
        const errStr = `Invalid Age: Entered value "${val}" is out of range. Age must be between 18 and 100 years. 4-digit input (e.g. 1222) is rejected.`;
        setFieldErrors(prev => ({ ...prev, [q.id]: errStr }));
      } else {
        setFieldErrors(prev => {
          if (prev[q.id]) {
            const copy = { ...prev };
            delete copy[q.id];
            return copy;
          }
          return prev;
        });
      }
    } else {
      setFieldErrors(prev => {
        if (prev[q.id]) {
          const copy = { ...prev };
          delete copy[q.id];
          return copy;
        }
        return prev;
      });
    }

    setData(d => {
      const next = { ...d, [q.id]: val, [`custom_${q.id}`]: val };
      
      // Save question number alias keys (e.g. q11, custom_q11) for instant logic engine lookup
      const titleStr = String(q.title || "").trim();
      const m = titleStr.match(/^Q(\d+)/i) || String(q.id || "").match(/^q(\d+)/i);
      if (m) {
        const qNumStr = m[1];
        next[`q${qNumStr}`] = val;
        next[`custom_q${qNumStr}`] = val;
      }

      if (titleLower.includes("name") || titleLower.includes("full name")) next.fullName = val;
      if (isAgeField) next.age = val;
      if (titleLower.includes("gender")) next.gender = val;
      if (titleLower.includes("site") || titleLower.includes("location")) next.location = val;
      return next;
    });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate) {
      const formatted = formatDateDDMMMYYYY(newDate);
      setData(d => ({
        ...d,
        raw_date: newDate,
        screening_date: formatted
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
        age: String(found.age),
        gender: found.gender,
        location: found.location,
        user_role: activeUser?.role_name || activeUser?.role || d.user_role
      }));
      notify("info", "Participant Selected", `Loaded details for Participant ${found.id}. Proceeding to ${activeUser?.role_name || data.user_role || "Clinical"} modules.`);
      setStep(1);
      setQPage(0);
    }
  };

  const validateCurrentPageQuestions = () => {
    const activeQs = activeCustomQuestions;
    if (!activeQs || activeQs.length === 0) return true;

    const pagesList = [];
    let curP = [];
    let qCount = 0;
    activeQs.forEach(q => {
      const isH = q.type === 'section_header' || String(q.id || '').startsWith('sec_');
      if (isH) {
        if (qCount > 0) {
          if (curP.length > 0) pagesList.push(curP);
          curP = [q];
          qCount = 0;
        } else {
          curP.push(q);
        }
      } else {
        curP.push(q);
        qCount++;
        if (qCount >= 1) {
          pagesList.push(curP);
          curP = [];
          qCount = 0;
        }
      }
    });
    if (curP.length > 0) pagesList.push(curP);

    const totalQPages = pagesList.length > 0 ? pagesList.length : 1;
    const safeQPage = Math.min(qPage, Math.max(0, totalQPages - 1));
    const currentBatch = pagesList[safeQPage] || [];

    let newErrors = {};
    let firstErrorMsg = null;

    for (const q of currentBatch) {
      if (q.type === 'section_header') continue;
      
      const val = data[q.id] !== undefined ? data[q.id] : data[`custom_${q.id}`];
      const isEmpty = val === undefined || 
                      val === null || 
                      val === "" || 
                      (typeof val === 'string' && val.trim() === "") || 
                      (Array.isArray(val) && val.length === 0);
      
      if (isEmpty) {
        const msg = `Please answer mandatory question: "${q.title}"`;
        newErrors[q.id] = msg;
        if (!firstErrorMsg) firstErrorMsg = msg;
      } else {
        const isAgeField = isAgeQuestion(q);
        if (isAgeField) {
          const ageNum = parseInt(val, 10);
          const strVal = String(val).trim();
          if (isNaN(ageNum) || ageNum < 18 || ageNum > 100 || strVal.length > 3) {
            const msg = `Invalid Age: Entered value "${val}" is out of range. Age must be between 18 and 100 years. 4-digit input (e.g. 1222) is rejected.`;
            newErrors[q.id] = msg;
            if (!firstErrorMsg) firstErrorMsg = msg;
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(prev => ({ ...prev, ...newErrors }));
      notify("error", "Question Required", firstErrorMsg || "Cannot leave mandatory questions empty. Please complete inline errors before proceeding.");
      return false;
    }

    return true;
  };

  const handleProceedNext = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!data.participant_id || String(data.participant_id).trim() === "") {
      newErrors.participant_id = "Please select or generate a valid Participant ID.";
      notify("error", "Participant ID Required", newErrors.participant_id);
    }

    if (isFieldSupervisor) {
      const contactDigits = String(data.contact_number || "").replace(/\D/g, "");
      if (!contactDigits) {
        newErrors.contact_number = "Contact Number is mandatory. Enter a 10-digit mobile number.";
      } else if (contactDigits.length !== 10) {
        newErrors.contact_number = `Contact Number must be EXACTLY 10 digits. Entered: ${contactDigits.length} digits.`;
      } else {
        const existingPid = await isContactNumberDuplicate(contactDigits, data.participant_id);
        if (existingPid) {
          newErrors.contact_number = `Duplicate Contact Number: Mobile ${contactDigits} is already registered to Participant ${existingPid}. Duplicate numbers are not accepted.`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(prev => ({ ...prev, ...newErrors }));
      const firstMsg = Object.values(newErrors)[0];
      notify("error", "Validation Error", firstMsg);
      return;
    }

    setStep(1);
    setQPage(0);
  };

  const validatePlausibilityRanges = () => {
    const checks = [
      { keys: ["waist_hip_ratio", "whr", "custom_whr", "q72", "custom_q72"], min: 0.60, max: 1.40, label: "Waist-Hip Ratio" },
      { keys: ["bmi", "custom_bmi", "q69", "custom_q69"], min: 10.0, max: 60.0, label: "BMI" },
      { keys: ["sys_bp", "systolic", "sbp", "custom_sys_bp", "sys_bp_1", "sys_bp_2"], min: 70, max: 260, label: "Systolic Blood Pressure (mmHg)" },
      { keys: ["dia_bp", "diastolic", "dbp", "custom_dia_bp", "dia_bp_1", "dia_bp_2"], min: 40, max: 160, label: "Diastolic Blood Pressure (mmHg)" },
      { keys: ["rbs", "blood_sugar", "custom_rbs"], min: 30, max: 600, label: "Random Blood Sugar (RBS mg/dL)" },
      { keys: ["hb", "haemoglobin", "custom_hb"], min: 3.0, max: 20.0, label: "Haemoglobin (Hb g/dL)" },
      { keys: ["age", "custom_age", "q1", "custom_q1"], min: 18, max: 100, label: "Age (years)" }
    ];

    for (const check of checks) {
      for (const key of check.keys) {
        const val = data[key];
        if (val !== undefined && val !== null && val !== "") {
          const num = parseFloat(val);
          if (!isNaN(num) && (num < check.min || num > check.max)) {
            notify("error", "Plausibility Range Error", `${check.label} must be between ${check.min} and ${check.max}. Entered value: ${num}`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmitRoleForm = async (e) => {
    e.preventDefault();

    // 1. Compulsory Safety Validation: PHQ-9 Item 9 (Q64) positive requires Q65 escalation
    const q64Val = data.q64 || data.custom_q64;
    const q65Val = data.q65 || data.custom_q65;
    if (q64Val !== undefined && q64Val !== null && q64Val !== "" && q64Val !== "0" && q64Val !== "Not at all" && q64Val !== "0 pts") {
      const isQ65Blank = q65Val === undefined || q65Val === null || q65Val === "" || (Array.isArray(q65Val) && q65Val.length === 0);
      if (isQ65Blank) {
        notify("error", "Compulsory Safety Warning", "PHQ-9 Item 9 (Q64) indicates self-harm risk. The form CANNOT be submitted where Q65 Escalation Protocol field is blank.");
        return;
      }
    }

    // 2. Plausibility Range Checks at entry
    if (!validatePlausibilityRanges()) {
      return;
    }

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
      
      // Instantly update local initiated participants registry for real-time Admin Participant Directory sync
      try {
        const existingStr = localStorage.getItem('ncd_local_initiated_participants');
        const existingList = existingStr ? JSON.parse(existingStr) : [];
        const updatedList = [payload, ...existingList.filter(p => (p.participant_id || p.mem_scrn_part_id) !== payload.participant_id)];
        localStorage.setItem('ncd_local_initiated_participants', JSON.stringify(updatedList));
        localStorage.setItem('ncd_offline_queue', JSON.stringify(updatedList));
      } catch (err) {}

      const contactDigits = String(data.contact_number || "").replace(/\D/g, "");
      if (contactDigits.length === 10) {
        registerContactNumber(contactDigits, data.participant_id);
      }
      incrementParticipantIDCounter(data.location || "Dharavi");

      if (navigator.onLine) {
        try {
          await api.post("/api/v1/screening/submit", payload);
        } catch (apiErr) {
          console.warn("API submission deferred to queue", apiErr);
        }
      }

      const succMsg = isFieldSupervisor 
        ? `Participant ${data.participant_id} demographics saved & sent to Staff Nurse queue.`
        : `Participant ${data.participant_id} updated under ${data.user_role}.`;
      notify("success", isFieldSupervisor ? "Demographics Completed" : "Section Completed", succMsg);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      notify("error", "Save Failed", "Could not save section entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Streamlined, Modern Clinical Entry Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 sm:px-8 py-3 flex items-center justify-between shadow-2xs gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="rounded-full p-1.5 hover:bg-slate-100 transition-colors border border-slate-200 shrink-0 cursor-pointer" title="Back to DEO Portal">
            <ChevronLeft size={18} className="text-slate-700" />
          </button>
          
          <img src="/yrg-logo.png" alt="YRG Care" className="w-8 h-8 object-contain shrink-0" />
          <div className="h-5 w-px bg-slate-200" />
          <Mark size={20} showSub={false} />

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs font-extrabold text-slate-900 font-mono tracking-tight">
              {data.user_role} • {activeUser?.user_code || activeUser?.username || activeUser?.user_name || data.user_name || "SN001"}
            </span>
          </div>
        </div>

        {/* Assigned Location Pill, Operator & Exit Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono shadow-2xs">
            <MapPin size={11} className="text-amber-600 shrink-0" /> Center: {data.location || "Dharavi"}
          </span>

          <span className="hidden md:inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-mono">
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
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-20">
        {isSubmitted ? (
          <div className="max-w-3xl mx-auto py-8 px-2 animate-in zoom-in-95 duration-300 space-y-6">
            
            {/* Hero Success Header (Brand Yellow Gradient & Success Green Tick) */}
            <div className="bg-gradient-to-br from-[#f5d40b] via-[#f7dc38] to-[#e0c20a] rounded-3xl p-8 border border-amber-300/80 shadow-2xl relative overflow-hidden text-slate-900">
              {/* Subtle ambient lighting blur */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 border border-emerald-500 text-white flex items-center justify-center shadow-lg backdrop-blur-md">
                    <CheckCircle2 size={34} />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-emerald-400 border border-slate-800 font-mono shadow-2xs">
                      {isFieldSupervisor ? "Demographics Recorded" : "Section Saved"}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight pt-1">
                    {isFieldSupervisor ? "Screening Initiated Successfully!" : "Clinical Entry Transmitted!"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                    Participant Record <span className="font-mono font-black text-[#f5d40b] bg-slate-900 px-2.5 py-0.5 rounded-lg shadow-2xs">{data.participant_id}</span> has been processed and saved.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Participant ID</span>
                <p className="text-sm font-black text-slate-900 font-mono truncate">{data.participant_id}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Screening Center</span>
                <p className="text-sm font-bold text-slate-900 truncate">{data.location || "Dharavi"} Center</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Submitted By</span>
                <p className="text-sm font-bold text-slate-900 truncate">{data.user_role}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Current Queue</span>
                <p className="text-xs font-black text-[#4a4a4c] bg-[#f5d40b]/30 px-2 py-1 rounded-lg border border-[#f5d40b]/50 inline-block font-mono truncate">
                  {isFieldSupervisor ? "Staff Nurse Queue" : "Active Pipeline"}
                </p>
              </div>
            </div>

            {/* Multi-Role Clinical Pipeline Progress Tracker */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                    Participant Workflow Pipeline Progression
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 font-mono">Stage 1 of 4 Completed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-800 font-mono">Stage 1</span>
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  </div>
                  <p className="text-xs font-black text-emerald-950">Field Supervisor</p>
                  <p className="text-[10px] font-bold text-emerald-700 font-mono">Demographics Completed</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-800 font-mono">Stage 2</span>
                    <Clock size={14} className="text-amber-600 animate-pulse" />
                  </div>
                  <p className="text-xs font-black text-amber-950">Staff Nurse</p>
                  <p className="text-[10px] font-bold text-amber-800 font-mono">Queued (Sections 2-7)</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 opacity-60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Stage 3</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">Doctor Exam</p>
                  <p className="text-[10px] font-medium text-slate-500 font-mono">Pending (Sections 8-11)</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 opacity-60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Stage 4</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">Counselor / Linkage</p>
                  <p className="text-[10px] font-medium text-slate-500 font-mono">Pending (Sections 12-16)</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={onSubmit}
                className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-[#f5d40b] text-[#4a4a4c] font-black text-xs hover:bg-[#e0c20a] transition-all shadow-md border border-[#e5c40a] cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Return to Dashboard Workstation</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform text-[#4a4a4c]" />
              </button>

              <button
                onClick={() => {
                  incrementParticipantIDCounter(data.location || "Dharavi");
                  const nextId = generateParticipantID(data.location || "Dharavi");
                  setIsSubmitted(false);
                  setStep(0);
                  setQPage(0);
                  setData({
                    participant_id: nextId,
                    screening_date: currentDateFormatted,
                    raw_date: new Date().toISOString().split('T')[0],
                    contact_number: "",
                    fullName: "",
                    age: "",
                    gender: "Male",
                    location: data.location || "Dharavi",
                    user_name: data.user_name || "",
                    user_role: data.user_role || "Field Supervisor"
                  });
                }}
                className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs transition-all border border-slate-300 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} className="text-amber-600" />
                <span>Initiate Next Participant Screening</span>
              </button>
            </div>

          </div>
        ) : (
        <div className="max-w-6xl w-full mx-auto space-y-6">

          {/* STEP 0: PARTICIPANT SELECTION & INITIAL HEADER */}
          {step === 0 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Participant Selection & Screening Overview
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select an existing participant record or verify Participant ID, screening date, and contact details to proceed.
                  </p>
                </div>
                <div className="relative flex items-center gap-1.5 bg-amber-50 text-amber-950 border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold shadow-2xs">
                  <MapPin size={13} className="text-amber-700 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-900">Center:</span>
                  <select
                    value={data.location || "Dharavi"}
                    onChange={(e) => {
                      const selectedLoc = e.target.value;
                      const newPid = generateParticipantID(selectedLoc);
                      localStorage.setItem('ncd_active_location', selectedLoc);
                      setData(prev => ({
                        ...prev,
                        location: selectedLoc,
                        participant_id: newPid
                      }));
                      if (notify) notify("info", "Location Center Switched", `Switched center to ${selectedLoc}. Participant ID updated to ${newPid}.`);
                    }}
                    className="bg-transparent font-black text-amber-950 outline-none cursor-pointer text-xs font-mono pr-1"
                    title="Switch Workstation Location Center"
                  >
                    <option value="Dharavi">Dharavi Center (DH)</option>
                    <option value="Malvani">Malvani Center (ML)</option>
                    <option value="Vashi">Vashi Center (VA)</option>
                  </select>
                </div>
              </div>

              {/* PARTICIPANT DROPDOWN SELECTOR FOR NON-SUPERVISOR ROLES ONLY */}
              {!isFieldSupervisor && (() => {
                const filteredParticipantsByLocation = availableParticipants.filter(p => {
                  if (!data.location || data.location === "All") return true;
                  const pLoc = String(p.location || "").toLowerCase().trim();
                  const selLoc = String(data.location || "").toLowerCase().trim();
                  const pPrefix = getlocationPrefix(p.location);
                  const selPrefix = getlocationPrefix(data.location);
                  return pLoc.includes(selLoc) || selLoc.includes(pLoc) || pPrefix === selPrefix || (p.id && p.id.includes(`NCD${selPrefix}`));
                });

                return (
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider font-mono text-amber-950 flex items-center gap-1.5">
                        <UserCheck size={14} className="text-amber-700" /> Select Participant from Queue / Database ({data.location}) *
                      </label>
                      <span className="text-[11px] font-bold text-amber-800 font-mono">{filteredParticipantsByLocation.length} Records Available</span>
                    </div>
                    <select 
                      value={data.participant_id} 
                      onChange={(e) => handleParticipantSelect(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-amber-300 text-sm font-bold text-slate-900 font-mono outline-none shadow-2xs cursor-pointer focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">-- Choose Participant ID for {data.location} Center --</option>
                      {filteredParticipantsByLocation.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.id} ({p.age ? `${p.age} yrs` : 'Demographics Recorded'}, {p.gender || 'Completed'}) [{p.location || data.location}]
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              {/* Initial Participant Details Card (Field Supervisor only) */}
              {isFieldSupervisor && (
                <div className="border border-slate-200 rounded-2xl bg-slate-50/80 text-slate-900 p-6 shadow-2xs space-y-6">
                  
                  {/* Row 1: Participant ID, Screening Date, Contact Number */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Column 1: Participant ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                        <User size={13} className="text-amber-600" /> Participant ID *
                      </label>
                      <input 
                        type="text" 
                        value={data.participant_id} 
                        readOnly
                        disabled
                        className="w-full bg-slate-100 border border-slate-300 text-slate-700 font-mono font-bold text-sm outline-none px-3.5 py-2.5 rounded-xl shadow-2xs cursor-not-allowed select-none"
                        placeholder="NCD-MUM-XXXXX"
                      />
                      {fieldErrors.participant_id && (
                        <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle size={13} className="text-red-600 shrink-0" />
                          <span>{fieldErrors.participant_id}</span>
                        </p>
                      )}
                    </div>

                    {/* Column 2: Screening Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                        <Calendar size={13} className="text-amber-600" /> Screening Date *
                      </label>
                      <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 shadow-2xs relative">
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
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Phone size={13} className="text-amber-600" /> Contact Number *
                        </label>
                        <span className="text-amber-900 font-bold text-[10px] font-mono">(10 Digits)</span>
                      </div>
                      <input 
                        type="tel" 
                        value={data.contact_number || ""} 
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (/\D/.test(raw)) {
                            notify("error", "Numeric Digits Only", "Contact Number must contain numbers 0-9 only.");
                          }
                          const digitsOnly = raw.replace(/\D/g, '');
                          if (digitsOnly.length > 10) {
                            notify("error", "Exceeded 10 Digits", "Contact Number cannot exceed 10 digits.");
                          }
                          set("contact_number")(digitsOnly.slice(0, 10));
                        }}
                        placeholder="Enter 10-digit number"
                        maxLength={10}
                        className="w-full bg-white border border-slate-300 text-slate-900 font-mono text-sm outline-none px-3.5 py-2.5 rounded-xl shadow-2xs focus:border-amber-500"
                      />
                      {fieldErrors.contact_number && (
                        <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle size={13} className="text-red-600 shrink-0" />
                          <span>{fieldErrors.contact_number}</span>
                        </p>
                      )}
                    </div>

                  </div>

                </div>
              )}

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
                  className="px-7 py-3 rounded-full text-xs font-black bg-[#f5d40b] text-[#4a4a4c] hover:bg-[#e0c20a] transition-all flex items-center gap-2.5 shadow-sm cursor-pointer border border-[#e5c40a]"
                >
                  <span>Proceed to {data.user_role} Modules</span>
                  <ArrowRight size={15} className="text-[#4a4a4c]" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 1: ROLE SPECIFIC MODULES */}
          {step === 1 && (
            <form 
              onSubmit={handleSubmitRoleForm} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                  e.preventDefault();
                }
              }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200"
            >
              
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {data.user_role} • {activeUser?.user_code || activeUser?.username || activeUser?.user_name || data.user_name || "SN001"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium font-mono">
                    Participant ID: <strong className="text-slate-900 font-bold">{data.participant_id}</strong> {data.age ? `• Age: ${data.age}` : ''} {data.gender ? `• ${data.gender}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {resumeFeatureEnabled && (
                    <button
                      type="button"
                      onClick={handlePauseSession}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs font-mono"
                    >
                      <PauseCircle size={14} className="text-amber-700" />
                      <span>Pause Session</span>
                    </button>
                  )}
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white font-mono">
                    Role: {data.user_role}
                  </span>
                </div>
              </div>

              {/* Active Survey Session Banner */}
              {activeDraft && resumeFeatureEnabled && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <PauseCircle size={18} className="text-amber-700 shrink-0" />
                    <div>
                      <span className="font-extrabold uppercase text-amber-900 block">Paused Session Found for {activeDraft.participant_id}</span>
                      <span className="text-[11px] text-amber-800 font-medium">
                        Saved on {new Date(activeDraft.updatedAt).toLocaleTimeString()} (Page {activeDraft.page + 1})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleResumeDraft}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-amber-950 hover:bg-amber-400 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 font-mono"
                    >
                      <Play size={13} />
                      <span>Resume Session</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 font-mono"
                    >
                      <Trash2 size={13} className="text-red-500" />
                      <span>Discard</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Survey Builder Questions Renderer */}
              {(() => {
                const filteredCustomQuestions = activeCustomQuestions;
                if (filteredCustomQuestions.length === 0) return null;

                // Build section-aware page batches (1 Question per page for precise skip logic)
                const qPagesList = [];
                let currentPage = [];
                let qCountOnPage = 0;

                filteredCustomQuestions.forEach((q) => {
                  const isHeader = q.type === 'section_header' || String(q.id || '').startsWith('sec_');
                  
                  if (isHeader) {
                    if (qCountOnPage > 0) {
                      if (currentPage.length > 0) qPagesList.push(currentPage);
                      currentPage = [q];
                      qCountOnPage = 0;
                    } else {
                      currentPage.push(q);
                    }
                  } else {
                    currentPage.push(q);
                    qCountOnPage++;
                    if (qCountOnPage >= 1) {
                      qPagesList.push(currentPage);
                      currentPage = [];
                      qCountOnPage = 0;
                    }
                  }
                });

                if (currentPage.length > 0) {
                  qPagesList.push(currentPage);
                }

                const totalQPages = qPagesList.length > 0 ? qPagesList.length : 1;
                const safeQPage = Math.min(qPage, Math.max(0, totalQPages - 1));
                const startIdx = qPagesList.slice(0, safeQPage).reduce((acc, p) => acc + p.length, 0);
                const currentBatch = qPagesList[safeQPage] || [];

                return (
                  <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    {/* Clean Page Indicator */}
                    <div className="text-xs font-bold text-slate-700 font-mono border-b border-slate-100 pb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-900 font-extrabold uppercase">
                        <FileText size={14} className="text-amber-600" /> Question Page {safeQPage + 1} of {totalQPages}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold">
                        Question {safeQPage + 1} of {totalQPages}
                      </span>
                    </div>

                    {currentBatch.map((q, idx) => {
                      const absoluteIdx = startIdx + idx;
                      const qType = q.type || 'short_text';
                      const opts = Array.isArray(q.options) ? q.options : [];
                      
                      if (qType === 'section_header' || String(q.id || '').startsWith('sec_')) {
                        return (
                          <div key={q.id || absoluteIdx} className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/5 border border-amber-300/80 shadow-2xs font-mono my-2">
                            <h3 className="text-xs font-black text-amber-950 tracking-wider uppercase flex items-center gap-2">
                              <Bookmark size={15} className="text-amber-600 shrink-0" />
                              <span>{q.title}</span>
                            </h3>
                          </div>
                        );
                      }

                      // Determine view mode for question (Defaults to Grid layout first for all options)
                      const userMode = viewModes[q.id];
                      const effectiveMode = userMode || "grid";
                      const qTitleDisplay = String(q.title || "").match(/^Q\d+/i) ? q.title : `${absoluteIdx + 1}. ${q.title}`;

                    return (
                      <div key={q.id || absoluteIdx} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-all">
                        
                        {/* Question Header & Layout View Switcher (First Grid, Second Dropdown) */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <label className="block text-xs sm:text-sm font-extrabold text-slate-900 leading-relaxed flex-1">
                            {qTitleDisplay} {q.required && <span className="text-red-500">*</span>}
                          </label>

                          {opts.length > 0 && (
                            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 shadow-2xs shrink-0 font-mono">
                              <button
                                type="button"
                                title="Grid / Pills View"
                                onClick={() => setViewModes(prev => ({ ...prev, [q.id]: "grid" }))}
                                className={`px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer ${effectiveMode === "grid" ? 'bg-[#f5d40b] text-[#4a4a4c] font-black shadow-2xs' : 'text-slate-500 font-bold hover:bg-slate-200/60'}`}
                              >
                                <LayoutGrid size={12} />
                                <span>Grid</span>
                              </button>
                              <button
                                type="button"
                                title="Dropdown View"
                                onClick={() => setViewModes(prev => ({ ...prev, [q.id]: "dropdown" }))}
                                className={`px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer ${effectiveMode === "dropdown" ? 'bg-[#f5d40b] text-[#4a4a4c] font-black shadow-2xs' : 'text-slate-500 font-bold hover:bg-slate-200/60'}`}
                              >
                                <ChevronDown size={12} />
                                <span>Dropdown</span>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Custom Score Cards (Q23 HSI, Q61 GAD-7, Q64 PHQ-9, Q30 AUDIT-C) evaluated BEFORE short_text */}
                        {(q.id === "q23" || (q.title && q.title.toLowerCase().includes("q23"))) ? (
                          <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between shadow-2xs font-mono">
                              <div>
                                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                                  Heaviness of Smoking Index (Q21 + Q22) Score
                                </span>
                                <div className="flex items-baseline gap-1.5 pt-1">
                                  <span className="text-3xl font-black text-amber-950">
                                    {data.q23 !== undefined ? data.q23 : (data.custom_q23 !== undefined ? data.custom_q23 : 0)}
                                  </span>
                                  <span className="text-base font-bold text-amber-700">/ 6</span>
                                </div>
                              </div>
                              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 shadow-2xs">
                                Auto-Calculated
                              </span>
                            </div>

                            {(() => {
                              const score = parseInt(data.q23 !== undefined ? data.q23 : (data.custom_q23 !== undefined ? data.custom_q23 : 0), 10);
                              if (score >= 4) {
                                return (
                                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 font-bold text-xs space-y-1 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-2 font-mono font-black text-red-700 uppercase">
                                      <AlertCircle size={16} className="text-red-600 shrink-0" />
                                      <span>High Nicotine Dependence (Score: {score} / 6)</span>
                                    </div>
                                    <p className="text-xs text-red-800 leading-relaxed font-medium">
                                      A score of 4 or more indicates high dependence and automatically routes participant to tobacco cessation counselling at Q111.
                                    </p>
                                  </div>
                                );
                              } else if (score >= 1) {
                                return (
                                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs space-y-1 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-2 font-mono font-black text-amber-800 uppercase">
                                      <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                                      <span>Moderate / Low Dependence (Score: {score} / 6)</span>
                                    </div>
                                    <p className="text-xs text-amber-800 font-medium">
                                      Routine tobacco cessation advice provided.
                                    </p>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono font-semibold">
                                    Score: 0 / 6 — Low / No Nicotine Dependence
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        ) : (q.id === "q61" || (q.title && (q.title.toLowerCase().includes("q61") || (q.title.toLowerCase().includes("gad") && q.title.toLowerCase().includes("score"))))) ? (
                          <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-md font-mono my-2 animate-in fade-in duration-200">
                            <div className="bg-[#b4c6ff] text-slate-950 px-5 py-3 font-extrabold text-sm border-b border-slate-600">
                              Q61. GAD-7 total score:
                            </div>
                            <div className="bg-[#242426] text-white px-5 py-4 flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={21}
                                  placeholder="___"
                                  value={data[`custom_${q.id}`] !== undefined ? data[`custom_${q.id}`] : (data[q.id] !== undefined ? data[q.id] : '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val !== '') {
                                      const num = parseInt(val, 10);
                                      if (isNaN(num) || num < 0 || num > 21) {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Score: GAD-7 total score must be a number between 0 and 21." }));
                                        if (notify) notify("error", "Invalid GAD-7 Score", "GAD-7 total score cannot exceed 21.");
                                        return;
                                      } else {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                      }
                                    } else {
                                      setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                    }
                                    updateCustomField(q, val);
                                  }}
                                  className="w-24 bg-transparent font-black text-2xl text-amber-400 border-b-2 border-amber-400 text-center outline-none"
                                />
                                <span className="text-xl font-bold text-slate-300">/ 21</span>
                              </div>
                              <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
                                Score Input
                              </span>
                            </div>
                            <div className="bg-[#32343a] text-slate-200 px-5 py-3 text-xs italic font-medium border-t border-slate-700 leading-relaxed">
                              Bands: 0 to 4 minimal, 5 to 9 mild, 10 to 14 moderate, 15 to 21 severe. 10 or more is clinically significant.
                            </div>
                          </div>
                        ) : (q.id === "q64" || (q.title && (q.title.toLowerCase().includes("q64") || (q.title.toLowerCase().includes("phq") && q.title.toLowerCase().includes("score"))))) ? (
                          <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-md font-mono my-2 animate-in fade-in duration-200">
                            <div className="bg-[#b4c6ff] text-slate-950 px-5 py-3 font-extrabold text-sm border-b border-slate-600">
                              Q64. PHQ-9 total score:
                            </div>
                            <div className="bg-[#242426] text-white px-5 py-4 flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={27}
                                  placeholder="___"
                                  value={data[`custom_${q.id}`] !== undefined ? data[`custom_${q.id}`] : (data[q.id] !== undefined ? data[q.id] : '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val !== '') {
                                      const num = parseInt(val, 10);
                                      if (isNaN(num) || num < 0 || num > 27) {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Score: PHQ-9 total score must be a number between 0 and 27." }));
                                        if (notify) notify("error", "Invalid PHQ-9 Score", "PHQ-9 total score cannot exceed 27.");
                                        return;
                                      } else {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                      }
                                    } else {
                                      setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                    }
                                    updateCustomField(q, val);
                                  }}
                                  className="w-24 bg-transparent font-black text-2xl text-amber-400 border-b-2 border-amber-400 text-center outline-none"
                                />
                                <span className="text-xl font-bold text-slate-300">/ 27</span>
                              </div>
                              <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
                                Score Input
                              </span>
                            </div>
                            <div className="bg-[#32343a] text-slate-200 px-5 py-3 text-xs italic font-medium border-t border-slate-700 leading-relaxed">
                              Bands: 0 to 4 minimal, 5 to 9 mild, 10 to 14 moderate, 15 to 19 moderately severe, 20 to 27 severe. 10 or more is clinically significant.
                            </div>
                          </div>
                        ) : (q.id === "q30" || (q.title && (q.title.toLowerCase().includes("q30") || (q.title.toLowerCase().includes("audit") && q.title.toLowerCase().includes("score"))))) ? (
                          <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-md font-mono my-2 animate-in fade-in duration-200">
                            <div className="bg-[#b4c6ff] text-slate-950 px-5 py-3 font-extrabold text-sm border-b border-slate-600">
                              Q30. AUDIT-C Total Score:
                            </div>
                            <div className="bg-[#242426] text-white px-5 py-4 flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={12}
                                  placeholder="___"
                                  value={data[`custom_${q.id}`] !== undefined ? data[`custom_${q.id}`] : (data[q.id] !== undefined ? data[q.id] : '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val !== '') {
                                      const num = parseInt(val, 10);
                                      if (isNaN(num) || num < 0 || num > 12) {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Score: AUDIT-C total score must be a number between 0 and 12." }));
                                        if (notify) notify("error", "Invalid AUDIT-C Score", "AUDIT-C total score cannot exceed 12.");
                                        return;
                                      } else {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                      }
                                    } else {
                                      setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                    }
                                    updateCustomField(q, val);
                                  }}
                                  className="w-24 bg-transparent font-black text-2xl text-amber-400 border-b-2 border-amber-400 text-center outline-none"
                                />
                                <span className="text-xl font-bold text-slate-300">/ 12</span>
                              </div>
                              <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
                                Auto-Calculated
                              </span>
                            </div>
                            <div className="bg-[#32343a] text-slate-200 px-5 py-3 text-xs italic font-medium border-t border-slate-700 leading-relaxed">
                              Bands: Positive screen is 4 or more for men, 3 or more for women and transgender participants.
                            </div>
                          </div>
                        ) : qType === 'short_text' ? (
                          <input 
                            type="text" 
                            placeholder="Enter text response..." 
                            value={data[`custom_${q.id}`] || data[q.id] || ''} 
                            onChange={(e) => updateCustomField(q, e.target.value)} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs" 
                          />
                        ) : qType === 'number' ? (
                          <input 
                            type="number" 
                            placeholder="Enter numerical value..." 
                            value={data[`custom_${q.id}`] || data[q.id] || ''} 
                            onChange={(e) => {
                              const val = e.target.value;
                              const isAgeQ = q.id === 'q1' || String(q.title || '').toLowerCase().includes('q1. age') || String(q.title || '').toLowerCase().includes('age');
                              if (isAgeQ && val) {
                                const numVal = parseInt(val, 10);
                                if (numVal > 120 || val.length > 3) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Age: Age must be a valid number between 1 and 120 years (cannot enter 4-digit values)." }));
                                  if (notify) notify("error", "Invalid Age Input", "Age cannot exceed 3 digits or 120 years.");
                                  return;
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }
                              updateCustomField(q, val);
                            }} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 font-mono shadow-2xs" 
                          />
                        ) : null}

                        {/* Single Choice (Custom Dropdown vs Grid/Pills) */}
                        {(qType === 'dropdown' || qType === 'single_choice' || qType === 'radio') && (
                          effectiveMode === 'dropdown' ? (
                            <div className="relative">
                              {(() => {
                                const curVal = data[`custom_${q.id}`] || data[q.id] || '';
                                const isOpen = !!openSingleDropdowns[q.id];
                                const selectedOpt = opts.find(o => getOptionLabel(o) === curVal);
                                const selectedLabel = selectedOpt ? getOptionLabel(selectedOpt) : '';
                                const selectedCode = selectedOpt ? getOptionCode(selectedOpt, opts.indexOf(selectedOpt)) : '';

                                return (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => setOpenSingleDropdowns(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 flex items-center justify-between shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2 truncate font-mono">
                                        {curVal ? (
                                          <span className="text-slate-900 font-bold flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-950 font-bold text-[11px]">{selectedCode}</span>
                                            <span>{selectedLabel}</span>
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 font-normal">-- Select Option ({opts.length} choices) --</span>
                                        )}
                                      </div>
                                      <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isOpen && (
                                      <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl p-2 border border-slate-200 shadow-xl space-y-1 animate-in fade-in duration-150 max-h-64 overflow-y-auto">
                                        {opts.map((opt, oIdx) => {
                                          const labelText = getOptionLabel(opt);
                                          const codeText = getOptionCode(opt, oIdx);
                                          const isSelected = curVal === labelText;

                                          const handleSelect = () => {
                                            updateCustomField(q, labelText);
                                            // IMMEDIATELY CLOSE DROPDOWN DRAWER AFTER SELECTING!
                                            setOpenSingleDropdowns(prev => ({ ...prev, [q.id]: false }));
                                          };

                                          return (
                                            <div 
                                              key={oIdx} 
                                              onClick={handleSelect} 
                                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${isSelected ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <input type="radio" checked={isSelected} onChange={() => {}} className="text-amber-600 focus:ring-0 cursor-pointer" />
                                                <span>{labelText}</span>
                                              </div>
                                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-bold">{codeText}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2.5 pt-1">
                              {opts.map((opt, oIdx) => {
                                const labelText = getOptionLabel(opt);
                                const codeText = getOptionCode(opt, oIdx);
                                const isSel = (data[`custom_${q.id}`] || data[q.id]) === labelText;
                                return (
                                  <label 
                                    key={oIdx} 
                                    onClick={() => updateCustomField(q, labelText)} 
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${isSel ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs ring-1 ring-amber-400' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                  >
                                    <input type="radio" checked={isSel} onChange={() => {}} className="text-amber-600 focus:ring-0 cursor-pointer" />
                                    <span>{labelText}</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">{codeText}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )
                        )}

                        {/* Multi-Choice (Multi-Select Dropdown vs Grid/Pills) */}
                        {(qType === 'multi_choice' || qType === 'checkbox') && (
                          (effectiveMode === 'dropdown' || effectiveMode === 'multi') ? (
                            <div className="relative">
                              {(() => {
                                const curVal = data[`custom_${q.id}`] || data[q.id];
                                const curArr = Array.isArray(curVal) ? curVal : [];
                                const isOpen = !!openMultiDropdowns[q.id];

                                return (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => setOpenMultiDropdowns(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 flex items-center justify-between shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2 truncate font-mono">
                                        <CheckSquare size={15} className="text-amber-600 shrink-0" />
                                        {curArr.length === 0 ? (
                                          <span className="text-slate-400 font-normal">-- Select Multiple Options ({opts.length} options available) --</span>
                                        ) : (
                                          <span className="text-amber-950 font-bold">
                                            {curArr.length} Selected: {curArr.map(x => getOptionLabel(x)).join(", ")}
                                          </span>
                                        )}
                                      </div>
                                      <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isOpen && (
                                      <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl p-3 border border-slate-200 shadow-xl space-y-2 animate-in fade-in duration-150 max-h-64 overflow-y-auto">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-mono font-bold text-slate-500">
                                          <span>Select Options (1 to {opts.length})</span>
                                          <div className="flex items-center gap-3">
                                            <button 
                                              type="button" 
                                              onClick={() => updateCustomField(q, [])}
                                              className="text-amber-700 hover:underline cursor-pointer"
                                            >
                                              Clear All
                                            </button>
                                            <button 
                                              type="button" 
                                              onClick={() => setOpenMultiDropdowns(prev => ({ ...prev, [q.id]: false }))}
                                              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px] hover:bg-black transition-colors cursor-pointer"
                                            >
                                              Done ✓
                                            </button>
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          {opts.map((opt, oIdx) => {
                                            const labelText = getOptionLabel(opt);
                                            const codeText = getOptionCode(opt, oIdx);
                                            const isChecked = curArr.some(x => getOptionLabel(x) === labelText);

                                            const titleLower = String(q.title || "").toLowerCase();
                                            const isQ9 = titleLower.includes("q9") || titleLower.includes("tobacco") || titleLower.includes("substance");

                                            const toggleOpt = () => {
                                              if (isQ9) {
                                                const isExclusiveCode16 = codeText === "16" || labelText.toLowerCase().includes("none");
                                                if (isExclusiveCode16) {
                                                  if (!isChecked) updateCustomField(q, [opt]);
                                                  else updateCustomField(q, []);
                                                } else {
                                                  const filtered = curArr.filter(x => {
                                                    const xCode = getOptionCode(x);
                                                    const xLabel = getOptionLabel(x).toLowerCase();
                                                    return xCode !== "16" && !xLabel.includes("none");
                                                  });
                                                  if (isChecked) {
                                                    updateCustomField(q, filtered.filter(x => getOptionLabel(x) !== labelText));
                                                  } else {
                                                    updateCustomField(q, [...filtered, opt]);
                                                  }
                                                }
                                              } else {
                                                if (isChecked) {
                                                  updateCustomField(q, curArr.filter(x => getOptionLabel(x) !== labelText));
                                                } else {
                                                  updateCustomField(q, [...curArr, opt]);
                                                }
                                              }
                                            };

                                            return (
                                              <label 
                                                key={oIdx} 
                                                onClick={toggleOpt} 
                                                className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${isChecked ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded text-amber-600 focus:ring-0 cursor-pointer" />
                                                  <span>{labelText}</span>
                                                </div>
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-bold">{codeText}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                              {opts.map((opt, oIdx) => {
                                const labelText = getOptionLabel(opt);
                                const codeText = getOptionCode(opt, oIdx);
                                const curVal = data[`custom_${q.id}`] || data[q.id];
                                const curArr = Array.isArray(curVal) ? curVal : [];
                                const isChecked = curArr.some(x => getOptionLabel(x) === labelText);

                                const titleLower = String(q.title || "").toLowerCase();
                                const isQ9 = titleLower.includes("q9") || titleLower.includes("tobacco") || titleLower.includes("substance");

                                const toggleOpt = () => {
                                  if (isQ9) {
                                    const isExclusiveCode16 = codeText === "16" || labelText.toLowerCase().includes("none");
                                    if (isExclusiveCode16) {
                                      if (!isChecked) updateCustomField(q, [opt]);
                                      else updateCustomField(q, []);
                                    } else {
                                      const filtered = curArr.filter(x => {
                                        const xCode = getOptionCode(x);
                                        const xLabel = getOptionLabel(x).toLowerCase();
                                        return xCode !== "16" && !xLabel.includes("none");
                                      });
                                      if (isChecked) {
                                        updateCustomField(q, filtered.filter(x => getOptionLabel(x) !== labelText));
                                      } else {
                                        updateCustomField(q, [...filtered, opt]);
                                      }
                                    }
                                  } else {
                                    if (isChecked) {
                                      updateCustomField(q, curArr.filter(x => getOptionLabel(x) !== labelText));
                                    } else {
                                      updateCustomField(q, [...curArr, opt]);
                                    }
                                  }
                                };

                                return (
                                  <label 
                                    key={oIdx} 
                                    onClick={toggleOpt} 
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${isChecked ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs ring-1 ring-amber-400' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                  >
                                    <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded text-amber-600 focus:ring-0 cursor-pointer" />
                                    <span>{labelText}</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">{codeText}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )
                        )}

                        {fieldErrors[q.id] && (
                          <div className="mt-3 px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 shadow-2xs">
                            <AlertCircle size={15} className="text-red-600 shrink-0" />
                            <span>{fieldErrors[q.id]}</span>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                );
              })()}

              {/* Fallback Standard Clinical Section Blocks (when customQuestions is empty) */}
              {!hasCustomQuestions && hasPrivilege(1) && (
                <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <User size={14} className="text-amber-600" /> Section 1: Demographics
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">Full Name *</label>
                      <input type="text" value={data.fullName} onChange={(e) => set("fullName")(e.target.value)} placeholder="Enter full name..." className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">Age (Years) *</label>
                      <input type="number" value={data.age} onChange={(e) => set("age")(e.target.value)} placeholder="e.g. 45" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">Gender</label>
                      <select value={data.gender} onChange={(e) => set("gender")(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">Education</label>
                      <select value={data.education} onChange={(e) => set("education")(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none">
                        <option value="Illiterate">Illiterate</option>
                        <option value="Primary School">Primary School</option>
                        <option value="High School">High School</option>
                        <option value="Graduate & Above">Graduate & Above</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">Housing Type</label>
                      <select value={data.housing_type} onChange={(e) => set("housing_type")(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none">
                        <option value="Pucca House">Pucca House</option>
                        <option value="Semi-Pucca">Semi-Pucca</option>
                        <option value="Slum / Kutcha">Slum / Kutcha</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!hasCustomQuestions && hasPrivilege(2) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                    <Stethoscope size={14} className="text-amber-600" /> Section 2: Medical History
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                    {["Hypertension", "Diabetes", "Heart Disease", "Stroke", "Asthma/COPD", "Cancer"].map(cond => (
                      <label key={cond} className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                        <input type="checkbox" defaultChecked={cond === "Hypertension"} className="rounded text-amber-600 focus:ring-amber-500" />
                        <span>{cond}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {!hasCustomQuestions && (hasPrivilege(9) || hasPrivilege(10)) && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <HeartPulse size={14} className="text-amber-700" /> Section 9 & 10: Anthropometry & Vitals
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {hasPrivilege(9) && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Height (cm)</label>
                          <input type="number" value={data.height_cm} onChange={(e) => set("height_cm")(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Weight (kg)</label>
                          <input type="number" value={data.weight_kg} onChange={(e) => set("weight_kg")(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                        </div>
                      </>
                    )}
                    {hasPrivilege(10) && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">BP Systolic</label>
                          <input type="number" value={data.bp_systolic} onChange={(e) => set("bp_systolic")(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">BP Diastolic</label>
                          <input type="number" value={data.bp_diastolic} onChange={(e) => set("bp_diastolic")(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!hasCustomQuestions && hasPrivilege(11) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Activity size={14} className="text-amber-600" /> Section 11: Point-of-Care (POC) Lab Tests
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Random Blood Glucose (mg/dL)</label>
                      <input type="number" value={data.random_blood_glucose} onChange={(e) => set("random_blood_glucose")(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">HbA1c (%)</label>
                      <input type="text" value={data.hba1c} onChange={(e) => set("hba1c")(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Total Cholesterol (mg/dL)</label>
                      <input type="number" value={data.total_cholesterol} onChange={(e) => set("total_cholesterol")(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {!hasCustomQuestions && hasPrivilege(12) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Stethoscope size={14} className="text-amber-600" /> Section 12: Clinical Examinations
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">10-Year CVD Risk Category</label>
                      <select value={data.cvd_risk_assessment} onChange={(e) => set("cvd_risk_assessment")(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none">
                        <option value="Low (<10%)">Low (&lt;10%)</option>
                        <option value="Moderate (10-20%)">Moderate (10-20%)</option>
                        <option value="High (>20%)">High (&gt;20%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Retinopathy Screening</label>
                      <select value={data.retinopathy_exam} onChange={(e) => set("retinopathy_exam")(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none">
                        <option value="Normal">Normal</option>
                        <option value="Mild Retinopathy">Mild Retinopathy</option>
                        <option value="Severe / Immediate Referral">Severe / Immediate Referral</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!hasCustomQuestions && hasPrivilege(13) && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-emerald-700" /> Section 13: Risk Categorisation & Referral
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Overall Doctor Risk Categorisation</label>
                      <select value={data.overall_risk_rating} onChange={(e) => set("overall_risk_rating")(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none">
                        <option value="Low Risk">Low Risk</option>
                        <option value="Moderate Risk">Moderate Risk</option>
                        <option value="High Risk (Priority Referral)">High Risk (Priority Referral)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Referral Hospital / Center Name</label>
                      <input type="text" value={data.referral_hospital} onChange={(e) => set("referral_hospital")(e.target.value)} placeholder="e.g. KEM Hospital" className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {!hasCustomQuestions && hasPrivilege(14) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Link2 size={14} className="text-amber-600" /> Section 14: Linkages and Follow-up Tracking
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Referral Confirmation Date</label>
                      <input type="text" value={data.referral_confirmation_date} onChange={(e) => set("referral_confirmation_date")(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">OPD Appointment Date</label>
                      <input type="text" value={data.opd_appointment_date} onChange={(e) => set("opd_appointment_date")(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 font-mono mb-1">Treatment Adherence Status</label>
                      <select value={data.treatment_adherence_status} onChange={(e) => set("treatment_adherence_status")(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold outline-none">
                        <option value="Regular Adherence">Regular Adherence</option>
                        <option value="Partial Adherence">Partial Adherence</option>
                        <option value="Non-Adherent (Lost to Follow-up)">Non-Adherent (Lost to Follow-up)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!hasCustomQuestions && hasPrivilege(15) && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <UserCheck size={14} className="text-amber-700" /> Section 15: Health Counseling & Behavioral Therapy Notes
                  </h3>
                  <textarea rows={4} value={data.health_counseling_notes} onChange={(e) => set("health_counseling_notes")(e.target.value)} placeholder="Counseling recommendations..." className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs outline-none" />
                </div>
              )}

              {!hasCustomQuestions && hasPrivilege(16) && isExistingParticipant && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <FileText size={14} className="text-amber-600" /> Section 16: Community Perception Notes
                  </h3>
                  <textarea rows={3} value={data.community_perception} onChange={(e) => set("community_perception")(e.target.value)} placeholder="Supervisor observations & community notes..." className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs outline-none" />
                </div>
              )}



              {/* Question Pagination & Submit Controls */}
              {(() => {
                const pagesList = [];
                let curP = [];
                let qCount = 0;
                (activeCustomQuestions || []).forEach(q => {
                  const isH = q.type === 'section_header' || String(q.id || '').startsWith('sec_');
                  if (isH) {
                    if (qCount > 0) {
                      if (curP.length > 0) pagesList.push(curP);
                      curP = [q];
                      qCount = 0;
                    } else {
                      curP.push(q);
                    }
                  } else {
                    curP.push(q);
                    qCount++;
                    if (qCount >= 1) {
                      pagesList.push(curP);
                      curP = [];
                      qCount = 0;
                    }
                  }
                });
                if (curP.length > 0) pagesList.push(curP);

                const totalQPages = pagesList.length > 0 ? pagesList.length : 1;
                const safeQPage = Math.min(qPage, Math.max(0, totalQPages - 1));

                return (
                  <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {safeQPage > 0 ? (
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            setQPage(p => Math.max(0, p - 1));
                          }} 
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <ChevronLeft size={15} />
                          <span>Previous Questions</span>
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            setStep(0);
                          }} 
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-center"
                        >
                          Back to Selection
                        </button>
                      )}

                      {resumeFeatureEnabled && (
                        <button
                          type="button"
                          onClick={handlePauseSession}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs font-mono"
                        >
                          <PauseCircle size={15} className="text-amber-700" />
                          <span>Pause & Resume Later</span>
                        </button>
                      )}
                    </div>

                    {safeQPage < totalQPages - 1 ? (
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (!validateCurrentPageQuestions()) return;
                          setQPage(p => Math.min(totalQPages - 1, p + 1));
                        }} 
                        className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#f5d40b] text-[#4a4a4c] hover:bg-[#e0c20a] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border border-[#e5c40a]"
                      >
                        <span>Next Questions</span>
                        <ArrowRight size={15} className="text-[#4a4a4c]" />
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={submitting} 
                        onClick={(e) => {
                          if (!validateCurrentPageQuestions()) {
                            e.preventDefault();
                          }
                        }}
                        className="px-8 py-3 rounded-xl text-xs font-black bg-[#f5d40b] text-[#4a4a4c] hover:bg-[#e0c20a] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer border border-[#e5c40a]"
                      >
                        <Save size={16} />
                        <span>
                          {submitting 
                            ? "Submitting..." 
                            : isFieldSupervisor 
                              ? "Submit Demographics & Send to Staff Nurse Queue" 
                              : `Submit ${data.user_role} Clinical Entry`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })()}

            </form>
          )}

          {/* Pause Survey Session Confirmation Modal */}
          {isPausedModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center mx-auto shadow-2xs">
                  <PauseCircle size={28} className="text-amber-700" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-black text-slate-900 uppercase font-mono tracking-tight">Survey Session Paused</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Participant <strong className="text-slate-900 font-bold">{data.participant_id}</strong>'s screening progress is safely stored as a draft at <strong className="text-amber-900 font-bold">Page {qPage + 1}</strong>.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900 text-center font-bold">
                  You can safely return to the dashboard or resume anytime.
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPausedModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-amber-950 hover:bg-amber-500 transition-colors shadow-2xs cursor-pointer font-mono"
                  >
                    Continue Editing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPausedModalOpen(false);
                      if (onCancel) onCancel();
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs cursor-pointer font-mono"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        )}
      </main>

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
