import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from .models import CmsScreening
from .services import ParticipantIdService, ScreeningSubmissionService
from apps.clinical.models import CmsMdhl

class QueueView(APIView):
    """
    GET /api/v1/screening/queue
    Returns all participant screening queue entries with unpacked JSON data.
    """
    def get(self, request):
        ScreeningSubmissionService.ensure_table_exists()
        rows = CmsScreening.objects.all().order_by('-mem_scrn_id')
        data = []

        for r in rows:
            extra = {}
            if r.mem_scrn_q30:
                try:
                    extra = json.loads(r.mem_scrn_q30) if isinstance(r.mem_scrn_q30, str) else r.mem_scrn_q30
                except Exception:
                    extra = {}

            row_dict = {
                'mem_scrn_id': r.mem_scrn_id,
                'mem_scrn_survey': r.mem_scrn_survey,
                'mem_scrn_loc': r.mem_scrn_loc,
                'mem_scrn_date': r.mem_scrn_date,
                'mem_scrn_part_id': r.mem_scrn_part_id,
                'mem_scrn_q1': r.mem_scrn_q1,
                'mem_scrn_q2': r.mem_scrn_q2,
                'mem_scrn_q16': r.mem_scrn_q16,
                'mem_scrn_q17': r.mem_scrn_q17,
                'mem_scrn_q24': r.mem_scrn_q24,
                'mem_scrn_q25': r.mem_scrn_q25,
                'status': r.status,
                'create_time': r.create_time,
                'update_time': r.update_time,
                'record_date': r.record_date,
            }
            if isinstance(extra, dict):
                row_dict.update(extra)

            data.append(row_dict)

        # Fallback to cms_mdhl if queue is empty
        if not data:
            try:
                mdhl_rows = CmsMdhl.objects.all().order_by('-mem_scrn_id')
                for r in mdhl_rows:
                    extra = {}
                    if r.mem_scrn_q30:
                        try:
                            extra = json.loads(r.mem_scrn_q30) if isinstance(r.mem_scrn_q30, str) else r.mem_scrn_q30
                        except Exception:
                            extra = {}
                    item = {
                        'mem_scrn_id': r.mem_scrn_id,
                        'mem_scrn_part_id': r.mem_scrn_part_id,
                        'mem_scrn_loc': r.mem_scrn_loc,
                        'mem_scrn_q16': r.mem_scrn_q16,
                        'mem_scrn_q1': r.mem_scrn_q1,
                        'mem_scrn_q2': r.mem_scrn_q2,
                        'mem_scrn_q24': r.mem_scrn_q24,
                        'mem_scrn_q25': r.mem_scrn_q25,
                    }
                    if isinstance(extra, dict):
                        item.update(extra)
                    data.append(item)
            except Exception:
                pass

        return Response({
            'status': 'success',
            'data': data
        })


class NextParticipantIdView(APIView):
    """
    GET /api/v1/screening/next-participant-id?location=Dharavi
    Returns next sequential participant ID.
    """
    def get(self, request):
        location = request.query_params.get('location') or request.data.get('location') or 'Dharavi'
        result = ParticipantIdService.get_next_id(location)
        return Response(result)

    def post(self, request):
        location = request.data.get('location') or request.query_params.get('location') or 'Dharavi'
        result = ParticipantIdService.get_next_id(location)
        return Response(result)


