# Cinebridge: Microsserviço de Recomendação e Orquestração de Equipes

Microsserviço que recomenda e monta equipes técnicas para projetos audiovisuais independentes. Recebe um projeto (gênero, orçamento, prazo e papéis exigidos), consulta os profissionais cadastrados e devolve uma equipe sugerida.

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

Os pacotes npm têm as versões fixadas no `package-lock.json`, então `npm install` reproduz exatamente o ambiente testado.

## Padrões de projeto aplicados

| Padrão | Localização | Papel |
|---|---|---|
| Strategy | `src/strategies/` | Troca o algoritmo de recomendação (similaridade de cosseno, filtragem colaborativa, regras de orçamento) sem alterar o restante do fluxo |
| Template Method | `src/orchestration/` | Fixa o esqueleto da orquestração (validar restrições, normalizar dados, recomendar, pós-processar), delegando os passos específicos às subclasses |
| Observer | `src/observers/` | Notifica vários interessados (e-mail, mensagem interna, auditoria) a cada recomendação, sem acoplar o sistema a cada notificador |
| Visitor | `src/visitors/` | Executa operações transversais (validação de consistência, cálculo de compatibilidade, relatório) sobre `Projeto` e `Profissional`, sem poluir essas classes |
| Prototype | `src/domain/Projeto.ts` + subclasses | `clonar()` devolve uma cópia profunda e independente de um projeto, preservando o tipo concreto (`ProjetoDocumentario`, `ProjetoAnimacao`, `ProjetoPublicitario`) |
| Factory Method | `src/factories/<genero>/` | Cada fábrica concreta decide COMO construir o recomendador, o validador e o notificador do seu próprio gênero |
| Abstract Factory | `src/factories/FabricaProjeto.ts` + fábricas concretas | Garante que validador, recomendador e notificador de um mesmo projeto pertençam sempre à MESMA família (gênero), nunca misturados |
| Adapter | `src/adapters/` + `src/externos/` | Isola o núcleo dos serviços de terceiros (armazenamento, pagamento, cadastro de profissionais): cada provedor ganha um adaptador que traduz a interface padrão para a API dele |
| Composite | `src/servicos/` | Representa pacotes de serviços dentro de pacotes (árvore). Serviço atômico e pacote compartilham a interface `ServicoProjeto`, então custo, prazo e validação são calculados recursivamente |
| Decorator | `src/decorators/` | Acrescenta cache, auditoria e compressão ao recomendador, em camadas e em qualquer ordem, sem alterar o recomendador nem o `SistemaRecomendacao` |

### Gêneros de projeto (Abstract Factory, seleção automática — rota `/recomendacoes/:tipo`)

| Gênero | Fábrica | Campos extras | Regra de recomendação específica | Regra de validação específica |
|---|---|---|---|---|
| `documentario` | `FabricaDocumentario` | `tema`, `entrevistados` | Prioriza quem tem competência de `entrevista` no papel de Diretor | Reprova se não houver nenhum entrevistado definido |
| `animacao` | `FabricaAnimacao` | `motorGrafico`, `resolucaoEntrega` | Prioriza quem tem competência de `modelagem3d` no papel de Efeitos Visuais | Reprova se o motor gráfico não estiver definido |
| `publicitario` | `FabricaPublicitario` | `cliente`, `plataformasDistribuicao` | Prioriza quem tem competência de `motion-graphics` no papel de Editor | Reprova se faltar cliente ou plataforma de distribuição |

## Atividade 3: Adapter, Composite e Decorator

### Adapter: provedores externos simulados

O `SistemaRecomendacao` depende apenas das interfaces. Os provedores são trocados com `configurarAdaptadores(armazenamento, pagamento, profissional)`, sem alterar a lógica de negócio.

| Interface | Adaptadores | Sistema externo simulado | O que o adaptador traduz |
|---|---|---|---|
| `AdaptadorArmazenamento` | `AdaptadorS3`, `AdaptadorGoogleCloud` | `S3Simulado`, `GoogleCloudStorageSimulado` | `salvarArquivo` vira `putObject` ou `file().save()` |
| `AdaptadorPagamento` | `AdaptadorStripe`, `AdaptadorPagSeguro` | `StripeSimulado`, `PagSeguroSimulado` | Reais viram centavos (Stripe) ou texto `"150.00"` (PagSeguro); os status viram `APROVADO`, `ESTORNADO` ou `NAO_ENCONTRADO` |
| `AdaptadorProfissional` | `AdaptadorLinkedIn`, `AdaptadorInterno` | `LinkedInSimulado`, `CadastroInternoSimulado` | Perfis externos viram objetos `Profissional` do domínio |

### Composite: hierarquia de serviços

