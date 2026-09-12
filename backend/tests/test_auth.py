import pytest
from django.test import Client

@pytest.mark.django_db
def test_login_admin_user():
    client = Client()
    response = client.post('/api/v1/auth/login', {'username': 'admin_user', 'password': 'admin123'}, content_type='application/json')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert 'token' in data
    assert data['user']['role_id'] == 1
    assert data['user']['role_name'] == 'Admin'

@pytest.mark.django_db
def test_login_fs001_legacy_md5():
    client = Client()
    response = client.post('/api/v1/auth/login', {'username': 'FS001', 'password': 'FSadmin123'}, content_type='application/json')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert 'token' in data
    assert data['user']['role_id'] == 2
    assert data['user']['role_name'] == 'Field Supervisor'

@pytest.mark.django_db
def test_login_readme_production_creds():
    client = Client()
    for u, p, expected_role in [('FS', 'Fs001', 2), ('SN1', 'Sf001', 3), ('Couns', 'Co001', 5)]:
        res = client.post('/api/v1/auth/login', {'username': u, 'password': p}, content_type='application/json')
        assert res.status_code == 200, f"Failed for {u}:{p}"
        data = res.json()
        assert data['status'] == 'success'
        assert data['user']['role_id'] == expected_role


@pytest.mark.django_db
def test_login_invalid_credentials():
    client = Client()
    response = client.post('/api/v1/auth/login', {'username': 'FS001', 'password': 'WrongPassword'}, content_type='application/json')
    assert response.status_code == 401
    data = response.json()
    assert data['status'] == 'error'

@pytest.mark.django_db
def test_users_index():
    client = Client()
    response = client.get('/api/v1/users/index')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert isinstance(data['data'], list)
    assert len(data['data']) >= 5

@pytest.mark.django_db
def test_create_user():
    client = Client()
    payload = {
        'username': 'TestSupervisor_01',
        'password': 'Password123!',
        'role': 'field_supervisor',
        'location': 'Dharavi',
        'privileges': [1, 2, 3, 16]
    }
    response = client.post('/api/v1/users/create', payload, content_type='application/json')
    assert response.status_code in (200, 201)
    data = response.json()
    assert data['status'] == 'success'
    assert data['data']['username'] == 'TestSupervisor_01'
