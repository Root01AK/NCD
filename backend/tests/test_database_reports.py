import pytest
from django.test import Client

@pytest.mark.django_db
def test_database_status_and_tables():
    client = Client()
    res_status = client.get('/api/v1/database/status')
    assert res_status.status_code == 200
    data_status = res_status.json()
    assert data_status['status'] == 'success'
    assert 'engine' in data_status
    assert 'version' in data_status

    res_tables = client.get('/api/v1/database/tables')
    assert res_tables.status_code == 200
    data_tables = res_tables.json()
    assert data_tables['status'] == 'success'
    assert isinstance(data_tables['tables'], list)

@pytest.mark.django_db
def test_database_table_data():
    client = Client()
    res_data = client.get('/api/v1/database/tabledata?table=cms_users&limit=10')
    assert res_data.status_code == 200
    data = res_data.json()
    assert data['status'] == 'success'
    assert 'data' in data
    assert 'columns' in data

@pytest.mark.django_db
def test_dashboard_screeninglist():
    client = Client()
    res_list = client.get('/api/v1/dashboard/screeninglist')
    assert res_list.status_code == 200
    data = res_list.json()
    assert data['status'] == 'success'
    assert isinstance(data['data'], list)

@pytest.mark.django_db
def test_export_csv():
    client = Client()
    res_csv = client.get('/api/v1/reports/export/screening/csv')
    assert res_csv.status_code == 200
    assert res_csv['Content-Type'] == 'text/csv'
    assert b'Participant_ID' in res_csv.content
