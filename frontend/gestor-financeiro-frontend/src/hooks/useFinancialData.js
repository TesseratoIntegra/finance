import { useState, useEffect, useCallback } from 'react';
import { gastosAPI, receitasAPI, dashboardAPI } from '../services/api';

export const useFinancialData = () => {
  const [data, setData] = useState({
    gastos: [],
    receitas: [],
    metrics: {},
    planning: [],
    loading: true,
    error: null
  });

  const [filters, setFilters] = useState({
    texto: '',
    categoria: '',
    tipo: '',
    status: ''
  });

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const [gastosRes, receitasRes, metricsRes, planningRes] = await Promise.all([
        gastosAPI.getAll(),
        receitasAPI.getAll(),
        dashboardAPI.getMetrics(),
        dashboardAPI.getPlanning()
      ]);

      setData(prev => ({
        ...prev,
        gastos: gastosRes.data,
        receitas: receitasRes.data,
        metrics: metricsRes.data,
        planning: planningRes.data,
        loading: false
      }));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setData(prev => ({
        ...prev,
        error: 'Erro ao carregar dados financeiros',
        loading: false
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar gastos
  const filteredGastos = data.gastos.filter(gasto => {
    const matchTexto = !filters.texto || 
      gasto.descricao.toLowerCase().includes(filters.texto.toLowerCase());
    const matchCategoria = !filters.categoria || gasto.categoria === filters.categoria;
    const matchTipo = !filters.tipo || gasto.tipo === filters.tipo;
    const matchStatus = !filters.status || gasto.status === filters.status;
    
    return matchTexto && matchCategoria && matchTipo && matchStatus;
  });

  // Calcular subtotais dos gastos filtrados
  const gastosSubtotal = {
    count: filteredGastos.length,
    total: filteredGastos.reduce((sum, g) => sum + parseFloat(g.valor), 0),
    pendente: filteredGastos.filter(g => g.status === 'Pendente')
      .reduce((sum, g) => sum + parseFloat(g.valor), 0),
    pago: filteredGastos.filter(g => g.status === 'Pago')
      .reduce((sum, g) => sum + parseFloat(g.valor), 0)
  };

  // Calcular subtotal das receitas (mensal)
  const receitasSubtotal = {
    count: data.receitas.length,
    totalMensal: data.receitas.reduce((sum, r) => {
      if (r.tipo === 'Parcelado') {
        return sum + parseFloat(r.valor);
      } else {
        const hoje = new Date();
        const dataReceita = new Date(r.data);
        if (dataReceita.getMonth() === hoje.getMonth() && 
            dataReceita.getFullYear() === hoje.getFullYear()) {
          return sum + parseFloat(r.valor);
        }
      }
      return sum;
    }, 0)
  };

  // Obter categorias únicas
  const categories = [...new Set(data.gastos.map(g => g.categoria))];

  // Funções CRUD
  const addGasto = async (gastoData) => {
    try {
      await gastosAPI.create(gastoData);
      await loadData(); // Recarregar dados
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      return { success: false, error: error.message };
    }
  };

  const updateGasto = async (id, gastoData) => {
    try {
      await gastosAPI.update(id, gastoData);
      await loadData();
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar gasto:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteGasto = async (id) => {
    try {
      await gastosAPI.delete(id);
      await loadData();
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
      return { success: false, error: error.message };
    }
  };

  const markGastoAsPaid = async (id) => {
    try {
      await gastosAPI.markAsPaid(id);
      await loadData();
      return { success: true };
    } catch (error) {
      console.error('Erro ao marcar gasto como pago:', error);
      return { success: false, error: error.message };
    }
  };

  const addReceita = async (receitaData) => {
    try {
      await receitasAPI.create(receitaData);
      await loadData();
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      return { success: false, error: error.message };
    }
  };

  const updateReceita = async (id, receitaData) => {
    try {
      await receitasAPI.update(id, receitaData);
      await loadData();
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteReceita = async (id) => {
    try {
      await receitasAPI.delete(id);
      await loadData();
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCaixa = async (valor) => {
    try {
      await dashboardAPI.updateCaixa(valor);
      await loadData();
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar caixa:', error);
      return { success: false, error: error.message };
    }
  };

  // Filtros
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      texto: '',
      categoria: '',
      tipo: '',
      status: ''
    });
  };

  const applyQuickFilter = (type) => {
    clearFilters();
    switch (type) {
      case 'pendentes':
        setFilters(prev => ({ ...prev, status: 'Pendente' }));
        break;
      case 'pagos':
        setFilters(prev => ({ ...prev, status: 'Pago' }));
        break;
      case 'vencendo':
        // Implementar lógica de vencimento se necessário
        break;
      default:
        break;
    }
  };

  return {
    // Dados
    gastos: filteredGastos,
    receitas: data.receitas,
    metrics: data.metrics,
    planning: data.planning,
    loading: data.loading,
    error: data.error,
    
    // Subtotais
    gastosSubtotal,
    receitasSubtotal,
    
    // Filtros
    filters,
    categories,
    updateFilter,
    clearFilters,
    applyQuickFilter,
    
    // Ações
    addGasto,
    updateGasto,
    deleteGasto,
    markGastoAsPaid,
    addReceita,
    updateReceita,
    deleteReceita,
    updateCaixa,
    refreshData: loadData
  };
};