`Projeto` agora possui `servicoPrincipal` (tipo `ServicoProjeto`). `calcularCustoTotal()` e `validarEstrutura()` delegam à árvore, e `exige()` deriva os papéis a partir dela. Continua aceitando a lista simples de papéis (formato antigo), que é convertida em árvore automaticamente, e `clonar()` copia a árvore inteira.

```ts
const posProducao = new PacoteServico('Pos-producao')
    .adicionar(new ServicoAtomico('Edicao', 5000, 10, Papel.EDITOR, 2))
    .adicionar(
        new PacoteServico('Audio').adicionar(
            new ServicoAtomico('Mixagem', 3000, 5, Papel.SONOPLASTA)
        )
    );

posProducao.calcularCusto(); // 8000
posProducao.obterPrazo();    // 15 (dias, em sequência)
```

### Decorator: cache, auditoria e compressão

A pilha é montada em tempo de execução. A ordem da lista vai do mais interno para o mais externo:

```ts
const pilha = montarPilhaRecomendador(
    new RecomendadorBase(),
    ['cache', 'auditoria', 'compressao']
);
sistema.definirEstrategia(pilha.topo);
```

A ordem muda o comportamento: com `cache,auditoria` a auditoria registra todas as chamadas, e com `auditoria,cache` ela registra só as que o cache não resolveu.

A demonstração do console lê a pilha da variável de ambiente `CINEBRIDGE_DECORADORES`:

```bash
# Linux / macOS
CINEBRIDGE_DECORADORES=cache,auditoria npm run dev

# Windows (cmd)
set CINEBRIDGE_DECORADORES=cache,auditoria
npm run dev

# Windows (PowerShell)
$env:CINEBRIDGE_DECORADORES="cache,auditoria"
npm run dev
```

Valores aceitos: `cache`, `auditoria` e `compressao`. Nomes desconhecidos ou repetidos geram erro.

## Como rodar

### 1. Pré-requisitos

- Node.js LTS
- PostgreSQL rodando localmente (porta 5432)

### 2. Clonar e instalar as dependências

```bash
git clone https://github.com/nevesmariana/ATVIII-cinebridge.git
cd ATVIII-cinebridge
npm install
```

### 3. Configurar o banco

```bash
# Linux / macOS
cp .env.example .env

# Windows (cmd)
copy .env.example .env
```

Edite o `.env` e troque `SUA_SENHA` pela senha do seu PostgreSQL. Caracteres especiais precisam ser codificados na URL (`#` vira `%23`, `@` vira `%40`).

### 4. Criar as tabelas e popular o banco

```bash
npx prisma migrate dev
npx prisma generate
npx tsx prisma/seed.ts
```

### 5. Subir a API

```bash
npm run dev:server
```

O servidor sobe em `http://localhost:3000`.

### 6. Testar as rotas de recomendação

**Rota da Atividade 1** — `POST /recomendacoes`, escolhendo a estratégia manualmente:

```bash
curl -X POST http://localhost:3000/recomendacoes \
  -H "Content-Type: application/json" \
  -d '{"projeto":{"id":"proj-1","genero":"documentario","duracao":90,"orcamento":30000,"prazo":"2035-01-01","papeisExigidos":[{"papel":"DIRETOR","peso":1},{"papel":"EDITOR","peso":0.8},{"papel":"SONOPLASTA","peso":0.6}]},"estrategia":"similaridadeCosseno"}'
```

**Rota da Atividade 2** — `POST /recomendacoes/:tipo`, a fábrica do gênero escolhe tudo sozinha:

```bash
curl -X POST http://localhost:3000/recomendacoes/documentario \
  -H "Content-Type: application/json" \
  -d '{"dados":{"id":"doc-1","genero":"documentario","duracao":60,"orcamento":20000,"prazo":"2035-01-01","papeisExigidos":[{"papel":"DIRETOR","peso":1},{"papel":"EDITOR","peso":0.8}],"tema":"cultura nordestina","entrevistados":["Maria","Joao"]}}'
```

Troque `/documentario` por `/animacao` ou `/publicitario` (ajustando os campos extras de `dados` conforme a tabela de gêneros acima).

Windows (cmd), mesma ideia com aspas escapadas:

```bat
curl -X POST http://localhost:3000/recomendacoes/documentario ^
  -H "Content-Type: application/json" ^
  -d "{\"dados\":{\"id\":\"doc-1\",\"genero\":\"documentario\",\"duracao\":60,\"orcamento\":20000,\"prazo\":\"2035-01-01\",\"papeisExigidos\":[{\"papel\":\"DIRETOR\",\"peso\":1},{\"papel\":\"EDITOR\",\"peso\":0.8}],\"tema\":\"cultura nordestina\",\"entrevistados\":[\"Maria\",\"Joao\"]}}"
```

### 7. Rodar a demonstração no console

```bash
npm run dev
```

### 8. Rodar os testes

```bash
npm test
```