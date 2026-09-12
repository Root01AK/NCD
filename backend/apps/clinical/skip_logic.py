from .scores import calculate_bmi, calculate_whr, calculate_audit_c, is_audit_c_positive, calculate_hsi

class SkipLogicEngine:
    """
    Evaluates clinical survey skip logic across all 16 survey sections
    according to the NCD Clinical Protocol Specification (Rules R1 - R18).
    """

    @classmethod
    def evaluate(cls, data):
        """
        Takes raw survey response payload and computes:
        - skipped_questions: list of question numbers that must be skipped
        - active_routes: dictionary of dynamic branching decisions
        - calculated_scores: computed indices (BMI, WHR, AUDIT-C, HSI, etc.)
        """
        skipped = set()
        routes = {}
        computed = {}

        # -------------------------------------------------------------
        # Section 2 & 3: Tobacco & Smoking
        # -------------------------------------------------------------
        # Rule 1: Q9 Code 16 is exclusive
        q9_selected = data.get('q9', [])
        if isinstance(q9_selected, str):
            q9_selected = [s.strip() for s in q9_selected.split(',') if s.strip()]

        if 16 in q9_selected or '16' in q9_selected:
            routes['q9_exclusive'] = True

        # Rule 2: In Q9, if code 11 is not ticked, skip to Q11
        if 11 not in q9_selected and '11' not in q9_selected:
            skipped.add('q10')
            routes['q9_to_q11_skip'] = True

        # Rule 3: If Q11 is opted to code 2 or 3, skip to Q13
        q11 = str(data.get('q11', '')).strip()
        if q11 in ('2', '3'):
            skipped.add('q12')
            routes['q11_skip_to_q13'] = True

        # Rule 4: If Q14 is opted to code 2, skip to Q17
        q14 = str(data.get('q14', '')).strip()
        if q14 == '2':
            for q in ['q15', 'q16']:
                skipped.add(q)
            routes['q14_skip_to_q17'] = True

        # Heaviness of Smoking Index (HSI)
        q21 = data.get('q21')
        q22 = data.get('q22')
        if q21 is not None and q22 is not None:
            hsi = calculate_hsi(q21, q22)
            computed['hsi_score'] = hsi
            if hsi >= 4:
                routes['high_dependence_cessation_counseling'] = True

        # -------------------------------------------------------------
        # Section 4: Alcohol Use (AUDIT-C)
        # -------------------------------------------------------------
        # Rule 5: Q17 Logic
        # - Code 1: Skip to Q24 (Lifetime abstainer)
        # - Code 2: Answer Q18 & Q19 then skip to Q24 (Past drinker)
        # - Code 3: Skip Q18 & Q19, answer Q20 to Q23 (Current drinker)
        q17 = str(data.get('q17', '')).strip()
        if q17 == '1':
            for i in range(18, 24):
                skipped.add(f'q{i}')
            routes['q17_abstainer_skip_to_q24'] = True
        elif q17 == '2':
            for i in range(20, 24):
                skipped.add(f'q{i}')
            routes['q17_past_drinker_skip_to_q24'] = True
        elif q17 == '3':
            skipped.add('q18')
            skipped.add('q19')
            routes['q17_current_drinker_answer_q20_q23'] = True

        # Rule 7: AUDIT-C score screen (Q28, Q29, Q30)
        q28 = data.get('q28')
        q29 = data.get('q29')
        q30 = data.get('q30')
        gender = data.get('gender') or data.get('q2') or 'Male'

        if q28 is not None or q29 is not None or q30 is not None:
            audit_score = calculate_audit_c(q28, q29, q30)
            computed['audit_c_score'] = audit_score
            is_pos = is_audit_c_positive(audit_score, gender)
            computed['audit_c_positive'] = is_pos

            if not is_pos:
                # If below threshold, skip full AUDIT (Q31, Q32) to Q33
                skipped.add('q31')
                skipped.add('q32')
                routes['audit_below_threshold_skip_to_q33'] = True
            else:
                routes['administer_full_audit'] = True

        # -------------------------------------------------------------
        # Section 5: Diet & Salt
        # -------------------------------------------------------------
        # Rule 6: Q25 Logic
        # - Code 1: Skip to Q33
        # - Code 2: Answer Q26 then skip to Q33
        # - Code 3: Skip Q26 and answer Q27 onward
        q25 = str(data.get('q25', '')).strip()
        if q25 == '1':
            for i in range(26, 33):
                skipped.add(f'q{i}')
            routes['q25_skip_to_q33'] = True
        elif q25 == '2':
            for i in range(27, 33):
                skipped.add(f'q{i}')
            routes['q25_answer_q26_skip_to_q33'] = True
        elif q25 == '3':
            skipped.add('q26')
            routes['q25_answer_q27_onward'] = True

        # -------------------------------------------------------------
        # Section 6: Physical Activity
        # -------------------------------------------------------------
        # Rule 8: Q33 Logic
        # - Code 1 or 5: Skip to Q37
        # - Code 2 or 3: Answer Q34 then skip to Q37
        # - Code 4: Answer Q34 to Q36
        q33 = str(data.get('q33', '')).strip()
        if q33 in ('1', '5'):
            for i in range(34, 37):
                skipped.add(f'q{i}')
            routes['q33_skip_to_q37'] = True
        elif q33 in ('2', '3'):
            for i in range(35, 37):
                skipped.add(f'q{i}')
            routes['q33_answer_q34_skip_to_q37'] = True
        elif q33 == '4':
            routes['q33_answer_q34_to_q36'] = True

        # -------------------------------------------------------------
        # Section 7: Medical History & Chronic Diseases
        # -------------------------------------------------------------
        # Rule 9: Q40 (Hypertension Dx) == 2 (No) -> Skip Q41 to Q42
        if str(data.get('q40', '')).strip() == '2':
            skipped.add('q41')
            routes['q40_no_htn_skip_to_q42'] = True

        # Rule 10: Q43 (Diabetes Dx) == 2 (No) -> Skip Q43b to Q44
        if str(data.get('q43', '')).strip() == '2':
            skipped.add('q43_med')
            routes['q43_no_diabetes_skip_to_q44'] = True

        # Rule 11: Q44 (Heart Disease Dx) == 2 (No) -> Skip Q45 to Q46
        if str(data.get('q44', '')).strip() == '2':
            skipped.add('q45')
            routes['q44_no_cvd_skip_to_q46'] = True

        # Rule 12: Q46 (Kidney Disease Dx) == 2 (No) -> Skip Q47 to Q48
        if str(data.get('q46', '')).strip() == '2':
            skipped.add('q47')
            routes['q46_no_ckd_skip_to_q48'] = True

        # -------------------------------------------------------------
        # Section 8: Mental Health (PHQ-9 & GAD-7)
        # -------------------------------------------------------------
        # Rule 13:
        # - If Q58 is 2 or 3 -> Administer GAD-7 (Q60)
        # - If Q59 is 2 or 3 -> Administer PHQ-9 (Q61-Q64)
        # - If both Q58 & Q59 are 0 or 1 -> Skip to Q65 / Section 9
        q58 = str(data.get('q58', '')).strip()
        q59 = str(data.get('q59', '')).strip()

        gad7_active = q58 in ('2', '3')
        phq9_active = q59 in ('2', '3')

        if not gad7_active:
            skipped.add('q60')
        if not phq9_active:
            for i in range(61, 65):
                skipped.add(f'q{i}')

        if not gad7_active and not phq9_active and q58 in ('0', '1') and q59 in ('0', '1'):
            routes['mental_health_all_negative_skip_to_q65'] = True

        # -------------------------------------------------------------
        # Section 9: Physical Measurements & Calculations
        # -------------------------------------------------------------
        weight = data.get('weight') or data.get('q68')
        height = data.get('height') or data.get('q67')
        if weight and height:
            bmi = calculate_bmi(weight, height)
            if bmi is not None:
                computed['bmi'] = bmi
                # Rule 15: Q88 only if BMI at Q69 is below 20. If BMI >= 20, skip to Q89
                if bmi >= 20.0:
                    skipped.add('q88')
                    routes['bmi_normal_skip_q88_to_q89'] = True
                else:
                    routes['undernutrition_guidance_q88_active'] = True

        waist = data.get('waist') or data.get('q70')
        hip = data.get('hip') or data.get('q71')
        if waist and hip:
            whr = calculate_whr(waist, hip)
            if whr is not None:
                computed['waist_hip_ratio'] = whr

        # -------------------------------------------------------------
        # Section 10: Oral Health
        # -------------------------------------------------------------
        # Rule 14: Q81 if not opted code 6 skip Q83
        q81 = str(data.get('q81', '')).strip()
        if q81 != '6' and '6' not in q81:
            skipped.add('q83')
            routes['no_oral_lesion_skip_q83'] = True

        # -------------------------------------------------------------
        # Section 12-14: Referral & Follow-up Attempts
        # -------------------------------------------------------------
        # Rule 16: Q94 if opted code 2 skip to Section 15
        q94 = str(data.get('q94', '')).strip()
        if q94 == '2':
            for i in range(95, 107):
                skipped.add(f'q{i}')
            routes['no_referral_skip_to_section15'] = True

        # Rule 17: Q97 (Attempt 1) if code 1, Skip to Q107 (Close record); otherwise proceed to Attempt 2
        q97 = str(data.get('q97', '')).strip()
        if q97 == '1':
            for i in range(98, 107):
                skipped.add(f'q{i}')
            routes['attempt1_linked_close_remaining_attempts'] = True

        # Rule 18: Q103 (Attempt 3) if code 1 go to Q107. Any other outcome closes record as lost to follow-up
        q103 = str(data.get('q103', '')).strip()
        if q103 and q103 != '1':
            routes['lock_as_lost_to_follow_up'] = True
            routes['q104_mandatory'] = True

        return {
            'skipped_questions': sorted(list(skipped)),
            'routes': routes,
            'computed_scores': computed
        }
