import React from 'react';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './GastosTable.scss';

const GastosTable = ({ 
  gastos, 
  onEdit, 
  onDelete, 
  onMarkAsPaid,
  subtotal 
}) => {
  const getStatusClass = (status) => {
    return status === 'Pago' ? 'pago' : 'pendente';
  };

  const getTipoClass = (tipo) => {
    return `tipo-${tipo.toLowerCase()}`;
  };

  const calculateNextDueDate = (gasto) => {
    if (gasto.tipo !== 'Parcelado') return '-';
    
    const currentDate = new Date(gasto.data);
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(currentDate.getMonth() + 1);
    
    return formatDate(nextMonth.toISOString().split('T')[0]);
  };

  return (
    <div className="table-section">
      <div className="table-section__header">
        <h3 className="table-section__title">📋 Controle de Gastos e Despesas</h3>
        {subtotal && (
          <div className="table-section__subtitle">
            📊 <strong>Subtotal:</strong> {subtotal.count} itens | 
            Total: {formatCurrency(subtotal.total)} | 
            Pendente: {formatCurrency(subtotal.pendente)} | 
            Pago: {formatCurrency(subtotal.pago)}
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="gastos-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Parcela</th>
              <th>Status</th>
              <th>Próx. Vencimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 ? (
              <tr>
                <td colSpan="9" className="table-empty">
                  Nenhum gasto cadastrado
                </td>
              </tr>
            ) : (
              gastos.map((gasto) => (
                <tr key={gasto.id} className={getStatusClass(gasto.status)}>
                  <td>{gasto.descricao}</td>
                  <td>{gasto.categoria}</td>
                  <td className="table-currency">{formatCurrency(gasto.valor)}</td>
                  <td>{formatDate(gasto.data)}</td>
                  <td>
                    <span className={`tipo-badge ${getTipoClass(gasto.tipo)}`}>
                      {gasto.tipo}
                    </span>
                  </td>
                  <td>
                    {gasto.tipo === 'Parcelado' 
                      ? `${gasto.parcela_atual || gasto.parcelaAtual || 1}/${gasto.parcelas}` 
                      : '-'
                    }
                  </td>
                  <td>
                    <span className={`status-badge status-${gasto.status.toLowerCase()}`}>
                      {gasto.status}
                    </span>
                  </td>
                  <td>
                    {gasto.tipo === 'Parcelado' 
                      ? calculateNextDueDate(gasto)
                      : '-'
                    }
                  </td>
                  <td>
                    <div className="table-actions">
                      {gasto.status === 'Pendente' && (
                        <button
                          className="action-btn action-btn--pay"
                          onClick={() => onMarkAsPaid(gasto.id)}
                          title="Marcar como Pago"
                        >
                          <DollarSign size={14} />
                        </button>
                      )}
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => onEdit(gasto)}
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => onDelete(gasto.id)}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GastosTable;