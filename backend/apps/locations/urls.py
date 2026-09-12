from django.urls import path
from .views import LocationIndexView, LocationCreateView, LocationUpdateView, LocationDeleteView

urlpatterns = [
    path('index', LocationIndexView.as_view(), name='location-index'),
    path('index/', LocationIndexView.as_view(), name='location-index-slash'),
    path('create', LocationCreateView.as_view(), name='location-create'),
    path('create/', LocationCreateView.as_view(), name='location-create-slash'),
    path('update', LocationUpdateView.as_view(), name='location-update'),
    path('update/', LocationUpdateView.as_view(), name='location-update-slash'),
    path('delete', LocationDeleteView.as_view(), name='location-delete'),
    path('delete/', LocationDeleteView.as_view(), name='location-delete-slash'),
]
