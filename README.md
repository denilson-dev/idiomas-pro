# 🌍 Idiomas Pro — Nivelamento de Idiomas

<div align="center">

### Projeto de estudos full stack

Aplicação desenvolvida para praticar, na prática, conceitos de **frontend, backend, banco de dados, APIs, autenticação, UX/UI, testes, CI/CD e deploy**.

> Este repositório é **exclusivamente um projeto de estudos**.  
> Não representa um sistema oficial de escola, certificação de proficiência, produto comercial finalizado ou experiência profissional anterior.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)

</div>

---

## 📌 O que é este projeto?

O **Idiomas Pro** começou como uma forma de transformar estudos de programação em uma aplicação completa.

Em vez de praticar apenas partes isoladas, a ideia foi montar um fluxo real de uma plataforma de nivelamento de idiomas:

1. o aluno entra na aplicação;
2. escolhe o idioma disponível;
3. identifica-se ou acessa como visitante;
4. seleciona um professor;
5. realiza uma avaliação;
6. responde questões de gramática, vocabulário e listening;
7. revisa as respostas;
8. recebe um resultado de nível;
9. o professor consegue acompanhar as avaliações vinculadas ao seu acesso.

O objetivo principal do projeto é **aprender construindo**.

---

## 🎯 Objetivo de aprendizagem

Este projeto foi usado para estudar e praticar:

- criação de interfaces com React;
- organização de uma aplicação com TypeScript;
- rotas no frontend;
- estado global;
- criação de APIs REST;
- backend com Node.js e Express;
- banco de dados PostgreSQL;
- modelagem de dados;
- Prisma ORM;
- migrations e seed;
- autenticação e sessões;
- hash de senhas;
- validação de dados;
- separação entre aluno e professor;
- segurança básica de API;
- integração com Text-to-Speech;
- responsividade para desktop e celular;
- comportamento em Android e iPhone;
- testes automatizados;
- integração contínua;
- deploy em ambiente cloud.

---

# 🧭 Como o projeto evoluiu

O histórico do repositório mostra uma evolução gradual. Cada etapa trouxe um problema novo para estudar e resolver.

## 1. Estrutura inicial

A primeira etapa foi criar a base da aplicação:

- React;
- TypeScript;
- Vite;
- páginas do fluxo de nivelamento;
- componentes reutilizáveis;
- navegação entre telas.

### Aprendizado

Entender como organizar um projeto frontend maior do que uma página única.

---

## 2. Fluxo completo do aluno

Depois foram adicionados:

- tela inicial;
- escolha de idioma;
- identificação do aluno;
- tela de teste;
- questões;
- progresso;
- revisão;
- resultado;
- histórico.

### Aprendizado

Manter dados durante várias telas e controlar corretamente o estado da avaliação.

---

## 3. Backend e banco de dados

O projeto deixou de depender apenas do navegador e passou a utilizar:

- Node.js;
- Express;
- PostgreSQL;
- Prisma;
- API REST;
- migrations;
- seed;
- persistência de usuários, sessões, questões e resultados.

### Aprendizado

Separar frontend, backend e banco de dados e fazer essas três partes trabalharem juntas.

---

## 4. Autenticação

Foram criados fluxos diferentes para:

- aluno visitante;
- aluno com conta;
- professor.

As senhas são armazenadas com hash e as sessões são persistidas no banco.

### Aprendizado

Autenticação não é apenas criar uma tela de login. Foi necessário estudar:

- sessão;
- token;
- expiração;
- rotas protegidas;
- identificação do usuário;
- separação de permissões.

---

## 5. Portal do professor

O projeto ganhou uma área própria para professores.

O professor pode:

- fazer login;
- visualizar avaliações;
- consultar alunos;
- abrir detalhes de uma avaliação;
- editar nome e e-mail vinculados ao registro;
- excluir uma avaliação;
- limpar as avaliações vinculadas ao próprio acesso.

### Aprendizado

Criar permissões diferentes e garantir que um professor não manipule dados pertencentes a outro professor.

---

## 6. Listening e geração de áudio

As questões de listening passaram por várias abordagens até chegar à estrutura atual.

O backend possui uma rota específica:

