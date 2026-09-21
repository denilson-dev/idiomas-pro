# 🌍 Idiomas Pro

<div align="center">

### Projeto de estudos de Bancos de Dados e Engenharia de Dados com PostgreSQL

O **Idiomas Pro** é um projeto criado para estudar, praticar e documentar conceitos de **bancos de dados**, **PostgreSQL**, **SQL**, **modelagem de dados** e **Engenharia de Dados** usando uma aplicação real como fonte de dados.

A aplicação de nivelamento de idiomas funciona como o cenário prático do projeto: alunos, professores, avaliações, respostas, sessões e resultados geram dados transacionais que depois podem ser persistidos, consultados, transformados e analisados.

> **Importante:** este repositório é exclusivamente um projeto de estudos.  
> Ele não representa experiência profissional anterior, certificação oficial de idiomas ou um produto comercial finalizado.

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-Studies-336791)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)

</div>

---

# 📚 Qual é o foco deste projeto?

O foco principal deste repositório é aprender **como os dados são gerados, armazenados, relacionados, consultados e transformados** dentro de uma aplicação.

Em vez de estudar banco de dados apenas com tabelas isoladas, a ideia foi construir um sistema que produzisse dados de uso real.

Exemplo:

~~~text
Aluno cria conta
       ↓
Sessão é criada
       ↓
Aluno inicia avaliação
       ↓
Questões são selecionadas
       ↓
Respostas são registradas
       ↓
Resultado é calculado
       ↓
Professor acompanha a avaliação
       ↓
Dados seguem para a camada analítica
       ↓
Data Warehouse
       ↓
Data Marts
       ↓
Análise
~~~

Dessa forma, o projeto permite estudar tanto o **banco transacional da aplicação** quanto uma arquitetura analítica separada.

---

# 🎯 Objetivos de estudo

Este projeto está sendo utilizado para praticar principalmente:

## Banco de Dados

- PostgreSQL;
- SQL;
- criação de tabelas;
- chaves primárias e estrangeiras;
- relacionamentos;
- índices;
- constraints;
- normalização;
- migrations;
- transações;
- CRUD;
- integridade referencial;
- performance de consultas;
- EXPLAIN;
- EXPLAIN ANALYZE;
- particionamento;
- modelagem transacional.

## Engenharia de Dados

- Python;
- psycopg;
- ETL/ELT;
- ingestão incremental;
- watermarks;
- schemas analíticos;
- camada raw;
- camada staging;
- Data Warehouse;
- modelagem dimensional;
- tabelas fato;
- dimensões;
- SCD Type 2;
- Data Marts;
- qualidade de dados;
- observabilidade de pipelines;
- dados sintéticos;
- dbt;
- Apache Airflow;
- Power BI;
- Metabase.

## Conhecimentos complementares

A aplicação também foi utilizada para estudar:

- APIs REST;
- Node.js;
- Express;
- TypeScript;
- React;
- autenticação;
- sessões;
- segurança;
- controle de acesso;
- responsividade;
- testes automatizados;
- CI/CD;
- deploy.

Essas tecnologias existem no projeto principalmente para criar um ambiente mais próximo de uma aplicação real e produzir dados para os estudos.

---

# 🏗️ Arquitetura geral

~~~text
                        IDIOMAS PRO

                ┌──────────────────────┐
                │        Aluno         │
                │ Professor / Admin    │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ React + TypeScript   │
                │ Frontend             │
                └──────────┬───────────┘
                           │
                           │ API REST
                           ▼
                ┌──────────────────────┐
                │ Node.js + Express    │
                │ Backend              │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Prisma ORM           │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ PostgreSQL           │
                │ schema public        │
                │ OLTP                 │
                └──────────┬───────────┘
                           │
                     ETL incremental
                           │
                           ▼
                    Python + psycopg
                           │
                           ▼
              ┌───────────────────────────┐
              │ raw → staging → warehouse │
              └─────────────┬─────────────┘
                            │
                            ▼
                          marts
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
             Power BI                Metabase
~~~

O schema `public` representa o banco operacional da aplicação.

A arquitetura analítica fica separada para não misturar o sistema transacional com as estruturas utilizadas para análise.

---

# 🗄️ Banco de dados transacional

O projeto utiliza **PostgreSQL 16**.

A modelagem principal é definida em:

