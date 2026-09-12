from django.urls import path
from .views import FieldmasterIndexView, FieldmasterCreateView

urlpatterns = [
    path('index', FieldmasterIndexView.as_view(), name='field-index'),
    path('index/', FieldmasterIndexView.as_view(), name='field-index-slash'),
    path('create', FieldmasterCreateView.as_view(), name='field-create'),
    path('create/', FieldmasterCreateView.as_view(), name='field-create-slash'),
]
