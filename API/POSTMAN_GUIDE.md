# Guia Rápido de Testes no Postman

## ⚙️ IMPORTANTE: Rodar os Seeds PRIMEIRO!

Antes de testar a API, você **PRECISA** popular o banco de dados com dados iniciais.

### Opção 1: Rodar Todos os Seeds de Uma Vez (Recomendado)
```bash
docker-compose exec api npm run seed:all
```

### Opção 2: Rodar Seeds Individualmente
```bash
# 1. Criar usuário administrador (OBRIGATÓRIO para fazer login)
docker-compose exec api npm run seed:users

# 2. Criar paradas e rotas de exemplo
docker-compose exec api npm run seed:paradas

# 3. Criar alunos de exemplo
docker-compose exec api npm run seed:alunos
```

### Dados Criados pelos Seeds

**Usuário Administrador:**
- Email: `admin@example.com`
- Senha: `345678` ⚠️ **NOTA: A senha é 345678, não 3456!**

**Paradas:**
- Parada Central
- Parada Escola A
- Parada Bairro B
- Parada Terminal

**Rotas:**
- Rota A - Centro/Escola
- Rota B - Bairro/Terminal

**Alunos:**
- Ana Silva (MTR1001)
- Bruno Souza (MTR1002)
- Carla Pereira (MTR1003)

---

## 🚀 Configuração Inicial

**Base URL:** `http://localhost:3456`

### Importante
- Todas as rotas (exceto `/auth/login` e `/api/users`) requerem autenticação
- A autenticação é feita via **cookie HttpOnly** chamado `token`
- Configure o Postman para aceitar cookies automaticamente

---

## 🔐 1. Autenticação

### Login
```
POST http://localhost:3456/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@example.com",
  "password": "345678"
}

Resposta (200 OK):
{
  "message": "Login bem-sucedido",
  "user": {
    "id": "...",
    "nome": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```
✅ **O cookie `token` será salvo automaticamente pelo Postman**

### Logout
```
POST http://localhost:3456/auth/logout

Resposta (200 OK):
{
  "message": "Logout realizado com sucesso"
}
```

---

## 👥 2. Usuários

### Listar Todos os Usuários (não requer autenticação)
```
GET http://localhost:3456/api/users

Resposta (200 OK):
[
  {
    "_id": "...",
    "nome": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
]
```

### Buscar Usuário por ID
```
GET http://localhost:3456/api/users/:id

Exemplo:
GET http://localhost:3456/api/users/674a7b8e9c1f2a3b4c5d6e7f
```

### Criar Novo Usuário
```
POST http://localhost:3456/api/users
Content-Type: application/json

Body:
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "role": "motorista"
}

Resposta (201 Created):
{
  "_id": "...",
  "nome": "João Silva",
  "email": "joao@example.com",
  "role": "motorista"
}
```

### Atualizar Usuário
```
PUT http://localhost:3456/api/users/:id
Content-Type: application/json

Body:
{
  "nome": "João Silva Atualizado",
  "role": "admin"
}
```

### Deletar Usuário
```
DELETE http://localhost:3456/api/users/:id
```

---

## 🚏 3. Paradas (Requer Autenticação)

### Listar Todas as Paradas
```
GET http://localhost:3456/api/paradas

Resposta (200 OK):
[
  {
    "_id": "...",
    "name": "Escola Central",
    "address": "Rua Principal, 123",
    "lat": -23.5505,
    "lng": -46.6333
  }
]
```

### Buscar Parada por ID
```
GET http://localhost:3456/api/paradas/:id
```

### Criar Nova Parada
```
POST http://localhost:3456/api/paradas
Content-Type: application/json

Body:
{
  "name": "Escola Jardim América",
  "address": "Av. São Paulo, 456",
  "lat": -23.5600,
  "lng": -46.6500
}

Resposta (201 Created):
{
  "_id": "...",
  "name": "Escola Jardim América",
  "address": "Av. São Paulo, 456",
  "lat": -23.56,
  "lng": -46.65
}
```