~~~text
prisma/schema.prisma
~~~

O Prisma é utilizado para:

- definição dos modelos;
- geração do Prisma Client;
- migrations;
- acesso aos dados;
- integração do backend com PostgreSQL.

---

# 🔗 Principais entidades

## User

Representa uma conta de aluno.

Principais informações:

~~~text
id
name
email
passwordHash
isActive
preferences
createdAt
updatedAt
~~~

---

## Session

Representa uma sessão de aluno ou visitante.

~~~text
id
token
userId
isAnonymous
expiresAt
createdAt
~~~

Uma sessão pode possuir várias tentativas de avaliação.

---

## Teacher

Representa contas da equipe pedagógica e administração.

~~~text
id
name
email
passwordHash
role
isActive
preferences
createdAt
updatedAt
~~~

Papéis disponíveis:

~~~text
TEACHER
ADMIN
~~~

---

## TeacherSession

Armazena sessões autenticadas da equipe.

~~~text
id
token
teacherId
expiresAt
createdAt
~~~

---

## Question

Armazena as questões utilizadas nas avaliações.

~~~text
id
prompt
options
correctAnswer
explanation
category
level
mediaType
mediaUrl
isActive
~~~

Categorias:

~~~text
GRAMMAR
VOCABULARY
LISTENING
~~~

Níveis:

~~~text
A1
A2
B1
B2
C1
C2
~~~

---

## TestAttempt

Representa uma tentativa de avaliação.

Entre os campos estudados estão:

~~~text
sessionId
userId
teacherId
studentName
studentEmail
language
status
totalQuestions
questionIds
score
cefrLevel
breakdown
createdAt
completedAt
~~~

Status:

~~~text
IN_PROGRESS
COMPLETED
~~~

---

## AttemptAnswer

Representa cada resposta enviada pelo aluno.

~~~text
attemptId
questionId
selectedAnswer
isCorrect
category
questionLevel
createdAt
~~~

Existe uma constraint para impedir que a mesma questão seja respondida duas vezes na mesma tentativa:

~~~text
@@unique([attemptId, questionId])
~~~

---

# 🔐 Relacionamentos e integridade

Alguns relacionamentos estudados no projeto:

~~~text
User
  │
  ├── Session
  │      │
  │      └── TestAttempt
  │
  └── TestAttempt

Teacher
  │
  ├── TeacherSession
  │
  └── TestAttempt

Question
  │
  └── AttemptAnswer

TestAttempt
  │
  └── AttemptAnswer
~~~

Também são estudados comportamentos de exclusão como:

- `Cascade`;
- `SetNull`;
- `Restrict`.

Exemplo:

Uma resposta não deve continuar existindo sem sua tentativa correspondente.

---

# ⚡ Índices

O banco possui índices para consultas utilizadas com frequência.

Exemplos:

~~~text
Session.token
Session.userId

Teacher.name

Question.level + category

TestAttempt.sessionId
TestAttempt.userId + createdAt
TestAttempt.teacherId + completedAt

AttemptAnswer.attemptId
~~~

O objetivo é estudar como índices influenciam buscas, joins, filtros e planos de execução.

---

# 🏭 Engenharia de Dados

A camada analítica está em:

~~~text
data-engineering/
~~~

Estrutura principal:

~~~text
data-engineering/
├── pipeline.py
├── requirements.txt
├── sql/
│   ├── 001_init_schemas.sql
│   ├── 002_raw.sql
│   ├── 003_staging.sql
│   ├── 004_warehouse.sql
│   ├── 005_transform.sql
│   ├── 006_marts.sql
│   ├── 007_quality.sql
│   └── labs/
├── synthetic/
│   └── generate.py
├── dbt/
└── airflow/
~~~

---

# 🧱 Schemas analíticos

| Schema | Responsabilidade |
|---|---|
| `public` | Banco transacional da aplicação |
| `meta` | Controle de execuções e watermarks |
| `raw` | Ingestão dos dados de origem |
| `staging` | Limpeza e padronização |
| `warehouse` | Modelo dimensional |
| `marts` | Dados preparados para análise |
| `data_quality` | Validações e registros rejeitados |

---

# 🔄 Pipeline incremental

O pipeline principal está em:

~~~text
data-engineering/pipeline.py
~~~

Fluxo:

