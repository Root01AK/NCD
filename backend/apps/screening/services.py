import re
import time
import json
import sys
from pathlib import Path
from django.db import connection, transaction
from .models import CmsScreening

from ..clinical.models import CmsMdhl
from ..clinical.validators import ClinicalValidator
from ..clinical.skip_logic import SkipLogicEngine

class ParticipantIdService:
    """
    Generates location-aware deterministic participant sequence IDs
    following the protocol specification: NCD{LOC}{SEQ:04d} (e.g. NCDDH0001).
    Optimized for 15,000+ records using indexed reverse-order lookups.
    """
    @classmethod
    def get_location_prefix(cls, location_name):
        loc_clean = str(location_name or 'Dharavi').strip().lower()
        if 'dharavi' in loc_clean or loc_clean == 'dh':
            return 'DH'
        elif 'malvani' in loc_clean or loc_clean == 'ml':
            return 'ML'
        elif 'vashi' in loc_clean or loc_clean == 'va':
            return 'VA'
        elif 'kurla' in loc_clean or loc_clean == 'ku':
            return 'KU'
        elif 'ghatkopar' in loc_clean or loc_clean == 'gh':
            return 'GH'
        elif 'other' in loc_clean or loc_clean == 'ot':
            return 'OT'
        
        alphanumeric = re.sub(r'[^a-zA-Z0-9]', '', loc_clean)
        return alphanumeric[:2].upper() if len(alphanumeric) >= 2 else 'DH'

    @classmethod
    def get_next_id(cls, location_name='Dharavi'):
        ScreeningSubmissionService.ensure_table_exists()
        prefix = cls.get_location_prefix(location_name)
        prefix_key = f"NCD{prefix}"

        # Query recent sequence numbers in cms_screening using index
        max_seq = 0
        screening_pids = []
        try:
            screening_pids = list(CmsScreening.objects.filter(
                mem_scrn_part_id__istartswith=prefix_key
            ).order_by('-mem_scrn_id')[:250].values_list('mem_scrn_part_id', flat=True))
        except Exception:
            pass

        for pid in screening_pids:
            match = re.match(rf'^NCD{prefix}(\d+)$', str(pid).strip(), re.IGNORECASE)
            if match:
                seq = int(match.group(1))
                if seq > max_seq:
                    max_seq = seq

        # Check cms_mdhl table as fallback
        try:
            mdhl_pids = list(CmsMdhl.objects.filter(
                mem_scrn_part_id__istartswith=prefix_key
            ).order_by('-mem_scrn_id')[:250].values_list('mem_scrn_part_id', flat=True))
            for pid in mdhl_pids:
                match = re.match(rf'^NCD{prefix}(\d+)$', str(pid).strip(), re.IGNORECASE)
                if match:
                    seq = int(match.group(1))
                    if seq > max_seq:
                        max_seq = seq
        except Exception:
            pass

        next_seq = max_seq + 1
        next_id = f"NCD{prefix}{next_seq:04d}"

        return {
            'status': 'success',
            'location': location_name,
            'prefix': prefix,
            'max_seq': max_seq,
            'next_seq': next_seq,
            'participant_id': next_id
        }


