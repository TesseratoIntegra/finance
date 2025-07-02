import React from 'react';
import MetricCard from './MetricCard';
import { formatCurrency } from '../../utils/formatters';
import './MetricsGrid.scss';

const MetricsGrid = ({ metrics }) => {
  const metricsConfig = [
    {
      key: 'caixa',
      icon: '💰',
      label: 'Valor em Caixa',
      subtitle: 'Disponível agora',
      type: 'caixa'
    },
    {
      key: 'gastosFixos',
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
      key: 'totalReceitas',
      icon: '💰',
      label: 'Receitas do Mês',
      subtitle: 'Entrada mensal',
      type: 'receitas'
    },
    {
      key: 'pagoMesVigente',
      icon: '✅',
      label: 'Pago no Mês Vigente',
      subtitle: 'Pagamentos realizados',
      type: 'pago'
    },
    {
      key: 'naoPagoMesVigente',
      icon: '❌',
      label: 'Não Pago no Mês Vigente',
      subtitle: 'Pendências atuais',
      type: 'nao-pago'
    },
    {
      key: 'atrasadosMesesAnteriores',
      icon: '⏰',
      label: 'Atrasados de Meses Anteriores',
      subtitle: 'Pendências anteriores',
      type: 'atrasados'
    }
  ];

  return (
    <div className="metrics-grid">
      {metricsConfig.map((config) => (
        <MetricCard
          key={config.key}
          icon={config.icon}
          value={formatCurrency(metrics[config.key] || 0)}
          label={config.label}
          subtitle={config.subtitle}
          type={config.type}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;

