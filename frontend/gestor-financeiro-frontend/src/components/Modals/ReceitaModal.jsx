import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.scss';

const ReceitaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingReceita = null 
}) => {
  const [formData, setFormData] = useState({
    tipo: 'Salário',
    responsavel: 'Pessoa 1',
    valor: '',
    data: '',
    parcelas: ''
  });

  const tipos = [
    'Salário', 'Freelance', 'Investimento', 
    'Venda', 'Parcelado', 'Outros'
  ];

  const responsaveis = ['Pessoa 1', 'Pessoa 2', 'Ambos'];

  useEffect(() => {
    if (editingReceita) {
      setFormData({
        tipo: editingReceita.tipo,
        responsavel: editingReceita.responsavel,
        valor: editingReceita.valor,
        data: editingReceita.data,
        parcelas: editingReceita.parcelas || ''
      });
    } else {
      setFormData({
        tipo: 'Salário',
        responsavel: 'Pessoa 1',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        parcelas: ''
      });
    }
  }, [editingReceita, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.tipo === 'Parcelado' && (!formData.parcelas || formData.parcelas < 2)) {
      alert('Por favor, informe o número de parcelas (mínimo 2)');
      return;
    }

    const receitaData = {
      ...formData,
      valor: parseFloat(formData.valor),
      parcelas: formData.tipo === 'Parcelado' ? parseInt(formData.parcelas) : 1,
      parcelaAtual: 1
    };

    if (editingReceita) {
      receitaData.id = editingReceita.id;
    }

    onSubmit(receitaData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💰 {editingReceita ? 'Editar' : 'Nova'} Receita</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tipo:</label>
            <select
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              required
            >
              {tipos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Responsável:</label>
            <select
              value={formData.responsavel}
              onChange={(e) => handleChange('responsavel', e.target.value)}
              required
            >
              {responsaveis.map(resp => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Valor (R$):</label>
            <input
              type="number"
              value={formData.valor}
              onChange={(e) => handleChange('valor', e.target.value)}
              placeholder="Ex: 3000"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Data:</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => handleChange('data', e.target.value)}
              required
            />
          </div>

          {formData.tipo === 'Parcelado' && (
            <div className="form-group">
              <label>Número de Parcelas:</label>
              <input
                type="number"
                value={formData.parcelas}
                onChange={(e) => handleChange('parcelas', e.target.value)}
                min="2"
                max="60"
                placeholder="Ex: 12"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            💾 {editingReceita ? 'Atualizar' : 'Salvar'} Receita
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReceitaModal;

