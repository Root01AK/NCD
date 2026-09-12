import re
from rest_framework.exceptions import ValidationError

class ClinicalValidator:
    """
    Validates clinical plausibility bounds and critical patient safety rules.
    """
    RANGES = {
        'age': (18, 120, 'Age must be between 18 and 120 years.'),
        'waist_hip_ratio': (0.60, 1.40, 'Waist-to-hip ratio must be between 0.60 and 1.40.'),
        'bmi': (10.0, 60.0, 'BMI must be between 10.0 and 60.0 kg/m².'),
        'systolic_bp': (70, 260, 'Systolic blood pressure must be between 70 and 260 mmHg.'),
        'diastolic_bp': (40, 160, 'Diastolic blood pressure must be between 40 and 160 mmHg.'),
        'rbs': (30, 600, 'Random blood sugar (RBS) must be between 30 and 600 mg/dL.'),
        'haemoglobin': (3.0, 20.0, 'Haemoglobin must be between 3.0 and 20.0 g/dL.'),
    }

    @classmethod
    def validate_contact_number(cls, phone):
        if phone:
            phone_str = str(phone).strip()
            if not re.match(r'^\d{10}$', phone_str):
                raise ValidationError({
                    'contact': 'Contact number must be exactly 10 digits without alphabets or special characters.'
                })
        return phone

    @classmethod
    def validate_plausibility(cls, field_name, value):
        if value is None or value == '':
            return value

        if field_name in cls.RANGES:
            min_val, max_val, err_msg = cls.RANGES[field_name]
            try:
                num_val = float(value)
                if num_val < min_val or num_val > max_val:
                    raise ValidationError({field_name: err_msg})
            except ValueError:
                raise ValidationError({field_name: f'Invalid numeric value for {field_name}.'})

        return value

    @classmethod
    def validate_safety_escalation(cls, payload):
        """
        Compulsory safety validation: Form cannot be submitted where PHQ-9 item 9
        (thoughts of self-harm / suicide at Q64) is positive (> 0) and the
        clinical safety escalation protocol field (Q65) is blank.
        """
        q64 = payload.get('q64') or payload.get('phq9_item9') or payload.get('mem_scrn_q64')
        q65 = payload.get('q65') or payload.get('escalation_protocol') or payload.get('mem_scrn_q65')

        try:
            if q64 is not None and int(q64) > 0:
                if not q65 or not str(q65).strip():
                    raise ValidationError({
                        'q65': 'Compulsory Clinical Safety Validation: PHQ-9 Item 9 (Self-harm/Suicide Risk) is positive. Escalation protocol (Q65) must be documented before proceeding.'
                    })
        except (ValueError, TypeError):
            pass

    @classmethod
    def validate_all_clinical(cls, data):
        """
        Run full validation suite on participant screening payload.
        """
        # 1. Contact validation
        if 'contact' in data:
            cls.validate_contact_number(data['contact'])
        if 'phone' in data:
            cls.validate_contact_number(data['phone'])
        if 'mem_scrn_q3' in data:
            cls.validate_contact_number(data['mem_scrn_q3'])

        # 2. Age plausibility
        age = data.get('age') or data.get('mem_scrn_q1')
        if age:
            cls.validate_plausibility('age', age)

        # 3. Numeric bounds
        if 'bmi' in data:
            cls.validate_plausibility('bmi', data['bmi'])
        if 'whr' in data or 'waist_hip_ratio' in data:
            cls.validate_plausibility('waist_hip_ratio', data.get('whr') or data.get('waist_hip_ratio'))
        if 'systolic_bp' in data:
            cls.validate_plausibility('systolic_bp', data['systolic_bp'])
        if 'diastolic_bp' in data:
            cls.validate_plausibility('diastolic_bp', data['diastolic_bp'])
        if 'rbs' in data:
            cls.validate_plausibility('rbs', data['rbs'])
        if 'haemoglobin' in data:
            cls.validate_plausibility('haemoglobin', data['haemoglobin'])

        # 4. Mandatory Safety check
        cls.validate_safety_escalation(data)

        return True
