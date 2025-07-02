from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Receita(models.Model):
    TIPO_CHOICES = [
        ('Salário', 'Salário'),
        ('Freelance', 'Freelance'),
        ('Investimento', 'Investimento'),
        ('Venda', 'Venda'),
        ('Parcelado', 'Parcelado'),
        ('Outros', 'Outros'),
    ]
    
    RESPONSAVEL_CHOICES = [
        ('Pessoa 1', 'Pessoa 1'),
        ('Pessoa 2', 'Pessoa 2'),
        ('Ambos', 'Ambos'),
    ]
    
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    responsavel = models.CharField(max_length=50, choices=RESPONSAVEL_CHOICES)
    valor = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    data = models.DateField()
    parcelas = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(60)]
    )
    parcela_atual = models.PositiveIntegerField(default=1)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-data_criacao']
        verbose_name = 'Receita'
        verbose_name_plural = 'Receitas'
    
    def __str__(self):
        return f"{self.tipo} - {self.responsavel} - {self.valor}"
    
    @property
    def valor_mensal(self):
        """Retorna o valor mensal da receita"""
        if self.tipo == 'Parcelado':
            return self.valor  # Para parcelados, o valor já é mensal
        return self.valor
    
    @property
    def valor_total(self):
        """Retorna o valor total da receita (para parcelados)"""
        if self.tipo == 'Parcelado':
            return self.valor * self.parcelas
        return self.valor

