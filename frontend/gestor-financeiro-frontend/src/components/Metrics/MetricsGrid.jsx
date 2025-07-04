import React from 'react';
import MetricCard from './MetricCard';
import { formatCurrency } from '../../utils/formatters';
import './MetricsGrid.scss';

const MetricsGrid = ({ metrics }) => {
  // DEBUG: Verificar dados recebidos
  console.log('=== DADOS RECEBIDOS NO FRONTEND ===');
  console.log('metrics:', metrics);
  console.log('gastos_fixos:', metrics.gastos_fixos);
  console.log('endividamento:', metrics.endividamento);
  console.log('=====================================');

  const metricsConfig = [
    {
      key: 'caixa',
      icon: '💰',
      label: 'Valor em Caixa',
      subtitle: 'Disponível agora',
      type: 'caixa'
    },
    {
      key: 'gastos_fixos',
      icon: '💸',
      label: 'Gastos Fixos Mensais',
      subtitle: 'Comprometimento mensal',
      type: 'fixos'
    },
    {
      key: 'endividamento',
      icon: '📊',
      label: 'Total do Endividamento',
      subtitle: 'Parcelas a quitar',
      type: 'endividamento'
    },
    {
      key: 'total_receitas',
      icon: '💰',
      label: 'Receitas do Mês',
      subtitle: 'Entrada mensal',
      type: 'receitas'
    },
    {
      key: 'pago_mes_vigente',
      icon: '✅',
      label: 'Pago no Mês Vigente',
      subtitle: 'Pagamentos realizados',
      type: 'pago'
    },
    {
      key: 'nao_pago_mes_vigente',
      icon: '❌',
      label: 'Não Pago no Mês Vigente',
      subtitle: 'Pendências atuais',
      type: 'nao-pago'
    },
    {
      key: 'atrasados_meses_anteriores',
      icon: '⏰',
      label: 'Atrasados de Meses Anteriores',
      subtitle: 'Pendências anteriores',
      type: 'atrasados'
    }
  ];

  return (
    <div className="metrics-grid">
      {metricsConfig.map((config) => {
        const value = metrics[config.key] || 0;
        console.log(`Card ${config.key}: ${value}`);
        
        return (
          <MetricCard
            key={config.key}
            icon={config.icon}
            value={formatCurrency(value)}
            label={config.label}
            subtitle={config.subtitle}
            type={config.type}
          />
        );
      })}
    </div>
  );
};

export default MetricsGrid;