### Atualizar Parada
```
PUT http://localhost:3456/api/paradas/:id
Content-Type: application/json

Body:
{
  "name": "Escola Jardim América - Atualizada",
  "address": "Av. São Paulo, 789"
}
```

### Deletar Parada
```
DELETE http://localhost:3456/api/paradas/:id
```

---

## 🚌 4. Rotas (Requer Autenticação)

### Listar Todas as Rotas
```
GET http://localhost:3456/api/rotas

Resposta (200 OK):
[
  {
    "_id": "...",
    "nome": "Rota Matutina Centro",
    "origem": "Terminal Central",
    "destino": "Escola Municipal",
    "paradas": ["...", "..."],
    "horaInicio": "07:00",
    "horaFim": "08:30",
    "status": "ativa"
  }
]
```

### Buscar Rota por ID
```
GET http://localhost:3456/api/rotas/:id

Resposta (200 OK):
{
  "_id": "...",
  "nome": "Rota Matutina Centro",
  "origem": "Terminal Central",
  "destino": "Escola Municipal",
  "paradas": [
    {
      "_id": "...",
      "name": "Parada 1",
      "address": "Endereço 1"
    }
  ],
  "horaInicio": "07:00",
  "horaFim": "08:30",
  "status": "ativa"
}
```

### Criar Nova Rota
```
POST http://localhost:3456/api/rotas
Content-Type: application/json

Body:
{
  "nome": "Rota Vespertina Sul",
  "origem": "Bairro Sul",
  "destino": "Escola Estadual",
  "paradas": ["674a7b8e9c1f2a3b4c5d6e7f", "674a7b8e9c1f2a3b4c5d6e80"],
  "horaInicio": "13:00",
  "horaFim": "14:30",
  "status": "ativa"
}

Resposta (201 Created):
{
  "_id": "...",
  "nome": "Rota Vespertina Sul",
  "origem": "Bairro Sul",
  "destino": "Escola Estadual",
  "paradas": ["...", "..."],
  "horaInicio": "13:00",
  "horaFim": "14:30",
  "status": "ativa"
}
```

### Atualizar Rota
```
PUT http://localhost:3456/api/rotas/:id
Content-Type: application/json

Body:
{
  "nome": "Rota Vespertina Sul - Atualizada",
  "status": "inativa"
}
```

### Deletar Rota
```
DELETE http://localhost:3456/api/rotas/:id
```

---

## 👨‍🎓 5. Alunos (Requer Autenticação)

### Listar Todos os Alunos
```
GET http://localhost:3456/api/alunos

Resposta (200 OK):
[
  {
    "_id": "...",
    "matricula": "2024001",
    "nome": "Maria Santos",
    "endereco": "Rua das Flores, 100",
    "telefone": "(11) 98765-4321",
    "status": "ativo"
  }
]
```

### Buscar Aluno por ID
```
GET http://localhost:3456/api/alunos/:id
```

### Criar Novo Aluno
```
POST http://localhost:3456/api/alunos
Content-Type: application/json

Body:
{
  "matricula": "2024050",
  "nome": "Carlos Oliveira",
  "endereco": "Rua das Palmeiras, 200",
  "telefone": "(11) 91234-5678",
  "status": "ativo"
}

Resposta (201 Created):
{
  "_id": "...",
  "matricula": "2024050",
  "nome": "Carlos Oliveira",
  "endereco": "Rua das Palmeiras, 200",
  "telefone": "(11) 91234-5678",
  "status": "ativo"
}
```

### Atualizar Aluno
```
PUT http://localhost:3456/api/alunos/:id
Content-Type: application/json

Body:
{
  "nome": "Carlos Oliveira Junior",
  "status": "inativo"
}
```

### Deletar Aluno
```
DELETE http://localhost:3456/api/alunos/:id
```

---

## 🔧 Configuração do Postman

### 1. Importar Collection (Opcional)
Você pode criar uma Collection com todas essas rotas no Postman.

### 2. Configurar Variável de Ambiente
Crie uma variável `baseUrl` com valor `http://localhost:3456`

