from django.urls import path
from .views import LoginView, MeView

urlpatterns = [
    path('login', LoginView.as_view(), name='auth-login'),
    path('login/', LoginView.as_view(), name='auth-login-slash'),
    path('me', MeView.as_view(), name='auth-me'),
    path('me/', MeView.as_view(), name='auth-me-slash'),
]
