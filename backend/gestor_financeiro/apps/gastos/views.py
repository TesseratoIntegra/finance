from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q, Case, When, IntegerField
from django.db.models.functions import Lower
from dateutil.relativedelta import relativedelta
from datetime import date

from .models import Gasto
from .serializers import GastoSerializer, GastoCreateSerializer


class GastoViewSet(viewsets.ModelViewSet):
    queryset = Gasto.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GastoCreateSerializer
        return GastoSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros via query params
        categoria = self.request.query_params.get('categoria')
        tipo = self.request.query_params.get('tipo')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        # NOVO: Filtro por mês
        mes = self.request.query_params.get('mes')
        ano = self.request.query_params.get('ano')
        
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        if tipo:
            queryset = queryset.filter(tipo=tipo)
            
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if search:
            queryset = queryset.filter(
                Q(descricao__icontains=search) |
                Q(categoria__icontains=search)
            )
        
        # NOVO: Filtro por mês e ano
        if mes:
            queryset = queryset.filter(data__month=mes)
        
        if ano:
            queryset = queryset.filter(data__year=ano)
        
        # Ordenação: Vencidos primeiro, depois pendentes por data crescente, pagos por data decrescente
        return queryset.annotate(
            prioridade_status=Case(
                When(status='Pendente', then=1),
                When(status='Pago', then=2),
                When(status='Vencido', then=0),
                default=3,
                output_field=IntegerField()
            )
        ).order_by('prioridade_status', 'data', 'id')
    
    @action(detail=True, methods=['patch'])
    def mark_paid(self, request, pk=None):
        """Marca um gasto como pago e registra a data do pagamento"""
        gasto = self.get_object()
        
        if gasto.status == 'Pago':
            return Response(
                {'detail': 'Gasto já está marcado como pago'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # NOVO: Definir data do pagamento como hoje
        gasto.status = 'Pago'
        gasto.data_pagamento = date.today()  # Data atual do pagamento
        gasto.save()
        
        # Se for parcelado, criar próxima parcela se necessário
        if (gasto.tipo == 'Parcelado' and 
            gasto.parcela_atual and 
            gasto.parcelas and 
            gasto.parcela_atual < gasto.parcelas):
            try:
                self._create_next_installment(gasto)
            except Exception as e:
                print(f"Erro ao criar próxima parcela: {e}")
        
        serializer = self.get_serializer(gasto)
        return Response({
            'message': 'Gasto marcado como pago com sucesso',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['patch'])
    def mark_pending(self, request, pk=None):
        """Marca um gasto como pendente e remove a data do pagamento"""
        gasto = self.get_object()
        
        if gasto.status == 'Pendente':
            return Response(
                {'detail': 'Gasto já está marcado como pendente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        gasto.status = 'Pendente'
        gasto.data_pagamento = None  # Remove a data do pagamento
        gasto.save()
        
        serializer = self.get_serializer(gasto)
        return Response({
            'message': 'Gasto marcado como pendente com sucesso',
            'data': serializer.data
        })
    
    def _create_next_installment(self, gasto_pago):
        """Cria a próxima parcela de um gasto parcelado"""
        proxima_parcela = gasto_pago.parcela_atual + 1
        
        # Verificar se já existe essa parcela
        existing_parcela = Gasto.objects.filter(
            descricao=gasto_pago.descricao,
            categoria=gasto_pago.categoria,
            valor=gasto_pago.valor,
            tipo='Parcelado',
            parcela_atual=proxima_parcela,
            parcelas=gasto_pago.parcelas
        ).exists()
        
        if existing_parcela:
            return
        
        # Calcular data da próxima parcela
        data_base = gasto_pago.data
        proxima_data = data_base + relativedelta(months=1)
        
        # Criar nova parcela
        Gasto.objects.create(
            descricao=gasto_pago.descricao,
            categoria=gasto_pago.categoria,
            valor=gasto_pago.valor,
            data=proxima_data,
            tipo=gasto_pago.tipo,
            parcelas=gasto_pago.parcelas,
            parcela_atual=proxima_parcela,
            status='Pendente'
        )
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Retorna resumo dos gastos"""
        gastos = self.get_queryset()
        
        totals = gastos.aggregate(
            total_gastos=Sum('valor'),
            total_pendente=Sum('valor', filter=Q(status='Pendente')),
            total_pago=Sum('valor', filter=Q(status='Pago'))
        )
        
        # Gastos por categoria
        categorias = gastos.values('categoria').annotate(
            total=Sum('valor'),
            pendente=Sum('valor', filter=Q(status='Pendente')),
            pago=Sum('valor', filter=Q(status='Pago'))
        ).order_by('-total')
        
        return Response({
            'totals': totals,
            'categorias': categorias,
            'count': gastos.count()
        })