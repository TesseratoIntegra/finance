import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './ReceitasTable.scss';

const ReceitasTable = ({ 
  receitas, 
  onEdit, 
  onDelete,
  subtotal 
}) => {
  return (
    <div className="table-section">
      <div className="table-section__header">
        <h3 className="table-section__title">💰 Receitas por Responsável</h3>
        {subtotal && (
          <div className="table-section__subtitle">
            💰 <strong>Subtotal:</strong> {subtotal.count} itens | 
            Total Mensal: {formatCurrency(subtotal.totalMensal)}
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="receitas-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Responsável</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Parcela</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {receitas.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">
                  Nenhuma receita cadastrada
                </td>
              </tr>
            ) : (
              receitas.map((receita) => (
                <tr key={receita.id}>
                  <td>
                    <span className="tipo-badge">
                      {receita.tipo}
                    </span>
                  </td>
                  <td>
                    <span className={`responsavel-badge responsavel-${receita.responsavel.toLowerCase().replace(' ', '-')}`}>
                      {receita.responsavel}
                    </span>
                  </td>
                  <td className="table-currency">{formatCurrency(receita.valor)}</td>
                  <td>{formatDate(receita.data)}</td>
                  <td>
                    {receita.tipo === 'Parcelado' 
                      ? `${receita.parcelaAtual}/${receita.parcelas}` 
                      : '-'
                    }
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => onEdit(receita)}
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => onDelete(receita.id)}
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

export default ReceitasTable;

