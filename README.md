# Sistema de Gestão de Rotas Escolares (GRTE)

Sistema completo para gerenciamento de rotas escolares, incluindo API REST, banco de dados MongoDB e interface web.

## 📋 Pré-requisitos

- [Docker](https://www.docker.com/get-started) (versão 20.10 ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.0 ou superior)
- Portas disponíveis: `3000` (frontend), `3456` (API), `27017` (MongoDB)

## 🚀 Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/lybiomoraesjr/projeto_bratopi.git
cd projeto_bratopi
```

### 2. Inicie os serviços com Docker Compose

```bash
docker-compose up -d
```

Este comando irá:
- Baixar as imagens necessárias (MongoDB, Node.js)
- Construir as imagens da API e do Frontend
- Iniciar todos os serviços em background

### 3. Aguarde a inicialização

Aguarde alguns segundos para que todos os serviços iniciem completamente. Você pode acompanhar os logs:

```bash
docker-compose logs -f
```

Pressione `Ctrl+C` para sair da visualização de logs (os serviços continuarão rodando).

### 4. ⚠️ IMPORTANTE: Popular o Banco de Dados (Seeds)

**ANTES de usar a aplicação**, você precisa rodar os seeds para criar dados iniciais:

```bash
# Rodar todos os seeds de uma vez (recomendado)
docker-compose exec api npm run seed:all
```

Ou rodar individualmente:

```bash
# 1. Criar usuário administrador (OBRIGATÓRIO)
docker-compose exec api npm run seed:users

# 2. Criar paradas e rotas de exemplo (opcional)
docker-compose exec api npm run seed:paradas

# 3. Criar alunos de exemplo (opcional)
docker-compose exec api npm run seed:alunos
```

**O que cada seed cria:**
- `seed:users` → Usuário administrador para login
- `seed:paradas` → 4 paradas de exemplo + 2 rotas
- `seed:alunos` → 3 alunos de exemplo

### 5. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3456
- **MongoDB**: `mongodb://localhost:27017`

## 🔐 Credenciais de Teste

Use as seguintes credenciais para fazer login:

- **Email**: `admin@example.com`
- **Senha**: `345678`

## 📡 API Endpoints

### Autenticação (Público)

- `POST /api/auth/login` - Fazer login
  ```json
  {
    "email": "admin@example.com",
    "password": "345678"
  }
  ```
- `POST /api/auth/logout` - Fazer logout

### Usuários (Público)

- `GET /api/users` - Listar todos os usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Remover usuário

### Rotas (Protegido - Requer autenticação)

- `GET /api/rotas` - Listar todas as rotas
- `GET /api/rotas/:id` - Buscar rota por ID
- `POST /api/rotas` - Criar nova rota
  ```json
  {
    "name": "Rota Centro",
    "paradas": [],
    "dataHoraInicio": "2025-11-05T07:00:00Z",
    "dataHoraFim": "2025-11-05T08:30:00Z",
    "frequenciaDias": ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
  }
  ```
- `PUT /api/rotas/:id` - Atualizar rota
- `DELETE /api/rotas/:id` - Remover rota

### Paradas (Protegido - Requer autenticação)

- `GET /api/paradas` - Listar todas as paradas
- `GET /api/paradas/:id` - Buscar parada por ID
- `POST /api/paradas` - Criar nova parada
  ```json
  {
    "name": "Parada Central",
    "address": "Rua das Flores, 123",
    "lat": -23.5505,
    "lng": -46.6333
  }
  ```
- `PUT /api/paradas/:id` - Atualizar parada
- `DELETE /api/paradas/:id` - Remover parada

### Alunos (Protegido - Requer autenticação)

- `GET /api/alunos` - Listar todos os alunos
- `GET /api/alunos/:id` - Buscar aluno por ID
- `POST /api/alunos` - Criar novo aluno
  ```json
  {
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "12345678901",
    "matricula": "MTR001",
    "turno": "Matutino",
    "escola": "Escola Municipal A",
    "endereco": "Rua A, 100",
    "telefone": "11999990001"
  }
  ```
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Remover aluno

### Autenticação

Os endpoints protegidos requerem autenticação via:
- **Cookie HttpOnly** (automático após login no frontend)
- **Header Authorization**: `Bearer <token>`

## 🛠️ Comandos Úteis

### Ver logs dos serviços

```bash
# Todos os serviços
docker-compose logs -f

# Apenas a API
docker-compose logs -f api

# Apenas o Frontend
docker-compose logs -f frontend

# Apenas o MongoDB
docker-compose logs -f mongo
```

### Reiniciar serviços rapidamente

```bash
# Reiniciar somente a API
docker-compose restart api

# Reiniciar somente o frontend
docker-compose restart frontend

# Reiniciar todos os serviços de uma vez
docker-compose restart
```

### Parar os serviços

```bash
docker-compose down
```

### Parar e remover volumes (apaga dados do banco)

```bash
docker-compose down -v
```

### Reconstruir as imagens

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Executar comandos dentro de um container

```bash
# Acessar o shell da API
docker-compose exec api sh

# Acessar o MongoDB
docker-compose exec mongo mongosh
```

### Popular o banco de dados com dados de teste

```bash
# Acessar o container da API
docker-compose exec api sh

# Executar os scripts de seed
npm run seed:users
npm run seed:paradas
npm run seed:alunos
```

## 🏗️ Estrutura do Projeto

```
.
├── API/                    # Backend (Node.js + Express)
│   ├── controllers/        # Lógica de negócio
│   ├── models/            # Modelos do MongoDB
│   ├── routes/            # Definição de rotas
│   ├── services/          # Serviços (auth, db)
│   └── scripts/           # Scripts de seed
├── FRONT/                 # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── api/          # Cliente HTTP
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── contexts/     # Context API (Auth)
│   │   └── types/        # Tipagens TypeScript
└── docker-compose.yml     # Configuração Docker Compose
```

## 🔧 Desenvolvimento

### Modo de desenvolvimento

O `docker-compose.yml` já está configurado para desenvolvimento:

- **API**: Hot reload com `nodemon` (mudanças refletidas automaticamente)
- **Frontend**: Hot reload com Vite HMR (mudanças refletidas automaticamente)
- Volumes montados para refletir mudanças no código

### Variáveis de ambiente

#### API (`API/.env`)
```
MONGODB_URI=mongodb://mongo:27017/api_grte
PORT=3456
NODE_ENV=development
```

#### Frontend (`FRONT/.env`)
```
VITE_API_BASE_URL=http://localhost:3456
```

## 🧪 Testando a API

### Usando cURL

```bash
# Login
curl -i -X POST http://localhost:3456/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"345678"}' \
  -c cookies.txt

# Listar rotas (usando cookie)
curl http://localhost:3456/api/rotas -b cookies.txt

# Criar uma parada (usando cookie)
curl -X POST http://localhost:3456/api/paradas \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Parada Teste",
    "address": "Rua Teste, 456",
    "lat": -23.5505,
    "lng": -46.6333
  }'
```

### Usando Postman ou Insomnia

1. Faça login em `POST http://localhost:3456/api/auth/login`
2. O token será salvo automaticamente nos cookies
3. Use os demais endpoints normalmente

## 📝 Health Check

Verifique se a API está rodando:

```bash
curl http://localhost:3456/health
```

Resposta esperada:
```json
{"status":"ok"}
```

## 🐛 Troubleshooting

### Erro: "Port already in use"

Se alguma porta já estiver em uso, você pode:

1. Parar o processo que está usando a porta
2. Ou modificar as portas no `docker-compose.yml`

### Erro ao conectar no MongoDB

Certifique-se de que o container do MongoDB iniciou corretamente:

```bash
docker-compose ps
docker-compose logs mongo
```

### Reconstruir do zero

Se houver problemas, tente reconstruir tudo:

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais no IFSP.

## 👥 Autores

- **Lybio Moraes Jr** - [GitHub](https://github.com/lybiomoraesjr)

---

Para mais informações sobre a API, consulte a [documentação completa](./API/README.md).
