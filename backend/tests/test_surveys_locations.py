import pytest
from django.test import Client

@pytest.mark.django_db
def test_surveymaster_index():
    client = Client()
    response = client.get('/api/v1/surveymaster/index')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert len(data['data']) >= 1
    # Check Phase II survey exists
    titles = [s['sur_title'] for s in data['data']]
    assert any('PHASE II' in t for t in titles)

@pytest.mark.django_db
def test_locations_index_and_create():
    client = Client()
    response = client.get('/api/v1/location/index')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert len(data['data']) >= 3

    # Create new location
    res_create = client.post('/api/v1/location/create', {'loc_name': 'Andheri Center', 'state_code': 'MH'}, content_type='application/json')
    assert res_create.status_code == 201
    created_loc = res_create.json()['data']
    assert len(created_loc['loc_code']) == 2
