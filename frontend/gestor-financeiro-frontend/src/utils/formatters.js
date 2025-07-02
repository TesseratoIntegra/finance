export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
};

export const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const calculateNextDueDate = (startDate, currentInstallment) => {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + currentInstallment);
  return date.toLocaleDateString('pt-BR');
};

