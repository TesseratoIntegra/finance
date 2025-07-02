import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.scss';

const GastoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingGasto = null 
}) => {
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: 'Moradia',
    valor: '',
    data: '',
    tipo: 'Fixo',
    parcelas: ''
  });

  const categorias = [
    'Moradia', 'Alimentação', 'Transporte', 'Saúde', 
    'Educação', 'Lazer', 'Financeiro', 'Outros'
  ];

  useEffect(() => {
    if (editingGasto) {
      setFormData({
        descricao: editingGasto.descricao,
        categoria: editingGasto.categoria,
        valor: editingGasto.valor,
        data: editingGasto.data,
        tipo: editingGasto.tipo,
        parcelas: editingGasto.parcelas || ''
      });
    } else {
      setFormData({
        descricao: '',
        categoria: 'Moradia',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        tipo: 'Fixo',
        parcelas: ''
      });
    }
  }, [editingGasto, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.tipo === 'Parcelado' && (!formData.parcelas || formData.parcelas < 2)) {
      alert('Por favor, informe o número de parcelas (mínimo 2)');
      return;
    }

    const gastoData = {
      ...formData,
      valor: parseFloat(formData.valor),
      parcelas: formData.tipo === 'Parcelado' ? parseInt(formData.parcelas) : 1,
      parcelaAtual: 1,
      status: 'Pendente'
    };

    if (editingGasto) {
      gastoData.id = editingGasto.id;
    }

    onSubmit(gastoData);
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
          <h3>💸 {editingGasto ? 'Editar' : 'Novo'} Gasto</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Descrição:</label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Ex: Aluguel"
              required
            />
          </div>

          <div className="form-group">
            <label>Categoria:</label>
            <select
              value={formData.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              required
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Valor (R$):</label>
            <input
              type="number"
              value={formData.valor}
              onChange={(e) => handleChange('valor', e.target.value)}
              placeholder="Ex: 1200"
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

          <div className="form-group">
            <label>Tipo:</label>
            <select
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              required
            >
              <option value="Fixo">Fixo (todo mês)</option>
              <option value="Variável">Variável</option>
              <option value="Parcelado">Parcelado</option>
            </select>
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
            💾 {editingGasto ? 'Atualizar' : 'Salvar'} Gasto
          </button>
        </form>
      </div>
    </div>
  );
};

export default GastoModal;

