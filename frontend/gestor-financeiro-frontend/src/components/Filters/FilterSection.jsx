import React from 'react';
import { Search, Filter } from 'lucide-react';
import './FilterSection.scss';

const FilterSection = ({
  filters,
  onFilterChange,
  onQuickFilter,
  onClearFilters,
  categories = []
}) => {
  const quickFilters = [
    { key: 'pendentes', label: '⚠️ Pendentes', type: 'warning' },
    { key: 'vencendo', label: '📅 Vencendo', type: 'danger' },
    { key: 'pagos', label: '✅ Pagos', type: 'success' },
  ];

  return (
    <div className="filter-section">
      <div className="filter-section__header">
        <h3 className="filter-section__title">
          <Filter size={20} />
          Filtros e Controles
        </h3>
      </div>

      <div className="filter-section__row">
        <div className="filter-input-group">
          <Search className="filter-input-group__icon" size={16} />
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar..."
            value={filters.texto || ''}
            onChange={(e) => onFilterChange('texto', e.target.value)}
          />
        </div>

        <select
          className="filter-input"
          value={filters.categoria || ''}
          onChange={(e) => onFilterChange('categoria', e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="filter-input"
          value={filters.tipo || ''}
          onChange={(e) => onFilterChange('tipo', e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="Fixo">Fixo</option>
          <option value="Variável">Variável</option>
          <option value="Parcelado">Parcelado</option>
        </select>

        <select
          className="filter-input"
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="Pendente">Pendente</option>
          <option value="Pago">Pago</option>
        </select>
      </div>

      <div className="filter-section__buttons">
        {quickFilters.map(filter => (
          <button
            key={filter.key}
            className={`filter-btn filter-btn--${filter.type}`}
            onClick={() => onQuickFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
        <button
          className="filter-btn filter-btn--clear"
          onClick={onClearFilters}
        >
          🔄 Limpar
        </button>
      </div>
    </div>
  );
};

export default FilterSection;

