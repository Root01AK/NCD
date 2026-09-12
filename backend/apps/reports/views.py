import json
import csv
import io
from django.http import HttpResponse, StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from ..screening.models import CmsScreening
from ..screening.services import ScreeningSubmissionService
from ..clinical.models import CmsCchv

class Echo:
    """An object that implements just the write method of the file-like interface."""
    def write(self, value):
        return value

class ExportScreeningCsvView(APIView):
    """
    GET /api/v1/reports/export/screening/csv
    Streaming CSV export capable of streaming 15,000+ participant records with minimal RAM usage.
    """
    def get(self, request):
        ScreeningSubmissionService.ensure_table_exists()

        def stream_csv_rows():
            pseudo_buffer = Echo()
            writer = csv.writer(pseudo_buffer)

            headers = [
                'ID', 'Participant_ID', 'Location', 'Full_Name', 'Age', 'Gender',
                'Eligible', 'Enrolled', 'Survey', 'Date'
            ]
            yield writer.writerow(headers)

            queryset = CmsScreening.objects.all().order_by('mem_scrn_id').iterator(chunk_size=1000)
            for r in queryset:
                gender_str = 'Male' if str(r.mem_scrn_q2) == '1' else ('Female' if str(r.mem_scrn_q2) == '2' else 'Transgender')
                yield writer.writerow([
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

        response = StreamingHttpResponse(stream_csv_rows(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ncd_screening_dataset.csv"'
        return response


class ExportCchvCsvView(APIView):
    """
    GET /api/v1/reports/export/cchv/csv
    Streaming Community Health Survey dataset export.
    """
    def get(self, request):
        def stream_cchv_rows():
            pseudo_buffer = Echo()
            writer = csv.writer(pseudo_buffer)

            headers = ['ClientID', 'Location', 'Name', 'Age', 'Gender', 'Contact', 'Status']
            yield writer.writerow(headers)

            queryset = CmsCchv.objects.all().iterator(chunk_size=1000)
            for r in queryset:
                yield writer.writerow([
                    r.clientid,
                    r.cchv_loc,
                    r.cchv_fname,
                    r.cchv_age,
                    r.cchv_gender,
                    r.cchv_contact,
                    r.status
                ])

        response = StreamingHttpResponse(stream_cchv_rows(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ncd_community_cchv_dataset.csv"'
        return response
