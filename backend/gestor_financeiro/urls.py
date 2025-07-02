"""
URL configuration for gestor_financeiro project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/gastos/', include('gestor_financeiro.apps.gastos.urls')),
    path('api/receitas/', include('gestor_financeiro.apps.receitas.urls')),
    path('api/dashboard/', include('gestor_financeiro.apps.dashboard.urls')),
]

