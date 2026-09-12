import pytest
from apps.clinical.skip_logic import SkipLogicEngine
from apps.clinical.validators import ClinicalValidator
from rest_framework.exceptions import ValidationError

def test_q9_exclusive_and_skip():
    # Code 16 exclusive
    res1 = SkipLogicEngine.evaluate({'q9': ['16']})
    assert res1['routes'].get('q9_exclusive') is True
    assert 'q10' in res1['skipped_questions']

    # Code 11 checked
    res2 = SkipLogicEngine.evaluate({'q9': ['11']})
    assert 'q10' not in res2['skipped_questions']

def test_q11_skip_to_q13():
    res = SkipLogicEngine.evaluate({'q11': '2'})
    assert 'q12' in res['skipped_questions']
    assert res['routes'].get('q11_skip_to_q13') is True

def test_q17_alcohol_abstainer_past_current_skips():
    # Lifetime abstainer (1) -> skips Q18 to Q23
    res_abstainer = SkipLogicEngine.evaluate({'q17': '1'})
    for q in ['q18', 'q19', 'q20', 'q21', 'q22', 'q23']:
        assert q in res_abstainer['skipped_questions']

    # Past drinker (2) -> answers Q18/Q19, skips Q20 to Q23
    res_past = SkipLogicEngine.evaluate({'q17': '2'})
    assert 'q18' not in res_past['skipped_questions']
    assert 'q19' not in res_past['skipped_questions']
    assert 'q20' in res_past['skipped_questions']

    # Current drinker (3) -> skips Q18/Q19, answers Q20 to Q23
    res_current = SkipLogicEngine.evaluate({'q17': '3'})
    assert 'q18' in res_current['skipped_questions']
    assert 'q19' in res_current['skipped_questions']
    assert 'q20' not in res_current['skipped_questions']

def test_q30_audit_c_threshold_screening():
    # Men below threshold (< 4) skips to Q33
    res_neg = SkipLogicEngine.evaluate({'q28': 1, 'q29': 1, 'q30': 1, 'gender': 'Male'})
    assert res_neg['computed_scores']['audit_c_score'] == 3
    assert 'q31' in res_neg['skipped_questions']
    assert 'q32' in res_neg['skipped_questions']

    # Men at or above threshold (>= 4) administers full AUDIT
    res_pos = SkipLogicEngine.evaluate({'q28': 2, 'q29': 2, 'q30': 1, 'gender': 'Male'})
    assert res_pos['computed_scores']['audit_c_score'] == 5
    assert 'q31' not in res_pos['skipped_questions']

def test_q58_q59_mental_health_screening():
    # Both 0 or 1 -> skips GAD-7 and PHQ-9
    res_neg = SkipLogicEngine.evaluate({'q58': '0', 'q59': '1'})
    assert 'q60' in res_neg['skipped_questions']
    for q in ['q61', 'q62', 'q63', 'q64']:
        assert q in res_neg['skipped_questions']

    # Q58 == 2 -> GAD-7 active
    res_gad = SkipLogicEngine.evaluate({'q58': '2', 'q59': '0'})
    assert 'q60' not in res_gad['skipped_questions']

    # Q59 == 3 -> PHQ-9 active
    res_phq = SkipLogicEngine.evaluate({'q58': '0', 'q59': '3'})
    assert 'q61' not in res_phq['skipped_questions']

def test_compulsory_safety_validation_suicide_risk():
    # PHQ-9 Q64 > 0 without Q65 escalation must fail
    with pytest.raises(ValidationError) as excinfo:
        ClinicalValidator.validate_safety_escalation({'q64': 2, 'q65': ''})
    assert 'q65' in excinfo.value.detail

    # PHQ-9 Q64 > 0 WITH Q65 escalation must succeed
    ClinicalValidator.validate_safety_escalation({
        'q64': 2,
        'q65': 'Immediate psychiatric consultation and family safety plan documented.'
    })

def test_plausibility_range_checks():
    # Age out of range (> 120 e.g. 1222) must fail
    with pytest.raises(ValidationError):
        ClinicalValidator.validate_plausibility('age', 1222)

    # Valid age (45) must succeed
    assert ClinicalValidator.validate_plausibility('age', 45) == 45

    # 10-digit phone must succeed
    assert ClinicalValidator.validate_contact_number('9876543210') == '9876543210'

    # Invalid phone (alphabets or wrong length) must fail
    with pytest.raises(ValidationError):
        ClinicalValidator.validate_contact_number('98765abcde')
