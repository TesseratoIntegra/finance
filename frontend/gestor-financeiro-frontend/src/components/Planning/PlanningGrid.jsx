import React from 'react';
import MonthCard from './MonthCard';
import './PlanningGrid.scss';

const PlanningGrid = ({ planning }) => {
  return (
    <div className="planning-section">
      <h2 className="planning-section__title">📅 Planejamento dos Próximos 3 Meses</h2>
      <div className="planning-grid">
        {planning.map((monthData, index) => (
          <MonthCard
            key={index}
            month={monthData.mes}
            data={monthData}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanningGrid;

