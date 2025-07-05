import { useState, useEffect, useCallback } from 'react';
import { gastosAPI, receitasAPI, dashboardAPI } from '../services/api';

const useFinancialData = () => {
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
    status: '',
    mes: null,     // NOVO: Filtro por mês
    ano: null      // NOVO: Filtro por ano
  });

  // Função para ordenar por data de vencimento
  const sortByDueDate = (items) => {
    return items.sort((a, b) => {
      // Se um é pendente e outro é pago, pendente vem primeiro
      if (a.status === 'Pendente' && b.status === 'Pago') return -1;
      if (a.status === 'Pago' && b.status === 'Pendente') return 1;
      
      // Se ambos têm o mesmo status, ordenar por data
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      
      // Para pendentes: mais antigos primeiro (vencimento próximo)
      if (a.status === 'Pendente' && b.status === 'Pendente') {
        return dateA - dateB;
      }
      
      // Para pagos: mais recentes primeiro
      return dateB - dateA;
    });
  };

  const loadData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fazer todas as chamadas em paralelo
      const [gastosRes, receitasRes, metricsRes, planningRes] = await Promise.all([
        gastosAPI.getAll(),
        receitasAPI.getAll(),
        dashboardAPI.getMetrics(),
        dashboardAPI.getPlanning()
      ]);

      // Processar dados de gastos
      let gastosArray = [];
      if (gastosRes.data && gastosRes.data.results && Array.isArray(gastosRes.data.results)) {
        gastosArray = gastosRes.data.results;
      } else if (Array.isArray(gastosRes.data)) {
        gastosArray = gastosRes.data;
      } else {
        gastosArray = [];
      }

      // Processar dados de receitas
      let receitasArray = [];
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

      console.log('=== DADOS PUROS DA API METRICS ===');
      console.log('metricsRes.data:', metricsRes.data);
      console.log('=================================');

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

  // NOVO: Função para buscar gastos com filtros de API
  const loadGastosWithFilters = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.texto) params.append('search', filters.texto);
      if (filters.mes) params.append('mes', filters.mes);
      if (filters.ano) params.append('ano', filters.ano);

      const url = `/gastos/?${params.toString()}`;
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${url}`);
      const data = await response.json();
      
      let gastosArray = [];
      if (data && data.results && Array.isArray(data.results)) {
        gastosArray = data.results;
      } else if (Array.isArray(data)) {
        gastosArray = data;
      }

      setData(prev => ({
        ...prev,
        gastos: sortByDueDate(gastosArray)
      }));

    } catch (error) {
      console.error('Erro ao carregar gastos filtrados:', error);
    }
  }, [filters]);

  // Recarregar gastos quando filtros mudarem
  useEffect(() => {
    if (filters.mes !== null || filters.ano !== null || filters.categoria || filters.tipo || filters.status || filters.texto) {
      loadGastosWithFilters();
    } else {
      loadData(); // Recarregar todos os dados se não há filtros
    }
  }, [filters, loadGastosWithFilters, loadData]);

  // Filtrar gastos localmente (para casos onde a API não filtrou)
  const filteredGastos = (Array.isArray(data.gastos) ? data.gastos : []).filter(gasto => {
    const matchTexto = !filters.texto || 
      gasto.descricao?.toLowerCase().includes(filters.texto.toLowerCase());
    const matchCategoria = !filters.categoria || gasto.categoria === filters.categoria;
    const matchTipo = !filters.tipo || gasto.tipo === filters.tipo;
    const matchStatus = !filters.status || gasto.status === filters.status;
    
    // Filtro por mês e ano (backup caso a API não tenha filtrado)
    let matchData = true;
    if (filters.mes || filters.ano) {
      const gastoDate = new Date(gasto.data);
      if (filters.mes && gastoDate.getMonth() + 1 !== filters.mes) matchData = false;
      if (filters.ano && gastoDate.getFullYear() !== filters.ano) matchData = false;
    }
    
    return matchTexto && matchCategoria && matchTipo && matchStatus && matchData;
  });

  // Aplicar ordenação aos gastos filtrados
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

  // Calcular subtotal das receitas
  const receitasSubtotal = {
    count: Array.isArray(data.receitas) ? data.receitas.length : 0,
    totalMensal: (Array.isArray(data.receitas) ? data.receitas : [])
      .reduce((sum, r) => sum + parseFloat(r.valor_mensal || r.valor || 0), 0)
  };

  return {
    data: {
      ...data,
      gastos: sortedFilteredGastos,
      gastosSubtotal,
      receitasSubtotal
    },
    filters,
    setFilters,
    loadData,
    markGastoAsPaid: async (id) => {
      try {
        await gastosAPI.markAsPaid(id);
        await loadData(); // Recarregar dados após marcar como pago
      } catch (error) {
        console.error('Erro ao marcar gasto como pago:', error);
        throw error;
      }
    }
  };
};

export default useFinancialData;