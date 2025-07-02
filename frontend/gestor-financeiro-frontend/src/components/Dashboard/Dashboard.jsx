import React, { useState } from 'react';
import { useFinancialData } from '../../hooks/useFinancialData';

// Componentes
import Header from '../Header';
import { MetricsGrid } from '../Metrics';
import { PlanningGrid } from '../Planning';
import { FilterSection } from '../Filters';
import { GastosTable, ReceitasTable } from '../Tables';
import { GastoModal, ReceitaModal, CaixaModal } from '../Modals';
import ActionButtons from './ActionButtons';

// Estilos
import '../../styles/globals.scss';
import './Dashboard.scss';

const Dashboard = () => {
  const {
    gastos,
    receitas,
    metrics,
    planning,
    loading,
    error,
    gastosSubtotal,
    receitasSubtotal,
    filters,
    categories,
    updateFilter,
    clearFilters,
    applyQuickFilter,
    addGasto,
    updateGasto,
    deleteGasto,
    markGastoAsPaid,
    addReceita,
    updateReceita,
    deleteReceita,
    updateCaixa,
    refreshData
  } = useFinancialData();

  // Estados dos modais
  const [modals, setModals] = useState({
    gasto: false,
    receita: false,
    caixa: false
  });

  // Estados de edição
  const [editingGasto, setEditingGasto] = useState(null);
  const [editingReceita, setEditingReceita] = useState(null);

  // Funções dos modais
  const openModal = (type, editData = null) => {
    if (type === 'gasto') {
      setEditingGasto(editData);
    } else if (type === 'receita') {
      setEditingReceita(editData);
    }
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: false }));
    if (type === 'gasto') setEditingGasto(null);
    if (type === 'receita') setEditingReceita(null);
  };

  // Handlers
  const handleGastoSubmit = async (gastoData) => {
    if (editingGasto) {
      await updateGasto(editingGasto.id, gastoData);
    } else {
      await addGasto(gastoData);
    }
  };

  const handleReceitaSubmit = async (receitaData) => {
    if (editingReceita) {
      await updateReceita(editingReceita.id, receitaData);
    } else {
      await addReceita(receitaData);
    }
  };

  const handleDeleteGasto = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este gasto?')) {
      await deleteGasto(id);
    }
  };

  const handleDeleteReceita = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      await deleteReceita(id);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      // Implementar limpeza de dados se necessário
      console.log('Limpar dados');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados financeiros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Erro ao carregar dados</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={refreshData}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <Header />
        
        <ActionButtons
          onNewGasto={() => openModal('gasto')}
          onNewReceita={() => openModal('receita')}
          onUpdateCaixa={() => openModal('caixa')}
          onClearData={handleClearData}
        />

        <MetricsGrid metrics={metrics} />

        <PlanningGrid planning={planning} />

        <FilterSection
          filters={filters}
          onFilterChange={updateFilter}
          onQuickFilter={applyQuickFilter}
          onClearFilters={clearFilters}
          categories={categories}
        />

        <GastosTable
          gastos={gastos}
          onEdit={(gasto) => openModal('gasto', gasto)}
          onDelete={handleDeleteGasto}
          onMarkAsPaid={markGastoAsPaid}
          subtotal={gastosSubtotal}
        />

        <ReceitasTable
          receitas={receitas}
          onEdit={(receita) => openModal('receita', receita)}
          onDelete={handleDeleteReceita}
          subtotal={receitasSubtotal}
        />

        {/* Modais */}
        <GastoModal
          isOpen={modals.gasto}
          onClose={() => closeModal('gasto')}
          onSubmit={handleGastoSubmit}
          editingGasto={editingGasto}
        />

        <ReceitaModal
          isOpen={modals.receita}
          onClose={() => closeModal('receita')}
          onSubmit={handleReceitaSubmit}
          editingReceita={editingReceita}
        />

        <CaixaModal
          isOpen={modals.caixa}
          onClose={() => closeModal('caixa')}
          onSubmit={updateCaixa}
          currentValue={metrics.caixa || 0}
        />
      </div>
    </div>
  );
};

export default Dashboard;