~~~text
public
   │
   ▼
extract
   │
   ▼
raw
   │
   ▼
staging
   │
   ▼
transform
   │
   ▼
warehouse
   │
   ▼
marts
   │
   ▼
data quality
~~~

O pipeline utiliza **watermarks** para evitar extrair sempre todos os registros.

O controle fica em:

~~~text
meta.pipeline_control
~~~

Assim, novas execuções podem buscar apenas registros criados ou atualizados depois da última carga bem-sucedida.

---

# 📋 Observabilidade do pipeline

Cada execução pode ser registrada em:

~~~text
meta.pipeline_runs
~~~

Exemplo:

~~~sql
SELECT *
FROM meta.pipeline_runs
ORDER BY started_at DESC;
~~~

São armazenadas informações como:

- identificador da execução;
- nome do pipeline;
- início;
- término;
- registros lidos;
- registros escritos;
- registros rejeitados;
- status;
- mensagem de erro.

---

# ⭐ Data Warehouse

O projeto possui uma modelagem dimensional para estudos.

## Dimensões

~~~text
warehouse.dim_date
warehouse.dim_student
warehouse.dim_teacher
warehouse.dim_question
warehouse.dim_language
warehouse.dim_cefr_level
~~~

## Fatos

~~~text
warehouse.fact_test_attempt
warehouse.fact_answer
~~~

Modelo simplificado:

~~~text
                 dim_student
                     │
                     │
dim_teacher ─ fact_test_attempt ─ dim_date
                     │
                     │
               dim_language
                     │
               dim_cefr_level


dim_question ───── fact_answer
                       │
                 fact_test_attempt
~~~

---

# 🕒 SCD Type 2

A dimensão de professores é utilizada para estudar **Slowly Changing Dimension Type 2**.

Campos utilizados:

~~~text
valid_from
valid_to
is_current
hashdiff
~~~

A ideia é manter histórico quando determinados atributos mudam.

Exemplo conceitual:

~~~text
Professor A
versão 1 → encerrada
versão 2 → atual
~~~

---

# 📊 Data Marts

O projeto possui estruturas preparadas para análise.

### Distribuição de níveis

~~~text
marts.cefr_distribution
~~~

### Desempenho por professor

~~~text
marts.teacher_performance
~~~

### Análise de questões

~~~text
marts.question_analysis
~~~

### Evolução dos alunos

~~~text
marts.student_progress
~~~

Essas estruturas podem ser consultadas diretamente com SQL ou consumidas por ferramentas de BI.

---

# ✅ Qualidade de dados

O projeto possui uma camada específica para estudar validação de dados.

Exemplos de regras:

- pontuação fora do intervalo esperado;
- nível CEFR inválido;
- resposta sem avaliação correspondente;
- resposta sem questão correspondente.

Problemas encontrados podem ser consultados em:

~~~text
data_quality.current_issues
~~~

Registros rejeitados podem ser armazenados em:

~~~text
data_quality.rejected_records
~~~

---

# 🧪 Dados sintéticos

Para estudar volume sem utilizar usuários reais, existe um gerador de dados com Faker.

Exemplo:

~~~bash
python data-engineering/synthetic/generate.py \
  --students 5000 \
  --teachers 50 \
  --questions 180 \
  --attempts 100000 \
  --answers-per-attempt 18
~~~

Os dados sintéticos recebem:

~~~text
source_system = synthetic
~~~

Isso permite diferenciá-los dos registros criados pela aplicação.

> Dados sintéticos existem apenas para estudos de SQL, volume, performance, índices, transformações e análise.

---

# 🚀 Comandos da camada de dados

Inicializar os schemas analíticos:

~~~bash
npm run data:init
~~~

Extrair novos dados:

~~~bash
npm run data:extract
~~~

Transformar e atualizar o Warehouse:

~~~bash
npm run data:transform
~~~

Executar validações de qualidade:

~~~bash
npm run data:quality
~~~

Executar o pipeline completo:

~~~bash
npm run data:run
~~~

Também é possível executar diretamente com Python:

~~~bash
python data-engineering/pipeline.py run-all
~~~

---

# ⚙️ PostgreSQL e performance

O projeto possui laboratórios separados para estudar performance.

Arquivos:

~~~text
data-engineering/sql/labs/001_partitioning.sql
data-engineering/sql/labs/002_performance.sql
~~~

