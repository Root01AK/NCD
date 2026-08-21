/**
 * Standalone Skip & Visibility Logic Engine for NCD Survey System
 * Evaluates dynamic skipRules attached to questions across any section.
 */

export function getOptionCode(opt, oIdx = 0) {
  if (typeof opt === 'object' && opt !== null) {
    return String(opt.code ?? (oIdx + 1));
  }
  const str = String(opt || '');
  const match = str.match(/^(?:Code\s*)?(\d+)/i);
  return match ? match[1] : String(oIdx + 1);
}

export function getOptionLabel(opt) {
  if (typeof opt === 'object' && opt !== null) {
    return String(opt.label || '');
  }
  return String(opt || '');
}

/**
 * Auto-calculates AUDIT-C score and checks threshold (Positive >= 4 for Males, >= 3 for Females / Transgender)
 */
export function calculateAuditCScore(formData) {
  if (!formData) return { score: 0, threshold: 4, isPositive: false };

  const g = String(formData.gender || formData.mem_scrn_q2 || "").toLowerCase();
  const isMale = g.includes("male") && !g.includes("trans") && !g.includes("female");
  const threshold = isMale ? 4 : 3;

  let score = 0;
  ["q27", "q28", "q29", "q30"].forEach(qId => {
    const val = formData[`custom_${qId}`] !== undefined ? formData[`custom_${qId}`] : formData[qId];
    if (val !== undefined && val !== null && val !== "") {
      const match = String(val).match(/\d+/);
      if (match) {
        score += parseInt(match[0], 10);
      }
    }
  });

  return {
    score,
    threshold,
    isPositive: score >= threshold
  };
}

/**
 * Auto-calculates BMI from weight (kg) and height (cm)
 */
export function calculateBMIFromForm(formData) {
  if (!formData) return null;
  const wt = parseFloat(formData.weight || formData.q67 || formData.custom_q67 || 0);
  const htCm = parseFloat(formData.height || formData.q68 || formData.custom_q68 || 0);

  if (wt > 0 && htCm > 0) {
    const htM = htCm / 100;
    return wt / (htM * htM);
  }
  return null;
}

/**
 * Returns pre-configured default skip rules for NCD survey questions
 */
