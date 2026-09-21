# 🌍 Idiomas Pro

<div align="center">

### Projeto de estudos: aplicação web + Engenharia de Dados com PostgreSQL

O **Idiomas Pro** é um projeto criado para transformar estudos em prática.

A aplicação simula um fluxo de nivelamento de idiomas e, a partir dos dados gerados pelo próprio sistema, também possui uma camada de **Engenharia de Dados** com ingestão incremental, Data Warehouse, Data Marts, qualidade de dados e integração com ferramentas analíticas.

> **Importante:** este repositório é exclusivamente um projeto de estudos.  
> Não representa uma plataforma oficial de ensino, certificação de proficiência, produto comercial finalizado ou experiência profissional anterior.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)

</div>

---

## 📖 Sobre o projeto

O Idiomas Pro nasceu com uma ideia simples: em vez de estudar programação apenas com exercícios isolados, construir uma aplicação baseada em uma necessidade real e evoluí-la conforme novos assuntos fossem estudados.

A primeira etapa foi criar uma plataforma em que:

1. o aluno entra na aplicação;
2. escolhe o idioma disponível;
3. acessa como visitante ou usuário cadastrado;
4. seleciona um professor;
5. realiza uma avaliação;
6. responde questões de gramática, vocabulário e listening;
7. revisa as respostas;
8. recebe uma classificação de nível;
9. o professor consegue acompanhar as avaliações relacionadas ao seu acesso.

Depois, o projeto passou a ser usado também para estudar **o caminho percorrido pelos dados**.

Assim, os dados gerados pela própria aplicação passaram a alimentar uma arquitetura analítica com PostgreSQL.

---

## 🎯 Objetivo

O principal objetivo é **aprender construindo**.

O projeto reúne estudos de:

- desenvolvimento frontend;
- desenvolvimento backend;
- APIs REST;
- modelagem de banco de dados;
- PostgreSQL;
- autenticação;
- segurança básica;
- responsividade;
- testes automatizados;
- CI/CD;
- deploy;
- Python para Engenharia de Dados;
- ETL/ELT;
- cargas incrementais;
- Data Warehouse;
- modelagem dimensional;
- qualidade de dados;
- observabilidade de pipelines;
- Data Marts;
- dbt;
- Apache Airflow;
- análise de performance no PostgreSQL;
- Power BI e Metabase.

---

# 🏗️ Arquitetura geral

Hoje o projeto possui duas partes que trabalham sobre os mesmos dados.

~~~text
                    IDIOMAS PRO

Aluno / Professor
       │
       ▼
┌─────────────────────────────┐
│ React + TypeScript          │
│ Frontend                    │
└──────────────┬──────────────┘
               │
               │ API REST
               ▼
┌─────────────────────────────┐
│ Node.js + Express           │
│ Backend                     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Prisma ORM                  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ PostgreSQL                  │
│ schema public - OLTP        │
└──────────────┬──────────────┘
               │
               │ Pipeline incremental
               ▼
┌─────────────────────────────┐
│ Python + psycopg            │
└──────────────┬──────────────┘
               │
               ▼
       raw → staging
               │
               ▼
           warehouse
               │
               ▼
             marts
               │
        ┌──────┴──────┐
        ▼             ▼
     Power BI      Metabase
~~~

O banco operacional continua responsável pela aplicação.

A camada analítica foi adicionada separadamente para estudar Engenharia de Dados sem misturar as responsabilidades do sistema transacional.

---

# 🧭 Evolução do projeto

## 1. Frontend

A primeira versão foi construída com:

- React;
- TypeScript;
- Vite;
- componentes reutilizáveis;
- navegação entre páginas;
- gerenciamento de estado.

O objetivo inicial foi entender como estruturar uma aplicação maior do que uma página isolada.

---

## 2. Fluxo do aluno

Foram desenvolvidas telas para:

- página inicial;
- escolha do idioma;
- identificação;
- cadastro;
- login;
- execução da avaliação;
- progresso;
- revisão;
- resultado;
- histórico.

Essa etapa trouxe desafios de navegação, persistência de estado e experiência do usuário.

---

## 3. Backend