Entre os assuntos estudados:

- índices;
- seq scan;
- index scan;
- planos de execução;
- buffers;
- estatísticas;
- particionamento;
- partition pruning.

Exemplo:

~~~sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM warehouse.fact_answer
WHERE question_key = 10
  AND is_correct = false;
~~~

---

# 🧱 dbt

Existe uma trilha complementar de estudos com dbt em:

~~~text
data-engineering/dbt/
~~~

Alguns conceitos praticados:

- sources;
- models;
- staging;
- marts;
- `ref()`;
- testes.

Exemplo:

~~~bash
dbt debug --project-dir data-engineering/dbt
dbt build --project-dir data-engineering/dbt
~~~

O pipeline principal continua funcionando com Python + SQL + PostgreSQL.

---

# ⏱️ Apache Airflow

Existe uma DAG de estudo em:

~~~text
data-engineering/airflow/dags/idiomas_pro_analytics.py
~~~

Fluxo:

~~~text
init
  ↓
extract
  ↓
transform
  ↓
quality
~~~

A utilização do Airflow faz parte dos estudos de orquestração.

---

# 📈 Power BI e Metabase

Os Data Marts podem ser utilizados como camada de consumo para ferramentas analíticas.

Exemplo de fluxo:

~~~text
PostgreSQL
   │
   ▼
marts
   │
   ├── Power BI
   │
   └── Metabase
~~~

A ideia é evitar que dashboards consultem diretamente as tabelas transacionais da aplicação.

---

# 🔒 Privacidade na camada de dados

Algumas decisões adicionadas durante os estudos:

- hashes de senha não são enviados para o Warehouse;
- tokens de sessão não são enviados para o Warehouse;
- e-mails usados na camada analítica podem ser transformados em hash;
- dados sintéticos são identificados separadamente.

> Este é um projeto educacional. Em um ambiente real ainda seriam necessários controles mais profundos de LGPD, governança, retenção, criptografia, auditoria e gerenciamento de acessos.

---

# 🖥️ Aplicação utilizada como fonte de dados

A aplicação possui três contextos principais.

## Aluno

O aluno pode:

- entrar como visitante;
- criar uma conta;
- fazer login;
- escolher o idioma da avaliação;
- selecionar um professor;
- realizar a prova;
- responder gramática;
- responder vocabulário;
- responder listening;
- revisar respostas;
- finalizar a avaliação;
- consultar resultado;
- acompanhar histórico;
- acompanhar evolução.

---

## Professor

O professor possui uma área pedagógica própria.

Funcionalidades:

- autenticação;
- visão pedagógica;
- consulta aos alunos;
- histórico de avaliações;
- busca;
- detalhes de tentativas;
- edição de identificação da avaliação;
- exclusão de avaliação;
- limpeza das próprias avaliações;
- exportação de dados;
- relatório pedagógico.

A API garante que apenas contas com:

~~~text
role = TEACHER
~~~

tenham acesso às operações pedagógicas.

---

## Administrador

O administrador é responsável pela gestão das contas da plataforma.

Funcionalidades:

- cadastrar alunos;
- editar alunos;
- redefinir senha;
- ativar/desativar contas;
- excluir alunos;
- cadastrar professores;
- editar professores;
- redefinir senha;
- ativar/desativar professores;
- excluir professores;
- pesquisar contas;
- consultar quantidade de avaliações vinculadas.

O administrador **não é professor**.

Por isso:

~~~text
ADMIN
→ administra a plataforma
→ não recebe avaliações
→ não aparece para o aluno como professor
→ não corrige provas

TEACHER
→ recebe avaliações
→ acompanha alunos
→ acessa dados pedagógicos
~~~

Essa separação é validada tanto no frontend quanto no backend.

---

# 🔐 Segurança e isolamento de sessões

A autenticação foi evoluindo durante o projeto e vários problemas foram utilizados como oportunidades de estudo.

Atualmente:

- senhas são armazenadas com bcrypt;
- tokens ficam registrados no PostgreSQL;
- rotas protegidas validam a sessão no backend;
- contas inativas não podem continuar utilizando sessões antigas;
- redefinição de senha invalida sessões relacionadas;
- aluno e equipe utilizam fluxos separados;
- contas `ADMIN` e `TEACHER` possuem permissões diferentes.