export function getDefaultSkipRulesForQuestion(qIdOrTitle) {
  const t = String(qIdOrTitle || "").toLowerCase().trim();
  
  if (t === "q10" || t.includes("q10")) {
    return [{
      id: "rule_q10_cancer",
      dependsOn: "q9",
      condition: "not_contains",
      value: "11",
      action: "hide",
      description: "Skip Q10 if Q9 Code 11 (Cancer) is not selected"
    }];
  }

  if (t === "q11" || t.includes("q11")) {
    return [{
      id: "rule_q11_skip_q12",
      dependsOn: "q11",
      condition: "in",
      value: "2, 3",
      action: "hide",
      targetQuestion: "q12",
      description: "If Q11 is Code 2 or 3 -> Skip Q12 (Jump to Q13)"
    }];
  }

  if (t === "q12" || t.includes("q12")) {
    return [{
      id: "rule_q12_family_ncd",
      dependsOn: "q11",
      condition: "in",
      value: "2, 3",
      action: "hide",
      targetQuestion: "q12",
      description: "Skip Q12 if Q11 (Family history) is Code 2 (No) or Code 3 (Don't know)"
    }];
  }

  if (t === "q14" || t.includes("q14")) {
    return [{
      id: "rule_q14_skip_substance",
      dependsOn: "q14",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q15, q16",
      description: "If Q14 is Code 2 -> Skip Q15 & Q16 (Jump to Q17)"
    }];
  }

  if (t === "q15" || t.includes("q15") || t === "q16" || t.includes("q16")) {
    return [{
      id: `rule_${t}_substance_use`,
      dependsOn: "q14",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: t,
      description: "Skip to Q17 if Q14 (Other Substance Use) is Code 2"
    }];
  }

  if (t === "q17" || t.includes("q17")) {
    return [
      {
        id: "rule_q17_code1",
        dependsOn: "q17",
        condition: "equals",
        value: "1",
        action: "hide",
        targetQuestion: "q18, q19, q20, q21, q22, q23",
        description: "If Q17 is Code 1 -> Skip Q18 to Q23 (Jump to Q24)"
      },
      {
        id: "rule_q17_code2",
        dependsOn: "q17",
        condition: "equals",
        value: "2",
        action: "hide",
        targetQuestion: "q20, q21, q22, q23",
        description: "If Q17 is Code 2 -> Answer Q18 & Q19, Skip Q20 to Q23 (Jump to Q24)"
      },
      {
        id: "rule_q17_code3",
        dependsOn: "q17",
        condition: "equals",
        value: "3",
        action: "hide",
        targetQuestion: "q18, q19",
        description: "If Q17 is Code 3 -> Skip Q18 & Q19, Answer Q20 to Q23"
      }
    ];
  }

  if (t === "q18" || t.includes("q18") || t === "q19" || t.includes("q19")) {
    return [{
      id: `rule_${t}_counseling_branch`,
      dependsOn: "q17",
      condition: "in",
      value: "1, 3",
      action: "hide",
      description: "Hide Q18 & Q19 if Q17 is Code 1 (Skip to Q24) or Code 3"
    }];
  }

  if (t === "q20" || t.includes("q20") || t === "q21" || t.includes("q21") || t === "q22" || t.includes("q22") || t === "q23" || t.includes("q23")) {
    return [{
      id: `rule_${t}_counseling_branch`,
      dependsOn: "q17",
      condition: "in",
      value: "1, 2",
      action: "hide",
      description: "Hide Q20 to Q23 if Q17 is Code 1 or Code 2"
    }];
  }

  // Rule 4: Q25 (Tobacco Use Status)
  if (t === "q25" || t.includes("q25")) {
    return [
      {
        id: "rule_q25_code1",
        dependsOn: "q25",
        condition: "equals",
        value: "1",
        action: "hide",
        targetQuestion: "q26, q27, q28, q29, q30, q31, q32",
        description: "If Q25 is Code 1 -> Skip Q26 to Q32 (Jump to Q33)"
      },
      {
        id: "rule_q25_code2",
        dependsOn: "q25",
        condition: "equals",
        value: "2",
        action: "hide",
        targetQuestion: "q27, q28, q29, q30, q31, q32",
        description: "If Q25 is Code 2 -> Answer Q26, Skip Q27 to Q32 (Jump to Q33)"
      },
      {
        id: "rule_q25_code3",
        dependsOn: "q25",
        condition: "equals",
        value: "3",
        action: "hide",
        targetQuestion: "q26",
        description: "If Q25 is Code 3 -> Skip Q26, Answer Q27 onwards"
      }
    ];
  }

  if (t === "q26" || t.includes("q26")) {
    return [{
      id: "rule_q26_tobacco",
      dependsOn: "q25",
      condition: "in",
      value: "1, 3",
      action: "hide",
      targetQuestion: "q26",
      description: "Skip Q26 if Q25 is Code 1 (Skip to Q33) or Code 3 (Answer Q27 onwards)"
    }];
  }

  if (["q27", "q28", "q29", "q30"].some(k => t === k || t.includes(k))) {
    return [{
      id: `rule_${t}_tobacco_branch`,
      dependsOn: "q25",
      condition: "in",
      value: "1, 2",
      action: "hide",
      targetQuestion: t,
      description: "Hide if Q25 is Code 1 or Code 2 (Skip to Q33)"
    }];
  }

  // Rule 5: Q30 (AUDIT-C Positive Threshold)
  if (t === "q31" || t.includes("q31") || t === "q32" || t.includes("q32")) {
    return [{
      id: `rule_${t}_audit_threshold`,
      dependsOn: "q30",
      condition: "below_threshold",
      value: "AUDIT-C Positive Threshold (Male >= 4, Female/Trans >= 3)",
      action: "hide",
      targetQuestion: t,
      description: "Q30 below threshold: Skip Q31 & Q32 (Jump to Q33). If positive, administer full AUDIT"
    }];
  }

  // Rule 6: Q33 (Diet / Activity Status)
  if (t === "q33" || t.includes("q33")) {
    return [
      {
        id: "rule_q33_code1_5",
        dependsOn: "q33",
        condition: "in",
        value: "1, 5",
        action: "hide",
        targetQuestion: "q34, q35, q36",
        description: "If Q33 is Code 1 or 5 -> Skip Q34 to Q36 (Jump to Q37)"
      },
      {
        id: "rule_q33_code2_3",
        dependsOn: "q33",
        condition: "in",
        value: "2, 3",
        action: "hide",
        targetQuestion: "q35, q36",
        description: "If Q33 is Code 2 or 3 -> Answer Q34, Skip Q35 & Q36 (Jump to Q37)"
      },
      {
        id: "rule_q33_code4",
        dependsOn: "q33",
        condition: "equals",
        value: "4",
        action: "show",
        targetQuestion: "q34, q35, q36",
        description: "If Q33 is Code 4 -> Answer Q34 to Q36"
      }
    ];
  }

  if (t === "q34" || t.includes("q34")) {
    return [{
      id: "rule_q34_diet",
      dependsOn: "q33",
      condition: "in",
      value: "1, 5",
      action: "hide",
      targetQuestion: "q34",
      description: "Hide Q34 if Q33 is Code 1 or 5 (Skip to Q37)"
    }];
  }

  if (t === "q35" || t.includes("q35") || t === "q36" || t.includes("q36")) {
    return [{
      id: `rule_${t}_diet_branch`,
      dependsOn: "q33",
      condition: "in",
      value: "1, 2, 3, 5",
      action: "hide",
      targetQuestion: t,
      description: "Hide if Q33 is Code 1, 2, 3, or 5 (Show only when Q33 is Code 4)"
    }];
  }

  // Rule 7: Q40 (Hypertension Screening / Diagnosis)
  if (t === "q40" || t.includes("q40")) {
    return [{
      id: "rule_q40_skip_q41",
      dependsOn: "q40",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q41",
      description: "If Q40 is Code 2 -> Skip Q41 (Jump to Q42)"
    }];
  }
  if (t === "q41" || t.includes("q41")) {
    return [{
      id: "rule_q41_htn",
      dependsOn: "q40",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q41",
      description: "Hide Q41 if Q40 is Code 2 (Skip to Q42)"
    }];
  }

  // Rule 8: Q43 (Diabetes Screening / Diagnosis)
  if (t === "q43" || t.includes("q43")) {
    return [{
      id: "rule_q43_skip_q44",
      dependsOn: "q43",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q44",
      description: "If Q43 is Code 2 -> Skip to Q44"
    }];
  }

  // Rule 9: Q44 (Heart Disease / Stroke)
  if (t === "q44" || t.includes("q44")) {
    return [{
      id: "rule_q44_skip_q45",
      dependsOn: "q44",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q45",
      description: "If Q44 is Code 2 -> Skip Q45 (Jump to Q46)"
    }];
  }
  if (t === "q45" || t.includes("q45")) {
    return [{
      id: "rule_q45_cvd",
      dependsOn: "q44",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q45",
      description: "Hide Q45 if Q44 is Code 2 (Skip to Q46)"
    }];
  }

  // Rule 10: Q46 (Chronic Kidney / Respiratory Disease)
  if (t === "q46" || t.includes("q46")) {
    return [{
      id: "rule_q46_skip_q47",
      dependsOn: "q46",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q47",
      description: "If Q46 is Code 2 -> Skip Q47 (Jump to Q48)"
    }];
  }
  if (t === "q47" || t.includes("q47")) {
    return [{
      id: "rule_q47_ckd",
      dependsOn: "q46",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q47",
      description: "Hide Q47 if Q46 is Code 2 (Skip to Q48)"
    }];
  }

  // Rule 11: Q58 & Q59 (Follow-up Vitals)
  if (t === "q58" || t.includes("q58")) {
    return [
      {
        id: "rule_q58_code2_3",
        dependsOn: "q58",
        condition: "in",
        value: "2, 3",
        action: "hide",
        targetQuestion: "q59",
        description: "If Q58 is Code 2 or 3 -> Skip Q59 (Jump to Q60)"
      },
      {
        id: "rule_q58_q59_combo",
        dependsOn: "q58",
        condition: "in",
        value: "0, 1",
        action: "hide",
        targetQuestion: "q65",
        description: "If both Q58 & Q59 are Code 0 or 1 -> Skip Q65"
      }
    ];
  }

  if (t === "q59" || t.includes("q59")) {
    return [
      {
        id: "rule_q59_code2_3",
        dependsOn: "q59",
        condition: "in",
        value: "2, 3",
        action: "hide",
        targetQuestion: "q60",
        description: "If Q59 is Code 2 or 3 -> Skip Q60 (Jump to Q61)"
      },
      {
        id: "rule_q59_skip_from_q58",
        dependsOn: "q58",
        condition: "in",
        value: "2, 3",
        action: "hide",
        targetQuestion: "q59",
        description: "Hide Q59 if Q58 is Code 2 or 3 (Skip to Q60)"
      }
    ];
  }

  if (t === "q60" || t.includes("q60")) {
    return [{
      id: "rule_q60_skip_from_q59",
      dependsOn: "q59",
      condition: "in",
      value: "2, 3",
      action: "hide",
      targetQuestion: "q60",
      description: "Hide Q60 if Q59 is Code 2 or 3 (Skip to Q61)"
    }];
  }

  if (t === "q65" || t.includes("q65")) {
    return [{
      id: "rule_q65_combo",
      dependsOn: "q58",
      condition: "combo_0_1",
      value: "0, 1",
      action: "hide",
      targetQuestion: "q65",
      description: "Skip Q65 if both Q58 & Q59 are opted to Code 0 or 1"
    }];
  }

  // Rule 12: Q81 (Referral Test Selection)
  if (t === "q81" || t.includes("q81")) {
    return [{
      id: "rule_q81_code6",
      dependsOn: "q81",
      condition: "not_equals",
      value: "6",
      action: "hide",
      targetQuestion: "q83",
      description: "If Q81 is NOT Code 6 -> Skip Q83"
    }];
  }

  if (t === "q83" || t.includes("q83")) {
    return [{
      id: "rule_q83_from_q81",
      dependsOn: "q81",
      condition: "not_equals",
      value: "6",
      action: "hide",
      targetQuestion: "q83",
      description: "Hide Q83 if Q81 is NOT Code 6"
    }];
  }

  // Rule 13: Q88 (Nutritional Counseling BMI Rule)
  if (t === "q88" || t.includes("q88")) {
    return [{
      id: "rule_q88_bmi",
      dependsOn: "q69",
      condition: "bmi_geq_20",
      value: "20",
      action: "hide",
      targetQuestion: "q88",
      description: "Q88 only if BMI at Q69 is below 20. If BMI >= 20, skip to Q89"
    }];
  }

  // Rule 14: Q94 (Follow-up Status)
  if (t === "q94" || t.includes("q94")) {
    return [{
      id: "rule_q94_sec15",
      dependsOn: "q94",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: "q95, q96",
      description: "If Q94 is Code 2 -> Skip to Section 15"
    }];
  }

  if (t === "q95" || t.includes("q95") || t === "q96" || t.includes("q96")) {
    return [{
      id: `rule_${t}_from_q94`,
      dependsOn: "q94",
      condition: "equals",
      value: "2",
      action: "hide",
      targetQuestion: t,
      description: "Hide if Q94 is Code 2 (Skip to Section 15)"
    }];
  }

  // Rule 15: Q97 (1st Attempt Contact Outcome)
  if (t === "q97" || t.includes("q97")) {
    return [{
      id: "rule_q97_contact",
      dependsOn: "q97",
      condition: "equals",
      value: "1",
      action: "hide",
      targetQuestion: "q98, q99, q100, q101, q102, q103, q104, q105, q106",
      description: "If Q97 is Code 1 -> Skip to Q107 and close remaining attempts"
    }];
  }

  if (["q98", "q99", "q100", "q101", "q102"].some(k => t === k || t.includes(k))) {
    return [{
      id: `rule_${t}_attempt2`,
      dependsOn: "q97",
      condition: "equals",
      value: "1",
      action: "hide",
      targetQuestion: t,
      description: "Hide Attempt 2 if Q97 is Code 1 (Successfully Contacted)"
    }];
  }

  // Rule 16: Q103 (2nd/3rd Attempt Outcome & Lost to Follow-up)
  if (t === "q103" || t.includes("q103")) {
    return [{
      id: "rule_q103_attempt3",
      dependsOn: "q103",
      condition: "not_equals",
      value: "1",
      action: "compulsory_q104",
      targetQuestion: "q104",
      description: "If Q103 is Code 1 -> Go to Q107. Any other outcome closes record as Lost to Follow-up & makes Q104 compulsory"
    }];
  }

  if (t === "q105" || t.includes("q105") || t === "q106" || t.includes("q106")) {
    return [{
      id: `rule_${t}_from_q103`,
      dependsOn: "q103",
      condition: "equals",
      value: "1",
      action: "hide",
      targetQuestion: t,
      description: "Hide if Q103 is Code 1 (Go to Q107)"
    }];
  }

  return [];
}

