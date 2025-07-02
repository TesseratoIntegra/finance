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

  // Função para ordenar por data de vencimento
  const sortByDueDate = (items) => {
    return items.sort((a, b) => {
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      
      // Para gastos, considerar status
      if (a.status && b.status) {
        // Vencidos primeiro
        if (a.status === 'Vencido' && b.status !== 'Vencido') return -1;
        if (b.status === 'Vencido' && a.status !== 'Vencido') return 1;
        
        // Pendentes antes de pagos
        if (a.status === 'Pendente' && b.status === 'Pago') return -1;
        if (b.status === 'Pendente' && a.status === 'Pago') return 1;
      }
      
      // Dentro do mesmo status, ordenar por data crescente (mais próximo primeiro)
      return dateA - dateB;
    });
  };

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

      // Extrair dados do formato paginado do Django REST Framework
      let gastosArray = [];
      let receitasArray = [];

      // Para gastos - verificar se tem formato paginado
      if (gastosRes.data && gastosRes.data.results && Array.isArray(gastosRes.data.results)) {
        gastosArray = gastosRes.data.results;
      } else if (Array.isArray(gastosRes.data)) {
        gastosArray = gastosRes.data;
      } else {
        gastosArray = [];
      }

      // Para receitas - verificar se tem formato paginado
      if (receitasRes.data && receitasRes.data.results && Array.isArray(receitasRes.data.results)) {
        receitasArray = receitasRes.data.results;
      } else if (Array.isArray(receitasRes.data)) {
        receitasArray = receitasRes.data;
      } else {
        receitasArray = [];
      }

      // Aplicar ordenação por data de vencimento
      gastosArray = sortByDueDate(gastosArray);
      receitasArray = sortByDueDate(receitasArray);

      setData(prev => ({
        ...prev,
        gastos: gastosArray,
        receitas: receitasArray,
        metrics: metricsRes.data || {},
        planning: Array.isArray(planningRes.data) ? planningRes.data : [],
        loading: false
      }));

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setData(prev => ({
        ...prev,
        gastos: [],
        receitas: [],
        metrics: {},
        planning: [],
        error: 'Erro ao carregar dados financeiros',
        loading: false
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar gastos
  const filteredGastos = (Array.isArray(data.gastos) ? data.gastos : []).filter(gasto => {
    const matchTexto = !filters.texto || 
      gasto.descricao?.toLowerCase().includes(filters.texto.toLowerCase());
    const matchCategoria = !filters.categoria || gasto.categoria === filters.categoria;
    const matchTipo = !filters.tipo || gasto.tipo === filters.tipo;
    const matchStatus = !filters.status || gasto.status === filters.status;
    
    return matchTexto && matchCategoria && matchTipo && matchStatus;
  });

  // Aplicar ordenação aos gastos filtrados também
  const sortedFilteredGastos = sortByDueDate([...filteredGastos]);

  // Calcular subtotais dos gastos filtrados
  const gastosSubtotal = {
    count: sortedFilteredGastos.length,
    total: sortedFilteredGastos.reduce((sum, g) => sum + parseFloat(g.valor || 0), 0),
    pendente: sortedFilteredGastos.filter(g => g.status === 'Pendente')
      .reduce((sum, g) => sum + parseFloat(g.valor || 0), 0),
    pago: sortedFilteredGastos.filter(g => g.status === 'Pago')
      .reduce((sum, g) => sum + parseFloat(g.valor || 0), 0)
  };

  // Calcular subtotal das receitas (mensal)
  const receitasSubtotal = {
    count: Array.isArray(data.receitas) ? data.receitas.length : 0,
    totalMensal: (Array.isArray(data.receitas) ? data.receitas : []).reduce((sum, r) => {
      if (r.tipo === 'Parcelado') {
        return sum + parseFloat(r.valor || 0);
      } else {
        const hoje = new Date();
        const dataReceita = new Date(r.data);
        if (dataReceita.getMonth() === hoje.getMonth() && 
            dataReceita.getFullYear() === hoje.getFullYear()) {
          return sum + parseFloat(r.valor || 0);
        }
      }
      return sum;
    }, 0)
  };

  // Obter categorias únicas
  const categories = [...new Set((Array.isArray(data.gastos) ? data.gastos : []).map(g => g.categoria).filter(Boolean))];

  // Funções CRUD
  const addGasto = async (gastoData) => {
    try {
      await gastosAPI.create(gastoData);
      await loadData();
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
    gastos: sortedFilteredGastos,
    receitas: Array.isArray(data.receitas) ? sortByDueDate([...data.receitas]) : [],
    metrics: data.metrics || {},
    planning: Array.isArray(data.planning) ? data.planning : [],
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