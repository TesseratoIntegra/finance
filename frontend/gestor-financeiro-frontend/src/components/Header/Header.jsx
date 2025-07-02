import React from 'react';
import './Header.scss';

const Header = () => {
  return (
    <header className="header">
      <div className="header__content">
        <h1 className="header__title">💰 Gestor Financeiro Pessoal</h1>
        <p className="header__subtitle">
          Controle completo de gastos, receitas e planejamento financeiro
        </p>
      </div>
    </header>
  );
};

export default Header;