class SubmitView(APIView):
    """
    POST /api/v1/screening/submit
    Saves screening section data, evaluates clinical skip logic, and calculates scores.
    """
    def post(self, request):
        try:
            payload = request.data
            result = ScreeningSubmissionService.process_submission(payload)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class DeleteView(APIView):
    """
    POST /api/v1/screening/delete
    Deletes participant from cms_screening and sub-tables.
    """
    def post(self, request):
        payload = request.data
        part_id = payload.get('mem_scrn_part_id') or payload.get('participant_id')
        local_id = payload.get('mem_scrn_id') or payload.get('id')

        if not part_id and not local_id:
            return Response({'status': 'error', 'message': 'Participant ID required'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            if local_id:
                cursor.execute("DELETE FROM cms_screening WHERE mem_scrn_id = %s", [local_id])
                try: cursor.execute("DELETE FROM cms_mdhl WHERE mem_scrn_id = %s", [local_id])
                except Exception: pass
            if part_id:
                cursor.execute("DELETE FROM cms_screening WHERE mem_scrn_part_id = %s", [part_id])
                for tbl, col in [('cms_mdhl', 'mem_scrn_part_id'), ('cms_apm', 'apm_pid'), ('cms_bsr', 'bsr_pid'),
                                 ('cms_ce', 'ce_pid'), ('cms_cml', 'cml_pid'), ('cms_cprca', 'cprca_pid'),
                                 ('cms_dg', 'dg_pid'), ('cms_fupm', 'fupm_pid'), ('cms_vital', 'vital_pid')]:
                    try: cursor.execute(f"DELETE FROM `{tbl}` WHERE `{col}` = %s", [part_id])
                    except Exception: pass

        return Response({'status': 'success', 'message': 'Participant screening record deleted successfully'})


class ResetAllView(APIView):
    """
    POST /api/v1/screening/reset-all
    Purges all screening records across all clinical tables.
    """
    def post(self, request):
        tables = [
            'cms_screening', 'cms_mdhl', 'cms_apm', 'cms_bsr',
            'cms_ce', 'cms_cml', 'cms_cprca', 'cms_dg', 'cms_fupm',
            'cms_vital', 'cms_mortalityform', 'cms_trackingform'
        ]
        with connection.cursor() as cursor:
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
            for tbl in tables:
                try: cursor.execute(f"TRUNCATE TABLE `{tbl}`;")
                except Exception: pass
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        return Response({
            'status': 'success',
            'message': 'All participant screening records deleted. Sequence reset to 0001.'
        })


class DetailView(APIView):
    """
    GET /api/v1/screening/detail?id=<participant_id>
    Returns individual participant screening record with fully unpacked data dictionary.
    """
    def get(self, request):
        pid = request.query_params.get('id') or request.query_params.get('participant_id') or request.query_params.get('mem_scrn_part_id')
        if not pid:
            return Response({'status': 'error', 'message': 'Participant ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        ScreeningSubmissionService.ensure_table_exists()
        rec = CmsScreening.objects.filter(mem_scrn_part_id__iexact=pid.strip()).first()
        if not rec and pid.isdigit():
            rec = CmsScreening.objects.filter(mem_scrn_id=int(pid)).first()

        if not rec:
            rec = CmsMdhl.objects.filter(mem_scrn_part_id__iexact=pid.strip()).first()

        if not rec:
            return Response({'status': 'error', 'message': f'Participant {pid} not found.'}, status=status.HTTP_404_NOT_FOUND)

        extra = {}
        if rec.mem_scrn_q30:
            try:
                extra = json.loads(rec.mem_scrn_q30) if isinstance(rec.mem_scrn_q30, str) else rec.mem_scrn_q30
            except Exception:
                extra = {}

        data = {
            'mem_scrn_id': rec.mem_scrn_id,
            'participant_id': rec.mem_scrn_part_id,
            'mem_scrn_part_id': rec.mem_scrn_part_id,
            'mem_scrn_survey': getattr(rec, 'mem_scrn_survey', 'NCD'),
            'mem_scrn_loc': rec.mem_scrn_loc,
            'location': rec.mem_scrn_loc,
            'mem_scrn_q16': rec.mem_scrn_q16,
            'fullName': rec.mem_scrn_q16,
            'mem_scrn_q1': rec.mem_scrn_q1,
            'age': rec.mem_scrn_q1,
            'mem_scrn_q2': rec.mem_scrn_q2,
            'gender': 'Male' if str(rec.mem_scrn_q2) == '1' else 'Female' if str(rec.mem_scrn_q2) == '2' else 'Transgender',
            'mem_scrn_q24': rec.mem_scrn_q24,
            'mem_scrn_q25': rec.mem_scrn_q25,
            'mem_scrn_q30': rec.mem_scrn_q30,
        }
        if isinstance(extra, dict):
            data.update(extra)

        return Response({
            'status': 'success',
            'data': data
        })

