# gestor_financeiro/apps/gastos/serializers.py
from rest_framework import serializers
from .models import Gasto

class GastoSerializer(serializers.ModelSerializer):
    is_vencido = serializers.ReadOnlyField()
    
    class Meta:
        model = Gasto
        fields = [
            'id', 'descricao', 'categoria', 'valor', 'data', 
            'tipo', 'status', 'parcelas', 'parcela_atual',
            'is_vencido', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class GastoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gasto
        fields = [
            'descricao', 'categoria', 'valor', 'data', 
            'tipo', 'parcelas', 'parcela_atual'
        ]
    
    def validate(self, data):
        if data.get('tipo') == 'Parcelado':
            if not data.get('parcelas') or data.get('parcelas') < 2:
                raise serializers.ValidationError(
                    "Para gastos parcelados, é necessário informar pelo menos 2 parcelas"
                )
            if not data.get('parcela_atual'):
                data['parcela_atual'] = 1
        
        return data
    
    def create(self, validated_data):
        # Para gastos parcelados, criar todas as parcelas
        if validated_data.get('tipo') == 'Parcelado':
            return self._create_parcelado(validated_data)
        
        return Gasto.objects.create(**validated_data)
    
    def _create_parcelado(self, validated_data):
        from datetime import datetime
        from dateutil.relativedelta import relativedelta
        
        parcelas = validated_data.get('parcelas')
        data_base = validated_data.get('data')
        
        gastos_criados = []
        
        for i in range(1, parcelas + 1):
            gasto_data = validated_data.copy()
            gasto_data['parcela_atual'] = i
            
            # Calcular data da parcela
            if i == 1:
                gasto_data['data'] = data_base
            else:
                gasto_data['data'] = data_base + relativedelta(months=i-1)
            
            gasto = Gasto.objects.create(**gasto_data)
            gastos_criados.append(gasto)
        
        return gastos_criados[0]  # Retorna a primeira parcela