import math

def calculate_bmi(weight_kg, height_cm):
    """
    Calculate Body Mass Index (BMI).
    Formula: weight (kg) / [height (m)]^2
    """
    try:
        w = float(weight_kg)
        h = float(height_cm)
        if h > 3.0: # If given in cm, convert to meters
            h = h / 100.0
        if h <= 0 or w <= 0:
            return None
        bmi = w / (h * h)
        return round(bmi, 2)
    except (ValueError, TypeError, ZeroDivisionError):
        return None


def calculate_whr(waist_cm, hip_cm):
    """
    Calculate Waist-to-Hip Ratio (WHR).
    Formula: waist (cm) / hip (cm)
    """
    try:
        w = float(waist_cm)
        h = float(hip_cm)
        if h <= 0 or w <= 0:
            return None
        whr = w / h
        return round(whr, 2)
    except (ValueError, TypeError, ZeroDivisionError):
        return None


def calculate_mean_bp(sys2, sys3, dia2, dia3):
    """
    Calculate Mean Blood Pressure from 2nd and 3rd clinical readings.
    """
    try:
        s2, s3 = float(sys2), float(sys3)
        d2, d3 = float(dia2), float(dia3)
        mean_sys = round((s2 + s3) / 2.0, 1)
        mean_dia = round((d2 + d3) / 2.0, 1)
        return mean_sys, mean_dia
    except (ValueError, TypeError):
        return None, None


def calculate_hsi(q21_time_to_first, q22_cigarettes_per_day):
    """
    Heaviness of Smoking Index (HSI) total: Q21 + Q22 out of 6.
    Score >= 4 indicates high dependence and routes to cessation counseling at Q111.
    """
    try:
        score = int(q21_time_to_first or 0) + int(q22_cigarettes_per_day or 0)
        return min(max(score, 0), 6)
    except (ValueError, TypeError):
        return 0


def calculate_audit_c(q28_freq, q29_quantity, q30_binge):
    """
    AUDIT-C Total Score: Q28 + Q29 + Q30.
    Positive screen threshold: >= 4 for men, >= 3 for women and transgender participants.
    """
    try:
        score = int(q28_freq or 0) + int(q29_quantity or 0) + int(q30_binge or 0)
        return score
    except (ValueError, TypeError):
        return 0


def is_audit_c_positive(audit_c_score, gender):
    """
    Check if AUDIT-C score is positive based on gender.
    """
    g = str(gender).strip().lower()
    threshold = 4 if g in ('male', '1', 'm') else 3
    return audit_c_score >= threshold


def calculate_gad7(responses):
    """
    Calculate GAD-7 Anxiety Score (Sum of 7 items, scale 0-21).
    """
    try:
        return sum(int(r or 0) for r in responses[:7])
    except (ValueError, TypeError):
        return 0


def calculate_phq9(responses):
    """
    Calculate PHQ-9 Depression Score (Sum of 9 items, scale 0-27).
    """
    try:
        return sum(int(r or 0) for r in responses[:9])
    except (ValueError, TypeError):
        return 0
