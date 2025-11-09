# Guia de Deploy com Docker Swarm

## Visao Geral
- Docker Swarm agrupa varios hosts Docker em um cluster unico, onde voce declara stacks ao inves de containers isolados.
- Servicos em Swarm fornecem orquestracao, atualizacoes gradativas, balanceamento embutido e politicas de reinicio.
- Este guia parte da estrutura atual (`docker-compose.yml`) e mostra como chegar em um `docker-stack.yml` pronto para uso no Swarm.

## 1. Preparar Imagens
1. Defina um registro acessivel pelos nos do cluster (Docker Hub, GHCR, registro privado, etc.).
2. Construa as imagens fora do Swarm:
   ```bash
   docker build -t <registro>/grte-api:<tag> API
   docker build -t <registro>/grte-front:<tag> FRONT
   ```
3. Envie para o registro:
   ```bash
   docker push <registro>/grte-api:<tag>
   docker push <registro>/grte-front:<tag>
   ```
4. Atualize `docker-stack.yml` (ver Secao 2) com essas tags em `image:`.

## 2. Adaptar docker-compose para Swarm
1. Copie `docker-compose.yml` para `docker-stack.yml`.
2. Ajuste o cabecalho para `version: "3.9"` (ou outra 3.x).
3. Remova campos nao suportados (`container_name`, `depends_on`, parametros de `build`).
4. Para cada servico, adicione um bloco `deploy`:
   ```yaml
   deploy:
     replicas: 1
     restart_policy:
       condition: on-failure
     update_config:
       parallelism: 1
       delay: 10s
     resources:
       limits:
         cpus: "0.50"
         memory: 512M
   ```
5. Converta portas para o formato objeto:
   ```yaml
   ports:
     - target: 3456
       published: 3456
       protocol: tcp
       mode: ingress
   ```
6. Substitua bind mounts que apontam para caminhos locais por volumes gerenciados ou por um caminho compartilhado que exista igual em todos os nos.
7. Centralize variaveis sensiveis em Secrets ou Configs do Swarm (ver Secao 4).

## 3. Criar Rede Overlay e Volumes
1. Antes do deploy crie uma rede overlay (ou declare no arquivo):
   ```bash
   docker network create --driver overlay grte_net
   ```
2. No `docker-stack.yml`, associe a rede aos servicos:
   ```yaml
   networks:
     - grte_net
   ```
3. Para persistir o MongoDB, planeje um volume adequado:
   - Para laboratorio: driver `local` apontando para diretorio compartilhado (NFS).
   - Em producao: considere plugin de volume (rexray, portworx) ou banco gerenciado fora do Swarm.

## 4. Variaveis, Configs e Secrets
1. Extraiam variaveis sensiveis dos arquivos `.env`.
2. Crie secrets:
   ```bash
   printf "VITE_API_BASE_URL=http://api:3456" | docker secret create front_env -
   printf "MONGODB_URI=mongodb://mongo:27017/api_grte" | docker secret create api_env -
   ```
3. No `docker-stack.yml`, adicione:
   ```yaml
   secrets:
     - source: api_env
       target: /run/secrets/api_env
   ```
4. Dentro do entrypoint/codigo, leia as variaveis do arquivo montado (`/run/secrets/...`).
5. Para configuracoes nao sensiveis, use `configs` com sintaxe similar a secrets.

## 5. Inicializar o Cluster Swarm
1. No primeiro host:
   ```bash
   docker swarm init --advertise-addr <ip_manager>
   ```
2. O comando retorna tokens para adicionar managers e workers.
3. Em cada novo no:
   ```bash
   docker swarm join --token <token> <ip_manager>:2377
   ```
4. Verifique status:
   ```bash
   docker node ls
   ```

## 6. Deploy do Stack
1. Certifique-se de que todos os nos tem acesso ao registro das imagens.
2. Execute:
   ```bash
   docker stack deploy -c docker-stack.yml grte
   ```
3. Verifique servicos:
   ```bash
   docker service ls
   docker service ps grte_api
   docker service logs -f grte_api
   ```
4. Para atualizar uma imagem:
   ```bash
   docker service update --image <registro>/grte-api:<nova-tag> grte_api
   ```
5. Se precisar aplicar alteracoes no arquivo stack:
   ```bash
   docker stack deploy -c docker-stack.yml --with-registry-auth grte
   ```

## 7. Scripts de Seed e Tarefas Adicionais
1. Para rodar seeds apos o deploy:
   ```bash
   docker run --rm --network grte_grte_net <registro>/grte-api:<tag> npm run seed:all
   ```
   (Ajuste o nome da rede conforme criado pelo stack: `<stack>_<network>`.)
2. Alternativa: crie um servico temporario e remova apos a conclusao:
   ```bash
   docker service create --name grte_seed --network grte_grte_net <registro>/grte-api:<tag> npm run seed:all
   docker service rm grte_seed
   ```

## 8. Operacoes e Troubleshooting
- `docker stack ls` lista stacks ativos.
- `docker service logs -f <servico>` mostra logs agregados pelas replicas.
- `docker service rollback <servico>` reverte para a revisao anterior.
- `docker node update --availability drain <node>` drena um no para manutencao.
- Se portas conflitam, ajuste o campo `published` no arquivo stack antes de redeploy.

## 9. Checklist Resumido
1. Build e push das imagens para um registro.
2. Criar `docker-stack.yml` com `deploy`, redes e volumes proprios para Swarm.
3. Configurar secrets/configs necessarios.
4. Inicializar (ou conectar-se a) um cluster Swarm.
5. Criar rede overlay e volumes persistentes.
6. Executar `docker stack deploy`.
7. Rodar seeds e validar acessos em `http://<ip_frontend>:3000` e `http://<ip_manager>:3456`.

Mantenha este arquivo atualizado conforme novos requisitos surgirem durante a migracao para Swarm.
