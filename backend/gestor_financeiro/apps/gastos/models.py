# gestor_financeiro/apps/gastos/models.py
from django.db import models
from decimal import Decimal

class Gasto(models.Model):
    TIPO_CHOICES = [
        ('Unico', 'Único'),
        ('Parcelado', 'Parcelado'),
        ('Recorrente', 'Recorrente'),
    ]
    
    STATUS_CHOICES = [
        ('Pendente', 'Pendente'),
        ('Pago', 'Pago'),
        ('Vencido', 'Vencido'),
    ]
    
    CATEGORIA_CHOICES = [
        ('Alimentacao', 'Alimentação'),
        ('Transporte', 'Transporte'),
        ('Moradia', 'Moradia'),
        ('Saude', 'Saúde'),
        ('Educacao', 'Educação'),
        ('Lazer', 'Lazer'),
        ('Vestuario', 'Vestuário'),
        ('Outros', 'Outros'),
    ]
    
    descricao = models.CharField(max_length=200)
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateField()  # Data de vencimento/programação
    data_pagamento = models.DateField(null=True, blank=True, verbose_name='Data do Pagamento')  # NOVO CAMPO
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='Unico')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pendente')
    
    # Campos para parcelamento
    parcelas = models.PositiveIntegerField(null=True, blank=True)
    parcela_atual = models.PositiveIntegerField(null=True, blank=True)
    
    # Campos de auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Gasto'
        verbose_name_plural = 'Gastos'
        ordering = ['-data']
    
    def __str__(self):
        if self.tipo == 'Parcelado' and self.parcela_atual and self.parcelas:
            return f"{self.descricao} ({self.parcela_atual}/{self.parcelas}) - R$ {self.valor}"
        return f"{self.descricao} - R$ {self.valor}"
    
    @property
    def is_vencido(self):
        from datetime import date
        return self.data < date.today() and self.status == 'Pendente'