```http
GET /api/tts/:questionId
```

A aplicação pode utilizar:

1. Google Cloud Text-to-Speech;
2. um fallback externo;
3. arquivos MP3 locais.

### Aprendizado

Áudio na web envolve vários detalhes, principalmente em navegadores móveis:

- carregamento;
- reprodução;
- preload;
- cache;
- falhas de rede;
- comportamento do Safari;
- alternativas quando um serviço externo não responde.

---

## 7. Responsividade e experiência mobile

Grande parte da evolução do projeto envolveu ajustes para:

- desktop;
- Android;
- iPhone;
- Safari/WebKit;
- telas estreitas;
- telas com pouca altura;
- teclado virtual;
- safe areas;
- scroll;
- botões fixos;
- componentes de áudio.

Também foram criadas bandeiras em SVG para evitar diferenças visuais entre sistemas operacionais.

### Aprendizado

Uma tela que funciona no desktop não necessariamente funciona bem no celular.

---

## 8. Testes automatizados

O projeto passou a utilizar:

- Vitest;
- Testing Library;
- Supertest;
- Playwright.

Os testes cobrem diferentes camadas da aplicação.

### Aprendizado

Testar apenas manualmente começou a ficar difícil conforme o projeto cresceu. Os testes automatizados ajudam a detectar regressões depois de alterações.

---

## 9. CI e deploy

Também foram estudadas configurações para:

- GitHub Actions;
- Vercel;
- Render;
- PostgreSQL em cloud;
- variáveis de ambiente;
- build de frontend e backend.

O repositório ainda mantém arquivos relacionados a Vercel e Render porque os dois ambientes fizeram parte do processo de aprendizagem.

### Aprendizado

Um projeto funcionar localmente não significa que ele funcionará automaticamente em produção.

Foi necessário lidar com:

- comandos de build;
- variáveis de ambiente;
- banco remoto;
- geração do Prisma Client;
- migrations;
- caminhos de API;
- arquivos estáticos;
- diferenças entre ambiente local e cloud.

---

# 🧩 Funcionalidades atuais

## 👨‍🎓 Aluno

O fluxo atual permite:

- entrar como visitante;
- criar conta;
- fazer login;
- escolher o idioma da avaliação;
- informar nome;
- informar e-mail opcional;
- selecionar um professor;
- iniciar a prova;
- responder questões de gramática;
- responder questões de vocabulário;
- responder questões de listening;
- acompanhar o progresso;
- revisar respostas;
- finalizar a avaliação;
- visualizar nota;
- visualizar nível;
- visualizar desempenho por habilidade;
- consultar histórico de avaliações.

---

## 👩‍🏫 Professor

O portal do professor permite:

- autenticação separada;
- visualizar quantidade de avaliações;
- visualizar alunos;
- acompanhar resultados;
- abrir detalhes de uma prova;
- pesquisar registros;
- editar dados administrativos;
- excluir uma avaliação;
- limpar avaliações vinculadas ao próprio professor.

---

# 🌐 Idiomas

## Interface

A interface principal está em:

```text
Português do Brasil
```

## Avaliação disponível

Atualmente:

```text
Espanhol
```

Inglês e Francês aparecem como possibilidades de evolução do projeto.

---

# 🧠 Sobre os níveis A1 a C2

O projeto utiliza níveis inspirados no CEFR:

| Aproveitamento | Nível |
|---:|:---:|
| 0–20% | A1 |
| 21–40% | A2 |
| 41–60% | B1 |
| 61–80% | B2 |
| 81–95% | C1 |
| 96–100% | C2 |

> Essa regra foi criada para fins de estudo.  
> O resultado da aplicação **não é uma certificação oficial de proficiência**.

---

# 🛠️ Tecnologias utilizadas

A tabela abaixo explica de forma simples o papel de cada tecnologia.

