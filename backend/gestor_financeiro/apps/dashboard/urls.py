from django.urls import path
from .views import get_metrics, get_planning, update_caixa

urlpatterns = [
    path('metrics/', get_metrics, name='dashboard-metrics'),
    path('planning/', get_planning, name='dashboard-planning'),
    path('caixa/', update_caixa, name='dashboard-caixa'),
]

