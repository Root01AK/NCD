from django.urls import path
from .views import ExportScreeningCsvView, ExportCchvCsvView

urlpatterns = [
    path('export/screening/csv', ExportScreeningCsvView.as_view(), name='export-screening-csv'),
    path('export/screening/csv/', ExportScreeningCsvView.as_view(), name='export-screening-csv-slash'),
    path('export/cchv/csv', ExportCchvCsvView.as_view(), name='export-cchv-csv'),
    path('export/cchv/csv/', ExportCchvCsvView.as_view(), name='export-cchv-csv-slash'),
]
