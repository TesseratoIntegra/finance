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
    print("🔥🔥🔥 EXECUTANDO A VIEW CORRETA! 🔥🔥🔥")
    print("🔥🔥🔥 SE VOCÊ VÊ ISSO, A VIEW ESTÁ FUNCIONANDO! 🔥🔥🔥")
    
    """Retorna as métricas principais do dashboard"""
    hoje = date.today()
    mes_atual = hoje.month
    ano_atual = hoje.year
    
    # Valor em caixa
    caixa = Caixa.get_current_value()
    
    # 1. GASTOS FIXOS = APENAS GASTOS RECORRENTES (não importa status)
    gastos_fixos = Gasto.objects.filter(tipo='Recorrente').aggregate(
        total=Sum('valor')
    )['total'] or Decimal('0')
    
    print(f"✅ Gastos Fixos (Recorrentes): R$ {gastos_fixos}")
    
    # 2. ENDIVIDAMENTO = APENAS GASTOS PARCELADOS PENDENTES
    endividamento = Gasto.objects.filter(
        tipo='Parcelado', 
        status='Pendente'
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    print(f"✅ Endividamento (Parcelados Pendentes): R$ {endividamento}")
    
    # 3. TOTAL DE RECEITAS (receitas do mês atual + parceladas)
    total_receitas = Decimal('0')
    
    # Receitas fixas/eventuais do mês atual
    receitas_mes_atual = Receita.objects.filter(
        data__month=mes_atual,
        data__year=ano_atual
    ).exclude(tipo='Parcelado').aggregate(
        total=Sum('valor')
    )['total'] or Decimal('0')
    
    # Receitas parceladas (considera apenas o valor mensal)
    receitas_parceladas = Receita.objects.filter(
        tipo='Parcelado'
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    total_receitas = receitas_mes_atual + receitas_parceladas
    
    print(f"✅ Total Receitas: R$ {total_receitas}")
    
    # 4. PAGO NO MÊS VIGENTE (todos os gastos pagos no mês atual)
    pago_mes_vigente = Gasto.objects.filter(
        status='Pago',
        data__month=mes_atual,
        data__year=ano_atual
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    print(f"✅ Pago no Mês: R$ {pago_mes_vigente}")
    
    # 5. NÃO PAGO NO MÊS VIGENTE (gastos pendentes do mês atual)
    nao_pago_mes_vigente = Gasto.objects.filter(
        status='Pendente',
        data__month=mes_atual,
        data__year=ano_atual
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    print(f"✅ Não Pago no Mês: R$ {nao_pago_mes_vigente}")
    
    # 6. ATRASADOS DE MESES ANTERIORES
    atrasados_meses_anteriores = Gasto.objects.filter(
        status='Pendente',
        data__lt=date(ano_atual, mes_atual, 1)
    ).aggregate(total=Sum('valor'))['total'] or Decimal('0')
    
    print(f"✅ Atrasados: R$ {atrasados_meses_anteriores}")
    
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
    
    print(f"🎯 Dados Finais Enviados: {metrics_data}")
    print("=" * 50)
    
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
        saldo = receitas_total - gastos_fixos - gastos_parcelados
        
        planning.append({
            'mes': mes_nome,
            'gastos_fixos': float(gastos_fixos),
            'gastos_parcelados': float(gastos_parcelados),
            'receitas': float(receitas_total),
            'saldo': float(saldo)
        })
    
    return Response(planning)


@api_view(['POST'])
def update_caixa(request):
    """Atualiza o valor em caixa"""
    serializer = CaixaUpdateSerializer(data=request.data)
    
    if serializer.is_valid():
        novo_valor = serializer.validated_data['value']
        
        # Atualizar ou criar registro de caixa
        caixa, created = Caixa.objects.get_or_create(
            id=1,
            defaults={'valor': novo_valor}
        )
        
        if not created:
            caixa.valor = novo_valor
            caixa.save()
        
        return Response({
            'message': 'Valor em caixa atualizado com sucesso',
            'valor': float(caixa.valor),
            'data_atualizacao': caixa.data_atualizacao
        })
    
    print("Erro de validação:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)