import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.scss';

const CaixaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentValue = 0 
}) => {
  const [valor, setValor] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValor(currentValue.toString());
    }
  }, [isOpen, currentValue]);

  const handleSubmit = (e) => {
  e.preventDefault();
  
  const valorNumerico = parseFloat(valor);
  console.log('Valor a ser enviado:', valorNumerico); // Debug
  
  if (isNaN(valorNumerico) || valorNumerico < 0) {
    alert('Por favor, informe um valor válido');
    return;
  }

  onSubmit(valorNumerico);
  onClose();
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏦 Atualizar Valor em Caixa</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Valor Atual em Caixa (R$):</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 5000"
              step="0.01"
              min="0"
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn btn-primary">
            💾 Atualizar Caixa
          </button>
        </form>
      </div>
    </div>
  );
};

export default CaixaModal;

