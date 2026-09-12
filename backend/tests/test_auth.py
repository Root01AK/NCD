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