O projeto evoluiu para uma arquitetura full stack utilizando:

- Node.js;
- Express;
- TypeScript;
- API REST;
- validação com Zod;
- autenticação;
- sessões;
- tratamento de erros.

---

## 4. PostgreSQL e Prisma

Os dados passaram a ser persistidos em PostgreSQL.

O Prisma é utilizado para:

- modelagem;
- acesso aos dados;
- migrations;
- geração do Prisma Client;
- seed do banco.

---

## 5. Autenticação

Existem fluxos distintos para:

- visitante;
- aluno cadastrado;
- professor.

As senhas são armazenadas com hash e as sessões ficam registradas no banco.

---

## 6. Portal do professor

O professor possui uma área separada da experiência do aluno.

Entre as funcionalidades atuais estão:

- autenticação própria;
- visualização das avaliações;
- consulta aos alunos;
- detalhes das tentativas;
- pesquisa;
- edição de dados administrativos;
- exclusão de avaliação;
- limpeza das avaliações vinculadas ao próprio professor.

---

## 7. Listening e Text-to-Speech

O projeto possui questões de listening.

O backend disponibiliza uma rota para áudio:

~~~http
GET /api/tts/:questionId
~~~

O estudo dessa funcionalidade envolveu:

- Google Cloud Text-to-Speech;
- fallback de áudio;
- arquivos locais;
- carregamento;
- preload;
- cache;
- diferenças entre navegadores;
- comportamento em dispositivos móveis.

---

## 8. Responsividade

A interface foi ajustada pensando em:

- desktop;
- Android;
- iPhone;
- Safari/WebKit;
- telas estreitas;
- telas de pouca altura;
- safe areas;
- teclado virtual;
- scroll;
- players de áudio;
- botões e navegação.

---

## 9. Testes

Com o crescimento da aplicação, foram adicionados testes automatizados para reduzir regressões.

O projeto utiliza:

- Vitest;
- Testing Library;
- Supertest;
- Playwright.

---

## 10. Engenharia de Dados

A etapa mais recente foi transformar os dados produzidos pela aplicação em uma fonte para estudos de Engenharia de Dados.

Foram adicionados:

- pipeline incremental em Python;
- controle de watermarks;
- camada raw;
- camada staging;
- Data Warehouse dimensional;
- Data Marts;
- qualidade de dados;
- histórico de execuções;
- dados sintéticos;
- dbt;
- DAG de Airflow;
- laboratórios de performance;
- integração com BI.

---

# 👨‍🎓 Funcionalidades do aluno

O aluno pode:

- acessar como visitante;
- criar uma conta;
- fazer login;
- escolher o idioma da avaliação;
- informar nome;
- informar e-mail opcional;
- selecionar um professor;
- iniciar uma avaliação;
- responder questões de gramática;
- responder questões de vocabulário;
- responder questões de listening;
- acompanhar o progresso;
- revisar respostas;
- finalizar a avaliação;
- visualizar nota;
- visualizar nível;
- visualizar o desempenho por habilidade;
- consultar o histórico.

---

# 👩‍🏫 Funcionalidades do professor

O portal do professor permite:

- login separado do aluno;
- primeiro acesso pedagógico;
- consulta ao dashboard;
- visualização de avaliações;
- consulta aos alunos;
- abertura dos detalhes de uma tentativa;
- pesquisa de registros;
- edição de dados;
- exclusão de uma avaliação;
- limpeza das avaliações vinculadas ao professor.

O backend verifica o professor autenticado antes de permitir operações sobre os registros.

## 🛡️ Administrador

O modelo de professores possui dois papéis:

~~~text
TEACHER
ADMIN
~~~

Professores comuns continuam com acesso apenas às funcionalidades pedagógicas vinculadas à própria conta.

O administrador possui uma área exclusiva em:

~~~text
/professor/administracao
~~~

Nela é possível:

- cadastrar usuários;
- editar usuários;
- redefinir senha de usuários;
- remover usuários;
- cadastrar professores;
- editar professores;
- redefinir senha de professores;
- ativar ou desativar professores;
- remover professores.

O papel `ADMIN` não pode ser atribuído pela interface. A conta administrativa também não pode ser removida nem desativada pela própria tela de administração.

