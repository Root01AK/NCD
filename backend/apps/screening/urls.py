from django.urls import path
from .views import QueueView, NextParticipantIdView, SubmitView, DeleteView, ResetAllView, DetailView

urlpatterns = [
    path('queue', QueueView.as_view(), name='screening-queue'),
    path('queue/', QueueView.as_view(), name='screening-queue-slash'),
    path('detail', DetailView.as_view(), name='screening-detail'),
    path('detail/', DetailView.as_view(), name='screening-detail-slash'),
    path('next-participant-id', NextParticipantIdView.as_view(), name='screening-next-id'),
    path('next-participant-id/', NextParticipantIdView.as_view(), name='screening-next-id-slash'),
    path('submit', SubmitView.as_view(), name='screening-submit'),
    path('submit/', SubmitView.as_view(), name='screening-submit-slash'),
    path('delete', DeleteView.as_view(), name='screening-delete'),
    path('delete/', DeleteView.as_view(), name='screening-delete-slash'),
    path('reset-all', ResetAllView.as_view(), name='screening-reset-all'),
    path('reset-all/', ResetAllView.as_view(), name='screening-reset-all-slash'),
]
