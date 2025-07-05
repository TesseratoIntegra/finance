import React from 'react';
import MetricCard from './MetricCard';
import { formatCurrency } from '../../utils/formatters';
import './MetricsGrid.scss';

const MetricsGrid = ({ metrics }) => {
  // Verificar se metrics existe
  if (!metrics) {
    return <div>Carregando métricas...</div>;
  }

  console.log('=== DADOS RECEBIDOS NO FRONTEND ===');
  console.log('metrics:', metrics);
  console.log('total_receitas:', metrics.total_receitas);
  console.log('endividamento:', metrics.endividamento);
  console.log('gastos_fixos:', metrics.gastos_fixos);
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
      key: 'total_receitas',
      icon: '💰',
      label: 'Receitas do Mês',
      subtitle: 'Entrada mensal',
      type: 'receitas'
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
        console.log(`Renderizando Card ${config.key}: ${value}`);
        
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