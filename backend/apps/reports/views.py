import json
import csv
import io
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.screening.models import CmsScreening
from apps.screening.services import ScreeningSubmissionService
from apps.clinical.models import CmsCchv

class ExportScreeningCsvView(APIView):
    """
    GET /api/v1/reports/export/screening/csv
    Exports all participant screening records as structured CSV.
    """
    def get(self, request):
        ScreeningSubmissionService.ensure_table_exists()
        rows = CmsScreening.objects.all().order_by('mem_scrn_id')
        output = io.StringIO()
        writer = csv.writer(output)

        headers = [
            'ID', 'Participant_ID', 'Location', 'Full_Name', 'Age', 'Gender',
            'Eligible', 'Enrolled', 'Survey', 'Date'
        ]
        writer.writerow(headers)

        for r in rows:
            gender_str = 'Male' if r.mem_scrn_q2 == '1' else ('Female' if r.mem_scrn_q2 == '2' else 'Transgender')
            writer.writerow([
                r.mem_scrn_id,
                r.mem_scrn_part_id,
                r.mem_scrn_loc,
                r.mem_scrn_q16,
                r.mem_scrn_q1,
                gender_str,
                r.mem_scrn_q24,
                r.mem_scrn_q25,
                r.mem_scrn_survey,
                r.mem_scrn_date
            ])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ncd_screening_dataset.csv"'
        return response


class ExportCchvCsvView(APIView):
    """
    GET /api/v1/reports/export/cchv/csv
    Exports Community Health Survey dataset.
    """
    def get(self, request):
        rows = CmsCchv.objects.all()
        output = io.StringIO()
        writer = csv.writer(output)

        headers = ['ClientID', 'Location', 'Name', 'Age', 'Gender', 'Contact', 'Status']
        writer.writerow(headers)

        for r in rows:
            writer.writerow([
                r.clientid,
                r.cchv_loc,
                r.cchv_fname,
                r.cchv_age,
                r.cchv_gender,
                r.cchv_contact,
                r.status
            ])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ncd_community_cchv_dataset.csv"'
        return response
