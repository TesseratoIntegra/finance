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
    
    # Valor em caixa (mantém como está)
    caixa = Caixa.get_current_value()
    
    # 1. GASTOS FIXOS MENSAIS = Apenas gastos recorrentes
    gastos_fixos = Gasto.objects.filter(
        tipo='Recorrente'
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    # 2. ENDIVIDAMENTO = Apenas gastos parcelados (independente do status)
    endividamento = Gasto.objects.filter(
        tipo='Parcelado'
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    # 3. TOTAL RECEITAS = Todas as receitas (fixas + eventuais + parceladas) do mês atual
    receitas_mes = Receita.objects.filter(
        Q(tipo='Fixa') | Q(tipo='Eventual'),
        data__month=mes_atual,
        data__year=ano_atual
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    receitas_parceladas = Receita.objects.filter(
        tipo='Parcelado'
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    total_receitas = receitas_mes + receitas_parceladas
    
    # 4. PAGO NO MÊS VIGENTE = MODIFICADO: Usar data_pagamento em vez de data
    pago_mes_vigente = Gasto.objects.filter(
        status='Pago',
        data_pagamento__month=mes_atual,  # MUDANÇA AQUI: usar data_pagamento
        data_pagamento__year=ano_atual
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    # 5. NÃO PAGO NO MÊS VIGENTE = Gastos pendentes do mês atual
    nao_pago_mes_vigente = Gasto.objects.filter(
        status='Pendente',
        data__month=mes_atual,
        data__year=ano_atual
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    # Adiciona gastos fixos (recorrentes) que ainda não foram pagos este mês
    gastos_fixos_nao_pagos = Gasto.objects.filter(
        tipo='Recorrente',
        status='Pendente'
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    nao_pago_mes_vigente += gastos_fixos_nao_pagos
    
    # 6. ATRASADOS DE MESES ANTERIORES = Gastos pendentes de meses passados
    atrasados_meses_anteriores = Gasto.objects.filter(
        status='Pendente',
        data__lt=date(ano_atual, mes_atual, 1)
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    # DADOS FINAIS
    metrics_data = {
        'caixa': float(caixa),
        'gastos_fixos': float(gastos_fixos),
        'endividamento': float(endividamento),
        'total_receitas': float(total_receitas),
        'pago_mes_vigente': float(pago_mes_vigente),
        'nao_pago_mes_vigente': float(nao_pago_mes_vigente),
        'atrasados_meses_anteriores': float(atrasados_meses_anteriores)
    }
    
    print(f"🎯 Dados Enviados:")
    print(f"   Caixa: R$ {caixa}")
    print(f"   Gastos Fixos: R$ {gastos_fixos}")
    print(f"   Endividamento: R$ {endividamento}")
    print(f"   Receitas: R$ {total_receitas}")
    print(f"   Pago Mês (por data_pagamento): R$ {pago_mes_vigente}")
    print(f"   Não Pago Mês: R$ {nao_pago_mes_vigente}")
    print(f"   Atrasados: R$ {atrasados_meses_anteriores}")
    
    return Response(metrics_data)


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
        mes = hoje.month + i
        ano = hoje.year
        if mes > 12:
            mes -= 12
            ano += 1
        
        mes_nome = f"{meses_nomes[mes-1]} {ano}"
        
        # Gastos fixos/recorrentes (se repetem todo mês)
        gastos_fixos = Gasto.objects.filter(tipo='Recorrente').aggregate(
            total=Sum('valor')
        )['total'] or Decimal('0')
        
        # Gastos parcelados específicos deste mês
        gastos_parcelados = Gasto.objects.filter(
            tipo='Parcelado',
            status='Pendente',
            data__month=mes,
            data__year=ano
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
        
        # Receitas específicas deste mês
        receitas_mes = Receita.objects.filter(
            data__month=mes,
            data__year=ano
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
        
        # Receitas parceladas (se repetem)
        receitas_parceladas = Receita.objects.filter(
            tipo='Parcelado'
        ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
        
        receitas_total = receitas_mes + receitas_parceladas
        
        # Saldo projetado
        saldo = receitas_total - (gastos_fixos + gastos_parcelados)
        
        planning.append({
            'mes': mes_nome,
            'gastos_fixos': float(gastos_fixos),
            'gastos_parcelados': float(gastos_parcelados),
            'receitas': float(receitas_total),
            'saldo': float(saldo)
        })
    
    return Response({'planning': planning})


@api_view(['POST'])
def update_caixa(request):
    """Atualiza o valor em caixa"""
    serializer = CaixaUpdateSerializer(data=request.data)
    if serializer.is_valid():
        value = serializer.validated_data['value']
        caixa, created = Caixa.objects.get_or_create(
            id=1,
            defaults={'valor': value}
        )
        if not created:
            caixa.valor = value
            caixa.save()
        
        return Response({
            'success': True,
            'message': 'Valor em caixa atualizado com sucesso',
            'valor': float(caixa.valor)
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)