from rest_framework import serializers
from .models import Caixa


class CaixaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caixa
        fields = ['valor', 'data_atualizacao']
        read_only_fields = ['data_atualizacao']


class CaixaUpdateSerializer(serializers.Serializer):
    value = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0, required=True)
    def validate_value(self, value):
        """Validação adicional do valor"""
        if value < 0:
            raise serializers.ValidationError("Valor não pode ser negativo")
        return value


class MetricsSerializer(serializers.Serializer):
    caixa = serializers.DecimalField(max_digits=12, decimal_places=2)
    gastos_fixos = serializers.DecimalField(max_digits=12, decimal_places=2)
    endividamento = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_receitas = serializers.DecimalField(max_digits=12, decimal_places=2)
    pago_mes_vigente = serializers.DecimalField(max_digits=12, decimal_places=2)
    nao_pago_mes_vigente = serializers.DecimalField(max_digits=12, decimal_places=2)
    atrasados_meses_anteriores = serializers.DecimalField(max_digits=12, decimal_places=2)


class PlanningMonthSerializer(serializers.Serializer):
    mes = serializers.CharField()
    gastos_fixos = serializers.DecimalField(max_digits=12, decimal_places=2)
    gastos_parcelados = serializers.DecimalField(max_digits=12, decimal_places=2)
    receitas = serializers.DecimalField(max_digits=12, decimal_places=2)
    saldo = serializers.DecimalField(max_digits=12, decimal_places=2)


class PlanningSerializer(serializers.Serializer):
    planning = PlanningMonthSerializer(many=True)

