import React from 'react';
import './MonthFilter.scss';

const MonthFilter = ({ selectedMonth, selectedYear, onMonthChange, onYearChange, onClear }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  return (
    <div className="month-filter">
      <div className="month-filter__controls">
        <div className="month-filter__field">
          <label htmlFor="month-select">Mês:</label>
          <select
            id="month-select"
            value={selectedMonth || ''}
            onChange={(e) => onMonthChange(e.target.value ? parseInt(e.target.value) : null)}
            className="month-filter__select"
          >
            <option value="">Todos os meses</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="month-filter__field">
          <label htmlFor="year-select">Ano:</label>
          <select
            id="year-select"
            value={selectedYear || ''}
            onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
            className="month-filter__select"
          >
            <option value="">Todos os anos</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {(selectedMonth || selectedYear) && (
          <button
            type="button"
            onClick={onClear}
            className="month-filter__clear"
            title="Limpar filtros de data"
          >
            ✖️ Limpar
          </button>
        )}
      </div>

      {(selectedMonth || selectedYear) && (
        <div className="month-filter__active">
          📅 Filtro ativo: {' '}
          {selectedMonth && months.find(m => m.value === selectedMonth)?.label}
          {selectedMonth && selectedYear && ' de '}
          {selectedYear}
        </div>
      )}
    </div>
  );
};

export default MonthFilter;