from django.db import models
from django.core.validators import MinValueValidator


class Caixa(models.Model):
    valor = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(0)],
        default=0
    )
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Caixa'
        verbose_name_plural = 'Caixa'
    
    def __str__(self):
        return f"Caixa: R$ {self.valor}"
    
    @classmethod
    def get_current_value(cls):
        """Retorna o valor atual do caixa"""
        caixa, created = cls.objects.get_or_create(id=1)
        return caixa.valor
    
    @classmethod
    def update_value(cls, novo_valor):
        """Atualiza o valor do caixa"""
        caixa, created = cls.objects.get_or_create(id=1)
        caixa.valor = novo_valor
        caixa.save()
        return caixa