| Tecnologia | Uso no projeto |
|---|---|
| React 19 | Construção das telas e componentes |
| React DOM | Renderização da interface no navegador |
| TypeScript | Tipagem e organização do código |
| Vite 8 | Ambiente de desenvolvimento e build do frontend |
| React Router | Navegação entre páginas |
| Zustand | Estado global da aplicação |
| Tailwind CSS 4 | Estilização e responsividade |
| Lucide React | Ícones da interface |
| Node.js 22 | Ambiente de execução do backend |
| Express 5 | Criação da API REST |
| Zod 4 | Validação de dados recebidos pela API |
| Helmet | Cabeçalhos de segurança HTTP |
| CORS | Controle de comunicação entre origens |
| bcryptjs | Hash de senhas |
| PostgreSQL | Banco de dados relacional |
| Prisma 7 | ORM e acesso ao banco |
| pg | Driver PostgreSQL |
| Docker Compose | Banco PostgreSQL local para desenvolvimento |
| Google Cloud TTS | Geração de áudio para listening |
| Vitest | Testes unitários |
| Testing Library | Testes de componentes React |
| Supertest | Testes das rotas da API |
| Playwright | Testes end-to-end em navegador |
| GitHub Actions | Pipeline automatizada de testes e build |
| Vercel | Ambiente estudado para deploy |
| Render | Ambiente estudado para deploy full stack |

---

# 🏗️ Arquitetura atual

```text
Aluno / Professor
       │
       ▼
┌───────────────────────┐
│ React + TypeScript    │
│ Frontend              │
└──────────┬────────────┘
           │
           │ /api
           ▼
┌───────────────────────┐
│ Node.js + Express     │
│ Backend               │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ Prisma ORM            │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ PostgreSQL            │
└───────────────────────┘

Listening
    │
    └── TTS externo + fallback local
```

---

# 🗃️ Principais dados armazenados

O banco possui entidades para:

### User

Conta do aluno.

### Session

Sessão do aluno, autenticado ou visitante.

### Teacher

Conta do professor.

### TeacherSession

Sessão exclusiva do professor.

### Question

Questão da avaliação.

Armazena informações como:

- enunciado;
- alternativas;
- resposta correta;
- categoria;
- nível interno;
- mídia.

### TestAttempt

Representa uma tentativa de avaliação.

### AttemptAnswer

Representa a resposta de uma questão dentro de uma tentativa.

---

# 🔐 Cuidados estudados no projeto

Algumas práticas aplicadas:

- senha com hash;
- sessões persistidas;
- validação com Zod;
- Helmet;
- CORS;
- variáveis de ambiente;
- resposta correta mantida no backend;
- nível interno da questão não exposto durante a prova;
- separação das sessões de aluno e professor;
- isolamento dos dados por professor;
- banco separado para testes automatizados.

Esses recursos foram adicionados como parte do aprendizado sobre segurança e organização de aplicações web.

---

# 🧪 Testes

## Unitários

Usados para testar regras isoladas, como:

- cálculo;
- classificação de nível;
- desempenho por categoria.

## Componentes

Usados para testar partes da interface.

Exemplo:

- seleção de alternativas;
- comportamento do card de questão.

## Integração da API

Usados para testar:

- autenticação;
- criação de sessão;
- início de avaliação;
- envio de respostas;
- resultado;
- painel do professor;
- edição;
- exclusão;
- isolamento entre professores.

## End-to-end

O Playwright simula uma jornada real da aplicação.

Os testes são executados em perfis equivalentes a:

- Desktop Chrome;
- Android / Pixel 7;
- iPhone 13 / WebKit.

---

# ⚙️ GitHub Actions

A pipeline de CI executa automaticamente:

1. PostgreSQL 16 temporário;
2. instalação das dependências;
3. geração do Prisma Client;
4. migrations;
5. seed;
6. testes unitários;
7. testes de componentes;
8. testes de integração;
9. build do backend;
10. build do frontend;
11. Playwright em Chromium e WebKit.

Isso foi criado para praticar o conceito de **integração contínua**.

---

# 🚧 Principais desafios encontrados

Alguns dos desafios que fizeram parte do desenvolvimento:

### 1. Fazer frontend e backend trabalharem juntos

Foi necessário entender requisições HTTP, rotas, respostas da API e tratamento de erros.

### 2. Persistir os dados

A aplicação começou com dados mais simples e depois passou a utilizar PostgreSQL e Prisma.

### 3. Trabalhar com autenticação

