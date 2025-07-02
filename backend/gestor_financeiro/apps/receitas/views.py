from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Receita
from .serializers import ReceitaSerializer, ReceitaCreateSerializer


class ReceitaViewSet(viewsets.ModelViewSet):
    queryset = Receita.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tipo', 'responsavel']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReceitaCreateSerializer
        return ReceitaSerializer
    
    def get_queryset(self):
        queryset = Receita.objects.all()
        
        # Filtro por texto (busca no tipo)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(tipo__icontains=search) |
                Q(responsavel__icontains=search)
            )
        
        # ORDENAÇÃO: Data mais próxima primeiro (vencimento mais próximo)
        return queryset.order_by('data', 'id')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Retorna resumo das receitas"""
        receitas = self.get_queryset()
        
        # Calcular receitas mensais
        total_mensal = 0
        for receita in receitas:
            if receita.tipo == 'Parcelado':
                # Para parcelados, conta apenas o valor de uma parcela
                total_mensal += float(receita.valor)
            else:
                # Para receitas fixas/eventuais, verifica se é do mês atual
                from datetime import datetime
                hoje = datetime.now()
                if (receita.data.month == hoje.month and 
                    receita.data.year == hoje.year):
                    total_mensal += float(receita.valor)
        
        # Receitas por responsável
        responsaveis = {}
        for receita in receitas:
            if receita.responsavel not in responsaveis:
                responsaveis[receita.responsavel] = 0
            responsaveis[receita.responsavel] += float(receita.valor_mensal)
        
        # Receitas por tipo
        tipos = {}
        for receita in receitas:
            if receita.tipo not in tipos:
                tipos[receita.tipo] = 0
            tipos[receita.tipo] += float(receita.valor_mensal)
        
        return Response({
            'total_mensal': total_mensal,
            'count': receitas.count(),
            'responsaveis': responsaveis,
            'tipos': tipos
        })