Para garantir a conta administrativa no banco local:

~~~bash
npm run admin:ensure
~~~

Em desenvolvimento, quando `ADMIN_PASSWORD` não estiver configurada, o script utiliza:

~~~text
E-mail: administrador@adm.com
Senha: admin123
~~~

Em produção, configure:

~~~env
ADMIN_EMAIL=administrador@adm.com
ADMIN_PASSWORD=uma-senha-segura
~~~

> A senha `admin123` existe apenas como conveniência para o ambiente de estudos. Não utilize essa senha em um ambiente público.

---

# 🌐 Idiomas

### Interface

Português do Brasil.

### Avaliação disponível atualmente

Espanhol.

Inglês e Francês aparecem como possibilidades futuras de expansão.

---

# 🧠 Níveis A1 a C2

O projeto utiliza uma classificação inspirada nos níveis CEFR.

| Aproveitamento | Nível |
|---:|:---:|
| 0–20% | A1 |
| 21–40% | A2 |
| 41–60% | B1 |
| 61–80% | B2 |
| 81–95% | C1 |
| 96–100% | C2 |

> Essa regra foi criada para fins de estudo e funcionamento interno da aplicação.  
> O resultado não representa uma certificação oficial de proficiência.

---

# 🛠️ Tecnologias

## Frontend

| Tecnologia | Uso |
|---|---|
| React 19 | Construção da interface |
| React DOM | Renderização da aplicação |
| TypeScript 5 | Tipagem do código |
| Vite 8 | Desenvolvimento e build |
| React Router 7 | Rotas do frontend |
| Zustand 5 | Estado global |
| Tailwind CSS 4 | Estilização e responsividade |
| Lucide React | Ícones |

## Backend

| Tecnologia | Uso |
|---|---|
| Node.js 22 | Ambiente de execução |
| Express 5 | API REST |
| TypeScript | Backend tipado |
| Zod 4 | Validação |
| Helmet | Cabeçalhos de segurança |
| CORS | Controle de origem |
| bcryptjs | Hash de senhas |
| dotenv | Variáveis de ambiente |

## Banco de dados

| Tecnologia | Uso |
|---|---|
| PostgreSQL 16 | Banco operacional e analítico |
| Prisma 7 | ORM |
| pg | Driver PostgreSQL |
| Docker Compose | PostgreSQL local |

## Engenharia de Dados

| Tecnologia | Uso |
|---|---|
| Python 3.12 | Pipeline de dados |
| psycopg | Comunicação com PostgreSQL |
| Faker | Dados sintéticos |
| dbt | Estudos de transformação e testes |
| Apache Airflow | Exemplo de orquestração |
| SQL | Transformações e modelagem |
| PostgreSQL Materialized Views | Data Marts |
| Power BI | Possível consumo analítico |
| Metabase | Visualização local opcional |

## Qualidade e entrega

| Tecnologia | Uso |
|---|---|
| Vitest | Testes unitários |
| Testing Library | Testes de componentes |
| Supertest | Testes da API |
| Playwright | Testes end-to-end |
| GitHub Actions | CI |
| Vercel | Estudos de deploy |
| Render | Estudos de deploy full stack |

---

# 🗄️ Banco operacional

A aplicação utiliza o schema PostgreSQL **public** como camada transacional.

As principais entidades são:

### User

Conta do aluno.

### Session

Sessão autenticada ou anônima.

### Teacher

Conta do professor.

### TeacherSession

Sessão exclusiva do professor.

### Question

Questões da avaliação.

### TestAttempt

Tentativa de avaliação.

### AttemptAnswer

Resposta individual de uma questão.

---

# 🏭 Engenharia de Dados com PostgreSQL

A implementação está dentro da pasta:

~~~text
data-engineering/
~~~

A arquitetura utiliza diferentes schemas no PostgreSQL.

| Schema | Responsabilidade |
|---|---|
| public | Sistema transacional da aplicação |
| meta | Controle das execuções e watermarks |
| raw | Dados ingeridos da origem |
| staging | Limpeza e padronização |
| warehouse | Modelo dimensional |
| marts | Dados preparados para análise |
| data_quality | Validações e registros rejeitados |

