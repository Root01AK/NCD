from django.urls import path
from .views import (
    UserListView, UserCreateView, UserUpdateView,
    UserDeleteView, UserStatusToggleView, UserPrivilegesUpdateView
)

urlpatterns = [
    path('index', UserListView.as_view(), name='users-index'),
    path('index/', UserListView.as_view(), name='users-index-slash'),
    path('create', UserCreateView.as_view(), name='users-create'),
    path('create/', UserCreateView.as_view(), name='users-create-slash'),
    path('update', UserUpdateView.as_view(), name='users-update'),
    path('update/', UserUpdateView.as_view(), name='users-update-slash'),
    path('delete', UserDeleteView.as_view(), name='users-delete'),
    path('delete/', UserDeleteView.as_view(), name='users-delete-slash'),
    path('status', UserStatusToggleView.as_view(), name='users-status'),
    path('status/', UserStatusToggleView.as_view(), name='users-status-slash'),
    path('privileges', UserPrivilegesUpdateView.as_view(), name='users-privileges'),
    path('privileges/', UserPrivilegesUpdateView.as_view(), name='users-privileges-slash'),
]