## Sessões da equipe

Sessões de professor e administrador receberam regras adicionais:

- não são persistidas no `localStorage`;
- utilizam `sessionStorage` no navegador;
- tokens privilegiados antigos salvos no estado persistido são descartados;
- uma nova autenticação invalida a sessão privilegiada anterior da mesma conta;
- sessões da equipe possuem expiração reduzida;
- entrar na página da equipe não abre automaticamente um painel privilegiado;
- uma sessão existente precisa ser confirmada explicitamente para continuar.

Essas correções foram adicionadas após testes com navegadores e dispositivos diferentes.

---

# 🧹 Cancelamento de avaliações

Uma tentativa em andamento pode ser cancelada explicitamente.

Endpoint:

~~~http
DELETE /api/test/:attemptId
~~~

Quando uma prova é abandonada:

- a tentativa `IN_PROGRESS` é removida;
- o rascunho local é limpo;
- a aplicação volta para uma rota segura.

Isso evita acumular tentativas incompletas no banco apenas porque o usuário fechou ou abandonou o fluxo.

---

# 🎨 UX/UI e responsividade

A interface também foi utilizada para estudar comportamento em diferentes dispositivos.

Foram revisados:

- página inicial;
- login;
- seleção de idioma;
- preparação da avaliação;
- prova;
- revisão;
- resultado;
- dashboard do aluno;
- progresso;
- portal do professor;
- administração;
- perfil e configurações.

A navegação passou a utilizar a mesma estrutura funcional em diferentes breakpoints.

~~~text
Desktop
→ navegação superior

Mobile
→ navegação inferior adaptativa
~~~

A regra adotada foi:

> um recurso pode mudar de posição ou tamanho conforme o dispositivo, mas não deve desaparecer sem necessidade.

Foram testados cenários de:

- Desktop Chrome;
- Pixel 7 / Android;
- iPhone 13 / WebKit;
- safe-area;
- Safari;
- diferentes alturas e larguras;
- rolagem horizontal;
- botões de voltar;
- logout;
- seletor de idioma.

---

# 🌐 Idiomas

Idioma da interface:

~~~text
Português do Brasil
~~~

Avaliação disponível atualmente:

~~~text
Espanhol
~~~

Inglês e Francês aparecem apenas como possibilidades futuras.

---

# 🧠 Classificação utilizada

O projeto utiliza uma classificação de estudos inspirada nos níveis CEFR.

| Aproveitamento | Nível |
|---:|:---:|
| 0–20% | A1 |
| 21–40% | A2 |
| 41–60% | B1 |
| 61–80% | B2 |
| 81–95% | C1 |
| 96–100% | C2 |

> Essa classificação existe somente para funcionamento e estudo dentro do projeto.  
> Ela não representa certificação oficial.

---

# 🛠️ Tecnologias

## Banco de dados e dados

| Tecnologia | Uso |
|---|---|
| PostgreSQL 16 | Banco transacional e estruturas analíticas |
| Prisma 7 | Modelagem, migrations e acesso aos dados |
| SQL | Consultas, transformações, marts e laboratórios |
| Python 3.12 | Pipeline de Engenharia de Dados |
| psycopg | Comunicação Python ↔ PostgreSQL |
| Faker | Geração de dados sintéticos |
| dbt | Estudos de transformação |
| Apache Airflow | Estudos de orquestração |

## Backend

| Tecnologia | Uso |
|---|---|
| Node.js 22 | Runtime |
| Express 5 | API REST |
| TypeScript | Tipagem |
| Zod | Validação |
| bcryptjs | Hash de senhas |
| Helmet | Segurança HTTP |
| CORS | Controle de origem |

## Frontend

| Tecnologia | Uso |
|---|---|
| React 19 | Interface |
| TypeScript 5 | Tipagem |
| Vite 8 | Desenvolvimento e build |
| React Router 7 | Navegação |
| Zustand 5 | Estado da aplicação |
| Lucide React | Ícones |
| CSS responsivo | Design e breakpoints |

## Testes e entrega

| Tecnologia | Uso |
|---|---|
| Vitest | Testes unitários |
| Testing Library | Componentes |
| Supertest | API |
| Playwright | E2E |
| GitHub Actions | CI |
| Render | Backend e PostgreSQL |
| Vercel | Estudos de frontend/proxy |

