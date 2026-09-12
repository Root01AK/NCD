import pytest
from django.test import Client
from apps.screening.services import ParticipantIdService

@pytest.mark.django_db
def test_next_participant_id_generation():
    client = Client()
    response = client.get('/api/v1/screening/next-participant-id?location=Dharavi')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert data['prefix'] == 'DH'
    assert data['participant_id'].startswith('NCDDH')

    # Test Malvani location
    res_ml = client.get('/api/v1/screening/next-participant-id?location=Malvani')
    assert res_ml.json()['prefix'] == 'ML'
    assert res_ml.json()['participant_id'].startswith('NCDML')

    # Test Vashi location
    res_va = client.get('/api/v1/screening/next-participant-id?location=Vashi')
    assert res_va.json()['prefix'] == 'VA'
    assert res_va.json()['participant_id'].startswith('NCDVA')

@pytest.mark.django_db
def test_screening_submit_and_queue():
    client = Client()
    payload = {
        'participant_id': 'NCDDH9999',
        'fullName': 'Test Participant Kumar',
        'age': 48,
        'gender': 'Male',
        'location': 'Dharavi',
        'q9': ['11'],
        'q11': '1',
        'q17': '3',
        'q28': 2,
        'q29': 1,
        'q30': 1,
        'q58': '0',
        'q59': '0',
        'weight': 68,
        'height': 168
    }
    res_submit = client.post('/api/v1/screening/submit', payload, content_type='application/json')
    assert res_submit.status_code == 200
    data = res_submit.json()
    assert data['status'] == 'success'
    assert data['participant_id'] == 'NCDDH9999'

    # Verify queue returns submitted participant
    res_queue = client.get('/api/v1/screening/queue')
    assert res_queue.status_code == 200
    queue_data = res_queue.json()['data']
    matched = any(p.get('mem_scrn_part_id') == 'NCDDH9999' or p.get('participant_id') == 'NCDDH9999' for p in queue_data)
    assert matched is True
