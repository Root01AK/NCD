from django.urls import path
from .views import ScreeningListView, EligibleListView, EnrolledListView, ResetDatabaseView

urlpatterns = [
    path('screeninglist', ScreeningListView.as_view(), name='dashboard-screeninglist'),
    path('screeninglist/', ScreeningListView.as_view(), name='dashboard-screeninglist-slash'),
    path('eligiblelist', EligibleListView.as_view(), name='dashboard-eligiblelist'),
    path('eligiblelist/', EligibleListView.as_view(), name='dashboard-eligiblelist-slash'),
    path('enrolledlist', EnrolledListView.as_view(), name='dashboard-enrolledlist'),
    path('enrolledlist/', EnrolledListView.as_view(), name='dashboard-enrolledlist-slash'),
    path('resetdatabase', ResetDatabaseView.as_view(), name='dashboard-resetdatabase'),
    path('resetdatabase/', ResetDatabaseView.as_view(), name='dashboard-resetdatabase-slash'),
]
