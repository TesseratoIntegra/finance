from rest_framework import serializers
from .models import Receita


class ReceitaSerializer(serializers.ModelSerializer):
    valor_mensal = serializers.ReadOnlyField()
    valor_total = serializers.ReadOnlyField()
    
    class Meta:
        model = Receita
        fields = [
            'id', 'tipo', 'responsavel', 'valor', 'data', 'parcelas',
            'parcela_atual', 'data_criacao', 'data_atualizacao',
            'valor_mensal', 'valor_total'
        ]
        read_only_fields = ['data_criacao', 'data_atualizacao']
    
    def validate(self, data):
        """Validações customizadas"""
        if data.get('tipo') == 'Parcelado':
            if not data.get('parcelas') or data.get('parcelas') < 2:
                raise serializers.ValidationError(
                    "Receitas parceladas devem ter pelo menos 2 parcelas"
                )
        
        if data.get('parcela_atual', 1) > data.get('parcelas', 1):
            raise serializers.ValidationError(
                "Parcela atual não pode ser maior que o total de parcelas"
            )
        
        return data


class ReceitaCreateSerializer(ReceitaSerializer):
    """Serializer específico para criação de receitas"""
    
    def create(self, validated_data):
        # Garantir que receitas não parceladas tenham apenas 1 parcela
        if validated_data.get('tipo') != 'Parcelado':
            validated_data['parcelas'] = 1
            validated_data['parcela_atual'] = 1
        
        return super().create(validated_data)