### 3. Habilitar Cookies
- Settings → General → Enable "Automatically follow redirects"
- Settings → General → Enable "Send cookies with requests"

### 4. Fluxo de Teste Completo

**Ordem recomendada:**

1. ✅ **POST** `/auth/login` - Fazer login (cookie será salvo)
2. ✅ **GET** `/api/users` - Testar rota pública
3. ✅ **GET** `/api/paradas` - Testar rota protegida
4. ✅ **POST** `/api/paradas` - Criar nova parada
5. ✅ **POST** `/api/rotas` - Criar rota (use IDs das paradas criadas)
6. ✅ **POST** `/api/alunos` - Criar aluno
7. ✅ **GET** `/api/rotas` - Listar todas as rotas
8. ✅ **PUT** `/api/rotas/:id` - Atualizar rota
9. ✅ **DELETE** `/api/rotas/:id` - Deletar rota
10. ✅ **POST** `/auth/logout` - Fazer logout

---

## ⚠️ Troubleshooting

### Erro 401 Unauthorized
- Certifique-se de que fez login primeiro
- Verifique se os cookies estão habilitados no Postman
- O cookie `token` deve estar presente nas requisições

### Erro 404 Not Found
- Verifique se a API está rodando: `docker-compose ps`
- Confirme a porta correta: `3456`

### Erro 500 Internal Server Error
- Verifique se o MongoDB está rodando
- Confira os logs: `docker-compose logs api`

### IDs Inválidos
- Use IDs reais retornados pelas requisições GET
- IDs do MongoDB têm 24 caracteres hexadecimais

---

## 📦 Collection JSON para Importar

Copie e salve como `GRTE_API.postman_collection.json`:

```json
{
  "info": {
    "name": "GRTE API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"345678\"\n}"
            },
            "url": {"raw": "{{baseUrl}}/auth/login", "host": ["{{baseUrl}}"], "path": ["auth", "login"]}
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "url": {"raw": "{{baseUrl}}/auth/logout", "host": ["{{baseUrl}}"], "path": ["auth", "logout"]}
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "List Users",
          "request": {
            "method": "GET",
            "url": {"raw": "{{baseUrl}}/api/users", "host": ["{{baseUrl}}"], "path": ["api", "users"]}
          }
        }
      ]
    },
    {
      "name": "Paradas",
      "item": [
        {
          "name": "List Paradas",
          "request": {
            "method": "GET",
            "url": {"raw": "{{baseUrl}}/api/paradas", "host": ["{{baseUrl}}"], "path": ["api", "paradas"]}
          }
        },
        {
          "name": "Create Parada",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Escola Teste\",\n  \"address\": \"Rua Teste, 123\",\n  \"lat\": -23.55,\n  \"lng\": -46.63\n}"
            },
            "url": {"raw": "{{baseUrl}}/api/paradas", "host": ["{{baseUrl}}"], "path": ["api", "paradas"]}
          }
        }
      ]
    },
    {
      "name": "Rotas",
      "item": [
        {
          "name": "List Rotas",
          "request": {
            "method": "GET",
            "url": {"raw": "{{baseUrl}}/api/rotas", "host": ["{{baseUrl}}"], "path": ["api", "rotas"]}
          }
        }
      ]
    },
    {
      "name": "Alunos",
      "item": [
        {
          "name": "List Alunos",
          "request": {
            "method": "GET",
            "url": {"raw": "{{baseUrl}}/api/alunos", "host": ["{{baseUrl}}"], "path": ["api", "alunos"]}
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3456"
    }
  ]
}
```

---

## 📝 Notas Importantes

1. **Sempre faça login primeiro** antes de testar rotas protegidas
2. **Salve os IDs** retornados para usar em operações de UPDATE e DELETE
3. **Para criar rotas**, você precisa ter paradas criadas antes
4. **A matrícula do aluno** deve ser única
5. **Status válidos**: "ativo", "inativo" (para alunos e rotas)

---

**🎯 Pronto para testar! Comece pelo login e boa sorte!** 🚀
