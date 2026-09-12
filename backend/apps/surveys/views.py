import time
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from .models import CmsSurveymaster, CmsFieldmaster

DEFAULT_SURVEYS = [
    {
        'sur_id': 1,
        'sur_code': 'NCD-P2-2026',
        'sur_title': 'MUMBAI NCD SURVEY — PHASE II (Comprehensive 16 Sections)',
        'sur_url': '[]',
        'sur_onlne_id': 'NCD-ONL-2026',
        'sur_pri_db_name': 'ncd',
        'sur_pri_db_server': 'localhost',
        'sur_pri_db_usrnme': 'root',
        'status': '1',
        'create_time': 1745646400,
        'record_date': 1745646400
    }
]

def ensure_survey_table_and_defaults():
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `cms_surveymaster` (
              `sur_id` int(11) NOT NULL AUTO_INCREMENT,
              `sur_code` varchar(50) NOT NULL,
              `sur_title` text NOT NULL,
              `sur_url` longtext NOT NULL,
              `sur_onlne_id` text NOT NULL,
              `sur_pri_db_name` text NOT NULL,
              `sur_pri_db_server` text NOT NULL,
              `sur_pri_db_usrnme` text NOT NULL,
              `sur_pri_db_paswrd` blob,
              `sur_sec_db_name` text,
              `sur_sec_db_server` text,
              `sur_sec_db_usrnme` text,
              `sur_sec_db_paswrd` blob,
              `status` varchar(1) DEFAULT '1',
              `create_time` int(11) DEFAULT NULL,
              `create_user` smallint(6) DEFAULT NULL,
              `update_time` int(11) DEFAULT NULL,
              `update_user` smallint(6) DEFAULT NULL,
              `record_date` int(11) DEFAULT NULL,
              PRIMARY KEY (`sur_id`),
              KEY `sur_code` (`sur_code`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        cursor.execute("SELECT COUNT(*) FROM cms_surveymaster;")
        cnt = cursor.fetchone()[0]
        if cnt == 0:
            for s in DEFAULT_SURVEYS:
                cursor.execute("""
                    INSERT INTO cms_surveymaster (sur_code, sur_title, sur_url, sur_onlne_id, sur_pri_db_name, sur_pri_db_server, sur_pri_db_usrnme, status, create_time, record_date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, [s['sur_code'], s['sur_title'], s['sur_url'], s['sur_onlne_id'], s['sur_pri_db_name'], s['sur_pri_db_server'], s['sur_pri_db_usrnme'], s['status'], s['create_time'], s['record_date']])


class SurveymasterIndexView(APIView):
    """
    GET /api/v1/surveymaster/index
    Returns list of all active surveys.
    """
    def get(self, request):
        ensure_survey_table_and_defaults()
        surveys = CmsSurveymaster.objects.filter(status='1').order_by('sur_id')
        data = []
        for s in surveys:
            data.append({
                'sur_id': s.sur_id,
                'id': s.sur_id,
                'sur_code': s.sur_code,
                'code': s.sur_code,
                'sur_title': s.sur_title,
                'title': s.sur_title,
                'sur_url': s.sur_url or '[]',
                'sur_onlne_id': s.sur_onlne_id or 'NCD-ONL',
                'status': s.status,
                'create_time': s.create_time,
                'record_date': s.record_date
            })

        return Response({
            'status': 'success',
            'data': data if data else DEFAULT_SURVEYS
        })


class SurveymasterCreateView(APIView):
    """
    POST /api/v1/surveymaster/create
    Creates a new survey master with custom schema.
    """
    def post(self, request):
        ensure_survey_table_and_defaults()
        payload = request.data
        sur_code = payload.get('sur_code') or f"S-{int(time.time())}"
        sur_title = payload.get('sur_title') or payload.get('title') or 'NCD Survey Form'

        sur_url = payload.get('sur_url') or payload.get('schema') or '[]'
        if isinstance(sur_url, (dict, list)):
            sur_url = json.dumps(sur_url)

        survey = CmsSurveymaster(
            sur_code=sur_code,
            sur_title=sur_title,
            sur_url=sur_url,
            sur_onlne_id=payload.get('sur_onlne_id') or 'NCD-ONL',
            sur_pri_db_name=payload.get('sur_pri_db_name') or 'ncd',
            sur_pri_db_server=payload.get('sur_pri_db_server') or 'localhost',
            sur_pri_db_usrnme=payload.get('sur_pri_db_usrnme') or 'root',
            status=str(payload.get('status', '1')),
            create_time=int(time.time()),
            record_date=int(time.time())
        )
        survey.save()

        return Response({
            'status': 'success',
            'message': 'Survey created successfully',
            'data': {
                'sur_id': survey.sur_id,
                'sur_code': survey.sur_code,
                'sur_title': survey.sur_title
            }
        }, status=status.HTTP_201_CREATED)


class SurveymasterUpdateView(APIView):
    """
    PUT /api/v1/surveymaster/update/<id>
    Updates survey title and schema JSON.
    """
    def put(self, request, pk=None):
        ensure_survey_table_and_defaults()
        survey_id = pk or request.query_params.get('id') or request.data.get('sur_id')
        survey = CmsSurveymaster.objects.filter(pk=survey_id).first()
        if not survey:
            survey = CmsSurveymaster.objects.filter(sur_code=str(survey_id)).first()

        if not survey:
            survey = CmsSurveymaster(
                sur_code=f"S-{survey_id}" if str(survey_id).isdigit() else str(survey_id),
                sur_title=request.data.get('sur_title') or 'NCD Survey Form',
                create_time=int(time.time())
            )

        payload = request.data
        if 'sur_title' in payload:
            survey.sur_title = payload['sur_title']
        elif 'title' in payload:
            survey.sur_title = payload['title']

        if 'schema' in payload:
            survey.sur_url = json.dumps(payload['schema']) if isinstance(payload['schema'], (dict, list)) else str(payload['schema'])
        elif 'sur_url' in payload:
            survey.sur_url = json.dumps(payload['sur_url']) if isinstance(payload['sur_url'], (dict, list)) else str(payload['sur_url'])

        survey.update_time = int(time.time())
        survey.save()

        return Response({
            'status': 'success',
            'message': 'Survey updated successfully',
            'data': {
                'sur_id': survey.sur_id,
                'sur_code': survey.sur_code,
                'sur_title': survey.sur_title
            }
        })


class FieldmasterIndexView(APIView):
    """
    GET /api/v1/fieldmaster/index
    """
    def get(self, request):
        return Response({'status': 'success', 'data': []})


class FieldmasterCreateView(APIView):
    """
    POST /api/v1/fieldmaster/create
    """
    def post(self, request):
        return Response({'status': 'success', 'message': 'Field saved'})
