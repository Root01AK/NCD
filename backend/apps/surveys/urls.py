from django.urls import path
from .views import SurveymasterIndexView, SurveymasterCreateView, SurveymasterUpdateView

urlpatterns = [
    path('index', SurveymasterIndexView.as_view(), name='survey-index'),
    path('index/', SurveymasterIndexView.as_view(), name='survey-index-slash'),
    path('create', SurveymasterCreateView.as_view(), name='survey-create'),
    path('create/', SurveymasterCreateView.as_view(), name='survey-create-slash'),
    path('update/<str:pk>', SurveymasterUpdateView.as_view(), name='survey-update-pk'),
    path('update/<str:pk>/', SurveymasterUpdateView.as_view(), name='survey-update-pk-slash'),
    path('update', SurveymasterUpdateView.as_view(), name='survey-update'),
    path('update/', SurveymasterUpdateView.as_view(), name='survey-update-slash'),
]
