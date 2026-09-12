import re
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from .models import CmsLocationmaster

DEFAULT_LOCATIONS = [
    {'loc_id': 1, 'loc_code': 'DH', 'loc_name': 'Dharavi', 'loc_city': 'Dharavi', 'loc_district': 'Mumbai', 'loc_state': 'Maharashtra', 'state_code': 'MH', 'status': '1'},
    {'loc_id': 2, 'loc_code': 'ML', 'loc_name': 'Malvani', 'loc_city': 'Malvani', 'loc_district': 'Mumbai', 'loc_state': 'Maharashtra', 'state_code': 'MH', 'status': '1'},
    {'loc_id': 3, 'loc_code': 'VA', 'loc_name': 'Vashi', 'loc_city': 'Vashi', 'loc_district': 'Navi Mumbai', 'loc_state': 'Maharashtra', 'state_code': 'MH', 'status': '1'},
    {'loc_id': 4, 'loc_code': 'KU', 'loc_name': 'Kurla', 'loc_city': 'Kurla', 'loc_district': 'Mumbai', 'loc_state': 'Maharashtra', 'state_code': 'MH', 'status': '1'},
    {'loc_id': 5, 'loc_code': 'GH', 'loc_name': 'Ghatkopar', 'loc_city': 'Ghatkopar', 'loc_district': 'Mumbai', 'loc_state': 'Maharashtra', 'state_code': 'MH', 'status': '1'}
]

def ensure_location_table_and_defaults():
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `cms_locationmaster` (
              `loc_id` int(11) NOT NULL AUTO_INCREMENT,
              `state_code` varchar(10) DEFAULT 'MH',
              `loc_code` varchar(20) NOT NULL,
              `loc_name` varchar(255) NOT NULL,
              `status` varchar(1) DEFAULT '1',
              `del_status` int(11) DEFAULT '0',
              `create_time` int(11) DEFAULT NULL,
              `create_user` int(11) DEFAULT NULL,
              `update_time` int(11) DEFAULT NULL,
              `update_user` int(11) DEFAULT NULL,
              `record_date` int(11) DEFAULT NULL,
              PRIMARY KEY (`loc_id`),
              UNIQUE KEY `loc_code` (`loc_code`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        cursor.execute("SELECT COUNT(*) FROM cms_locationmaster WHERE del_status = 0;")
        cnt = cursor.fetchone()[0]
        if cnt == 0:
            for dl in DEFAULT_LOCATIONS:
                try:
                    cursor.execute("""
                        INSERT INTO cms_locationmaster (loc_code, loc_name, state_code, status, del_status, create_time, record_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE loc_name = VALUES(loc_name);
                    """, [dl['loc_code'], dl['loc_name'], dl['state_code'], dl['status'], 0, int(time.time()), int(time.time())])
                except Exception:
                    pass


class LocationIndexView(APIView):
    """
    GET /api/v1/location/index
    Returns all active field location records.
    """
    def get(self, request):
        ensure_location_table_and_defaults()
        locations = CmsLocationmaster.objects.filter(del_status=0).order_by('loc_id')
        data = []
        for l in locations:
            data.append({
                'loc_id': l.loc_id,
                'id': l.loc_id,
                'loc_code': l.loc_code,
                'code': l.loc_code,
                'loc_name': l.loc_name,
                'name': l.loc_name,
                'loc_city': l.loc_name,
                'loc_district': 'Mumbai' if l.loc_code in ('DH', 'ML', 'KU', 'GH') else 'Navi Mumbai',
                'loc_state': 'Maharashtra',
                'state_code': l.state_code or 'MH',
                'status': str(l.status or '1'),
                'loc_status': str(l.status or '1')
            })

        return Response({
            'status': 'success',
            'data': data if data else DEFAULT_LOCATIONS
        })


class LocationCreateView(APIView):
    """
    POST /api/v1/location/create
    Creates a new location and auto-generates a unique 2-character location code.
    """
    def post(self, request):
        ensure_location_table_and_defaults()
        payload = request.data
        loc_name = payload.get('loc_name') or payload.get('location') or payload.get('loc_city') or 'New Location'

        # Generate unique 2-letter location code
        existing_codes = set(CmsLocationmaster.objects.values_list('loc_code', flat=True))
        requested_code = re.sub(r'[^A-Z]', '', str(payload.get('loc_code', '')).upper())

        if len(requested_code) == 2 and requested_code not in existing_codes:
            final_code = requested_code
        else:
            base_letters = re.sub(r'[^A-Z]', '', loc_name.upper())
            candidate = base_letters[:2] if len(base_letters) >= 2 else 'LC'
            if candidate in existing_codes:
                import string
                for char1 in string.ascii_uppercase:
                    for char2 in string.ascii_uppercase:
                        cand = f"{char1}{char2}"
                        if cand not in existing_codes:
                            candidate = cand
                            break
                    if candidate not in existing_codes:
                        break
            final_code = candidate

        loc = CmsLocationmaster(
            loc_code=final_code,
            loc_name=loc_name,
            state_code=(payload.get('state_code') or 'MH')[:2].upper(),
            status=str(payload.get('status', '1')),
            del_status=0,
            create_time=int(time.time()),
            record_date=int(time.time())
        )
        loc.save()

        return Response({
            'status': 'success',
            'message': 'Location created successfully',
            'data': {
                'loc_id': loc.loc_id,
                'loc_code': loc.loc_code,
                'loc_name': loc.loc_name
            }
        }, status=status.HTTP_201_CREATED)


class LocationUpdateView(APIView):
    """
    PUT /api/v1/location/update?id=<id>
    Updates an existing location record.
    """
    def put(self, request):
        loc_id = request.query_params.get('id') or request.data.get('loc_id') or request.data.get('id')
        loc = CmsLocationmaster.objects.filter(pk=loc_id).first()
        if not loc:
            return Response({'status': 'error', 'message': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)

        payload = request.data
        if 'loc_name' in payload:
            loc.loc_name = payload['loc_name']
        elif 'loc_city' in payload:
            loc.loc_name = payload['loc_city']

        if 'status' in payload:
            loc.status = str(payload['status'])

        loc.update_time = int(time.time())
        loc.save()

        return Response({
            'status': 'success',
            'message': 'Location updated successfully',
            'data': {
                'loc_id': loc.loc_id,
                'loc_code': loc.loc_code,
                'loc_name': loc.loc_name
            }
        })


class LocationDeleteView(APIView):
    """
    DELETE /api/v1/location/delete?id=<id>
    Soft-deletes location record.
    """
    def delete(self, request):
        loc_id = request.query_params.get('id') or request.data.get('id')
        loc = CmsLocationmaster.objects.filter(pk=loc_id).first()
        if loc:
            loc.del_status = 1
            loc.save()
            return Response({'status': 'success', 'message': 'Location deleted successfully'})

        return Response({'status': 'error', 'message': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