class ScreeningSubmissionService:
    """
    Handles end-to-end participant screening section submissions,
    safety validation, skip logic evaluation, auto-calculated indices,
    and cumulative JSON state merging. Optimized for 15,000+ volume.
    """
    @classmethod
    def process_submission(cls, payload):
        if not payload:
            raise ValueError("No survey payload received.")

        part_id = payload.get('mem_scrn_part_id') or payload.get('participant_id') or payload.get('id')
        if not part_id:
            loc = payload.get('location') or 'Dharavi'
            part_id = ParticipantIdService.get_next_id(loc)['participant_id']

        # 1. Run Clinical & Plausibility Validation
        ClinicalValidator.validate_all_clinical(payload)

        # 2. Evaluate Clinical Skip Logic & Calculate Scores
        skip_results = SkipLogicEngine.evaluate(payload)
        payload['_skip_logic_evaluation'] = skip_results
        payload['_computed_scores'] = skip_results.get('computed_scores', {})

        # Ensure table exists in MySQL
        cls.ensure_table_exists()

        now = int(time.time())
        part_id_clean = str(part_id).strip()
        payload['mem_scrn_part_id'] = part_id_clean
        payload['record_date'] = now

        existing = CmsScreening.objects.filter(mem_scrn_part_id__iexact=part_id_clean).first()

        if existing:
            old_json = {}
            if existing.mem_scrn_q30:
                try:
                    old_json = json.loads(existing.mem_scrn_q30) if isinstance(existing.mem_scrn_q30, str) else existing.mem_scrn_q30
                except Exception:
                    old_json = {}

            merged = {**old_json, **payload}
            existing.mem_scrn_q30 = json.dumps(merged)
            existing.mem_scrn_q16 = merged.get('fullName') or merged.get('full_name') or merged.get('mem_scrn_q16') or existing.mem_scrn_q16
            
            age_val = merged.get('age') or merged.get('mem_scrn_q1')
            if age_val is not None:
                try: existing.mem_scrn_q1 = int(age_val)
                except Exception: pass

            gender_val = str(merged.get('gender') or merged.get('mem_scrn_q2') or '1')
            existing.mem_scrn_q2 = '1' if gender_val in ('Male', '1', 'm') else '2'
            existing.mem_scrn_q17 = merged.get('location') or merged.get('mem_scrn_q17') or existing.mem_scrn_q17
            existing.mem_scrn_loc = merged.get('location') or existing.mem_scrn_loc
            if payload.get('eligible') is not None:
                existing.mem_scrn_q24 = 1 if payload.get('eligible') else 0
            if payload.get('enrolled') is not None:
                existing.mem_scrn_q25 = 1 if payload.get('enrolled') else 0
            existing.update_time = now
            existing.save()
        else:
            full_name = payload.get('fullName') or payload.get('full_name') or payload.get('mem_scrn_q16') or 'Participant'
            age_val = payload.get('age') or payload.get('mem_scrn_q1') or 45
            gender_val = str(payload.get('gender') or payload.get('mem_scrn_q2') or '1')
            loc_val = payload.get('location') or payload.get('mem_scrn_q17') or 'Dharavi'

            new_record = CmsScreening(
                mem_scrn_part_id=part_id,
                mem_scrn_survey=payload.get('survey_name') or 'NCD',
                mem_scrn_loc=loc_val,
                mem_scrn_date=now,
                mem_scrn_q1=int(age_val) if str(age_val).isdigit() else 45,
                mem_scrn_q2='1' if gender_val in ('Male', '1', 'm') else '2',
                mem_scrn_q16=full_name,
                mem_scrn_q17=loc_val,
                mem_scrn_q24=1 if payload.get('eligible') else 0,
                mem_scrn_q25=1 if payload.get('enrolled') else 0,
                mem_scrn_q30=json.dumps(payload),
                status='1',
                create_time=now,
                record_date=now
            )
            new_record.save()

        return {
            'status': 'success',
            'message': 'Screening section saved successfully',
            'participant_id': part_id,
            'skip_logic': skip_results
        }

    @classmethod
    def process_batch(cls, items):
        """
        Processes a batch of survey submissions in a single atomic transaction.
        Ideal for high-concurrency offline sync of 50-500 surveys at once.
        """
        if not isinstance(items, list):
            raise ValueError("Expected a list of survey items for batch processing.")

        cls.ensure_table_exists()
        results = []
        synced_count = 0
        failed_count = 0

        with transaction.atomic():
            for item in items:
                try:
                    res = cls.process_submission(item)
                    results.append(res)
                    synced_count += 1
                except Exception as e:
                    results.append({
                        'status': 'error',
                        'participant_id': item.get('participant_id') or item.get('mem_scrn_part_id'),
                        'error': str(e)
                    })
                    failed_count += 1

        return {
            'status': 'success' if failed_count == 0 else 'partial_success',
            'total_items': len(items),
            'synced_count': synced_count,
            'failed_count': failed_count,
            'results': results
        }

    @classmethod
    def ensure_table_exists(cls):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `cms_screening` (
                  `mem_scrn_id` int(11) NOT NULL AUTO_INCREMENT,
                  `mem_scrn_survey` varchar(50) DEFAULT 'NCD',
                  `mem_scrn_loc` varchar(50) DEFAULT 'Dharavi',
                  `mem_scrn_date` int(11) DEFAULT NULL,
                  `mem_scrn_part_id` varchar(100) NOT NULL,
                  `mem_scrn_q1` int(11) DEFAULT NULL,
                  `mem_scrn_q2` varchar(50) DEFAULT NULL,
                  `mem_scrn_q16` varchar(255) DEFAULT NULL,
                  `mem_scrn_q17` varchar(100) DEFAULT NULL,
                  `mem_scrn_q24` int(11) DEFAULT 0,
                  `mem_scrn_q25` int(11) DEFAULT 0,
                  `mem_scrn_q30` longtext DEFAULT NULL,
                  `status` varchar(1) DEFAULT '1',
                  `create_time` int(11) DEFAULT NULL,
                  `update_time` int(11) DEFAULT NULL,
                  `record_date` int(11) DEFAULT NULL,
                  PRIMARY KEY (`mem_scrn_id`),
                  KEY `idx_part_id` (`mem_scrn_part_id`),
                  KEY `idx_loc` (`mem_scrn_loc`),
                  KEY `idx_status_loc` (`status`, `mem_scrn_loc`),
                  KEY `idx_status_date` (`status`, `record_date`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
