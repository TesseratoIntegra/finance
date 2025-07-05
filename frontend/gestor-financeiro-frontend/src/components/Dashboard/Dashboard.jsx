import React, { useState } from 'react';
import Header from '../Header';
import { MetricsGrid } from '../Metrics';
import { PlanningGrid } from '../Planning';
import { FilterSection } from '../Filters';
import MonthFilter from '../Filters/MonthFilter';
import { GastosTable, ReceitasTable } from '../Tables';
import { GastoModal, ReceitaModal, CaixaModal } from '../Modals';
import ActionButtons from './ActionButtons';
import useFinancialData from '../../hooks/useFinancialData';
import { gastosAPI, receitasAPI } from '../../services/api';
import './Dashboard.scss';

const Dashboard = () => {
  const { data, filters, setFilters, loadData, markGastoAsPaid } = useFinancialData();
  
  // Estados dos modais
  const [gastoModal, setGastoModal] = useState({ isOpen: false, editData: null });
  const [receitaModal, setReceitaModal] = useState({ isOpen: false, editData: null });
  const [caixaModal, setCaixaModal] = useState(false);

  // Estados das abas
  const [activeTab, setActiveTab] = useState('gastos');

  // Handlers dos filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      texto: '',
      categoria: '',
      tipo: '',
      status: '',
      mes: null,
      ano: null
    });
  };

  // Handlers para filtro de mês
  const handleMonthChange = (mes) => {
    setFilters(prev => ({ ...prev, mes }));
  };

  const handleYearChange = (ano) => {
    setFilters(prev => ({ ...prev, ano }));
  };

  const handleClearDateFilters = () => {
    setFilters(prev => ({ ...prev, mes: null, ano: null }));
  };

  // CORRIGIDO: Handlers dos gastos usando a API diretamente
  const handleGastoSubmit = async (gastoData) => {
    try {
      if (gastoModal.editData) {
        await gastosAPI.update(gastoModal.editData.id, gastoData);
      } else {
        await gastosAPI.create(gastoData);
      }
      loadData(); // Recarregar dados
      setGastoModal({ isOpen: false, editData: null });
    } catch (error) {
      console.error('Erro ao salvar gasto:', error);
      alert('Erro ao salvar gasto');
    }
  };

  const handleEditGasto = (gasto) => {
    setGastoModal({ isOpen: true, editData: gasto });
  };

  const handleDeleteGasto = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este gasto?')) {
      try {
        await gastosAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir gasto:', error);
        alert('Erro ao excluir gasto');
      }
    }
  };

  const handleMarkGastoPaid = async (id) => {
    try {
      await markGastoAsPaid(id);
    } catch (error) {
      console.error('Erro ao marcar gasto como pago:', error);
      alert('Erro ao marcar gasto como pago');
    }
  };

  // CORRIGIDO: Handlers das receitas usando a API diretamente
  const handleReceitaSubmit = async (receitaData) => {
    try {
      if (receitaModal.editData) {
        await receitasAPI.update(receitaModal.editData.id, receitaData);
      } else {
        await receitasAPI.create(receitaData);
      }
      loadData(); // Recarregar dados
      setReceitaModal({ isOpen: false, editData: null });
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita');
    }
  };

  const handleEditReceita = (receita) => {
    setReceitaModal({ isOpen: true, editData: receita });
  };

  const handleDeleteReceita = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await receitasAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir receita:', error);
        alert('Erro ao excluir receita');
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      console.log('Função de limpar dados ainda não implementada');
    }
  };

  // Loading state
  if (data.loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__content">
          <Header />
          <div className="loading">Carregando dados financeiros...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__content">
        <Header />
        
        {/* Botões de Ação */}
        <section className="dashboard__section">
          <ActionButtons
            onNewGasto={() => setGastoModal({ isOpen: true, editData: null })}
            onNewReceita={() => setReceitaModal({ isOpen: true, editData: null })}
            onUpdateCaixa={() => setCaixaModal(true)}
            onClearData={handleClearData}
          />
        </section>

        {/* Métricas principais */}
        <section className="dashboard__section">
          <MetricsGrid metrics={data.metrics} />
        </section>

        {/* Planejamento */}
        <section className="dashboard__section">
          <PlanningGrid planning={data.planning} />
        </section>

        {/* Filtros gerais */}
        <section className="dashboard__section">
          <FilterSection 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            categories={['Alimentacao', 'Transporte', 'Moradia', 'Saude', 'Educacao', 'Lazer', 'Vestuario', 'Outros']}
          />
        </section>

        {/* Filtro por mês */}
        <section className="dashboard__section">
          <MonthFilter
            selectedMonth={filters.mes}
            selectedYear={filters.ano}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onClear={handleClearDateFilters}
          />
        </section>

        {/* Abas de navegação */}
        <section className="dashboard__section">
          <div className="dashboard__tabs">
            <button
              className={`dashboard__tab ${activeTab === 'gastos' ? 'active' : ''}`}
              onClick={() => setActiveTab('gastos')}
            >
              💸 Gastos ({data.gastosSubtotal?.count || 0})
            </button>
            <button
              className={`dashboard__tab ${activeTab === 'receitas' ? 'active' : ''}`}
              onClick={() => setActiveTab('receitas')}
            >
              💰 Receitas ({data.receitasSubtotal?.count || 0})
            </button>
          </div>

          {/* Conteúdo das abas */}
          <div className="dashboard__tab-content">
            {activeTab === 'gastos' && (
              <GastosTable
                gastos={data.gastos}
                onEdit={handleEditGasto}
                onDelete={handleDeleteGasto}
                onMarkAsPaid={handleMarkGastoPaid}
                subtotal={data.gastosSubtotal}
              />
            )}

            {activeTab === 'receitas' && (
              <ReceitasTable
                receitas={data.receitas}
                onEdit={handleEditReceita}
                onDelete={handleDeleteReceita}
                subtotal={data.receitasSubtotal}
              />
            )}
          </div>
        </section>
      </div>

      {/* Modais */}
      {gastoModal.isOpen && (
        <GastoModal
          isOpen={gastoModal.isOpen}
          editingGasto={gastoModal.editData}
          onClose={() => setGastoModal({ isOpen: false, editData: null })}
          onSubmit={handleGastoSubmit}
        />
      )}

      {receitaModal.isOpen && (
        <ReceitaModal
          isOpen={receitaModal.isOpen}
          editingReceita={receitaModal.editData}
          onClose={() => setReceitaModal({ isOpen: false, editData: null })}
          onSubmit={handleReceitaSubmit}
        />
      )}

      {caixaModal && (
        <CaixaModal
          isOpen={caixaModal}
          currentValue={data.metrics?.caixa || 0}
          onClose={() => setCaixaModal(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
};

export default Dashboard;