---

# 🌐 Arquitetura de deploy

A arquitetura foi reorganizada para existir apenas uma fonte de verdade para dados e autenticação.

~~~text
Vercel
Frontend
   │
   │ /api
   ▼
Proxy
   │
   ▼
Render
Express API
   │
   ▼
PostgreSQL
~~~

O frontend não possui um segundo banco ou uma autenticação paralela.

O backend real permanece responsável pelas operações com PostgreSQL.

O Render utiliza a variável `PORT` disponibilizada pelo ambiente e o servidor escuta em:

~~~text
0.0.0.0:$PORT
~~~

A CI também testa o servidor utilizando a porta `10000`, simulando o comportamento esperado no Render.

---

# 🛡️ Administrador

A conta administrativa pode ser criada/garantida com:

~~~bash
npm run admin:ensure
~~~

Variáveis:

~~~env
ADMIN_EMAIL=administrador@adm.com
ADMIN_PASSWORD=
~~~

A senha não deve ser armazenada no código.

Em produção, `ADMIN_PASSWORD` deve ser configurada como segredo no provedor de hospedagem.

O seed também não cria automaticamente usuários demo com senhas públicas.

---

# 🧪 Testes automatizados

Com o crescimento do projeto, os testes passaram a ser importantes para evitar regressões.

## Testes de API

Cobrem exemplos como:

- autenticação;
- perfis;
- preferências;
- alteração de senha;
- professor;
- administrador;
- papéis;
- início de avaliação;
- finalização;
- cancelamento;
- CRUD administrativo.

## Playwright

Os testes E2E executam fluxos em:

~~~text
Desktop Chrome
Pixel 7
iPhone 13 / WebKit
~~~

Também existem regressões para:

- navegação responsiva;
- ações de voltar;
- logout;
- isolamento de sessões entre navegadores;
- administrador não herdado por outro navegador;
- invalidação da sessão privilegiada anterior;
- bloqueio de sessão privilegiada legada no localStorage;
- separação entre ADMIN e TEACHER.

---

# 🔁 CI

O GitHub Actions executa uma sequência semelhante a:

~~~text
PostgreSQL
   ↓
Instalação
   ↓
Prisma Client
   ↓
Migrations
   ↓
Seed
   ↓
Bootstrap de admin de teste
   ↓
Pipeline de dados
   ↓
Testes unitários
   ↓
Testes da API
   ↓
Build backend
   ↓
Build frontend
   ↓
Teste PORT 10000
   ↓
Playwright E2E
~~~

Isso permite usar o próprio projeto para estudar não apenas banco de dados, mas também integração entre dados, aplicação e entrega.

---

# 💻 Executando localmente

## Requisitos

- Node.js 22;
- npm;
- PostgreSQL;
- Python 3.12 para a camada de Engenharia de Dados.

Clone:

~~~bash
git clone git@github.com:denilson-dev/idiomas-pro.git
cd idiomas-pro
~~~

Instale:

~~~bash
npm install
~~~

Configure o ambiente:

~~~bash
cp .env.example .env
~~~

No Windows PowerShell:

~~~powershell
Copy-Item .env.example .env
~~~

Configure pelo menos:

~~~env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/idiomas_pro?schema=public"
PORT=3333
CLIENT_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3333/api
~~~

Depois:

~~~bash
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
~~~

Frontend:

~~~text
http://localhost:5173
~~~

Backend:

~~~text
http://localhost:3333
~~~

---

# 🧰 Scripts principais

| Comando | Uso |
|---|---|
| `npm run dev` | Frontend + backend |
| `npm run build` | Build completo |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:migrate` | Criar migration local |
| `npm run db:deploy` | Aplicar migrations |
| `npm run db:seed` | Popular dados base |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run admin:ensure` | Garantir administrador |
| `npm run data:init` | Criar arquitetura analítica |
| `npm run data:extract` | Ingestão incremental |
| `npm run data:transform` | Atualizar Warehouse e marts |
| `npm run data:quality` | Validar qualidade |
| `npm run data:run` | Executar pipeline completo |
| `npm run test:unit` | Testes unitários |
| `npm run test:api` | Testes da API |
| `npm run test:e2e` | Playwright |
| `npm run test:all` | Suíte completa |

---

# 🧭 Correções e evolução recente

