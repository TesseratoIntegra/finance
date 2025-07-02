# gestor_financeiro/apps/gastos/admin.py
from django.contrib import admin
from .models import Gasto

@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    list_display = ['descricao', 'categoria', 'valor', 'data', 'tipo', 'status', 'is_vencido']
    list_filter = ['categoria', 'tipo', 'status', 'data']
    search_fields = ['descricao', 'categoria']
    date_hierarchy = 'data'
    ordering = ['-data']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('descricao', 'categoria', 'valor', 'data')
        }),
        ('Configurações', {
            'fields': ('tipo', 'status')
        }),
        ('Parcelamento', {
            'fields': ('parcelas', 'parcela_atual'),
            'classes': ('collapse',)
        }),
    )