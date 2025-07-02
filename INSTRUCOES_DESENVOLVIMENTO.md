# 🚀 Instruções para Desenvolvimento no VS Code

## 📋 Pré-requisitos

### Software Necessário
- **Python 3.8+** (para Django backend)
- **Node.js 16+** (para React frontend)
- **VS Code** com extensões recomendadas:
  - Python
  - ES7+ React/Redux/React-Native snippets
  - SCSS IntelliSense
  - Django
  - Prettier
  - ESLint

## 🛠️ Configuração Inicial

### 1. Extrair o Projeto
```bash
# Extrair o arquivo ZIP
unzip gestor-financeiro-fullstack.zip
cd gestor-financeiro-fullstack
```

### 2. Abrir no VS Code
```bash
# Abrir o projeto no VS Code
code .
```

## 🐍 Configuração do Backend (Django)

### 1. Criar Ambiente Virtual
```bash
cd backend
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 2. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 3. Configurar Banco de Dados
```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser
```

### 4. Executar Servidor Django
```bash
python manage.py runserver
```

**Backend disponível em:** `http://localhost:8000`
**Admin Django:** `http://localhost:8000/admin`

## ⚛️ Configuração do Frontend (React)

### 1. Instalar Dependências
```bash
cd frontend/gestor-financeiro-frontend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env se necessário
# REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Executar Servidor React
```bash
npm run dev
```

**Frontend disponível em:** `http://localhost:3000`

## 🔧 Desenvolvimento

### Estrutura de Pastas para Desenvolvimento

```
gestor-financeiro-fullstack/
├── backend/                           # 🐍 Django Backend
│   ├── gestor_financeiro/
│   │   ├── settings/                  # ⚙️ Configurações Django
│   │   │   ├── base.py               # Configurações base
│   │   │   └── development.py        # Configurações de desenvolvimento
│   │   ├── apps/                     # 📱 Apps Django
│   │   │   ├── gastos/               # App de gastos
│   │   │   │   ├── models.py         # Modelos de dados
│   │   │   │   ├── serializers.py    # Serializers da API
│   │   │   │   ├── views.py          # Views da API
│   │   │   │   └── urls.py           # URLs do app
│   │   │   ├── receitas/             # App de receitas
│   │   │   └── dashboard/            # App de dashboard
│   │   └── urls.py                   # URLs principais
│   ├── requirements.txt              # Dependências Python
│   └── manage.py                     # Comando Django
├── frontend/                         # ⚛️ React Frontend
│   └── gestor-financeiro-frontend/
│       ├── src/
│       │   ├── components/           # 🧩 Componentes React
│       │   │   ├── Header/           # Cabeçalho
│       │   │   │   ├── Header.jsx
│       │   │   │   ├── Header.scss   # Estilos específicos
│       │   │   │   └── index.js
│       │   │   ├── Metrics/          # Cards de métricas
│       │   │   ├── Planning/         # Planejamento
│       │   │   ├── Filters/          # Filtros
│       │   │   ├── Tables/           # Tabelas
│       │   │   ├── Modals/           # Modais
│       │   │   └── Dashboard/        # Dashboard principal
│       │   ├── hooks/                # 🎣 Custom Hooks
│       │   │   └── useFinancialData.js
│       │   ├── services/             # 🌐 Serviços API
│       │   │   └── api.js
│       │   ├── utils/                # 🛠️ Utilitários
│       │   │   └── formatters.js
│       │   └── styles/               # 🎨 Estilos Globais
│       │       └── globals.scss
│       ├── package.json              # Dependências Node.js
│       └── vite.config.js            # Configuração Vite
└── README.md                         # Documentação
```

### 🎯 Fluxo de Desenvolvimento

#### 1. **Modificar Backend (Django)**
- Editar modelos em `backend/gestor_financeiro/apps/*/models.py`
- Criar migrações: `python manage.py makemigrations`
- Aplicar migrações: `python manage.py migrate`
- Testar API em: `http://localhost:8000/api/`

#### 2. **Modificar Frontend (React)**
- Componentes em `frontend/src/components/`
- Cada componente tem seu próprio arquivo SCSS
- Hooks customizados em `frontend/src/hooks/`
- Serviços API em `frontend/src/services/`

#### 3. **Adicionar Novos Componentes**
```bash
# Estrutura recomendada para novo componente
mkdir src/components/NovoComponente
touch src/components/NovoComponente/NovoComponente.jsx
touch src/components/NovoComponente/NovoComponente.scss
touch src/components/NovoComponente/index.js
```

## 🧪 Testes e Debug

### Backend (Django)
```bash
# Executar shell Django
python manage.py shell

# Verificar URLs
python manage.py show_urls

# Executar testes
python manage.py test
```

### Frontend (React)
```bash
# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificar lint
npm run lint
```

## 📡 Endpoints da API

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

## 🎨 Personalização de Estilos

### Variáveis SCSS Globais
Edite `frontend/src/styles/globals.scss`:

```scss
:root {
  --primary-color: #667eea;        // Cor primária
  --secondary-color: #764ba2;      // Cor secundária
  --success-color: #28a745;        // Cor de sucesso
  --warning-color: #ffc107;        // Cor de aviso
  --danger-color: #dc3545;         // Cor de perigo
  --border-radius: 12px;           // Raio das bordas
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // Sombra
}
```

### Componentes Individuais
Cada componente tem seu próprio arquivo SCSS:
- `Header.scss` - Estilos do cabeçalho
- `MetricCard.scss` - Estilos dos cards de métricas
- `GastosTable.scss` - Estilos da tabela de gastos
- etc.

## 🚀 Deploy e Produção

### Backend
```bash
# Configurar para produção
pip install gunicorn
gunicorn gestor_financeiro.wsgi:application
```

### Frontend
```bash
# Build para produção
npm run build
# Arquivos gerados em dist/
```

## 🔧 Extensões VS Code Recomendadas

### Python/Django
- Python
- Django
- Python Docstring Generator

### React/JavaScript
- ES7+ React/Redux/React-Native snippets
- Bracket Pair Colorizer
- Auto Rename Tag
- JavaScript (ES6) code snippets

### CSS/SCSS
- SCSS IntelliSense
- CSS Peek
- Color Highlight

### Geral
- Prettier - Code formatter
- ESLint
- GitLens
- Thunder Client (para testar APIs)

## 📝 Comandos Úteis

### Django
```bash
# Criar nova app
python manage.py startapp nome_app

# Criar superusuário
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic

# Shell interativo
python manage.py shell
```

### React
```bash
# Instalar nova dependência
npm install nome-pacote

# Remover dependência
npm uninstall nome-pacote

# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências
npm update
```

## 🐛 Solução de Problemas

### Erro de CORS
- Verificar configuração em `backend/gestor_financeiro/settings/base.py`
- Confirmar que `corsheaders` está instalado

### Erro de Conexão API
- Verificar se backend está rodando na porta 8000
- Confirmar URL da API em `.env` do frontend

### Erro de Dependências
- Deletar `node_modules` e executar `npm install`
- Para Python: recriar ambiente virtual

---

**🎉 Pronto para desenvolver! Qualquer dúvida, consulte a documentação ou os comentários no código.**

