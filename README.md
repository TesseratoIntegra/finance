# 💰 Gestor Financeiro Pessoal - Full Stack

Sistema completo de gestão financeira pessoal desenvolvido com **React** (frontend) e **Django** (backend).

## 🚀 Funcionalidades

### 📊 **Dashboard Completo**
- Cards de métricas financeiras em tempo real
- Planejamento dos próximos 3 meses
- Gráficos e visualizações interativas

### 💸 **Gestão de Gastos**
- Cadastro de gastos fixos, variáveis e parcelados
- Controle de parcelas e vencimentos
- Sistema de baixa de pagamentos
- Filtros avançados por categoria, tipo e status

### 💰 **Gestão de Receitas**
- Cadastro de receitas por responsável
- Suporte a receitas parceladas
- Cálculo automático de receitas mensais

### 🎯 **Recursos Avançados**
- Persistência de dados com Django ORM
- API REST completa
- Interface responsiva (desktop/mobile)
- Filtros em tempo real
- Subtotais automáticos

## 🛠️ Tecnologias

### Frontend
- **React 19** com Hooks
- **SCSS** para estilização modular
- **Axios** para comunicação com API
- **Lucide React** para ícones
- **Vite** como bundler

### Backend
- **Django 4.2** com Django REST Framework
- **SQLite** como banco de dados
- **CORS** habilitado para integração
- **Admin interface** para gerenciamento

## 📁 Estrutura do Projeto

```
gestor-financeiro-fullstack/
├── backend/                    # Django Backend
│   ├── gestor_financeiro/
│   │   ├── settings/          # Configurações
│   │   ├── apps/              # Aplicações Django
│   │   │   ├── gastos/        # App de gastos
│   │   │   ├── receitas/      # App de receitas
│   │   │   └── dashboard/     # App de dashboard
│   │   └── urls.py
│   ├── requirements.txt
│   └── manage.py
├── frontend/                   # React Frontend
│   └── gestor-financeiro-frontend/
│       ├── src/
│       │   ├── components/    # Componentes React
│       │   │   ├── Header/
│       │   │   ├── Metrics/
│       │   │   ├── Planning/
│       │   │   ├── Filters/
│       │   │   ├── Tables/
│       │   │   ├── Modals/
│       │   │   └── Dashboard/
│       │   ├── hooks/         # Custom hooks
│       │   ├── services/      # API services
│       │   ├── utils/         # Utilitários
│       │   └── styles/        # Estilos SCSS
│       ├── package.json
│       └── vite.config.js
└── README.md
```

## 🚀 Como Executar

### 1. **Backend (Django)**

```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py makemigrations
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser

# Executar servidor
python manage.py runserver
```

O backend estará disponível em: `http://localhost:8000`

### 2. **Frontend (React)**

```bash
cd frontend/gestor-financeiro-frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## 🔧 Configuração

### Backend
1. Copie `.env.example` para `.env`
2. Configure as variáveis de ambiente conforme necessário

### Frontend
1. Copie `.env.example` para `.env`
2. Configure a URL da API (padrão: `http://localhost:8000/api`)

## 📱 Uso da Aplicação

### 1. **Métricas Principais**
- **Valor em Caixa**: Saldo atual disponível
- **Gastos Fixos**: Comprometimento mensal
- **Endividamento**: Total de parcelas pendentes
- **Receitas do Mês**: Entrada mensal

### 2. **Cadastro de Gastos**
- Clique em "Novo Gasto"
- Preencha descrição, categoria, valor e tipo
- Para gastos parcelados, informe o número de parcelas

### 3. **Cadastro de Receitas**
- Clique em "Nova Receita"
- Selecione tipo e responsável
- Para receitas parceladas, informe as parcelas

### 4. **Controle de Pagamentos**
- Use o botão "💰" para dar baixa em gastos
- Acompanhe o status na coluna "Status"

### 5. **Filtros e Busca**
- Use a barra de busca para encontrar itens
- Aplique filtros por categoria, tipo e status
- Use filtros rápidos (Pendentes, Pagos, etc.)

## 🎨 Componentes React

### Estrutura Modular
Cada componente possui seu próprio arquivo SCSS:

- `Header/` - Cabeçalho da aplicação
- `Metrics/` - Cards de métricas
- `Planning/` - Planejamento mensal
- `Filters/` - Seção de filtros
- `Tables/` - Tabelas de gastos e receitas
- `Modals/` - Modais de cadastro/edição
- `Dashboard/` - Componente principal

### Custom Hooks
- `useFinancialData` - Gerencia estado e API calls

## 🔌 API Endpoints

### Gastos
- `GET /api/gastos/` - Listar gastos
- `POST /api/gastos/` - Criar gasto
- `PUT /api/gastos/{id}/` - Atualizar gasto
- `DELETE /api/gastos/{id}/` - Excluir gasto
- `PATCH /api/gastos/{id}/mark-paid/` - Marcar como pago

### Receitas
- `GET /api/receitas/` - Listar receitas
- `POST /api/receitas/` - Criar receita
- `PUT /api/receitas/{id}/` - Atualizar receita
- `DELETE /api/receitas/{id}/` - Excluir receita

### Dashboard
- `GET /api/dashboard/metrics/` - Métricas principais
- `GET /api/dashboard/planning/` - Planejamento 3 meses
- `POST /api/dashboard/caixa/` - Atualizar valor em caixa

## 🎯 Recursos Implementados

✅ **Frontend React Componentizado**
✅ **SCSS Individual por Componente**
✅ **API Django REST Completa**
✅ **Persistência de Dados**
✅ **Interface Responsiva**
✅ **Filtros em Tempo Real**
✅ **Subtotais Automáticos**
✅ **Gestão de Estado com Hooks**
✅ **Integração Frontend-Backend**

## 📄 Licença

Este projeto é de uso pessoal e educacional.

---

**Desenvolvido com ❤️ usando React + Django**

