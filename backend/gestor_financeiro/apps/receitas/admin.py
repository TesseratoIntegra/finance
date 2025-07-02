from django.contrib import admin
from .models import Receita


@admin.register(Receita)
class ReceitaAdmin(admin.ModelAdmin):
    list_display = [
        'tipo', 'responsavel', 'valor', 'data', 
        'parcela_atual', 'parcelas'
    ]
    list_filter = ['tipo', 'responsavel', 'data']
    search_fields = ['tipo', 'responsavel']
    ordering = ['-data_criacao']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('tipo', 'responsavel', 'valor', 'data')
        }),
        ('Parcelamento', {
            'fields': ('parcelas', 'parcela_atual')
        }),
        ('Datas', {
            'fields': ('data_criacao', 'data_atualizacao'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['data_criacao', 'data_atualizacao']

