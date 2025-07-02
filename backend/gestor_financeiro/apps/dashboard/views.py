from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, date
from decimal import Decimal
from django.db.models import Sum, Q

from .models import Caixa
from .serializers import (
    CaixaUpdateSerializer, MetricsSerializer, 
    PlanningSerializer, PlanningMonthSerializer
)
from ..gastos.models import Gasto
from ..receitas.models import Receita


@api_view(['GET'])
def get_metrics(request):
    """Retorna as métricas principais do dashboard"""
    hoje = date.today()
    mes_atual = hoje.month
    ano_atual = hoje.year
    
    # Valor em caixa
    caixa = Caixa.get_current_value()
    
    # Gastos fixos mensais
    gastos_fixos = Gasto.objects.filter(tipo='Fixo').aggregate(
        total=Sum('valor')
    )['total'] or Decimal('0')
    
    # Total do endividamento (apenas parcelas pendentes)
    endividamento = Decimal('0')
    gastos_parcelados = Gasto.objects.filter(
        tipo='Parcelado', 
        status='Pendente'
    )
    for gasto in gastos_parcelados:
        endividamento += gasto.valor_total_restante
    
    # Total de receitas mensais
    total_receitas = Decimal('0')
    receitas = Receita.objects.all()
    for receita in receitas:
        if receita.tipo == 'Parcelado':
            # Para parcelados, conta apenas o valor de uma parcela
            total_receitas += receita.valor
        else:
            # Para receitas fixas/eventuais, verifica se é do mês atual
            if (receita.data.month == mes_atual and 
                receita.data.year == ano_atual):
                total_receitas += receita.valor
    
    # Pago no mês vigente
    pago_mes_vigente = Gasto.objects.filter(
        status='Pago',
        data__month=mes_atual,
        data__year=ano_atual
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    # Não pago no mês vigente
    nao_pago_mes_vigente = Gasto.objects.filter(
        status='Pendente',
        data__month=mes_atual,
        data__year=ano_atual
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    # Atrasados de meses anteriores
    atrasados_meses_anteriores = Gasto.objects.filter(
        status='Pendente',
        data__lt=date(ano_atual, mes_atual, 1)
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    metrics_data = {
        'caixa': caixa,
        'gastos_fixos': gastos_fixos,
        'endividamento': endividamento,
        'total_receitas': total_receitas,
        'pago_mes_vigente': pago_mes_vigente,
        'nao_pago_mes_vigente': nao_pago_mes_vigente,
        'atrasados_meses_anteriores': atrasados_meses_anteriores
    }
    
    serializer = MetricsSerializer(metrics_data)
    return Response(serializer.data)


@api_view(['GET'])
def get_planning(request):
    """Retorna o planejamento dos próximos 3 meses"""
    hoje = date.today()
    planning = []
    
    meses_nomes = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    
    for i in range(3):
        # Calcular o mês
        mes = hoje.month + i
        ano = hoje.year
        if mes > 12:
            mes -= 12
            ano += 1
        
        mes_nome = f"{meses_nomes[mes-1]} {ano}"
        
        # Gastos fixos
        gastos_fixos = Gasto.objects.filter(tipo='Fixo').aggregate(
            total=Sum('valor')
        )['total'] or Decimal('0')
        
        # Gastos parcelados para este mês
        gastos_parcelados = Decimal('0')
        gastos_parc = Gasto.objects.filter(
            tipo='Parcelado', 
            status='Pendente'
        )
        
        for gasto in gastos_parc:
            # Verificar se a parcela cai neste mês
            data_inicio = gasto.data
            meses_diferenca = (ano - data_inicio.year) * 12 + (mes - data_inicio.month)
            
            if 0 <= meses_diferenca < gasto.parcelas:
                gastos_parcelados += gasto.valor
        
        # Receitas mensais para este mês
        receitas_mes = Decimal('0')
        receitas = Receita.objects.all()
        
        for receita in receitas:
            if receita.tipo == 'Parcelado':
                # Verificar se a parcela cai neste mês
                data_inicio = receita.data
                meses_diferenca = (ano - data_inicio.year) * 12 + (mes - data_inicio.month)
                
                if 0 <= meses_diferenca < receita.parcelas:
                    receitas_mes += receita.valor
            else:
                # Para receitas fixas/eventuais, verifica se é do mês específico
                if (receita.data.month == mes and 
                    receita.data.year == ano):
                    receitas_mes += receita.valor
        
        total_gastos = gastos_fixos + gastos_parcelados
        saldo = receitas_mes - total_gastos
        
        planning.append({
            'mes': mes_nome,
            'gastos_fixos': gastos_fixos,
            'gastos_parcelados': gastos_parcelados,
            'receitas': receitas_mes,
            'saldo': saldo
        })
    
    serializer = PlanningMonthSerializer(planning, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def update_caixa(request):
    """Atualiza o valor em caixa"""
    serializer = CaixaUpdateSerializer(data=request.data)
    
    if serializer.is_valid():
        novo_valor = serializer.validated_data['value']
        caixa = Caixa.update_value(novo_valor)
        
        return Response({
            'valor': caixa.valor,
            'data_atualizacao': caixa.data_atualizacao,
            'message': 'Valor em caixa atualizado com sucesso'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