Algumas das correções realizadas durante a evolução do projeto:

### Banco e backend

- persistência completa em PostgreSQL;
- modelagem com Prisma;
- migrations;
- índices;
- preferências em JSON;
- papéis `TEACHER` e `ADMIN`;
- CRUD administrativo;
- cancelamento de avaliação em andamento;
- separação de responsabilidades entre administrador e professor;
- proteção das rotas pedagógicas;
- administrador removido da lista de professores disponíveis para o aluno.

### Segurança

- senhas com bcrypt;
- administrador sem senha fixa no código;
- seed sem conta demo pública;
- validação de sessão no backend;
- sessões privilegiadas separadas das sessões do aluno;
- remoção de tokens privilegiados do `localStorage`;
- uso de `sessionStorage` para equipe;
- invalidação de sessão privilegiada anterior em novo login;
- bloqueio de acesso administrativo herdado entre contextos de navegador;
- permissões verificadas também pela API.

### Frontend e experiência

- nova arquitetura visual;
- navegação unificada;
- página inicial revisada;
- identidade Idiomas Pro;
- layout do aluno;
- tela de progresso;
- portal pedagógico;
- administração;
- perfil e preferências;
- desktop;
- Android;
- iPhone/WebKit;
- safe areas;
- ações de voltar e sair disponíveis conforme o contexto;
- seletor de idioma preservado em mobile.

### Deploy

- Render configurado para servir o backend;
- servidor preparado para `0.0.0.0:$PORT`;
- smoke test de porta na CI;
- Vercel sem backend paralelo;
- proxy para a API real;
- uma única fonte de verdade para autenticação e banco.

### Testes

- testes de componentes;
- testes de API;
- E2E;
- testes responsivos;
- testes de papéis;
- testes de cancelamento;
- testes de isolamento de sessão.

---

# 🚧 Limitações atuais

Este ainda é um projeto de estudos.

Alguns pontos que poderiam ser aprofundados em uma aplicação de produção:

- auditoria completa de alterações;
- RBAC mais granular;
- refresh tokens;
- MFA;
- rate limiting mais avançado;
- filas;
- backups automatizados;
- criptografia adicional;
- políticas de retenção;
- LGPD;
- governança de dados;
- catálogo de dados;
- lineage;
- monitoramento;
- alertas;
- gerenciamento de segredos mais completo;
- infraestrutura como código.

Esses pontos são possibilidades de estudo futuro, não funcionalidades que o projeto afirma possuir hoje.

---

# 📌 Próximos estudos com banco de dados

Algumas evoluções que fazem sentido para o objetivo deste repositório:

1. criar consultas SQL analíticas mais complexas;
2. comparar consultas com e sem índices;
3. estudar CTEs e Window Functions;
4. aprofundar `EXPLAIN ANALYZE`;
5. estudar locks e concorrência;
6. praticar transações e níveis de isolamento;
7. aprofundar particionamento;
8. implementar auditoria de mudanças;
9. estudar backup e restore;
10. criar novas dimensões e fatos;
11. aprofundar SCD Type 2;
12. adicionar testes de qualidade com dbt;
13. estudar CDC;
14. estudar mensageria e processamento assíncrono;
15. conectar os Data Marts a dashboards do Power BI.

---

# 👨‍💻 O que este repositório representa

Este repositório representa minha evolução durante os estudos.

A intenção não é afirmar experiência profissional com todas as tecnologias utilizadas.

O objetivo é mostrar que, durante o aprendizado, busquei ir além da teoria e construir um ambiente em que pudesse praticar:

~~~text
Modelagem
   ↓
PostgreSQL
   ↓
SQL
   ↓
Aplicação
   ↓
Dados transacionais
   ↓
ETL
   ↓
Data Warehouse
   ↓
Data Marts
   ↓
Qualidade
   ↓
Análise
~~~

A aplicação de idiomas é o contexto.

**Os dados são o principal objeto de estudo.**

---

## 📖 Forma de aprendizado

~~~text
Estudar
   ↓
Construir
   ↓
Gerar dados
   ↓
Consultar
   ↓
Encontrar problemas
   ↓
Corrigir
   ↓
Testar
   ↓
Analisar
   ↓
Aprender
   ↓
Evoluir
~~~

Esse é o objetivo do **Idiomas Pro**.
