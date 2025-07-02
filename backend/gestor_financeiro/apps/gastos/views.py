from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum
from datetime import datetime
from dateutil.relativedelta import relativedelta
from .models import Gasto
from .serializers import GastoSerializer, GastoCreateSerializer


class GastoViewSet(viewsets.ModelViewSet):
    queryset = Gasto.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['categoria', 'tipo', 'status']
    ordering = ['-data']  # Ordenar por data decrescente
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GastoCreateSerializer
        return GastoSerializer
    
    def get_queryset(self):
        queryset = Gasto.objects.all()
        
        # Filtro por texto (busca na descrição)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(descricao__icontains=search) |
                Q(categoria__icontains=search)
            )
        
        # Filtro por período
        data_inicio = self.request.query_params.get('data_inicio', None)
        data_fim = self.request.query_params.get('data_fim', None)
        
        if data_inicio:
            try:
                data_inicio = datetime.strptime(data_inicio, '%Y-%m-%d').date()
                queryset = queryset.filter(data__gte=data_inicio)
            except ValueError:
                pass
        
        if data_fim:
            try:
                data_fim = datetime.strptime(data_fim, '%Y-%m-%d').date()
                queryset = queryset.filter(data__lte=data_fim)
            except ValueError:
                pass
        
        return queryset.order_by('-data')
    
    @action(detail=True, methods=['patch'])
    def mark_paid(self, request, pk=None):
        """Marca um gasto como pago"""
        gasto = self.get_object()
        
        if gasto.status == 'Pago':
            return Response(
                {'detail': 'Gasto já está marcado como pago'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        gasto.status = 'Pago'
        gasto.save()
        
        # Se for parcelado, criar próxima parcela se necessário
        if (gasto.tipo == 'Parcelado' and 
            gasto.parcela_atual and 
            gasto.parcelas and 
            gasto.parcela_atual < gasto.parcelas):
            try:
                self._create_next_installment(gasto)
            except Exception as e:
                # Log do erro, mas não falhar a operação
                print(f"Erro ao criar próxima parcela: {e}")
        
        serializer = self.get_serializer(gasto)
        return Response({
            'message': 'Gasto marcado como pago com sucesso',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['patch'])
    def mark_pending(self, request, pk=None):
        """Marca um gasto como pendente"""
        gasto = self.get_object()
        
        if gasto.status == 'Pendente':
            return Response(
                {'detail': 'Gasto já está marcado como pendente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        gasto.status = 'Pendente'
        gasto.save()
        
        serializer = self.get_serializer(gasto)
        return Response({
            'message': 'Gasto marcado como pendente com sucesso',
            'data': serializer.data
        })
    
    def _create_next_installment(self, gasto_pago):
        """Cria a próxima parcela de um gasto parcelado"""
        # Verificar se já existe a próxima parcela
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
            return  # Não criar duplicata
        
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
        
        # Usar agregação para melhor performance
        totals = gastos.aggregate(
            total_gastos=Sum('valor'),
            total_pendente=Sum('valor', filter=Q(status='Pendente')),
            total_pago=Sum('valor', filter=Q(status='Pago'))
        )
        
        # Gastos por categoria usando agregação
        categorias = (gastos.values('categoria')
                     .annotate(total=Sum('valor'))
                     .order_by('-total'))
        
        # Gastos por status
        status_count = (gastos.values('status')
                       .annotate(count=Sum('valor'))
                       .order_by('status'))
        
        return Response({
            'total_gastos': totals['total_gastos'] or 0,
            'total_pendente': totals['total_pendente'] or 0,
            'total_pago': totals['total_pago'] or 0,
            'count': gastos.count(),
            'categorias': {cat['categoria']: float(cat['total']) for cat in categorias},
            'status_summary': {s['status']: float(s['count']) for s in status_count}
        })
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Retorna resumo mensal dos gastos"""
        from django.db.models import Extract
        
        gastos = self.get_queryset()
        
        monthly_data = (gastos
                       .annotate(
                           mes=Extract('data', 'month'),
                           ano=Extract('data', 'year')
                       )
                       .values('ano', 'mes')
                       .annotate(
                           total=Sum('valor'),
                           count=Q(id__count=True)
                       )
                       .order_by('-ano', '-mes'))
        
        return Response({
            'monthly_summary': list(monthly_data)
        })
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Retorna lista de categorias únicas"""
        categorias = (Gasto.objects
                     .values_list('categoria', flat=True)
                     .distinct()
                     .order_by('categoria'))
        
        return Response({
            'categories': list(categorias)
        })