Foi necessário separar visitante, aluno cadastrado e professor.

### 4. Não expor respostas da prova

A resposta correta e o nível interno da questão precisaram permanecer no backend.

### 5. Fazer o áudio funcionar em diferentes dispositivos

O listening exigiu ajustes de preload, reprodução, fallback e comportamento mobile.

### 6. Corrigir problemas específicos do iPhone

Safe areas, Safari, WebKit, scroll e botões fixos exigiram vários ajustes.

### 7. Manter o layout consistente

Elementos como bandeiras, cards, navegação e players precisaram funcionar de forma semelhante em navegadores diferentes.

### 8. Separar os dados dos professores

O backend precisa verificar a identidade do professor antes de permitir leitura, edição ou exclusão de registros.

### 9. Fazer deploy

Vercel e Render possuem comportamentos diferentes. Isso exigiu aprender sobre build, API, banco, arquivos estáticos e variáveis de ambiente.

### 10. Evitar regressões

Conforme o sistema cresceu, uma alteração podia quebrar outra parte. Os testes automatizados e a CI passaram a ajudar nesse processo.

---

# 📂 Estrutura do repositório

```text
idiomas-pro/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── test/
│       ├── App.tsx
│       └── main.tsx
│
├── server/
│   └── src/
│       ├── controllers/
│       ├── lib/
│       ├── routes/
│       ├── services/
│       ├── tests/
│       ├── app.ts
│       └── index.ts
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── e2e/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── api/
├── docker-compose.yml
├── playwright.config.ts
├── render.yaml
├── vercel.json
├── package.json
└── README.md
```

---

# 🚀 Como executar localmente

## Pré-requisitos

- Node.js 22+
- npm
- PostgreSQL

Ou Docker, caso queira subir o banco local de forma mais simples.

---

## 1. Clone o projeto

```bash
git clone https://github.com/denilson-dev/idiomas-pro.git
cd idiomas-pro
```

---

## 2. Instale as dependências

```bash
npm install
```

O projeto utiliza **npm workspaces** para organizar `client` e `server`.

---

## 3. Crie o arquivo de ambiente

Linux/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Exemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/idiomas_pro?schema=public"
PORT=3333
CLIENT_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3333/api

GOOGLE_TTS_API_KEY=
GOOGLE_TTS_VOICE=es-ES-Chirp3-HD-Zephyr
```

As variáveis de TTS são opcionais.

> Nunca coloque credenciais reais no Git.

---

## 4. Suba o PostgreSQL

Com Docker:

```bash
docker compose up -d
```

---

## 5. Gere o Prisma Client

```bash
npm run db:generate
```

---

## 6. Aplique as migrations

```bash
npm run db:deploy
```

---

## 7. Popule o banco

```bash
npm run db:seed
```

---

## 8. Inicie a aplicação

```bash
npm run dev
```

Por padrão:

```text
Frontend:   http://localhost:5173
Backend:    http://localhost:3333
Health:     http://localhost:3333/api/health
```

---

# 📜 Comandos principais

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia frontend e backend |
| `npm run build` | Compila toda a aplicação |
| `npm start` | Inicia o backend compilado |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:deploy` | Aplica migrations |
| `npm run db:migrate` | Executa migration de desenvolvimento |
| `npm run db:seed` | Popula o banco |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run test:unit` | Testes unitários e de componentes |
| `npm run test:api` | Testes de integração da API |
| `npm run test:e2e` | Testes end-to-end |
| `npm run test:all` | Executa todas as suítes |

---

# 🔌 Principais rotas da API

## Autenticação do aluno

```http
POST /api/auth/anonymous
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Professores

```http
GET /api/teachers
```

## Autenticação do professor

```http
GET  /api/teacher/auth/bootstrap-status
POST /api/teacher/auth/bootstrap
POST /api/teacher/auth/login
GET  /api/teacher/auth/me
POST /api/teacher/auth/logout
```

## Painel do professor

```http
GET    /api/teacher/dashboard
DELETE /api/teacher/attempts
GET    /api/teacher/attempts/:attemptId
PATCH  /api/teacher/attempts/:attemptId
DELETE /api/teacher/attempts/:attemptId
```