/**
 * Main Dynamic Logic Engine Evaluator
 * Evaluates whether a question should be visible (return false for skip, true for show)
 */
export function isQuestionSkipped(q, allQuestions, formData) {
  if (!q) return false;
  if (q.type === 'section_header' || String(q.id || '').startsWith('sec_')) return false;

  // Extract Question Number robustly from q.id or q.title
  let qNum = null;
  const qIdStr = String(q.id || "").toLowerCase().trim();
  const titleStr = String(q.title || "").trim();
  const combinedStr = `${qIdStr} ${titleStr.toLowerCase()}`;
  
  const numMatch = combinedStr.match(/(?:^|[^a-z0-9])q(\d+)\b/i) || combinedStr.match(/^q(\d+)/i) || titleStr.match(/^Q(\d+)/i) || combinedStr.match(/(\d+)/);
  if (numMatch) {
    qNum = parseInt(numMatch[1], 10);
  }

  // Robust answer fetch helper from formData
  const getAnswer = (num) => {
    if (!formData) return null;
    const keys = [
      `q${num}`, `custom_q${num}`, `Q${num}`, `custom_Q${num}`, `mem_scrn_q${num}`,
      `q_${num}`, `custom_q_${num}`
    ];
    for (const k of keys) {
      if (formData[k] !== undefined && formData[k] !== null && formData[k] !== "") return formData[k];
    }
    const foundK = Object.keys(formData).find(k => {
      const kl = k.toLowerCase();
      return kl.endsWith(`q${num}`) || kl.endsWith(`q_${num}`) || kl.includes(`q${num}`);
    });
    return foundK ? formData[foundK] : null;
  };

  // Explicit Rule 1: Q11 Family History Skip (Q12)
  if (qNum === 12) {
    const q11Val = getAnswer(11);
    if (!q11Val) return true; // Hide Q12 until Q11 is answered!
    const fullStr = (typeof q11Val === 'object' ? `${q11Val.code || ''} ${q11Val.label || ''}` : String(q11Val)).toLowerCase().trim();
    if (fullStr.includes("no") || fullStr.includes("don't know") || fullStr.includes("code 2") || fullStr.includes("code 3") || fullStr.startsWith("2") || fullStr.startsWith("3") || fullStr === "2" || fullStr === "3") {
      return true; // Skip Q12 if Q11 is No (Code 2) or Don't know (Code 3)
    }
    if (fullStr.includes("yes") || fullStr.includes("code 1") || fullStr.startsWith("1") || fullStr === "1") {
      return false; // Show Q12 if Q11 is Yes (Code 1)
    }
  }

  // Explicit Rule 2: Q14 Medication Skip (Q15 & Q16)
  if (qNum === 15 || qNum === 16) {
    const q14Val = getAnswer(14);
    if (!q14Val) return true; // Hide Q15 & Q16 until Q14 is answered!
    const fullStr = (typeof q14Val === 'object' ? `${q14Val.code || ''} ${q14Val.label || ''}` : String(q14Val)).toLowerCase().trim();
    if (fullStr.includes("no") || fullStr.includes("code 2") || fullStr.startsWith("2") || fullStr === "2") {
      return true; // Skip Q15 & Q16 if Q14 is No (Code 2)
    }
    if (fullStr.includes("yes") || fullStr.includes("code 1") || fullStr.startsWith("1") || fullStr === "1") {
      return false; // Show Q15 & Q16 if Q14 is Yes (Code 1)
    }
  }

  // Explicit Rule 3: Q17 Tobacco Use Branching (Q18 to Q23)
  if (qNum !== null && qNum >= 18 && qNum <= 23) {
    const q17Val = getAnswer(17);
    if (!q17Val) {
      return true; // Hide Q18 to Q23 until Q17 is answered!
    }
    const fullStr = (typeof q17Val === 'object' ? `${q17Val.code || ''} ${q17Val.label || ''} ${q17Val.value || ''}` : String(q17Val)).toLowerCase().trim();
    let code17 = null;
    if (fullStr.includes("never") || fullStr.includes("code 1") || fullStr.startsWith("1") || fullStr === "1") {
      code17 = "1";
    } else if (fullStr.includes("past") || fullStr.includes("stopped") || fullStr.includes("former") || fullStr.includes("code 2") || fullStr.startsWith("2") || fullStr === "2") {
      code17 = "2";
    } else if (fullStr.includes("currently") || fullStr.includes("current") || fullStr.includes("code 3") || fullStr.startsWith("3") || fullStr === "3") {
      code17 = "3";
    }

    if (code17 === "1") {
      return true; // Code 1: Never used -> Skip Q18 to Q23 (Jump to Q24)
    }
    if (code17 === "2") {
      if (qNum === 18 || qNum === 19) return false; // Code 2: Former user -> Show Q18 & Q19
      if (qNum >= 20 && qNum <= 23) return true; // Skip Q20 to Q23 (Jump to Q24)
    }
    if (code17 === "3") {
      if (qNum === 18 || qNum === 19) return true; // Code 3: Current user -> Skip Q18 & Q19
      if (qNum >= 20 && qNum <= 23) return false; // Show Q20 to Q23
    }
    return true;
  }

  // Explicit Rule 4: Q25 Alcohol Use Branching (Q26 to Q32)
  if (qNum !== null && qNum >= 26 && qNum <= 32) {
    const q25Val = getAnswer(25);
    if (!q25Val) {
      return true; // Hide Q26 to Q32 until Q25 is answered!
    }
    const str = typeof q25Val === 'object' ? (q25Val.code || q25Val.label || '') : String(q25Val);
    const l = str.toLowerCase().trim();
    let code25 = null;
    if (l.includes("never") || str === "1" || l.includes("code 1") || l.startsWith("1")) code25 = "1";
    else if (l.includes("past") || l.includes("stopped") || l.includes("former") || str === "2" || l.includes("code 2") || l.startsWith("2")) code25 = "2";
    else if (l.includes("currently") || l.includes("current") || str === "3" || l.includes("code 3") || l.startsWith("3")) code25 = "3";

    if (code25 === "1") return true; // Code 1: Never consumed -> Skip Q26 to Q32 (Jump to Q33)
    if (code25 === "2") {
      if (qNum === 26) return false; // Code 2: Former consumer -> Show Q26
      if (qNum >= 27 && qNum <= 32) return true; // Skip Q27 to Q32 (Jump to Q33)
    }
    if (code25 === "3") {
      if (qNum === 26) return true; // Code 3: Current consumer -> Skip Q26
      if (qNum >= 27 && qNum <= 32) {
        if (qNum === 31 || qNum === 32) {
          const auditRes = calculateAuditCScore(formData);
          if (!auditRes.isPositive) return true; // Skip Q31 & Q32 if AUDIT-C below threshold
        }
        return false; // Show Q27 to Q30
      }
    }
    return true;
  }

  // Explicit Rule 6: Q33 Diet & Physical Activity Branching (Q34 to Q36)
  if (qNum !== null && qNum >= 34 && qNum <= 36) {
    const q33Val = getAnswer(33);
    if (!q33Val) {
      return true; // Hide Q34 to Q36 until Q33 is answered!
    }
    const str = typeof q33Val === 'object' ? (q33Val.code || q33Val.label || '') : String(q33Val);
    const l = str.toLowerCase().trim();
    let code33 = null;
    if (str === "1" || l.includes("code 1") || l.startsWith("1")) code33 = "1";
    else if (str === "2" || l.includes("code 2") || l.startsWith("2")) code33 = "2";
    else if (str === "3" || l.includes("code 3") || l.startsWith("3")) code33 = "3";
    else if (str === "4" || l.includes("code 4") || l.startsWith("4")) code33 = "4";
    else if (str === "5" || l.includes("code 5") || l.startsWith("5")) code33 = "5";

    if (code33 === "1" || code33 === "5") return true; // Code 1 or 5 -> Skip Q34 to Q36 (Jump to Q37)
    if (code33 === "2" || code33 === "3") {
      if (qNum === 34) return false; // Code 2 or 3 -> Show Q34
      if (qNum === 35 || qNum === 36) return true; // Skip Q35 & Q36 (Jump to Q37)
    }
    if (code33 === "4") return false; // Code 4 -> Show Q34 to Q36
    return true;
  }

  // Rule 5: Auto-calculated AUDIT-C score threshold check for Q31 & Q32
  if (qNum === 31 || qNum === 32) {
    const auditRes = calculateAuditCScore(formData);
    if (!auditRes.isPositive) {
      return true; // Skip Q31 & Q32 when AUDIT-C score is below positive threshold (Male < 4, Female/Trans < 3)
    }
  }

  // Explicit Rule: Q40 Hypertension History Skip (Q41)
  if (qNum === 41) {
    const q40Val = getAnswer(40);
    if (!q40Val) return true;
    const fullStr = (typeof q40Val === 'object' ? `${q40Val.code || ''} ${q40Val.label || ''}` : String(q40Val)).toLowerCase().trim();
    if (fullStr.includes("no") || fullStr.includes("code 2") || fullStr.startsWith("2") || fullStr === "2") return true;
    if (fullStr.includes("yes") || fullStr.includes("code 1") || fullStr.startsWith("1") || fullStr === "1") return false;
  }

  // Explicit Rule: Q43 Diabetes History Skip (Q44, Q45)
  if (qNum === 44 || qNum === 45) {
    const q43Val = getAnswer(43);
    if (!q43Val) return true;
    const fullStr = (typeof q43Val === 'object' ? `${q43Val.code || ''} ${q43Val.label || ''}` : String(q43Val)).toLowerCase().trim();
    if (fullStr.includes("no") || fullStr.includes("code 2") || fullStr.startsWith("2") || fullStr === "2") return true;
  }

  // Explicit Rule: Q44 On Diabetes Medication Skip (Q45)
  if (qNum === 45) {
    const q44Val = getAnswer(44);
    if (q44Val) {
      const fullStr = (typeof q44Val === 'object' ? `${q44Val.code || ''} ${q44Val.label || ''}` : String(q44Val)).toLowerCase().trim();
      if (fullStr.includes("no") || fullStr.includes("code 2") || fullStr.startsWith("2") || fullStr === "2") return true;
    }
  }

  // Explicit Rule: Q46 On Hypertension Medication Skip (Q47)
  if (qNum === 47) {
    const q46Val = getAnswer(46);
    if (!q46Val) return true;
    const fullStr = (typeof q46Val === 'object' ? `${q46Val.code || ''} ${q46Val.label || ''}` : String(q46Val)).toLowerCase().trim();
    if (fullStr.includes("no") || fullStr.includes("code 2") || fullStr.startsWith("2") || fullStr === "2") return true;
    if (fullStr.includes("yes") || fullStr.includes("code 1") || fullStr.startsWith("1") || fullStr === "1") return false;
  }

  // Explicit Rule: Q86 Skip (Q87)
  if (qNum === 87) {
    const q86Val = getAnswer(86);
    if (q86Val) {
      const fullStr = (typeof q86Val === 'object' ? `${q86Val.code || ''} ${q86Val.label || ''}` : String(q86Val)).toLowerCase().trim();
      if (fullStr.includes("no") || fullStr.includes("code 2") || fullStr.startsWith("2") || fullStr === "2") return true;
    }
  }

  // Rule 13: BMI threshold check for Q88 (Skip Q88 if BMI >= 20)
  if (qNum === 88) {
    const bmi = calculateBMIFromForm(formData);
    if (bmi !== null && bmi >= 20) {
      return true;
    }
  }

  // Rule 11: Combined Q58 & Q59 check for Q65
  if (qNum === 65) {
    const findQ = (num) => (allQuestions || []).find(item => {
      const t = String(item.title || "").toLowerCase();
      return t.startsWith(`q${num}`) || t.includes(`q${num}`);
    });
    const getCode = (parentQ) => {
      if (!parentQ) return null;
      const val = formData[`custom_${parentQ.id}`] !== undefined ? formData[`custom_${parentQ.id}`] : formData[parentQ.id];
      if (val === undefined || val === null || val === "") return null;
      const opts = Array.isArray(parentQ.options) ? parentQ.options : [];
      const idx = opts.findIndex(o => getOptionLabel(o) === getOptionLabel(val));
      return getOptionCode(val, idx >= 0 ? idx : 0);
    };

    const c58 = getCode(findQ(58));
    const c59 = getCode(findQ(59));

    if ((c58 === "0" || c58 === "1") && (c59 === "0" || c59 === "1")) {
      return true; // Skip Q65 if both Q58 & Q59 are 0 or 1
    }
  }

  // Rule 12: Q81 non-code 6 check for Q83
  if (qNum === 83) {
    const findQ = (num) => (allQuestions || []).find(item => String(item.title || "").toLowerCase().startsWith(`q${num}`));
    const q81 = findQ(81);
    if (q81) {
      const val = formData[`custom_${q81.id}`] !== undefined ? formData[`custom_${q81.id}`] : formData[q81.id];
      if (val) {
        const opts = Array.isArray(q81.options) ? q81.options : [];
        const idx = opts.findIndex(o => getOptionLabel(o) === getOptionLabel(val));
        const code = getOptionCode(val, idx >= 0 ? idx : 0);
        if (code !== "6") return true; // Skip Q83 if Q81 is NOT Code 6
      }
    }
  }

  // Rule 14: Q94 Code 2 check for Section 14 (Q95, Q96)
  if (qNum === 95 || qNum === 96) {
    const findQ = (num) => (allQuestions || []).find(item => String(item.title || "").toLowerCase().startsWith(`q${num}`));
    const q94 = findQ(94);
    if (q94) {
      const val = formData[`custom_${q94.id}`] !== undefined ? formData[`custom_${q94.id}`] : formData[q94.id];
      if (val) {
        const opts = Array.isArray(q94.options) ? q94.options : [];
        const idx = opts.findIndex(o => getOptionLabel(o) === getOptionLabel(val));
        const code = getOptionCode(val, idx >= 0 ? idx : 0);
        if (code === "2") return true; // Skip to Section 15
      }
    }
  }

  // Rule 15 & 16: Q97 & Q103 contact attempt outcomes
  if (qNum >= 98 && qNum <= 106) {
    const findQ = (num) => (allQuestions || []).find(item => String(item.title || "").toLowerCase().startsWith(`q${num}`));
    const q97 = findQ(97);
    if (q97) {
      const val = formData[`custom_${q97.id}`] !== undefined ? formData[`custom_${q97.id}`] : formData[q97.id];
      if (val) {
        const opts = Array.isArray(q97.options) ? q97.options : [];
        const idx = opts.findIndex(o => getOptionLabel(o) === getOptionLabel(val));
        const code = getOptionCode(val, idx >= 0 ? idx : 0);
        if (code === "1") return true; // Skip Q98-Q106, jump to Q107
      }
    }
  }

  if (qNum === 105 || qNum === 106) {
    const findQ = (num) => (allQuestions || []).find(item => String(item.title || "").toLowerCase().startsWith(`q${num}`));
    const q103 = findQ(103);
    if (q103) {
      const val = formData[`custom_${q103.id}`] !== undefined ? formData[`custom_${q103.id}`] : formData[q103.id];
      if (val) {
        const opts = Array.isArray(q103.options) ? q103.options : [];
        const idx = opts.findIndex(o => getOptionLabel(o) === getOptionLabel(val));
        const code = getOptionCode(val, idx >= 0 ? idx : 0);
        if (code === "1") return true; // Skip Q105-Q106, jump to Q107
      }
    }
  }

  // Gather rules: explicit q.skipRules array, fallback to default rules or single q.skipRule
  let rules = Array.isArray(q.skipRules) && q.skipRules.length > 0 ? q.skipRules : [];

  if (rules.length === 0 && q.skipRule && q.skipRule.dependsOn) {
    rules = [q.skipRule];
  }

  if (rules.length === 0) {
    const qIdStr = qNum ? `q${qNum}` : q.id;
    rules = getDefaultSkipRulesForQuestion(qIdStr);
  }

  if (!rules || rules.length === 0) return false;

  // Helper to find parent question in schema
  const findParentQ = (dependsOnId) => {
    if (!dependsOnId) return null;
    const depStr = String(dependsOnId).toLowerCase().trim();
    return (allQuestions || []).find(item => {
      if (item.id === dependsOnId) return true;
      const t = String(item.title || "").toLowerCase();
      const m = t.match(/^Q(\d+)/i);
      if (m && depStr.includes(`q${m[1]}`)) return true;
      return t.startsWith(depStr) || t.includes(depStr);
    });
  };

  // Helper to extract selected code(s) from formData
  const getSelectedResponseCodes = (parentQ) => {
    if (!parentQ || !formData) return [];
    
    const pId = parentQ.id || '';
    const m = pId.match(/q\d+/i);
    const baseId = m ? m[0].toLowerCase() : pId.toLowerCase();

    let val = undefined;
    const candidates = [
      parentQ.id,
      baseId,
      `custom_${baseId}`,
      `custom_${parentQ.id}`,
      `mem_scrn_${baseId}`
    ];

    for (const c of candidates) {
      if (c && formData[c] !== undefined && formData[c] !== null && formData[c] !== "") {
        val = formData[c];
        break;
      }
    }

    if (val === undefined || val === null || val === "") return [];

    const opts = Array.isArray(parentQ.options) ? parentQ.options : [];
    const valArray = Array.isArray(val) ? val : [val];

    return valArray.map(sel => {
      const idx = opts.findIndex(o => getOptionLabel(o) === getOptionLabel(sel));
      return getOptionCode(sel, idx >= 0 ? idx : 0);
    });
  };

  for (const rule of rules) {
    if (!rule || !rule.dependsOn) continue;
    
    // Check target question match if specified
    if (rule.targetQuestion) {
      const targets = String(rule.targetQuestion).toLowerCase().split(',').map(s => s.trim());
      const isTarget = currNum => currNum ? targets.some(t => t === `q${currNum}` || t.includes(`q${currNum}`)) : false;
      if (!isTarget(qNum)) {
        continue; // If q is not in targetQuestion list, skip this rule!
      }
    }

    const parentQ = findParentQ(rule.dependsOn);
    if (!parentQ) continue;

    const codes = getSelectedResponseCodes(parentQ);
    if (codes.length === 0) continue; // Not answered yet

    const targetVals = String(rule.value || "").split(',').map(s => s.trim().toUpperCase());
    const condition = String(rule.condition || "equals").toLowerCase();
    const action = String(rule.action || "hide").toLowerCase();

    let ruleMatches = false;

    if (condition === "equals" || condition === "in") {
      ruleMatches = codes.some(c => targetVals.includes(c.toUpperCase()));
    } else if (condition === "not_equals" || condition === "not_in") {
      ruleMatches = !codes.some(c => targetVals.includes(c.toUpperCase()));
    } else if (condition === "not_contains") {
      ruleMatches = !codes.some(c => targetVals.includes(c.toUpperCase()));
    } else if (condition === "is_answered") {
      ruleMatches = codes.length > 0;
    } else if (condition === "is_empty") {
      ruleMatches = codes.length === 0;
    }

    if (ruleMatches && action === "hide") {
      return true; // Question is skipped
    }
    if (!ruleMatches && action === "show") {
      return true; // Question is skipped because show condition was not met
    }
  }

  return false;
}