---

## 🔄 Pipeline incremental

O pipeline principal está em Python e utiliza psycopg.

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

Cada conjunto de dados possui um watermark registrado em:

~~~text
meta.pipeline_control
~~~

Assim, uma nova execução pode buscar somente registros novos ou atualizados.

---

## 📊 Observabilidade do pipeline

As execuções são registradas em:

~~~text
meta.pipeline_runs
~~~

Entre as informações armazenadas estão:

- identificação da execução;
- pipeline;
- horário de início;
- horário de término;
- registros lidos;
- registros escritos;
- registros rejeitados;
- status;
- mensagem de erro.

Exemplo:

~~~sql
SELECT *
FROM meta.pipeline_runs
ORDER BY started_at DESC;
~~~

---

# ⭐ Data Warehouse

O Warehouse utiliza uma modelagem dimensional.

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

Arquitetura simplificada:

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


dim_question ─── fact_answer
                      │
                 fact_test_attempt
~~~

---

# 🕒 SCD Type 2

A dimensão de professores possui uma implementação de **Slowly Changing Dimension Type 2**.

Quando informações do professor mudam, a versão anterior pode ser encerrada e uma nova versão passa a representar o estado atual.

Campos utilizados:

~~~text
valid_from
valid_to
is_current
hashdiff
~~~

Essa implementação foi criada com finalidade educacional para estudar histórico em Data Warehouses.

---

# 🥇 Data Marts

O projeto cria Materialized Views para consumo analítico.

### Distribuição CEFR

~~~text
marts.cefr_distribution
~~~

Permite analisar a quantidade de avaliações por nível e a média de pontuação.

### Desempenho por professor

~~~text
marts.teacher_performance
~~~

Inclui informações como:

- quantidade de alunos;
- avaliações;
- média;
- distribuição A1–C2.

### Análise das questões

~~~text
marts.question_analysis
~~~

Permite observar:

- quantidade de respostas;
- acertos;
- erros;
- taxa de acerto.

### Evolução do aluno

~~~text
marts.student_progress
~~~

Permite analisar resultados anteriores e mudanças de nível ao longo das avaliações.

---

# ✅ Qualidade de dados

O projeto possui uma camada específica para estudar Data Quality.

Algumas validações:

- pontuação fora de 0–100;
- nível CEFR inválido;
- resposta sem avaliação correspondente;
- resposta sem questão correspondente.

Problemas encontrados ficam disponíveis em:

~~~text
data_quality.current_issues
~~~

Também existe:

~~~text
data_quality.rejected_records
~~~

para registrar rejeições associadas às execuções.

---

# 🔒 Privacidade na camada analítica

O pipeline não leva hashes de senha nem tokens de sessão para o Warehouse.

Na camada de staging, endereços de e-mail utilizados para análise são convertidos em hash.

> A camada raw pode conter os campos recebidos da origem e deve ser tratada como uma área de acesso restrito. Em um ambiente real, controles de acesso, criptografia, retenção, governança e LGPD precisariam ser aprofundados.

---

# 🧪 Dados sintéticos

Para estudar volume sem depender de dados reais, o projeto possui um gerador com Faker.

Exemplo:

~~~bash
python data-engineering/synthetic/generate.py   --students 5000   --teachers 50   --questions 180   --attempts 100000   --answers-per-attempt 18
~~~

Os dados recebem:

~~~text
source_system = synthetic
~~~

Isso permite diferenciá-los claramente dos dados originados pela aplicação.

> Os dados sintéticos existem somente para testes, consultas, índices, performance e aprendizado. Eles não representam usuários reais.

---

# ⚡ PostgreSQL e performance

Existem laboratórios isolados para estudar:

- índices;
- planos de execução;
- EXPLAIN;
- EXPLAIN ANALYZE;
- buffers;
- estatísticas;
- particionamento por data;
- partition pruning.

Arquivos:

~~~text
data-engineering/sql/labs/001_partitioning.sql
data-engineering/sql/labs/002_performance.sql
~~~

Exemplo:

~~~sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM warehouse.fact_answer
WHERE question_key = 10
  AND is_correct = false;
