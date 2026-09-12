from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from apps.locations.views import ensure_location_table_and_defaults
from apps.surveys.views import ensure_survey_table_and_defaults

class DatabaseStatusView(APIView):
    """
    GET /api/v1/database/status
    Returns live MySQL engine diagnostics and table statistics.
    """
    def get(self, request):
        ensure_location_table_and_defaults()
        ensure_survey_table_and_defaults()

        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION(), @@sql_mode, @@character_set_database, @@collation_database;")
            row = cursor.fetchone()
            version, sql_mode, charset, collation = row[0], row[1], row[2], row[3]

            cursor.execute("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE();")
            total_tables = cursor.fetchone()[0]

            cursor.execute("SELECT TABLE_NAME, TABLE_ROWS, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME;")
            tables_info = [{'table': r[0], 'rows': r[1] or 0, 'engine': r[2] or 'InnoDB'} for r in cursor.fetchall()]

        return Response({
            'status': 'success',
            'engine': 'MySQL 8.0 / 9.0 (InnoDB Enterprise Edition)',
            'version': version,
            'database': 'ncd',
            'sql_mode': sql_mode,
            'charset': charset,
            'collation': collation,
            'total_tables': total_tables,
            'tables': tables_info
        })


class DatabaseTablesView(APIView):
    """
    GET /api/v1/database/tables
    Returns list of all tables with column schemas and live row counts.
    """
    def get(self, request):
        tables_list = []
        with connection.cursor() as cursor:
            cursor.execute("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE';")
            raw_tables = cursor.fetchall()

            for t in raw_tables:
                t_name = t[0]
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM `{t_name}`;")
                    cnt = cursor.fetchone()[0]
                except Exception:
                    cnt = 0

                cursor.execute(f"SHOW COLUMNS FROM `{t_name}`;")
                cols = [{'name': c[0], 'type': c[1], 'null': c[2], 'key': c[3], 'default': c[4]} for c in cursor.fetchall()]

                tables_list.append({
                    'name': t_name,
                    'count': cnt,
                    'columns': cols
                })

        return Response({
            'status': 'success',
            'tables': tables_list
        })


class DatabaseTableDataView(APIView):
    """
    GET /api/v1/database/tabledata?table=cms_users&limit=150
    Returns paginated rows from the specified table.
    """
    def get(self, request):
        table_name = request.query_params.get('table') or 'cms_users'
        limit = min(int(request.query_params.get('limit', 150)), 500)

        # Sanitize table name against SQL injection
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES LIKE %s;", [table_name])
            if not cursor.fetchone():
                return Response({'status': 'error', 'message': f'Table {table_name} does not exist.'}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(f"SHOW COLUMNS FROM `{table_name}`;")
            columns = [c[0] for c in cursor.fetchall()]

            cursor.execute(f"SELECT * FROM `{table_name}` LIMIT %s;", [limit])
            raw_rows = cursor.fetchall()

            data = []
            for r in raw_rows:
                row_dict = {}
                for idx, col in enumerate(columns):
                    val = r[idx]
                    if isinstance(val, (bytes, bytearray)):
                        val = str(val)
                    row_dict[col] = val
                data.append(row_dict)

        return Response({
            'status': 'success',
            'table': table_name,
            'columns': columns,
            'count': len(data),
            'data': data
        })


class DatabaseUpdateRecordView(APIView):
    """
    POST /api/v1/database/updaterecord
    """
    def post(self, request):
        table = request.data.get('table')
        pk_col = request.data.get('primary_key', 'id')
        pk_val = request.data.get('primary_key_val')
        data = request.data.get('data', {})

        if not table or not pk_val or not data:
            return Response({'status': 'error', 'message': 'table, primary_key_val, and data required'}, status=status.HTTP_400_BAD_REQUEST)

        set_clauses = []
        params = []
        for k, v in data.items():
            set_clauses.append(f"`{k}` = %s")
            params.append(v)
        params.append(pk_val)

        with connection.cursor() as cursor:
            cursor.execute(f"UPDATE `{table}` SET {', '.join(set_clauses)} WHERE `{pk_col}` = %s;", params)

        return Response({'status': 'success', 'message': 'Record updated successfully'})


class DatabaseDeleteRecordView(APIView):
    """
    POST /api/v1/database/deleterecord
    """
    def post(self, request):
        table = request.data.get('table')
        pk_col = request.data.get('primary_key', 'id')
        pk_val = request.data.get('primary_key_val')

        with connection.cursor() as cursor:
            cursor.execute(f"DELETE FROM `{table}` WHERE `{pk_col}` = %s;", [pk_val])

        return Response({'status': 'success', 'message': 'Record deleted successfully'})


class DatabaseCreateRecordView(APIView):
    """
    POST /api/v1/database/createrecord
    """
    def post(self, request):
        table = request.data.get('table')
        data = request.data.get('data', {})

        if not table or not data:
            return Response({'status': 'error', 'message': 'table and data required'}, status=status.HTTP_400_BAD_REQUEST)

        cols = list(data.keys())
        placeholders = ['%s'] * len(cols)
        values = list(data.values())

        with connection.cursor() as cursor:
            cursor.execute(f"INSERT INTO `{table}` (`{'`, `'.join(cols)}`) VALUES ({', '.join(placeholders)});", values)

        return Response({'status': 'success', 'message': 'Record created successfully'})


class DatabaseFlushTableView(APIView):
    """
    POST /api/v1/database/flushtable
    """
    def post(self, request):
        table = request.data.get('table')
        if not table:
            return Response({'status': 'error', 'message': 'Table required'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
            cursor.execute(f"TRUNCATE TABLE `{table}`;")
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        return Response({'status': 'success', 'message': f'Table {table} flushed successfully'})


class DatabaseSeedDataView(APIView):
    """
    POST /api/v1/database/seeddata
    """
    def post(self, request):
        ensure_location_table_and_defaults()
        ensure_survey_table_and_defaults()
        return Response({'status': 'success', 'message': 'Database seeded successfully'})
