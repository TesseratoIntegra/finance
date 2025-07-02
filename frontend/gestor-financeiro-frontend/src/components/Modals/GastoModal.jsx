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
    tipo: 'Unico',
    parcelas: ''
  });

  // Categorias alinhadas com o backend
  const categorias = [
    { value: 'Alimentacao', label: 'Alimentação' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Moradia', label: 'Moradia' },
    { value: 'Saude', label: 'Saúde' },
    { value: 'Educacao', label: 'Educação' },
    { value: 'Lazer', label: 'Lazer' },
    { value: 'Vestuario', label: 'Vestuário' },
    { value: 'Outros', label: 'Outros' }
  ];

  // Tipos alinhados com o backend
  const tipos = [
    { value: 'Unico', label: 'Único' },
    { value: 'Recorrente', label: 'Recorrente (todo mês)' },
    { value: 'Parcelado', label: 'Parcelado' }
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
        tipo: 'Unico',
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
      descricao: formData.descricao,
      categoria: formData.categoria,
      valor: parseFloat(formData.valor),
      data: formData.data,
      tipo: formData.tipo,
      parcelas: formData.tipo === 'Parcelado' ? parseInt(formData.parcelas) : null,
      parcela_atual: formData.tipo === 'Parcelado' ? 1 : null
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
                <option key={cat.value} value={cat.value}>{cat.label}</option>
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
              min="0.01"
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
              {tipos.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
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