~~~

Os laboratórios são educacionais e não são executados automaticamente pelo pipeline principal.

---

# 🧱 dbt

Existe um projeto dbt em:

~~~text
data-engineering/dbt/
~~~

Ele foi adicionado para estudar:

- sources;
- models;
- ref;
- testes;
- staging;
- marts;
- organização das transformações.

Exemplo de execução:

~~~bash
dbt debug --project-dir data-engineering/dbt
dbt build --project-dir data-engineering/dbt
~~~

O dbt é uma trilha complementar de estudos. O pipeline principal continua funcionando com Python, SQL e PostgreSQL.

---

# ⏱️ Apache Airflow

Existe uma DAG de exemplo em:

~~~text
data-engineering/airflow/dags/idiomas_pro_analytics.py
~~~

Fluxo proposto:

~~~text
init
  ↓
extract
  ↓
transform
  ↓
quality
~~~

O agendamento de exemplo é diário.

O Airflow não é necessário para executar a aplicação principal e foi incluído como estudo de orquestração.

---

# 📈 Power BI e Metabase

Os Data Marts foram preparados para consumo por ferramentas analíticas.

## Metabase

Existe um Docker Compose opcional:

~~~bash
docker compose -f docker-compose.analytics.yml up -d
~~~

Por padrão:

~~~text
http://localhost:3001
~~~

## Power BI

Uma abordagem possível é conectar diretamente ao PostgreSQL e utilizar preferencialmente as estruturas do schema **marts**.

Exemplos de análises:

- total de avaliações;
- média de pontuação;
- distribuição CEFR;
- desempenho por professor;
- taxa de acerto por questão;
- evolução dos alunos;
- desempenho por categoria.

---

# 🧪 Testes automatizados

## Testes unitários

Cobrem regras isoladas, incluindo lógica de classificação e desempenho.

## Testes de componentes

Validam partes da interface React.

## Testes da API

Cobrem fluxos como:

- autenticação;
- sessão;
- criação de avaliação;
- envio de respostas;
- resultados;
- portal do professor;
- edição;
- exclusão;
- isolamento entre professores.

## End-to-end

O Playwright testa a aplicação simulando diferentes ambientes.

Configurações atuais:

- Desktop Chrome;
- Android / Pixel 7;
- iPhone 13 / WebKit.

---

# ⚙️ Integração contínua

O GitHub Actions executa uma pipeline com:

1. PostgreSQL 16;
2. Node.js 22;
3. Python 3.12;
4. instalação das dependências;
5. geração do Prisma Client;
6. aplicação das migrations;
7. seed;
8. validação dos arquivos Python;
9. execução do pipeline analítico;
10. Data Quality;
11. testes unitários;
12. testes de componentes;
13. testes da API;
14. build do backend;
15. build do frontend;
16. instalação dos navegadores Playwright;
17. testes end-to-end.

A ideia é detectar regressões tanto na aplicação quanto na camada de dados.

---

# 🚧 Principais desafios estudados

Durante a evolução do projeto, alguns dos principais desafios foram:

### Frontend e backend

Entender a comunicação entre telas, API e banco de dados.

### Autenticação

Separar os fluxos de visitante, aluno e professor.

### Segurança da avaliação

Evitar que respostas corretas e informações internas da questão fossem expostas durante a prova.

### Responsividade

Corrigir diferenças de comportamento em desktop, Android, iPhone, Safari e WebKit.

### Áudio

Trabalhar com carregamento, reprodução, TTS, fallback e diferenças entre navegadores.

### Persistência

Modelar usuários, professores, sessões, questões, avaliações e respostas.

### Deploy

Entender diferenças entre execução local, Vercel, Render e banco em cloud.

### Pipeline incremental

Evitar a necessidade de recarregar todos os registros em todas as execuções.

### Modelagem analítica

Separar banco transacional, raw, staging, Warehouse e marts.

### Histórico

Estudar SCD Type 2 para preservar mudanças de dimensão.

### Data Quality

Criar verificações antes do consumo analítico.

### Performance

Analisar índices, planos de execução e particionamento no PostgreSQL.

### Testes e regressões

