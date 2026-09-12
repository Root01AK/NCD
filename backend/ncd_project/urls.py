from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from django.http import JsonResponse

def root_status_view(request):
    return JsonResponse({
        'status': 'success',
        'platform': 'NCD Health Screening & Clinical Linkage Platform',
        'version': '1.0.0 (Enterprise Django REST Edition)',
        'documentation': '/api/docs/',
        'admin_portal': '/'
    })

urlpatterns = [
    # Health & Root Status View
    path('api/status/', root_status_view, name='root-status'),

    # OpenAPI 3.0 & Swagger Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # REST API Endpoints v1
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/users/', include('apps.authentication.user_urls')),
    path('api/v1/surveymaster/', include('apps.surveys.urls')),
    path('api/v1/fieldmaster/', include('apps.surveys.field_urls')),
    path('api/v1/location/', include('apps.locations.urls')),
    path('api/v1/screening/', include('apps.screening.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/database/', include('apps.database_mastery.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),

    # Admin Redirects
    path('admin/', RedirectView.as_view(url='/', permanent=False)),
    path('django-admin/', RedirectView.as_view(url='/', permanent=False)),

    # Unfold Django Admin mounted directly at root /
    path('', admin.site.urls),
]

