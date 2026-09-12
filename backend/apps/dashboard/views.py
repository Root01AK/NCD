import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import connection
from apps.screening.models import CmsScreening
from apps.clinical.models import CmsMdhl

from apps.screening.services import ScreeningSubmissionService

class ScreeningListView(APIView):
    """
    GET /api/v1/dashboard/screeninglist
    Returns list of all participant screenings with unpacked JSON sections.
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
            }
            if isinstance(extra, dict):
                row_dict.update(extra)

            data.append(row_dict)

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


class EligibleListView(APIView):
    """
    GET /api/v1/dashboard/eligiblelist
    """
    def get(self, request):
        rows = CmsScreening.objects.filter(mem_scrn_q24=1).order_by('mem_scrn_id')
        data = [{'mem_scrn_part_id': r.mem_scrn_part_id, 'mem_scrn_q16': r.mem_scrn_q16, 'mem_scrn_loc': r.mem_scrn_loc} for r in rows]
        return Response({'status': 'success', 'data': data})


class EnrolledListView(APIView):
    """
    GET /api/v1/dashboard/enrolledlist
    """
    def get(self, request):
        rows = CmsScreening.objects.filter(mem_scrn_q25=1).order_by('mem_scrn_id')
        data = [{'mem_scrn_part_id': r.mem_scrn_part_id, 'mem_scrn_q16': r.mem_scrn_q16, 'mem_scrn_loc': r.mem_scrn_loc} for r in rows]
        return Response({'status': 'success', 'data': data})


class ResetDatabaseView(APIView):
    """
    GET /api/v1/dashboard/resetdatabase
    """
    def get(self, request):
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
            'message': 'All screening tables truncated successfully!'
        })
