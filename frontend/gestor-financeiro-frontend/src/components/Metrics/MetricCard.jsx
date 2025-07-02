import React from 'react';
import './MetricCard.scss';

const MetricCard = ({ 
  icon, 
  value, 
  label, 
  subtitle, 
  type = 'default',
  onClick 
}) => {
  return (
    <div 
      className={`metric-card metric-card--${type}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="metric-card__icon">{icon}</div>
      <div className="metric-card__value">{value}</div>
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__subtitle">{subtitle}</div>
    </div>
  );
};

export default MetricCard;

