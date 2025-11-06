# API_GRTE — backend simples em Express

Este repositório contém um backend básico em Node.js + Express com recursos para gestão de rotas escolares (`users`, `rotas`, `paradas`) e persistência em MongoDB via Mongoose.

Endpoints:

- GET /health — verifica se a API está viva
- GET /api/users — lista usuários
- GET /api/users/:id — obtém usuário por id
- POST /api/users — cria usuário (body: { name, email })
- PUT /api/users/:id — atualiza usuário (partial allowed)
- DELETE /api/users/:id — remove usuário

Adicionadas também rotas protegidas para autenticação, rotas escolares e paradas:

- POST /auth/login — faz login com credenciais hardcoded (body: { email, password })
- POST /auth/logout — invalida token (envia Authorization: Bearer <token>)
- GET /api/paradas — lista paradas (protegido)
- GET /api/paradas/:id — obtém parada por id (protegido)
- POST /api/paradas — cria parada (body: { name, lat, lng }) (protegido)
- PUT /api/paradas/:id — atualiza parada (protegido)
- DELETE /api/paradas/:id — remove parada (protegido)

- GET /api/rotas — lista rotas (protegido)
- GET /api/rotas/:id — obtém rota por id (retorna paradas populadas) (protegido)
- POST /api/rotas — cria rota (body: { name, paradas: [paradaId] }) (protegido)
- PUT /api/rotas/:id — atualiza rota (protegido)
- DELETE /api/rotas/:id — remove rota (protegido)

Como rodar

1. Instale dependências:

```bash
npm install
```

2. Rodar em desenvolvimento (com nodemon):

```bash
npm run dev
```

3. Exemplos (curl):

Criar:

```bash
# exemplo: login (credenciais: admin@example.com / 345678)
curl -X POST http://localhost:3456/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"345678"}'

# use o token retornado nas próximas chamadas com header: Authorization: Bearer <token>

# criar parada
curl -X POST http://localhost:3456/api/paradas -H 'Content-Type: application/json' -H 'Authorization: Bearer <token>' -d '{"name":"Parada A","lat":-23.5,"lng":-46.6}'

# criar rota associando paradas (substitua ids)
curl -X POST http://localhost:3456/api/rotas -H 'Content-Type: application/json' -H 'Authorization: Bearer <token>' -d '{"name":"Rota 1","paradas":["parada-id-1","parada-id-2"]}'
```

Listar:

```bash
curl http://localhost:3000/api/users
```

Notas

- A persistência é feita por arquivo JSON para simplicidade. Para produção, substitua por um banco de dados (Postgres, MongoDB, etc.).
- O projeto foi gerado automaticamente por um assistente; ajustes finos podem ser necessários conforme as regras de negócio.

MongoDB
-------

Esta versão foi atualizada para usar MongoDB via Mongoose. Defina a variável de ambiente `MONGODB_URI` para a string de conexão; por padrão a aplicação tenta `mongodb://127.0.0.1:27017/api_grte`.

Modelos / estrutura de dados

- User
	- email: string (required, único)
	- name: string (required)
	- createdAt: Date
	- updatedAt: Date

- Parada
	- name: string (required)
	- lat: number (opcional)
	- lng: number (opcional)
	- createdAt: Date
	- updatedAt: Date

- Rota
	- name: string (required)
	- paradas: [ObjectId] (referência para documentos Parada)
	- createdAt: Date
	- updatedAt: Date

- Session
	- token: string (UUID gerado)
	- user: { email, name }
	- createdAt: Date

Rodando com MongoDB

1. Execute um MongoDB localmente (ex: `brew services start mongodb-community` se estiver no macOS) ou use um serviço externo e ajuste `MONGODB_URI`.

2. Instale dependências:

```bash
npm install
npm install mongoose dotenv
```

3. Inicie a aplicação:

```bash
npm run dev
```

Agora os endpoints `/api/paradas` e `/api/rotas` usam MongoDB para persistência e `/auth/login` grava sessões na coleção `sessions`.

Rodando com Docker (MongoDB + app)
---------------------------------

1. Certifique-se de ter Docker e Docker Compose instalados.

2. Suba os serviços:

```bash
docker compose up --build
```

3. A API ficará disponível em http://localhost:3456 e o MongoDB em mongodb://localhost:27017 (volume persistente definido em `docker-compose.yml`).

Observações sobre a pasta `data/`
--------------------------------

A pasta `data/` e os arquivos JSON (`data/db.json`, `data/paradas.json`, `data/rotas.json`) eram usados na versão inicial do projeto para persistência em arquivo. Nesta versão a persistência foi migrada para MongoDB com Mongoose. Os arquivos foram mantidos no repositório para compatibilidade, mas não são utilizados pela aplicação — prefira usar o MongoDB (variável `MONGODB_URI`).