## Avaliação

```http
POST /api/test/start
POST /api/test/:attemptId/submit
```

## Resultados

```http
GET /api/results/history
GET /api/results/:attemptId
```

## Listening

```http
GET /api/tts/:questionId
```

---

# ☁️ Deploy

O projeto possui arquivos de configuração para experiências de deploy em:

- **Vercel**;
- **Render**.

O `render.yaml` configura uma aplicação Node.js com PostgreSQL.

O `vercel.json` contém a configuração utilizada durante os estudos de deploy serverless/full stack.

Esses arquivos permanecem no repositório porque fazem parte do histórico de aprendizado do projeto.

---

# 📈 Próximos estudos possíveis

Algumas ideias para continuar evoluindo o projeto:

- adicionar Inglês;
- adicionar Francês;
- ampliar o banco de questões;
- permitir criação de provas pelo professor;
- criar turmas;
- criar relatórios;
- exportar resultados;
- adicionar filtros avançados;
- estudar envio de e-mails;
- adicionar reconhecimento de voz;
- estudar avaliação de pronúncia;
- estudar acessibilidade com mais profundidade;
- melhorar observabilidade e logs;
- estudar containers para toda a aplicação;
- aprofundar segurança e autorização.

---

# ⚠️ Limitações

Por ser um projeto de estudos:

- não é uma plataforma oficial de certificação;
- não substitui uma avaliação pedagógica profissional;
- não possui garantia de disponibilidade;
- pode passar por mudanças frequentes;
- algumas integrações dependem de serviços externos;
- alguns recursos ainda estão em evolução.

---

# 👨‍💻 O que este repositório representa

Este projeto representa meu processo de aprendizagem através da prática.

A intenção não é afirmar que já possuo experiência profissional com todas as tecnologias utilizadas.

O objetivo é mostrar que, durante os estudos, tive contato prático com diferentes partes de uma aplicação moderna e enfrentei problemas reais de desenvolvimento, integração, responsividade, testes e deploy.

```text
Estudar
   ↓
Construir
   ↓
Encontrar problemas
   ↓
Pesquisar
   ↓
Corrigir
   ↓
Testar
   ↓
Aprender
   ↓
Evoluir
```

---

<div align="center">

### 📚 Projeto criado para estudar, praticar e registrar evolução técnica.

</div>


---

# 🏭 Engenharia de Dados com PostgreSQL

Além da aplicação full stack, o repositório agora possui uma trilha prática de **Engenharia de Dados** construída sobre os próprios dados gerados pelo Idiomas Pro.

O objetivo é estudar o ciclo completo:

```text
Aplicação (OLTP / public)
        ↓
Ingestão incremental em Python
        ↓
raw
        ↓
staging (dbt)
        ↓
warehouse / Star Schema
        ↓
marts
        ↓
Power BI / Metabase
```

Schemas utilizados:

- `public`: dados operacionais da aplicação;
- `raw`: cópia técnica incremental dos dados de origem;
- `staging`: limpeza e padronização;
- `warehouse`: dimensões e fatos;
- `marts`: tabelas/views prontas para análise;
- `monitoring`: controle e observabilidade dos pipelines;
- `data_quality`: registros rejeitados;
- `synthetic`: dados fictícios para testes de volume.

### Conceitos implementados

- ETL/ELT;
- carga incremental com watermark;
- controle de batches;
- Data Warehouse;
- Star Schema;
- dimensões e fatos;
- SCD Type 2 com dbt Snapshot;
- Data Marts;
- testes de qualidade;
- observabilidade do pipeline;
- materialized views;
- índices;
- particionamento por data para estudo;
- dados sintéticos para testes de volume;
- dbt;
- Python + psycopg;
- Prefect;
- CI de Engenharia de Dados;
- preparação para Power BI e Metabase.

A implementação está isolada em:

```text
data-engineering/
```

Para instruções completas, arquitetura e comandos consulte `data-engineering/README.md`.

> Esta camada também é parte do **projeto de estudos**. Alguns recursos, como particionamento e geração de grandes volumes sintéticos, foram adicionados para aprendizado e simulação de cenários maiores do que a necessidade atual da aplicação.
