from django.contrib import admin
from .models import Caixa


@admin.register(Caixa)
class CaixaAdmin(admin.ModelAdmin):
    list_display = ['valor', 'data_atualizacao']
    readonly_fields = ['data_atualizacao']
    
    def has_add_permission(self, request):
        # Permitir apenas um registro de caixa
        return not Caixa.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Não permitir deletar o registro de caixa
        return False

