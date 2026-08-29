import React, { useState, useEffect } from "react";
import { FileText, ChevronLeft, ChevronDown, Check, Calendar, Phone, User, ShieldCheck, Shield, Clock, PlusCircle, ArrowRight, Save, MapPin, Activity, Stethoscope, HeartPulse, Brain, Link2, CheckCircle2, UserCheck, AlertCircle, AlertTriangle, LayoutGrid, CheckSquare, ListFilter, X, PauseCircle, Play, Trash2, Bookmark } from "lucide-react";
import { T } from "../../lib/theme";
import { saveToQueue, getQueue } from "../../lib/db";
import { api } from "../../lib/api";
import { Mark } from "../../components/ui/Mark";

import { isQuestionSkipped, getOptionCode, getOptionLabel, calculateAuditCScore } from "../../lib/logicEngine";
import { 
  getLocationPrefix, 
  generateNextParticipantID, 
  fetchNextParticipantIDFromDB, 
  getOrLockParticipantID 
} from "../../lib/participantIdGenerator";

export { 
  getLocationPrefix as getlocationPrefix, 
  generateNextParticipantID as generateParticipantID, 
  fetchNextParticipantIDFromDB 
};

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

  const [availableParticipants, setAvailableParticipants] = useState([]);

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
        if (u && (u.location || u.assigned_location || u.loc_code)) return u.location || u.assigned_location || u.loc_code;
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
    fetchNextParticipantIDFromDB(loc).then(freshId => {
      setData(prev => ({
        ...prev,
        location: loc,
        participant_id: freshId || generateParticipantID(loc)
      }));
    });
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [activeDraft, setActiveDraft] = useState(null);
  const [isPausedModalOpen, setIsPausedModalOpen] = useState(false);
  const [showStaffNurseTransferModal, setShowStaffNurseTransferModal] = useState(false);

  const roleLowerCheck = (data.user_role || activeUser?.role_name || activeUser?.role || "").toLowerCase();
  const isStaffNurseRole = roleLowerCheck.includes("nurse") || roleLowerCheck.includes("staff nurse");

  const handleCompleteSelf = () => {
    setShowStaffNurseTransferModal(false);
    setData(prev => ({ ...prev, staff_nurse_section_decided: "self" }));
    if (notify) notify("info", "Staff Nurse Section", "Proceeding to complete Section 2 clinical assessment.");
  };

  const handleTransferToCounselor = async () => {
    setShowStaffNurseTransferModal(false);
    
    const updatedData = {
      ...data,
      staff_nurse_section_decided: "transferred_to_counselor",
      counselor_section_required: true,
      counselor_section_completed: false,
      status: "Transferred to Counselor Queue for Section 8",
      resume_section: 9
    };

    setData(updatedData);

    // Clear active draft so Staff Nurse doesn't re-open Section 8 draft
    localStorage.removeItem('ncd_active_survey_draft');

    try {
      const payload = {
        participant_id: data.participant_id,
        contact_number: data.contact_number,
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        location: data.location,
        status: "Transferred to Counselor Queue for Section 8",
        section: 8,
        survey_data: JSON.stringify(updatedData)
      };
      await saveToQueue(payload);

      try {
        const localStr = localStorage.getItem('ncd_offline_queue') || '[]';
        const localArr = JSON.parse(localStr);
        const existingIdx = localArr.findIndex(x => x.participant_id === data.participant_id);
        if (existingIdx >= 0) {
          localArr[existingIdx] = payload;
        } else {
          localArr.push(payload);
        }
        localStorage.setItem('ncd_offline_queue', JSON.stringify(localArr));
      } catch (err) {}

      if (notify) notify("success", "Participant Transferred", `Participant ${data.participant_id} moved to Counselor Queue for Section 8.`);
    } catch (e) {}

    if (onCancel) onCancel();
    else if (onBack) onBack();
  };

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

  // Real-Time Continuous Auto-Save: Saves active survey draft session
  useEffect(() => {
    if (data && data.participant_id && !submitting) {
      try {
        const draft = {
          participant_id: data.participant_id,
          page: qPage,
          data: data,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('ncd_active_survey_draft', JSON.stringify(draft));
        localStorage.setItem(`ncd_draft_${data.participant_id}`, JSON.stringify(draft));
      } catch (err) {}
    }
  }, [step, data, qPage, submitting]);

  // Protected Mode: Tab reload & close warning listener during active survey session
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step === 1 && !submitting) {
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
    const loc = data.location || activeCenterLoc || "Dharavi";
    if (customQuestions && customQuestions.length > 0) {
      const q3 = customQuestions.find(q => {
        const titleLower = String(q.title || "").toLowerCase();
        const idLower = String(q.id || "").toLowerCase();
        return idLower === "q3" || titleLower.startsWith("q3") || titleLower.includes("site") || titleLower.includes("location");
      });
      if (q3) {
        const customKey = `custom_${q3.id}`;
        setData(d => ({
          ...d,
          q3: loc,
          custom_q3: loc,
          location: loc,
          [customKey]: loc,
          [q3.id]: loc
        }));
      }
    }
  }, [customQuestions, data.location, activeCenterLoc]);

  // Auto-calculate 6 core clinical fields: BMI, WHR, Avg BP, HSI (Q23), AUDIT-C (Q30), Amber Review Date
  useEffect(() => {
    setData(d => {
      let updates = {};

      // 1. BMI Calculation: Q67 (Height in cm) & Q68 (Weight in kg) -> Q69 (BMI)
      let htCm = parseFloat(d.q67 || d.custom_q67 || d.height || d.Q67 || 0);
      let wt = parseFloat(d.q68 || d.custom_q68 || d.weight || d.Q68 || 0);

      // Dynamic search for Q67 (Height) and Q68 (Weight) across all data keys
      if (!htCm || !wt) {
        Object.keys(d).forEach(k => {
          const kLower = k.toLowerCase();
          const valNum = parseFloat(d[k]);
          if (!isNaN(valNum) && valNum > 0) {
            if (!htCm && (kLower.includes("q67") || kLower.includes("height"))) htCm = valNum;
            if (!wt && (kLower.includes("q68") || kLower.includes("weight"))) wt = valNum;
          }
        });
      }

      if (wt > 0 && htCm > 0) {
        const htM = htCm / 100;
        const calcBmi = (wt / (htM * htM)).toFixed(2);
        if (d.bmi !== calcBmi || d.custom_q69 !== calcBmi || d.q69 !== calcBmi) {
          updates.bmi = calcBmi;
          updates.custom_bmi = calcBmi;
          updates.q69 = calcBmi;
          updates.custom_q69 = calcBmi;
          updates.Q69 = calcBmi;
          Object.keys(d).forEach(k => {
            if (k.toLowerCase().includes("q69") || k.toLowerCase().includes("bmi")) {
              if (d[k] !== calcBmi) updates[k] = calcBmi;
            }
          });
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

      // 5. AUDIT-C Total (Q30 = Q27 + Q28 + Q29)
      const auditRes = calculateAuditCScore(d);
      if (auditRes.hasAnyAnswer) {
        const auditScore = auditRes.score;
        const q30Key = Object.keys(d).find(k => k.toLowerCase().includes("q30")) || "custom_q30";
        if (d[q30Key] !== auditScore || d.q30 !== auditScore || d.custom_q30 !== auditScore || d.audit_score !== auditScore) {
          updates.q30 = auditScore;
          updates.custom_q30 = auditScore;
          updates.audit_score = auditScore;
          updates.AUDIT_C_score = auditScore;
          updates[q30Key] = auditScore;
        }
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
        fetchNextParticipantIDFromDB(loc).then(freshId => {
          setData(d => ({
            ...d,
            user_name: u.username || "DEO",
            user_role: role,
            location: loc,
            participant_id: freshId || `NCD${getlocationPrefix(loc)}0001`
          }));
        });
      } catch (e) {}
    }

    // Fetch active backend list & combine with local queue
    const loadAllParticipants = async () => {
      let idbQueue = [];
      try {
        idbQueue = await getQueue();
      } catch (e) {}

      let localInitiated = [];
      try {
        const initStr = localStorage.getItem('ncd_local_initiated_participants');
        if (initStr) {
          const parsed = JSON.parse(initStr);
          if (Array.isArray(parsed)) localInitiated = parsed;
        }
      } catch (e) {}

      let offlineQueue = [];
      try {
        const offStr = localStorage.getItem('ncd_offline_queue');
        if (offStr) {
          const parsed = JSON.parse(offStr);
          if (Array.isArray(parsed)) offlineQueue = parsed;
        }
      } catch (e) {}

      let rawList = [];
      try {
        const res = await api.get("/api/v1/dashboard/screeninglist");
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          rawList = res.data;
        }
      } catch (e) {}

      const allRecords = [...localInitiated, ...offlineQueue, ...(Array.isArray(idbQueue) ? idbQueue : []), ...rawList];
      const seenIds = new Set();
      const uniqueParticipants = [];

      try {
        const usedIdsRaw = localStorage.getItem('ncd_used_participant_ids');
        const usedSet = new Set(usedIdsRaw ? JSON.parse(usedIdsRaw) : []);
        allRecords.forEach(r => {
          let extra = {};
          if (r.mem_scrn_q30) { try { extra = typeof r.mem_scrn_q30 === 'string' ? JSON.parse(r.mem_scrn_q30) : r.mem_scrn_q30; } catch(e) {} }
          const pId = r.participant_id || r.mem_scrn_part_id || extra.participant_id;
          if (pId) usedSet.add(String(pId).toUpperCase().trim());
        });
        localStorage.setItem('ncd_used_participant_ids', JSON.stringify(Array.from(usedSet)));
      } catch (e) {}

      const activeLoc = data.location || activeCenterLoc || "Dharavi";
      fetchNextParticipantIDFromDB(activeLoc).then(freshParticipantId => {
        setData(d => ({
          ...d,
          participant_id: freshParticipantId
        }));
      });

      allRecords.forEach((r, idx) => {
        let rawPayload = {};
        if (r.mem_scrn_q30) {
          try { rawPayload = typeof r.mem_scrn_q30 === 'string' ? JSON.parse(r.mem_scrn_q30) : r.mem_scrn_q30; } catch (e) {}
        }

        let surveyData = {};
        if (r.survey_data) {
          try { surveyData = typeof r.survey_data === 'string' ? JSON.parse(r.survey_data) : r.survey_data; } catch (e) {}
        } else if (rawPayload.survey_data) {
          try { surveyData = typeof rawPayload.survey_data === 'string' ? JSON.parse(rawPayload.survey_data) : rawPayload.survey_data; } catch (e) {}
        }

        const combined = { ...rawPayload, ...surveyData, ...r };

        const partId = r.participant_id || r.mem_scrn_part_id || combined.participant_id || (r.mem_scrn_id ? `NCD-MUM-${r.mem_scrn_id}` : (r.id ? `NCD-MUM-${r.id}` : null));
        
        if (!partId || partId.includes("undefined") || seenIds.has(partId)) {
          return;
        }

        seenIds.add(partId);

        const nameVal = combined.fullName || r.fullName || r.mem_scrn_q16;
        const displayName = (nameVal && nameVal !== "Unnamed Participant") ? nameVal : partId;
        const ageVal = combined.age || r.age || r.mem_scrn_q1 || "45";
        const genderVal = combined.gender || r.gender || (r.mem_scrn_q2 == "1" ? "Male" : "Female");
        const locVal = combined.location || r.location || r.mem_scrn_q17 || "Dharavi";
        const statusVal = combined.status || r.status || "Demographics Completed";

        uniqueParticipants.push({
          id: partId,
          name: displayName,
          age: ageVal,
          gender: genderVal,
          location: locVal,
          status: statusVal,
          counselor_section_required: Boolean(combined.counselor_section_required || String(statusVal).toLowerCase().includes("counselor")),
          counselor_section_completed: Boolean(combined.counselor_section_completed || String(statusVal).toLowerCase().includes("counseling completed")),
          bp: combined.bp_systolic ? `${combined.bp_systolic}/${combined.bp_diastolic}` : "130/84",
          glucose: combined.random_blood_glucose || "135",
          rawPayload: combined
        });
      });

      if (uniqueParticipants.length > 0) {
        setAvailableParticipants(uniqueParticipants);
      }
    };

    loadAllParticipants();
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
  
  let rawPrivileges = loggedInUser?.privileges || activeUser?.privileges;
  if (typeof rawPrivileges === 'string') {
    try { rawPrivileges = JSON.parse(rawPrivileges); } catch (e) { rawPrivileges = null; }
  }
  let userPrivileges = Array.isArray(rawPrivileges) ? rawPrivileges : null;
  if (userPrivileges === null) {
    const rLower = (data.user_role || activeUser?.role_name || activeUser?.role || "").toLowerCase();
    userPrivileges = rLower.includes("nurse") ? [2, 3, 4, 5, 6, 7, 9, 10, 11]
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

  // Trigger Staff Nurse Transfer Modal ONLY when Staff Nurse actively navigates to Section 8 and HAS Section 8 privilege
  useEffect(() => {
    if (!isStaffNurseRole || !hasPrivilege(8) || data.staff_nurse_section_decided) return;
    if (step < 1 || !data.participant_id) return;

    const activeQs = activeCustomQuestions;
    if (!activeQs || activeQs.length === 0) return;

    const pagesList = [];
    let curP = [];
    let qCount = 0;
    activeQs.forEach(q => {
      const isH = q.type === 'section_header' || String(q.id || '').startsWith('sec_');
      if (isH) {
        if (curP.length > 0) {
          pagesList.push(curP);
          curP = [];
          qCount = 0;
        }
        curP.push(q);
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

    if (pagesList.length <= 1) return;

    const safeQPage = Math.min(qPage, Math.max(0, pagesList.length - 1));
    if (safeQPage === 0) return;

    const currentBatch = pagesList[safeQPage] || [];

    const isSection8Page = currentBatch.some(q => {
      const secNum = parseInt(q.section, 10);
      const titleLower = String(q.title || '').toLowerCase();
      const idLower = String(q.id || '').toLowerCase();
      return (
        secNum === 8 || 
        titleLower.includes("section 8") || 
        titleLower.includes("sec 8") || 
        idLower.includes("sec_8") || 
        idLower === "sec_8" || 
        titleLower.includes("section  8")
      );
    });

    if (isSection8Page) {
      setShowStaffNurseTransferModal(true);
    }
  }, [step, qPage, activeCustomQuestions, isStaffNurseRole, data.participant_id, data.staff_nurse_section_decided]);

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
      const rawP = found.rawPayload || {};
      let surData = {};
      try {
        surData = typeof rawP.survey_data === 'string' ? JSON.parse(rawP.survey_data) : (rawP.survey_data || {});
      } catch (e) {}

      setData(d => ({
        ...d,
        ...(found.rawPayload || {}),
        ...surData,
        participant_id: found.id,
        age: String(found.age),
        gender: found.gender,
        location: found.location,
        user_role: activeUser?.role_name || activeUser?.role || d.user_role
      }));

      notify("info", "Participant Selected", `Loaded details for Participant ${found.id}. Proceeding to ${activeUser?.role_name || data.user_role || "Clinical"} modules.`);
      setStep(1);

      const userRoleCheck = (activeUser?.role_name || data.user_role || "").toLowerCase();
      const isCounselor = userRoleCheck.includes("counselor");

      if (isCounselor) {
        if (isSec15Pending || surData.counselor_sec15_required) {
          setQPage(14); // Section 15
        } else {
          setQPage(7); // Section 8
        }
      } else if (isStaffNurseRole) {
        if (surData.counselor_section_completed || surData.resume_section === 9 || surData.next_section === 9) {
          setQPage(8); // Section 9
        } else {
          setQPage(0);
        }
      } else {
        setQPage(0);
      }
    }
  };

  const isQ3LocationQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q3" || titleL.startsWith("q3.") || titleL.startsWith("q3 ") || (titleL.includes("q3") && (titleL.includes("site") || titleL.includes("location")));
  };

  const isGadTotalQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    if (titleL.includes("item") || titleL.includes("response") || titleL.includes("feeling") || titleL.includes("nervous")) return false;
    return idL === "q61_score" || idL === "gad_total" || titleL.includes("gad-7 total score") || titleL.includes("gad-7 score") || (titleL.includes("gad") && titleL.includes("total score"));
  };

  const isPhqTotalQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    if (titleL.includes("item") || titleL.includes("response") || titleL.includes("thoughts") || titleL.includes("self-harm") || titleL.includes("bothered")) return false;
    return idL === "q63_score" || idL === "phq_total" || titleL.includes("phq-9 total score") || titleL.includes("phq-9 score") || (titleL.includes("phq") && titleL.includes("total score"));
  };

  const isAuditTotalQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    if (titleL.includes("often") || titleL.includes("how many") || titleL.includes("drink")) return false;
    return idL === "q30" || titleL.includes("audit-c total score") || titleL.includes("audit-c score") || (titleL.includes("audit") && titleL.includes("total score"));
  };

  const isBmiQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    if (titleL.includes("height") || titleL.includes("weight") || titleL.includes("q67") || titleL.includes("q68")) return false;
    return idL === "q69" || idL.includes("bmi") || titleL.includes("body mass index") || titleL.includes("bmi");
  };

  const isWhrQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    if (titleL.includes("waist circumference") || titleL.includes("hip circumference") || titleL.includes("q70") || titleL.includes("q71")) return false;
    return idL === "q72" || idL.includes("whr") || titleL.includes("waist-hip") || titleL.includes("whr");
  };

  const isQ74PulseQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q74" || idL.includes("q74") || titleL.includes("q74") || titleL.includes("pulse");
  };

  const isQ75BP1Question = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q75" || idL.includes("q75") || titleL.includes("q75") || (titleL.includes("blood pressure") && titleL.includes("reading 1"));
  };

  const isQ76BP2Question = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q76" || idL.includes("q76") || titleL.includes("q76") || (titleL.includes("blood pressure") && titleL.includes("reading 2"));
  };

  const isQ77AvgBPQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q77" || idL.includes("q77") || titleL.includes("q77") || titleL.includes("average blood pressure") || titleL.includes("avg bp") || titleL.includes("average bp");
  };

  const isQ78SpO2Question = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q78" || idL.includes("q78") || titleL.includes("q78") || titleL.includes("spo2") || titleL.includes("oxygen saturation");
  };

  const isQ79RbsQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q79" || idL.includes("q79") || titleL.includes("q79") || titleL.includes("random blood sugar") || titleL.includes("rbs");
  };

  const isQ80HbQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q80" || idL.includes("q80") || titleL.includes("q80") || titleL.includes("haemoglobin") || titleL.includes("hemoglobin");
  };

  const isQ93FollowupDateQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase().trim();
    const titleL = String(q.title || "").toLowerCase().trim();
    const typeL = String(q.type || "").toLowerCase().trim();
    if (idL === "q93" || idL.includes("q93") || idL.includes("sec_12_q93") || idL.includes("q_93")) return true;
    if (titleL.includes("q93") || (titleL.includes("follow-up") && titleL.includes("date")) || (titleL.includes("appointment") && titleL.includes("date")) || (titleL.includes("review") && titleL.includes("date"))) return true;
    if (typeL === 'date' && (idL.includes('93') || titleL.includes('93'))) return true;
    return false;
  };

  const isAutoCalculatedQuestion = (q) => {
    if (!q) return false;
    if (q.type === 'calculated' || q.type === 'computed' || q.type === 'readonly' || q.readOnly || q.required === false) return true;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    if (titleL.includes("auto-calculated") || titleL.includes("autocalculated") || titleL.includes("index total") || titleL.includes("total score")) return true;
    if (idL.includes("q23") || titleL.includes("q23") || titleL.includes("heaviness of smoking")) return true;
    if (idL.includes("q30") || titleL.includes("q30") || titleL.includes("audit-c")) return true;
    if (idL.includes("q69") || idL.includes("bmi") || titleL.includes("q69") || titleL.includes("body mass index") || titleL.includes("bmi")) return true;
    if (idL.includes("q72") || idL.includes("whr") || titleL.includes("q72") || titleL.includes("waist-hip")) return true;
    return false;
  };

  const isMatrixQuestion = (q) => {
    if (!q) return false;
    const qIdLower = String(q.id || "").toLowerCase();
    const qTitleLower = String(q.title || "").toLowerCase();
    const qTypeLower = String(q.type || "").toLowerCase();

    if (qTypeLower === 'matrix' || qTypeLower === 'grid' || qTypeLower === 'table') return true;
    if (qIdLower.includes('q86') || qTitleLower.includes('q86') || qTitleLower.includes('fat loss')) return true;
    if (qIdLower.includes('q87') || qTitleLower.includes('q87') || qTitleLower.includes('muscle loss')) return true;
    if (q.rows && Array.isArray(q.rows) && q.rows.length > 0) return true;
    if (q.matrix_rows && Array.isArray(q.matrix_rows) && q.matrix_rows.length > 0) return true;
    return false;
  };

  const getMatrixRows = (q) => {
    if (!q) return [];
    if (q.rows && Array.isArray(q.rows) && q.rows.length > 0) return q.rows;
    if (q.matrix_rows && Array.isArray(q.matrix_rows) && q.matrix_rows.length > 0) return q.matrix_rows;

    const qIdLower = String(q.id || "").toLowerCase();
    const qTitleLower = String(q.title || "").toLowerCase();

    if (qIdLower.includes('q86') || qTitleLower.includes('q86') || qTitleLower.includes('fat loss')) {
      return [
        { id: "row_1", label: "1. Temple / Orbital Region (Fat pad under eyes)" },
        { id: "row_2", label: "2. Clavicle / Subclavicular Region" },
        { id: "row_3", label: "3. Thoracic / Rib Region" },
        { id: "row_4", label: "4. Deltoid / Shoulder Region" },
        { id: "row_5", label: "5. Quadriceps / Thigh Region" },
        { id: "row_6", label: "6. Calf / Lower Leg Region" }
      ];
    }

    if (qIdLower.includes('q87') || qTitleLower.includes('q87') || qTitleLower.includes('muscle loss')) {
      return [
        { id: "row_1", label: "1. Temple (Temporalis muscle)" },
        { id: "row_2", label: "2. Clavicle (Pectoralis & Deltoid)" },
        { id: "row_3", label: "3. Shoulder (Acromion process)" },
        { id: "row_4", label: "4. Scapula (Infraspinatus & Supraspinatus)" },
        { id: "row_5", label: "5. Hands (Interosseous muscle)" },
        { id: "row_6", label: "6. Quadriceps (Anterior thigh)" },
        { id: "row_7", label: "7. Calf (Gastrocnemius)" }
      ];
    }

    return [
      { id: "row_1", label: "1. Parameter / Assessment Site 1" },
      { id: "row_2", label: "2. Parameter / Assessment Site 2" },
      { id: "row_3", label: "3. Parameter / Assessment Site 3" }
    ];
  };

  const getMatrixCols = (q) => {
    if (!q) return [];
    if (q.cols && Array.isArray(q.cols) && q.cols.length > 0) return q.cols;
    if (q.columns && Array.isArray(q.columns) && q.columns.length > 0) return q.columns;

    return [
      { code: "1", label: "Normal (No loss)" },
      { code: "2", label: "Mild loss" },
      { code: "3", label: "Moderate loss" },
      { code: "4", label: "Severe loss" }
    ];
  };

  const isQ88HandGripQuestion = (q) => {
    if (!q) return false;
    const idL = String(q.id || "").toLowerCase();
    const titleL = String(q.title || "").toLowerCase();
    return idL === "q88" || idL.includes("q88") || titleL.includes("q88") || titleL.includes("hand-grip") || titleL.includes("hand grip");
  };

  const getQuestionValue = (q) => {
    if (!q || !q.id) return undefined;
    
    if (isQ3LocationQuestion(q)) {
      const q3Loc = data[`custom_${q.id}`] || data[q.id] || data.q3 || data.custom_q3 || data.location || activeCenterLoc || "Dharavi";
      if (q3Loc !== undefined && q3Loc !== null && String(q3Loc).trim() !== "") {
        return String(q3Loc).trim();
      }
    }

    if (isQ88HandGripQuestion(q)) {
      const val = data.q88_avg || data.q88 || data.custom_q88 || data.q88_reading1 || data[`custom_${q.id}`] || data[q.id];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        return String(val).trim();
      }
    }

    if (isMatrixQuestion(q)) {
      const mRows = getMatrixRows(q);
      let answeredCount = 0;
      mRows.forEach((row, rIdx) => {
        const rowKey = typeof row === 'object' ? row.id || `row_${rIdx + 1}` : `row_${rIdx + 1}`;
        const matrixValKey = `${q.id}_${rowKey}`;
        const val = data[matrixValKey] || (data[q.id] && data[q.id][rowKey]);
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          answeredCount++;
        }
      });
      if (answeredCount > 0) {
        return `${answeredCount} of ${mRows.length} assessed`;
      }
      return undefined;
    }

    if (data[q.id] !== undefined && data[q.id] !== null && data[q.id] !== "") return data[q.id];
    if (data[`custom_${q.id}`] !== undefined && data[`custom_${q.id}`] !== null && data[`custom_${q.id}`] !== "") return data[`custom_${q.id}`];

    const qIdLower = String(q.id).toLowerCase();
    const qTitleLower = String(q.title || "").toLowerCase();

    if (qIdLower.includes("q23") || qTitleLower.includes("q23") || qTitleLower.includes("heaviness of smoking")) {
      const hsiVal = data.q23 ?? data.custom_q23 ?? data.hsi_score;
      if (hsiVal !== undefined && hsiVal !== null && hsiVal !== "") return hsiVal;
    }

    if (qIdLower.includes("q30") || qTitleLower.includes("q30") || qTitleLower.includes("audit-c")) {
      const auditVal = data.q30 ?? data.custom_q30 ?? data.audit_score;
      if (auditVal !== undefined && auditVal !== null && auditVal !== "") return auditVal;
    }

    if (qIdLower.includes("q69") || qIdLower.includes("bmi") || qTitleLower.includes("q69") || qTitleLower.includes("body mass index") || qTitleLower.includes("bmi")) {
      const bmiVal = data.bmi ?? data.custom_bmi ?? data.q69 ?? data.custom_q69;
      if (bmiVal !== undefined && bmiVal !== null && bmiVal !== "") return bmiVal;
    }

    if (qIdLower.includes("q72") || qIdLower.includes("whr") || qTitleLower.includes("q72") || qTitleLower.includes("waist-hip") || qTitleLower.includes("whr")) {
      const whrVal = data.whr ?? data.custom_whr ?? data.q72 ?? data.custom_q72 ?? data.waist_hip_ratio;
      if (whrVal !== undefined && whrVal !== null && whrVal !== "") return whrVal;
    }

    const qNumMatch = qIdLower.match(/^q(\d+)/) || qTitleLower.match(/^q(\d+)/);
    if (qNumMatch) {
      const qNum = `q${qNumMatch[1]}`;
      const foundKey = Object.keys(data).find(k => k.toLowerCase() === qNum || k.toLowerCase() === `custom_${qNum}`);
      if (foundKey && data[foundKey] !== undefined && data[foundKey] !== null && data[foundKey] !== "") {
        return data[foundKey];
      }
    }

    return undefined;
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
      
      // Auto-calculated fields are derived by system engine and never block page navigation
      if (isAutoCalculatedQuestion(q)) {
        continue;
      }

      const val = getQuestionValue(q);
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

    // Save initiated record once on Proceeding past Step 0
    if (isFieldSupervisor && data.participant_id) {
      const pId = data.participant_id;
      const nameVal = data.fullName || data.mem_scrn_q16 || pId;
      const locVal = data.location || "Dharavi";
      const ageVal = data.age || data.mem_scrn_q1 || "45";
      const genderVal = data.gender || (data.mem_scrn_q2 == "1" ? "Male" : "Female");

      const newRecord = {
        id: pId,
        participant_id: pId,
        mem_scrn_part_id: pId,
        name: nameVal,
        fullName: nameVal,
        age: ageVal,
        gender: genderVal,
        location: locVal,
        status: "Demographics Recorded",
        rawPayload: { ...data }
      };

      let currentLocals = [];
      try {
        const existingStr = localStorage.getItem('ncd_local_initiated_participants');
        if (existingStr) {
          const parsed = JSON.parse(existingStr);
          if (Array.isArray(parsed)) currentLocals = parsed;
        }
      } catch (e) {}

      const filteredLocals = currentLocals.filter(r => (r.participant_id || r.mem_scrn_part_id || r.id) !== pId);
      filteredLocals.unshift(newRecord);
      localStorage.setItem('ncd_local_initiated_participants', JSON.stringify(filteredLocals));

      setAvailableParticipants(prev => {
        const exists = prev.some(item => item.id === pId);
        if (exists) {
          return prev.map(item => item.id === pId ? { ...item, name: nameVal, age: ageVal, gender: genderVal, location: locVal, rawPayload: { ...data } } : item);
        } else {
          return [newRecord, ...prev];
        }
      });
    }

    setStep(1);
    setQPage(0);
  };

  const validatePlausibilityRanges = () => {
    const checks = [
      { keys: ["q67", "custom_q67", "height", "Q67"], min: 50.0, max: 250.0, label: "Q67. Height (cm)" },
      { keys: ["q68", "custom_q68", "weight", "Q68"], min: 10.0, max: 300.0, label: "Q68. Weight (kg)" },
      { keys: ["bmi", "custom_bmi", "q69", "custom_q69", "Q69"], min: 10.0, max: 60.0, label: "Q69. BMI (kg/m²)" },
      { keys: ["waist", "q70", "custom_q70", "Q70"], min: 30.0, max: 200.0, label: "Q70. Waist Circumference (cm)" },
      { keys: ["hip", "q71", "custom_q71", "Q71"], min: 30.0, max: 200.0, label: "Q71. Hip Circumference (cm)" },
      { keys: ["waist_hip_ratio", "whr", "custom_whr", "q72", "custom_q72", "Q72"], min: 0.40, max: 2.00, label: "Q72. Waist-Hip Ratio" },
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
      const userRoleStr = (data.user_role || activeUser?.role_name || "").toLowerCase();
      const isCounselorSubmission = userRoleStr.includes("counselor");
      const isCoordinatorSubmission = userRoleStr.includes("coordinator");

      let cSec8Done = Boolean(data.counselor_section_completed);
      let cSec15Req = Boolean(data.counselor_sec15_required);
      let cSec15Done = Boolean(data.counselor_sec15_completed);
      let statusVal = data.status || "Clinical Entry Completed";
      let queueVal = data.current_queue || "Active Pipeline";
      let nextSec = data.section || 2;

      if (isCounselorSubmission) {
        if (data.counselor_sec15_required || qPage >= 13) {
          cSec15Done = true;
          statusVal = "Section 15 Health Counseling Completed";
          queueVal = "Completed";
          nextSec = 16;
        } else {
          cSec8Done = true;
          statusVal = "Section 8 Counseling Completed - Ready for Nurse (Sec 9)";
          queueVal = "Staff Nurse Queue";
          nextSec = 9;
        }
      } else if (isCoordinatorSubmission) {
        cSec15Req = true;
        cSec15Done = false;
        statusVal = "Section 14 Completed - Counselor Queue for Sec 15";
        queueVal = "Counselor Queue (Sec 15)";
        nextSec = 15;
      }

      const payload = {
        ...data,
        mem_scrn_part_id: data.participant_id,
        mem_scrn_q16: data.fullName,
        mem_scrn_q1: parseInt(data.age) || 0,
        mem_scrn_q2: data.gender === "Male" ? "1" : "2",
        mem_scrn_q17: data.location,
        submitted_by_role: data.user_role,
        submitted_at: new Date().toISOString(),
        counselor_section_completed: cSec8Done,
        counselor_sec15_required: cSec15Req,
        counselor_sec15_completed: cSec15Done,
        status: statusVal,
        current_queue: queueVal,
        section: nextSec
      };

      await saveToQueue(payload);
      
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

      if (navigator.onLine) {
        try {
          await api.post("/api/v1/screening/submit", payload);
        } catch (apiErr) {
          console.warn("API submission deferred to queue", apiErr);
        }
      }

      const succMsg = isFieldSupervisor 
        ? `Participant ${data.participant_id} demographics saved & sent to Staff Nurse queue.`
        : isCounselorSubmission
          ? cSec15Done
            ? `Section 15 Health Counseling completed for Participant ${data.participant_id}!`
            : `Section 8 Counseling completed! Participant ${data.participant_id} moved back to Staff Nurse Queue for Section 9.`
          : isCoordinatorSubmission
            ? `Section 14 Linkages completed! Participant ${data.participant_id} sent back to Counselor Queue for Section 15 Health Counseling.`
            : `Participant ${data.participant_id} updated under ${data.user_role}.`;

      notify("success", isCounselorSubmission ? "Counseling Completed" : (isCoordinatorSubmission ? "Section 14 Completed" : (isFieldSupervisor ? "Demographics Completed" : "Section Completed")), succMsg);
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
                onClick={async () => {
                  const nextId = await fetchNextParticipantIDFromDB(data.location || "Dharavi");
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
              </div>

              {/* PARTICIPANT DROPDOWN SELECTOR FOR NON-SUPERVISOR ROLES ONLY */}
              {!isFieldSupervisor && (() => {
                const isCounselorLogin = (data.user_role || activeUser?.role_name || "").toLowerCase().includes("counselor");

                const filteredParticipantsByLocation = availableParticipants.filter(p => {
                  // Location Filter
                  if (data.location && data.location !== "All") {
                    const pLoc = String(p.location || "").toLowerCase().trim();
                    const selLoc = String(data.location || "").toLowerCase().trim();
                    const pidUpper = String(p.id || "").toUpperCase().trim();
                    const pPrefix = getlocationPrefix(p.location);
                    const selPrefix = getlocationPrefix(data.location);

                    let locMatch = false;
                    if (selLoc.includes("vashi") || selPrefix === "VA") {
                      locMatch = pLoc.includes("vashi") || pLoc.includes("va") || pidUpper.includes("NCDVA") || (pidUpper.includes("VA") && !pidUpper.includes("NCDDH") && !pidUpper.includes("NCDML"));
                    } else if (selLoc.includes("malvani") || selPrefix === "ML") {
                      locMatch = pLoc.includes("malvani") || pLoc.includes("ml") || pidUpper.includes("NCDML") || (pidUpper.includes("ML") && !pidUpper.includes("NCDDH") && !pidUpper.includes("NCDVA"));
                    } else if (selLoc.includes("dharavi") || selPrefix === "DH") {
                      locMatch = pLoc.includes("dharavi") || pLoc.includes("dh") || pidUpper.includes("NCDDH") || (pidUpper.includes("DH") && !pidUpper.includes("NCDML") && !pidUpper.includes("NCDVA"));
                    } else {
                      locMatch = pLoc.includes(selLoc) || selLoc.includes(pLoc) || pPrefix === selPrefix || pidUpper.includes(`NCD${selPrefix}`);
                    }

                    if (!locMatch) return false;
                  }
                  return true;
                });

                return (
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider font-mono text-amber-950 flex items-center gap-1.5">
                        <UserCheck size={14} className="text-amber-700" /> 
                        Select Initiated Participant from Center ({data.location}) *
                      </label>
                      <span className="text-[11px] font-bold text-amber-800 font-mono">
                        {filteredParticipantsByLocation.length} Initiated Records Available
                      </span>
                    </div>
                    <select 
                      value={data.participant_id} 
                      onChange={(e) => handleParticipantSelect(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-amber-300 text-sm font-bold text-slate-900 font-mono outline-none shadow-2xs cursor-pointer focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">
                        {filteredParticipantsByLocation.length > 0 
                          ? `-- Choose Participant ID for ${data.location} Center --` 
                          : `-- No Initiated Participants for ${data.location} Center --`}
                      </option>
                      {filteredParticipantsByLocation.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.id} ({p.name || p.fullName || 'Initiated'}, {p.age ? `${p.age} yrs` : ''}) [{p.location || data.location}]
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

                          {isQ3LocationQuestion(q) ? (
                            <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs shrink-0">
                              Auto-Fetched (Read-Only)
                            </span>
                          ) : opts.length > 0 ? (
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
                          ) : null}
                        </div>
                        
                        {/* Non-editable, clean readable Q3 Site Location input field */}
                        {(isQ3LocationQuestion(q)) ? (
                          <div className="w-full relative">
                            <input 
                              type="text" 
                              readOnly 
                              disabled 
                              value={data[`custom_${q.id}`] || data[q.id] || data.q3 || data.custom_q3 || data.location || activeCenterLoc || "Dharavi"} 
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100/90 text-xs sm:text-sm font-extrabold text-slate-900 outline-none cursor-not-allowed select-none shadow-2xs font-sans" 
                            />
                          </div>
                        ) : (q.id === "q23" || (q.title && q.title.toLowerCase().includes("q23"))) ? (
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
                        ) : (isGadTotalQuestion(q)) ? (
                          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs font-sans my-2 bg-white animate-in fade-in duration-200">
                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/90 flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-slate-800 font-mono tracking-wider">
                                GAD-7 Total Score
                              </span>
                              <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
                                Score Input
                              </span>
                            </div>
                            <div className="p-5 bg-white flex items-center justify-between gap-4">
                              <div className="flex items-baseline gap-2 font-mono">
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
                                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 focus:border-amber-400 rounded-xl font-mono font-black text-2xl text-slate-900 text-center outline-none transition-all shadow-inner"
                                />
                                <span className="text-base font-bold text-slate-400">/ 21</span>
                              </div>
                            </div>
                            <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200/90 text-xs font-medium text-slate-600 leading-relaxed font-sans">
                              <span className="font-bold text-slate-800">Clinical Bands:</span> 0–4 minimal, 5–9 mild, 10–14 moderate, 15–21 severe. (Score 10 or higher is clinically significant).
                            </div>
                          </div>
                        ) : (isPhqTotalQuestion(q)) ? (
                          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs font-sans my-2 bg-white animate-in fade-in duration-200">
                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/90 flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-slate-800 font-mono tracking-wider">
                                PHQ-9 Total Score
                              </span>
                              <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
                                Score Input
                              </span>
                            </div>
                            <div className="p-5 bg-white flex items-center justify-between gap-4">
                              <div className="flex items-baseline gap-2 font-mono">
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
                                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 focus:border-amber-400 rounded-xl font-mono font-black text-2xl text-slate-900 text-center outline-none transition-all shadow-inner"
                                />
                                <span className="text-base font-bold text-slate-400">/ 27</span>
                              </div>
                            </div>
                            <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200/90 text-xs font-medium text-slate-600 leading-relaxed font-sans">
                              <span className="font-bold text-slate-800">Clinical Bands:</span> 0–4 minimal, 5–9 mild, 10–14 moderate, 15–19 moderately severe, 20–27 severe. (Score 10 or higher is clinically significant).
                            </div>
                          </div>
                        ) : (isAuditTotalQuestion(q)) ? (
                          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs font-sans my-2 bg-white animate-in fade-in duration-200">
                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/90 flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-slate-800 font-mono tracking-wider">
                                AUDIT-C Total Score
                              </span>
                              <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
                                Auto-Calculated
                              </span>
                            </div>
                            <div className="p-5 bg-white flex items-center justify-between gap-4">
                              <div className="flex items-baseline gap-2 font-mono">
                                <input
                                  type="number"
                                  min={0}
                                  max={12}
                                  placeholder="___"
                                  value={getFieldValue(q) !== undefined && getFieldValue(q) !== null ? getFieldValue(q) : (data.q30 ?? data.custom_q30 ?? data.audit_score ?? '')}
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
                                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 focus:border-amber-400 rounded-xl font-mono font-black text-2xl text-slate-900 text-center outline-none transition-all shadow-inner"
                                />
                                <span className="text-base font-bold text-slate-400">/ 12</span>
                              </div>
                            </div>
                            <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200/90 text-xs font-medium text-slate-600 leading-relaxed font-sans">
                              <span className="font-bold text-slate-800">Clinical Bands:</span> Positive screen is 4 or more for men, 3 or more for women and transgender participants.
                            </div>
                          </div>
                        ) : (isBmiQuestion(q)) ? (
                          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs font-sans my-2 bg-white animate-in fade-in duration-200">
                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/90 flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-slate-800 font-mono tracking-wider">
                                Q69. Body Mass Index (BMI)
                              </span>
                              <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 font-extrabold shadow-2xs">
                                Formula: Weight (kg) / [Height (m)]²
                              </span>
                            </div>
                            <div className="p-5 bg-white flex items-center justify-between gap-4">
                              <div className="flex items-baseline gap-3 font-mono">
                                <input
                                  type="text"
                                  readOnly
                                  disabled
                                  placeholder="0.00"
                                  value={data[`custom_${q.id}`] || data[q.id] || data.bmi || data.q69 || ''}
                                  className="w-32 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-black text-2xl text-slate-900 text-center outline-none cursor-not-allowed select-none shadow-2xs"
                                />
                                <span className="text-base font-bold text-slate-400">kg/m²</span>
                              </div>

                              {(() => {
                                const bmiNum = parseFloat(data[`custom_${q.id}`] || data[q.id] || data.bmi || data.q69 || 0);
                                let category = "Pending Q67 Height & Q68 Weight";
                                let badgeColor = "bg-slate-100 text-slate-700 border-slate-300";

                                if (bmiNum > 0) {
                                  if (bmiNum < 18.5) {
                                    category = "Underweight (< 18.5)";
                                    badgeColor = "bg-sky-50 text-sky-900 border-sky-300 font-bold";
                                  } else if (bmiNum <= 24.9) {
                                    category = "Normal / Healthy (18.5 - 24.9)";
                                    badgeColor = "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold";
                                  } else if (bmiNum <= 29.9) {
                                    category = "Overweight (25.0 - 29.9)";
                                    badgeColor = "bg-amber-50 text-amber-900 border-amber-300 font-bold";
                                  } else {
                                    category = "Obese (≥ 30.0)";
                                    badgeColor = "bg-red-50 text-red-900 border-red-300 font-bold";
                                  }
                                }

                                return (
                                  <div className="flex flex-col items-end gap-1 font-mono">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-2xs ${badgeColor}`}>
                                      {category}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold">
                                      Height: {data.q67 || data.custom_q67 || data.height || '—'} cm | Weight: {data.q68 || data.custom_q68 || data.weight || '—'} kg
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="px-5 py-3 bg-slate-50/80 text-slate-600 text-xs font-medium border-t border-slate-200/90 leading-relaxed flex items-center justify-between font-sans">
                              <span>Auto-computed from Q67 (Height) & Q68 (Weight). Plausibility range: 10.0 to 60.0 kg/m².</span>
                              <span className="font-bold text-amber-900 font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">Auto-Locked</span>
                            </div>
                          </div>
                        ) : (isWhrQuestion(q)) ? (
                          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs font-sans my-2 bg-white animate-in fade-in duration-200">
                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/90 flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-slate-800 font-mono tracking-wider">
                                Q72. Waist-Hip Ratio (WHR)
                              </span>
                              <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 font-extrabold shadow-2xs">
                                Formula: Waist (cm) / Hip (cm)
                              </span>
                            </div>
                            <div className="p-5 bg-white flex items-center justify-between gap-4">
                              <div className="flex items-baseline gap-3 font-mono">
                                <input
                                  type="text"
                                  readOnly
                                  disabled
                                  placeholder="0.00"
                                  value={data[`custom_${q.id}`] || data[q.id] || data.whr || data.q72 || data.waist_hip_ratio || ''}
                                  className="w-32 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-black text-2xl text-slate-900 text-center outline-none cursor-not-allowed select-none shadow-2xs"
                                />
                                <span className="text-base font-bold text-slate-400">ratio</span>
                              </div>

                              {(() => {
                                const whrNum = parseFloat(data[`custom_${q.id}`] || data[q.id] || data.whr || data.q72 || data.waist_hip_ratio || 0);
                                const genderStr = String(data.gender || data.mem_scrn_q2 || "").toLowerCase();
                                const isFemale = genderStr.includes("female") || genderStr.includes("woman");
                                const highRiskThreshold = isFemale ? 0.85 : 0.90;

                                let category = "Pending Q70 Waist & Q71 Hip";
                                let badgeColor = "bg-slate-100 text-slate-700 border-slate-300";

                                if (whrNum > 0) {
                                  if (whrNum < highRiskThreshold) {
                                    category = `Low Risk (< ${highRiskThreshold})`;
                                    badgeColor = "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold";
                                  } else {
                                    category = `Substantial / High Risk (≥ ${highRiskThreshold})`;
                                    badgeColor = "bg-red-50 text-red-900 border-red-300 font-bold";
                                  }
                                }

                                return (
                                  <div className="flex flex-col items-end gap-1 font-mono">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-2xs ${badgeColor}`}>
                                      {category}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold">
                                      Waist: {data.q70 || data.custom_q70 || data.waist || '—'} cm | Hip: {data.q71 || data.custom_q71 || data.hip || '—'} cm
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="px-5 py-3 bg-slate-50/80 text-slate-600 text-xs font-medium border-t border-slate-200/90 leading-relaxed flex items-center justify-between font-sans">
                              <span>Auto-computed from Q70 (Waist) & Q71 (Hip). Medical plausibility range: 0.40 to 2.00.</span>
                              <span className="font-bold text-amber-900 font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">Auto-Locked</span>
                            </div>
                          </div>
                        ) : (isQ75BP1Question(q) || isQ76BP2Question(q)) ? (
                          <div className="space-y-4 my-2 animate-in fade-in duration-200 font-sans">
                            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-mono">
                                <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                                  <HeartPulse size={15} className="text-red-500" />
                                  {q.title || (isQ75BP1Question(q) ? "Q75. Blood Pressure, Reading 1" : "Q76. Blood Pressure, Reading 2")}
                                </span>
                                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
                                  Systolic &gt; Diastolic
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Systolic BP */}
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono">
                                  <label className="text-[11px] font-extrabold uppercase text-slate-700 block">
                                    Systolic BP (SBP mmHg) *
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="120"
                                    min="70"
                                    max="260"
                                    value={(() => {
                                      const prefix = isQ75BP1Question(q) ? "sys_bp_1" : "sys_bp_2";
                                      const qPrefix = isQ75BP1Question(q) ? "q75_sys" : "q76_sys";
                                      return data[prefix] || data[qPrefix] || data[`custom_${prefix}`] || '';
                                    })()}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const sNum = parseFloat(val);
                                      const isP1 = isQ75BP1Question(q);
                                      const sysKey = isP1 ? "sys_bp_1" : "sys_bp_2";
                                      const diaKey = isP1 ? "dia_bp_1" : "dia_bp_2";
                                      const dNum = parseFloat(data[diaKey] || 0);

                                      if (val !== "" && (isNaN(sNum) || sNum < 70 || sNum > 260)) {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Systolic BP: Must be a medically valid value between 70 and 260 mmHg." }));
                                      } else if (dNum > 0 && sNum > 0 && sNum <= dNum) {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid BP: Systolic BP must be strictly greater than Diastolic BP." }));
                                      } else {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                      }

                                      const sysQKey = isP1 ? "q75_sys" : "q76_sys";
                                      updateCustomField(q, `${val}/${data[diaKey] || ''}`);
                                      setData(prev => ({
                                        ...prev,
                                        [sysKey]: val,
                                        [sysQKey]: val
                                      }));
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
                                  />
                                </div>

                                {/* Diastolic BP */}
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono">
                                  <label className="text-[11px] font-extrabold uppercase text-slate-700 block">
                                    Diastolic BP (DBP mmHg) *
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="80"
                                    min="40"
                                    max="160"
                                    value={(() => {
                                      const prefix = isQ75BP1Question(q) ? "dia_bp_1" : "dia_bp_2";
                                      const qPrefix = isQ75BP1Question(q) ? "q75_dia" : "q76_dia";
                                      return data[prefix] || data[qPrefix] || data[`custom_${prefix}`] || '';
                                    })()}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const dNum = parseFloat(val);
                                      const isP1 = isQ75BP1Question(q);
                                      const sysKey = isP1 ? "sys_bp_1" : "sys_bp_2";
                                      const diaKey = isP1 ? "dia_bp_1" : "dia_bp_2";
                                      const sNum = parseFloat(data[sysKey] || 0);

                                      if (val !== "" && (isNaN(dNum) || dNum < 40 || dNum > 160)) {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Diastolic BP: Must be a medically valid value between 40 and 160 mmHg." }));
                                      } else if (sNum > 0 && dNum > 0 && sNum <= dNum) {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid BP: Systolic BP must be strictly greater than Diastolic BP." }));
                                      } else {
                                        setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                      }

                                      const diaQKey = isP1 ? "q75_dia" : "q76_dia";
                                      updateCustomField(q, `${data[sysKey] || ''}/${val}`);
                                      setData(prev => ({
                                        ...prev,
                                        [diaKey]: val,
                                        [diaQKey]: val
                                      }));
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
                                  />
                                </div>
                              </div>

                              {fieldErrors[q.id] && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold font-mono flex items-center gap-2 animate-in fade-in">
                                  <AlertTriangle size={15} className="shrink-0 text-red-600" />
                                  <span>{fieldErrors[q.id]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (isQ77AvgBPQuestion(q)) ? (
                          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs font-sans my-2 bg-white animate-in fade-in duration-200">
                            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/90 flex items-center justify-between font-mono">
                              <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                                Q77. Average Blood Pressure (SBP / DBP)
                              </span>
                              <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 font-extrabold shadow-2xs">
                                Formula: Avg (Reading 1 &amp; Reading 2)
                              </span>
                            </div>
                            <div className="p-5 bg-white flex items-center justify-between gap-4">
                              <div className="flex items-baseline gap-3 font-mono">
                                <input
                                  type="text"
                                  readOnly
                                  disabled
                                  placeholder="0 / 0"
                                  value={data.avg_bp || data.q77 || data.custom_q77 || (data.avg_sys_bp && data.avg_dia_bp ? `${data.avg_sys_bp} / ${data.avg_dia_bp}` : '')}
                                  className="w-44 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-black text-2xl text-slate-900 text-center outline-none cursor-not-allowed select-none shadow-2xs"
                                />
                                <span className="text-base font-bold text-slate-400">mmHg</span>
                              </div>

                              {(() => {
                                const sbp = parseFloat(data.avg_sys_bp || data.sys_bp || 0);
                                const dbp = parseFloat(data.avg_dia_bp || data.dia_bp || 0);

                                let category = "Pending BP Reading 1 & 2";
                                let badgeColor = "bg-slate-100 text-slate-700 border-slate-300";

                                if (sbp > 0 && dbp > 0) {
                                  if (sbp < 120 && dbp < 80) {
                                    category = "Normal BP (< 120/80)";
                                    badgeColor = "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold";
                                  } else if (sbp <= 129 && dbp < 80) {
                                    category = "Elevated BP (120-129 / <80)";
                                    badgeColor = "bg-amber-50 text-amber-900 border-amber-300 font-bold";
                                  } else if ((sbp >= 130 && sbp <= 139) || (dbp >= 80 && dbp <= 89)) {
                                    category = "Stage 1 HTN (130-139 / 80-89)";
                                    badgeColor = "bg-orange-50 text-orange-950 border-orange-300 font-bold";
                                  } else if ((sbp >= 140 && sbp <= 179) || (dbp >= 90 && dbp <= 119)) {
                                    category = "Stage 2 HTN (≥ 140 / ≥ 90)";
                                    badgeColor = "bg-red-50 text-red-900 border-red-300 font-bold";
                                  } else if (sbp >= 180 || dbp >= 120) {
                                    category = "Hypertensive Crisis (≥ 180 / ≥ 120)";
                                    badgeColor = "bg-red-600 text-white border-red-700 font-extrabold animate-pulse";
                                  }
                                }

                                return (
                                  <div className="flex flex-col items-end gap-1 font-mono">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-2xs ${badgeColor}`}>
                                      {category}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold">
                                      R1: {data.sys_bp_1 || '—'}/{data.dia_bp_1 || '—'} | R2: {data.sys_bp_2 || '—'}/{data.dia_bp_2 || '—'}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="px-5 py-3 bg-slate-50/80 text-slate-600 text-xs font-medium border-t border-slate-200/90 leading-relaxed flex items-center justify-between font-sans">
                              <span>Auto-calculated average BP drives clinical risk categorization at Q90.</span>
                              <span className="font-bold text-amber-900 font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">Auto-Locked</span>
                            </div>
                          </div>
                        ) : (isQ88HandGripQuestion(q)) ? (
                          <div className="space-y-4 my-2 animate-in fade-in duration-200">
                            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs font-sans">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                                <div>
                                  <span className="text-xs font-black uppercase text-slate-800 font-mono tracking-wider block">
                                    Q88. Hand-Grip Strength (kg) — 3 Individual Readings & Average
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-medium pt-0.5 block">
                                    ➔ Measured only if BMI at Q69 is below 20.0 kg/m²
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs shrink-0">
                                  BMI &lt; 20 Filtered
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                {/* Reading 1 */}
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                                  <label className="text-[11px] font-extrabold uppercase text-slate-700 font-mono block">
                                    Reading 1 (kg)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="0.0"
                                    value={data.q88_reading1 !== undefined ? data.q88_reading1 : ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const r1 = parseFloat(val || 0);
                                      const r2 = parseFloat(data.q88_reading2 || 0);
                                      const r3 = parseFloat(data.q88_reading3 || 0);
                                      const valid = [r1, r2, r3].filter(v => v > 0);
                                      const avg = valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : "";

                                      setData(prev => ({
                                        ...prev,
                                        q88_reading1: val,
                                        q88_avg: avg,
                                        q88: avg,
                                        [`custom_${q.id}`]: avg,
                                        [q.id]: avg
                                      }));
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
                                  />
                                </div>

                                {/* Reading 2 */}
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                                  <label className="text-[11px] font-extrabold uppercase text-slate-700 font-mono block">
                                    Reading 2 (kg)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="0.0"
                                    value={data.q88_reading2 !== undefined ? data.q88_reading2 : ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const r1 = parseFloat(data.q88_reading1 || 0);
                                      const r2 = parseFloat(val || 0);
                                      const r3 = parseFloat(data.q88_reading3 || 0);
                                      const valid = [r1, r2, r3].filter(v => v > 0);
                                      const avg = valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : "";

                                      setData(prev => ({
                                        ...prev,
                                        q88_reading2: val,
                                        q88_avg: avg,
                                        q88: avg,
                                        [`custom_${q.id}`]: avg,
                                        [q.id]: avg
                                      }));
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
                                  />
                                </div>

                                {/* Reading 3 */}
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                                  <label className="text-[11px] font-extrabold uppercase text-slate-700 font-mono block">
                                    Reading 3 (kg)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="0.0"
                                    value={data.q88_reading3 !== undefined ? data.q88_reading3 : ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const r1 = parseFloat(data.q88_reading1 || 0);
                                      const r2 = parseFloat(data.q88_reading2 || 0);
                                      const r3 = parseFloat(val || 0);
                                      const valid = [r1, r2, r3].filter(v => v > 0);
                                      const avg = valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : "";

                                      setData(prev => ({
                                        ...prev,
                                        q88_reading3: val,
                                        q88_avg: avg,
                                        q88: avg,
                                        [`custom_${q.id}`]: avg,
                                        [q.id]: avg
                                      }));
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
                                  />
                                </div>

                                {/* Average */}
                                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-extrabold uppercase text-amber-900 font-mono block">
                                      Average (kg)
                                    </label>
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-950">Auto</span>
                                  </div>
                                  <input
                                    type="text"
                                    readOnly
                                    disabled
                                    placeholder="0.00"
                                    value={data.q88_avg || data.q88 || data[`custom_${q.id}`] || ''}
                                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-mono font-black text-amber-950 outline-none cursor-not-allowed select-none shadow-2xs"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (isQ93FollowupDateQuestion(q) || qType === 'date') ? (
                          <div className="space-y-4 my-2 animate-in fade-in duration-200 font-sans">
                            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-mono">
                                <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                                  <Calendar size={15} className="text-amber-600" />
                                  Q93. Follow-Up / Review Appointment Date
                                </span>
                                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
                                  No Past / Back Dates Allowed
                                </span>
                              </div>

                              {/* Datepicker Control Bar */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                                <div className="relative">
                                  <label className="block text-[11px] font-bold uppercase text-slate-500 font-mono mb-1">
                                    Select Appointment Date *
                                  </label>
                                  <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-slate-50 border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-inner">
                                    <Calendar size={18} className="text-amber-600 shrink-0" />
                                    <input
                                      type="date"
                                      min={new Date().toISOString().split('T')[0]}
                                      value={(() => {
                                        const curVal = data[`custom_${q.id}`] || data[q.id] || data.q93 || data.custom_q93 || data.followup_appointment_date;
                                        if (!curVal) return new Date().toISOString().split('T')[0];
                                        if (typeof curVal === 'string' && curVal.match(/^\d{4}-\d{2}-\d{2}$/)) return curVal;
                                        try {
                                          const dObj = new Date(curVal);
                                          if (!isNaN(dObj.getTime())) return dObj.toISOString().split('T')[0];
                                        } catch(e) {}
                                        return new Date().toISOString().split('T')[0];
                                      })()}
                                      onChange={(e) => {
                                        const selectedVal = e.target.value;
                                        const todayStr = new Date().toISOString().split('T')[0];
                                        
                                        if (selectedVal && selectedVal < todayStr) {
                                          setFieldErrors(prev => ({ 
                                            ...prev, 
                                            [q.id]: "Invalid Date: Back dates / past dates are not allowed for Q93 appointment date. Please select today or a future date." 
                                          }));
                                          if (notify) notify("error", "Invalid Appointment Date", "Back dates are not allowed. Please select today or a future date.");
                                          return;
                                        } else {
                                          setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                        }

                                        updateCustomField(q, selectedVal);
                                        setData(prev => ({
                                          ...prev,
                                          q93: selectedVal,
                                          custom_q93: selectedVal,
                                          followup_appointment_date: selectedVal,
                                          formatted_q93_date: selectedVal ? formatDateDDMMMYYYY(selectedVal) : formatDateDDMMMYYYY(todayStr)
                                        }));
                                      }}
                                      className="w-full bg-transparent text-sm font-extrabold text-slate-900 outline-none cursor-pointer font-mono"
                                    />
                                  </div>
                                </div>

                                {/* Selected Date Preview Badge */}
                                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 font-mono space-y-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                                    Formatted Appointment Preview
                                  </span>
                                  <span className="text-sm font-extrabold text-amber-950 block">
                                    {formatDateDDMMMYYYY(data[`custom_${q.id}`] || data[q.id] || data.q93 || new Date().toISOString().split('T')[0])}
                                  </span>
                                </div>
                              </div>

                              {/* Validation Error Banner */}
                              {fieldErrors[q.id] && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold font-mono flex items-center gap-2 animate-in fade-in">
                                  <AlertTriangle size={15} className="shrink-0 text-red-600" />
                                  <span>{fieldErrors[q.id]}</span>
                                </div>
                              )}
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
                              const qIdLower = String(q.id || '').toLowerCase();
                              const titleLower = String(q.title || '').toLowerCase();

                              // 1. Age (Q1)
                              const isAgeQ = q.id === 'q1' || titleLower.includes('q1. age') || titleLower.includes('age');
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

                              // 2. Q67. Height (cm) [Medical range: 50.0 to 250.0 cm]
                              const isHeightQ = qIdLower.includes('q67') || titleLower.includes('q67') || titleLower.includes('height');
                              if (isHeightQ && val !== "") {
                                const numVal = parseFloat(val);
                                if (isNaN(numVal) || numVal < 50 || numVal > 250) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Height: Height must be a medically valid value between 50.0 cm and 250.0 cm." }));
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }

                              // 3. Q68. Weight (kg) [Medical range: 10.0 to 300.0 kg]
                              const isWeightQ = qIdLower.includes('q68') || titleLower.includes('q68') || titleLower.includes('weight');
                              if (isWeightQ && val !== "") {
                                const numVal = parseFloat(val);
                                if (isNaN(numVal) || numVal < 10 || numVal > 300) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Weight: Weight must be a medically valid value between 10.0 kg and 300.0 kg." }));
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }

                              // 4. Q70. Waist Circumference (cm) [Medical range: 30.0 to 200.0 cm]
                              const isWaistQ = qIdLower.includes('q70') || titleLower.includes('q70') || titleLower.includes('waist');
                              if (isWaistQ && val !== "") {
                                const numVal = parseFloat(val);
                                if (isNaN(numVal) || numVal < 30 || numVal > 200) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Waist Circumference: Waist circumference must be between 30.0 cm and 200.0 cm." }));
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }

                              // 5. Q71. Hip Circumference (cm) [Medical range: 30.0 to 200.0 cm]
                              const isHipQ = qIdLower.includes('q71') || titleLower.includes('q71') || titleLower.includes('hip');
                              if (isHipQ && val !== "") {
                                const numVal = parseFloat(val);
                                if (isNaN(numVal) || numVal < 30 || numVal > 200) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Hip Circumference: Hip circumference must be between 30.0 cm and 200.0 cm." }));
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }

                              // 6. Q74. Pulse (bpm) [Medical range: 30 to 220 bpm]
                              const isPulseQ = qIdLower.includes('q74') || titleLower.includes('q74') || titleLower.includes('pulse');
                              if (isPulseQ && val !== "") {
                                const numVal = parseFloat(val);
                                if (isNaN(numVal) || numVal < 30 || numVal > 220) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Pulse Rate: Pulse rate must be between 30 bpm and 220 bpm." }));
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }

                              // 7. Q78. SpO₂ (%) [Medical range: 50 to 100 %]
                              const isSpO2Q = qIdLower.includes('q78') || titleLower.includes('q78') || titleLower.includes('spo2');
                              if (isSpO2Q && val !== "") {
                                const numVal = parseFloat(val);
                                if (isNaN(numVal) || numVal < 50 || numVal > 100) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid SpO₂: Oxygen saturation (SpO₂) must be between 50% and 100%." }));
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }

                              // 8. Q79. Random Blood Sugar (RBS mg/dL) [Medical range: 30 to 600 mg/dL]
                              const isRbsQ = qIdLower.includes('q79') || titleLower.includes('q79') || titleLower.includes('random blood sugar') || titleLower.includes('rbs');
                              if (isRbsQ && val !== "") {
                                const numVal = parseFloat(val);
                                if (isNaN(numVal) || numVal < 30 || numVal > 600) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid RBS: Random Blood Sugar must be between 30 mg/dL and 600 mg/dL." }));
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }

                              // 9. Q80. Haemoglobin (Hb g/dL) [Medical range: 3.0 to 20.0 g/dL]
                              const isHbQ = qIdLower.includes('q80') || titleLower.includes('q80') || titleLower.includes('haemoglobin') || titleLower.includes('hemoglobin');
                              if (isHbQ && val !== "") {
                                const numVal = parseFloat(val);
                                if (isNaN(numVal) || numVal < 3.0 || numVal > 20.0) {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: "Invalid Haemoglobin: Haemoglobin must be between 3.0 g/dL and 20.0 g/dL." }));
                                } else {
                                  setFieldErrors(prev => ({ ...prev, [q.id]: null }));
                                }
                              }

                              updateCustomField(q, val);
                            }} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 font-mono shadow-2xs" 
                          />
                        ) : null}

                        {/* Matrix Question Type (Q86 Fat Loss, Q87 Muscle Loss, etc.) */}
                        {isMatrixQuestion(q) && (
                          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs my-2 font-sans bg-white">
                            <table className="w-full text-left border-collapse min-w-[640px]">
                              <thead>
                                <tr className="bg-amber-50/70 border-b border-amber-200/80 font-mono">
                                  <th className="py-3 px-4 text-xs font-black text-slate-800 uppercase tracking-wider">
                                    Assessment Site / Row Parameter
                                  </th>
                                  {getMatrixCols(q).map((col, cIdx) => (
                                    <th key={cIdx} className="py-3 px-3 text-center text-xs font-extrabold text-slate-900">
                                      <span className="inline-flex items-center gap-1.5 justify-center">
                                        <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950 font-black text-[11px] border border-amber-300">
                                          {getOptionCode(col, cIdx)}
                                        </span>
                                        <span className="font-sans font-extrabold text-xs">{getOptionLabel(col)}</span>
                                      </span>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {getMatrixRows(q).map((row, rIdx) => {
                                  const rowKey = typeof row === 'object' ? row.id || `row_${rIdx + 1}` : `row_${rIdx + 1}`;
                                  const rowLabel = typeof row === 'object' ? row.label || row.title || row.name : row;
                                  const matrixValKey = `${q.id}_${rowKey}`;
                                  const curRowVal = data[matrixValKey] || (data[q.id] && data[q.id][rowKey]) || '';

                                  return (
                                    <tr key={rIdx} className="hover:bg-amber-50/20 transition-colors">
                                      <td className="py-3 px-4 text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                                        {rowLabel}
                                      </td>
                                      {getMatrixCols(q).map((col, cIdx) => {
                                        const colVal = getOptionLabel(col);
                                        const colCode = getOptionCode(col, cIdx);
                                        const isChecked = String(curRowVal).trim() === String(colVal).trim() || String(curRowVal).trim() === String(colCode).trim();

                                        return (
                                          <td key={cIdx} className="py-3 px-3 text-center">
                                            <label 
                                              onClick={() => {
                                                updateCustomField({ id: matrixValKey }, colVal);
                                                setData(prev => {
                                                  const curObj = (typeof prev[q.id] === 'object' && prev[q.id] !== null) ? prev[q.id] : {};
                                                  return {
                                                    ...prev,
                                                    [matrixValKey]: colVal,
                                                    [q.id]: {
                                                      ...curObj,
                                                      [rowKey]: colVal
                                                    }
                                                  };
                                                });
                                              }}
                                              className={`inline-flex items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs ring-2 ring-amber-400' : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                                            >
                                              <input
                                                type="radio"
                                                name={`${q.id}_${rowKey}`}
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-amber-600 focus:ring-0 cursor-pointer"
                                              />
                                            </label>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Single Choice (Custom Dropdown vs Grid/Pills) */}
                        {(qType === 'dropdown' || qType === 'single_choice' || qType === 'radio') && !isQ3LocationQuestion(q) && !isMatrixQuestion(q) && (
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

          {/* Staff Nurse Section Workflow Choice Modal */}
          {showStaffNurseTransferModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 font-sans space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      Section 8 · Counselor Transfer Option
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold pt-0.5">
                      Participant ID: <span className="font-mono text-amber-900 font-bold">{data.participant_id}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                  <p className="font-semibold">
                    How would you like to proceed with Section 8 (Counselor Counselling & Review)?
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                    <li><strong>Complete Myself:</strong> Fill out Section 8 clinical counselling and review myself.</li>
                    <li><strong>Move to Counselor Queue:</strong> Transfer participant directly to Counselor Queue for counselling.</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteSelf}
                    className="flex-1 h-14 px-5 rounded-2xl bg-[#f5d40b] hover:bg-[#e0c20a] text-[#4a4a4c] font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer text-center leading-snug border border-[#e5c40a]"
                  >
                    <UserCheck size={20} className="shrink-0 text-[#4a4a4c]" />
                    <span>I will complete this section</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTransferToCounselor}
                    className="flex-1 h-14 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer text-center leading-snug border border-slate-800"
                  >
                    <ArrowRight size={20} className="shrink-0 text-white" />
                    <span>Move to Counselor Queue</span>
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
