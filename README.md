# Cinebridge: Microsserviço de Recomendação e Orquestração de Equipes
Microsserviço que recomenda e monta equipes técnicas para projetos audiovisuais independentes. 

## Stack técnica

| Tecnologia | Versão testada |
|---|---|
| Node.js (LTS) | 24.14.0 |
| PostgreSQL | 18.6 |
| TypeScript (modo estrito) | 5.9.3 |
| Fastify | 5.12.5 |
| Prisma / @prisma/client | 6.19.3 |
| Jest | 30.5.2 |
| ts-jest | 29.4.14 |
| tsx | 4.23.15 |

## Como rodar

### 1. Pré-requisitos

- Node.js LTS
- PostgreSQL rodando localmente (porta 5432)

### 2. Clonar e instalar as dependências

```bash
git clone https://github.com/nevesmariana/ATVI-cinebridge.git
cd ATVI-cinebridge
npm install
```

### 3. Configurar o banco

Copie o arquivo de exemplo:

```bash
# Linux / macOS
cp .env.example .env

# Windows (cmd)
copy .env.example .env
```

Edite o `.env` e troque `SUA_SENHA` pela senha do seu PostgreSQL. Caracteres especiais precisam ser codificados na URL (`#` vira `%23`, `@` vira `%40`). O usuário padrão é `postgres`; ajuste se for outro.

### 4. Criar as tabelas e popular o banco

```bash
npx prisma migrate dev
npx prisma generate
npx tsx prisma/seed.ts
```

O `migrate dev` cria o banco `cinebridge_db` caso ele ainda não exista. O seed apaga e recria 6 profissionais de teste.

### 5. Subir a API

```bash
npm run dev:server
```

O servidor sobe em `http://localhost:3000`.

### 6. Testar a rota de recomendação

`POST /recomendacoes`

Linux / macOS:

```bash
curl -X POST http://localhost:3000/recomendacoes \
  -H "Content-Type: application/json" \
  -d '{"projeto":{"id":"proj-1","genero":"documentario","duracao":90,"orcamento":30000,"prazo":"2035-01-01","papeisExigidos":[{"papel":"DIRETOR","peso":1},{"papel":"EDITOR","peso":0.8},{"papel":"SONOPLASTA","peso":0.6}]},"estrategia":"similaridadeCosseno"}'
```

Windows (cmd; no PowerShell use `curl.exe` em vez de `curl`):

```bat
curl -X POST http://localhost:3000/recomendacoes ^
  -H "Content-Type: application/json" ^
  -d "{\"projeto\":{\"id\":\"proj-1\",\"genero\":\"documentario\",\"duracao\":90,\"orcamento\":30000,\"prazo\":\"2035-01-01\",\"papeisExigidos\":[{\"papel\":\"DIRETOR\",\"peso\":1},{\"papel\":\"EDITOR\",\"peso\":0.8},{\"papel\":\"SONOPLASTA\",\"peso\":0.6}]},\"estrategia\":\"similaridadeCosseno\"}"
```

Resposta esperada (equipe recomendada):

```json
{
  "projetoId": "proj-1",
  "equipeId": "equipe-proj-1",
  "membros": [
    { "papel": "DIRETOR", "profissionalId": "p1", "profissionalNome": "Ana Silva" },
    { "papel": "EDITOR", "profissionalId": "p2", "profissionalNome": "Bruno Costa" },
    { "papel": "SONOPLASTA", "profissionalId": "p3", "profissionalNome": "Carla Dias" }
  ]
}
```

Troque o campo `estrategia` por `filtragemColaborativa` ou `regrasOrcamento` para ver a recomendação mudar. Se o projeto for inválido (orçamento zero, prazo no passado ou sem papéis), a API responde `422`; sem o campo `projeto`, responde `400`.

### 7. Rodar a demonstração no console

Executa um cenário completo (troca de estratégia, observadores e visitantes) sem passar pelo HTTP:

```bash
npm run dev
```

### 8. Rodar os testes

```bash
npm test
```

Roda os testes unitários e de integração e exibe o relatório de cobertura (meta mínima de 80% configurada no `jest.config.js`). Os testes usam o repositório em memória, então não precisam do PostgreSQL.