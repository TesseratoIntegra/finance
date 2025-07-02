import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import './MonthCard.scss';

const MonthCard = ({ month, data }) => {
  const { gastosFixos, gastosParcelados, receitas, saldo } = data;

  return (
    <div className="month-card">
      <div className="month-card__title">{month}</div>
      
      <div className="month-card__item">
        <span>Gastos Fixos</span>
        <span>{formatCurrency(gastosFixos)}</span>
      </div>
      
      <div className="month-card__item">
        <span>Gastos Parcelados</span>
        <span>{formatCurrency(gastosParcelados)}</span>
      </div>
      
      <div className="month-card__item">
        <span>Receitas do Mês</span>
        <span>{formatCurrency(receitas)}</span>
      </div>
      
      <div className={`month-card__item month-card__item--saldo ${saldo >= 0 ? 'positive' : 'negative'}`}>
        <span>Saldo do Mês</span>
        <span>{formatCurrency(saldo)}</span>
      </div>
    </div>
  );
};

export default MonthCard;