Automatizar verificações conforme o projeto foi crescendo.

---

# 📂 Estrutura do repositório

~~~text
idiomas-pro/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── test/
│
├── server/
│   └── src/
│       ├── controllers/
│       ├── lib/
│       ├── routes/
│       ├── services/
│       └── tests/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── data-engineering/
│   ├── airflow/
│   │   └── dags/
│   ├── dbt/
│   │   └── models/
│   ├── sql/
│   │   └── labs/
│   ├── synthetic/
│   ├── pipeline.py
│   ├── requirements.txt
│   └── README.md
│
├── e2e/
├── api/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── docker-compose.analytics.yml
├── playwright.config.ts
├── render.yaml
├── vercel.json
├── package.json
└── README.md
~~~

---

# 🚀 Executando localmente

## Pré-requisitos

Para a aplicação:

- Node.js 22+
- npm
- PostgreSQL 16 ou compatível
- Docker opcional

Para a parte de Engenharia de Dados:

- Python 3.12 recomendado
- pip

---

## 1. Clone

~~~bash
git clone https://github.com/denilson-dev/idiomas-pro.git
cd idiomas-pro
~~~

---

## 2. Instale as dependências Node

~~~bash
npm install
~~~

O projeto utiliza npm workspaces para organizar frontend e backend.

---

## 3. Configure o ambiente

Linux/macOS:

~~~bash
cp .env.example .env
~~~

Windows PowerShell:

~~~powershell
Copy-Item .env.example .env
~~~

Exemplo:

~~~env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/idiomas_pro?schema=public"
PORT=3333
CLIENT_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3333/api

GOOGLE_TTS_API_KEY=
GOOGLE_TTS_VOICE=es-ES-Chirp3-HD-Zephyr
~~~

As variáveis relacionadas ao TTS são opcionais.

> Nunca coloque senhas, tokens ou chaves reais em arquivos versionados.

---

## 4. Suba o PostgreSQL

~~~bash
docker compose up -d
~~~

---

## 5. Gere o Prisma Client

~~~bash
npm run db:generate
~~~

---

## 6. Aplique as migrations

~~~bash
npm run db:deploy
~~~

---

## 7. Execute o seed

~~~bash
npm run db:seed
~~~

---

## 8. Inicie frontend e backend

~~~bash
npm run dev
~~~

Por padrão:

~~~text
Frontend: http://localhost:5173
Backend:  http://localhost:3333
Health:   http://localhost:3333/api/health
~~~

---

# 🏭 Executando a camada de Engenharia de Dados

## 1. Crie um ambiente virtual

~~~bash
python -m venv .venv
~~~

### Windows PowerShell

~~~powershell
.\.venv\Scripts\Activate.ps1
~~~

### Linux/macOS

~~~bash
source .venv/bin/activate
~~~

---

## 2. Instale as dependências

~~~bash
pip install -r data-engineering/requirements.txt
~~~

---

## 3. Inicialize a arquitetura analítica

~~~bash
npm run data:init
~~~

---

## 4. Execute a ingestão

~~~bash
npm run data:extract
~~~

---

## 5. Atualize Warehouse e Data Marts

~~~bash
npm run data:transform
~~~

---

## 6. Execute Data Quality

~~~bash
npm run data:quality
~~~

---

## Executar tudo

~~~bash
npm run data:run
~~~

---

# 📜 Principais comandos

| Comando | Função |
|---|---|
| npm run dev | Frontend + backend |
| npm run build | Build completo |
| npm start | Backend compilado |
| npm run db:generate | Gera Prisma Client |
| npm run db:deploy | Aplica migrations |
| npm run db:migrate | Migration de desenvolvimento |
| npm run db:seed | Seed |
| npm run db:studio | Prisma Studio |
| npm run test:unit | Testes unitários/componentes |
| npm run test:api | Integração da API |
| npm run test:e2e | Testes E2E |
| npm run test:all | Todas as suítes |
| npm run data:init | Cria arquitetura analítica |
| npm run data:extract | Ingestão incremental |
| npm run data:transform | Warehouse + marts |
| npm run data:quality | Data Quality |
| npm run data:run | Pipeline analítico completo |
| npm run data:synthetic | Gera dataset sintético padrão |
| npm run admin:ensure | Aplica migrations e garante a conta administrativa |

