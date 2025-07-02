import React from 'react';
import { Plus, DollarSign, Vault, Trash2 } from 'lucide-react';
import './ActionButtons.scss';

const ActionButtons = ({
  onNewGasto,
  onNewReceita,
  onUpdateCaixa,
  onClearData
}) => {
  const buttons = [
    {
      icon: <Plus size={16} />,
      label: 'Novo Gasto',
      onClick: onNewGasto,
      className: 'btn-primary'
    },
    {
      icon: <DollarSign size={16} />,
      label: 'Nova Receita',
      onClick: onNewReceita,
      className: 'btn-info'
    },
    {
      icon: <Vault size={16} />,
      label: 'Atualizar Caixa',
      onClick: onUpdateCaixa,
      className: 'btn-warning'
    },
    {
      icon: <Trash2 size={16} />,
      label: 'Limpar Dados',
      onClick: onClearData,
      className: 'btn-danger'
    }
  ];

  return (
    <div className="action-buttons">
      {buttons.map((button, index) => (
        <button
          key={index}
          className={`btn ${button.className}`}
          onClick={button.onClick}
        >
          {button.icon}
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;

