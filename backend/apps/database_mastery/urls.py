from django.urls import path
from .views import (
    DatabaseStatusView, DatabaseTablesView, DatabaseTableDataView,
    DatabaseUpdateRecordView, DatabaseDeleteRecordView, DatabaseCreateRecordView,
    DatabaseFlushTableView, DatabaseSeedDataView
)

urlpatterns = [
    path('status', DatabaseStatusView.as_view(), name='db-status'),
    path('status/', DatabaseStatusView.as_view(), name='db-status-slash'),
    path('tables', DatabaseTablesView.as_view(), name='db-tables'),
    path('tables/', DatabaseTablesView.as_view(), name='db-tables-slash'),
    path('tabledata', DatabaseTableDataView.as_view(), name='db-tabledata'),
    path('tabledata/', DatabaseTableDataView.as_view(), name='db-tabledata-slash'),
    path('updaterecord', DatabaseUpdateRecordView.as_view(), name='db-updaterecord'),
    path('updaterecord/', DatabaseUpdateRecordView.as_view(), name='db-updaterecord-slash'),
    path('deleterecord', DatabaseDeleteRecordView.as_view(), name='db-deleterecord'),
    path('deleterecord/', DatabaseDeleteRecordView.as_view(), name='db-deleterecord-slash'),
    path('createrecord', DatabaseCreateRecordView.as_view(), name='db-createrecord'),
    path('createrecord/', DatabaseCreateRecordView.as_view(), name='db-createrecord-slash'),
    path('flushtable', DatabaseFlushTableView.as_view(), name='db-flushtable'),
    path('flushtable/', DatabaseFlushTableView.as_view(), name='db-flushtable-slash'),
    path('seeddata', DatabaseSeedDataView.as_view(), name='db-seeddata'),
    path('seeddata/', DatabaseSeedDataView.as_view(), name='db-seeddata-slash'),
]