---

# 🔌 Principais rotas da API

## Aluno

~~~http
POST /api/auth/anonymous
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
~~~

## Professores

~~~http
GET /api/teachers
~~~

## Autenticação do professor

~~~http
GET  /api/teacher/auth/bootstrap-status
POST /api/teacher/auth/bootstrap
POST /api/teacher/auth/login
GET  /api/teacher/auth/me
POST /api/teacher/auth/logout
~~~

## Painel do professor

~~~http
GET    /api/teacher/dashboard
DELETE /api/teacher/attempts
GET    /api/teacher/attempts/:attemptId
PATCH  /api/teacher/attempts/:attemptId
DELETE /api/teacher/attempts/:attemptId
~~~

## Avaliação

~~~http
POST /api/test/start
POST /api/test/:attemptId/submit
~~~

## Resultados

~~~http
GET /api/results/history
GET /api/results/:attemptId
~~~

## Listening

~~~http
GET /api/tts/:questionId
~~~

---

# ☁️ Deploy

O repositório possui configurações usadas durante estudos de deploy em:

- Vercel;
- Render.

O objetivo foi compreender:

- build em ambiente cloud;
- variáveis de ambiente;
- rotas da API;
- PostgreSQL remoto;
- migrations;
- Prisma Client;
- arquivos estáticos;
- diferenças entre desenvolvimento e produção.

A presença dessas configurações faz parte do histórico de aprendizado do projeto.

---

# 📚 Documentação adicional

A parte específica de Engenharia de Dados possui documentação própria:

~~~text
data-engineering/README.md
~~~

Ela contém detalhes sobre:

- schemas;
- pipeline;
- Data Warehouse;
- Data Marts;
- dados sintéticos;
- dbt;
- Airflow;
- Metabase;
- Power BI;
- performance;
- privacidade.

---

# 🔭 Possíveis próximos estudos

Algumas evoluções possíveis:

- ampliar os idiomas disponíveis;
- ampliar o banco de questões;
- criar turmas;
- adicionar relatórios pedagógicos;
- exportar resultados;
- estudar CDC;
- estudar filas e processamento assíncrono;
- implementar uma estratégia mais robusta de incrementalidade para registros mutáveis;
- aprofundar dbt;
- executar Airflow em ambiente containerizado;
- adicionar testes específicos do pipeline;
- estudar Great Expectations ou Soda;
- implementar métricas de SLA/SLO do pipeline;
- estudar observabilidade com Prometheus/Grafana;
- experimentar PostgreSQL logical replication;
- estudar armazenamento em objeto;
- criar uma camada lake/lakehouse;
- explorar Spark ou Databricks em uma evolução futura;
- conectar os marts a um dashboard completo no Power BI;
- estudar governança, catálogo, lineage e LGPD.

---

# ⚠️ Limitações

Como este é um projeto de estudos:

- não é uma plataforma oficial de certificação;
- não substitui uma avaliação pedagógica profissional;
- não possui garantia de disponibilidade;
- algumas integrações dependem de serviços externos;
- dbt e Airflow são trilhas complementares e não são necessários para o funcionamento principal;
- os laboratórios de escala foram criados para aprendizado e não significam que a aplicação atual necessite dessa complexidade;
- a arquitetura pode mudar conforme novos conceitos forem estudados.

---

# 👨‍💻 O que este repositório representa

Este repositório representa um processo de aprendizado através da prática.

A intenção não é afirmar experiência profissional com todas as tecnologias presentes.

O objetivo é registrar o contato prático com diferentes partes do ciclo de software e dados:

~~~text
Necessidade
    ↓
Aplicação
    ↓
Geração de dados
    ↓
PostgreSQL
    ↓
Pipeline
    ↓
Tratamento
    ↓
Data Warehouse
    ↓
Data Marts
    ↓
Análise
    ↓
Aprendizado
~~~

---

<div align="center">

### 📚 Projeto criado para estudar, praticar e documentar evolução em desenvolvimento, Ciência de Dados e Engenharia de Dados.

</div>
