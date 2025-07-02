# gestor_financeiro/apps/gastos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GastoViewSet

router = DefaultRouter()
router.register(r'', GastoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]