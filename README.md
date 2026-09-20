# 🌍 Nivelamento no Topo

<div align="center">

### Projeto de estudos full stack para nivelamento de idiomas

Aplicação web desenvolvida para praticar **frontend, backend, banco de dados, autenticação, UX/UI, testes automatizados, CI/CD e deploy** em um cenário real de ensino de idiomas.

A proposta foi apresentada a uma **professora de idiomas**, que avaliou e aprovou o conceito do projeto e contribuiu com feedbacks para a evolução do fluxo de nivelamento e do acompanhamento pedagógico.

<br />

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)

</div>

---

## 📌 Sobre o projeto

O **Nivelamento no Topo** nasceu como um projeto de estudos aplicado.

A ideia foi sair de exercícios isolados e construir uma aplicação completa, baseada em uma necessidade real: permitir que um aluno faça uma avaliação de nivelamento e que o professor responsável consiga acompanhar os resultados posteriormente.

O projeto evoluiu para um fluxo com dois perfis principais:

- **Aluno**, que realiza o teste de nivelamento;
- **Professor**, que acompanha e gerencia as avaliações vinculadas ao seu acesso.

> [!IMPORTANT]
> Este repositório representa um **projeto de estudo e prática técnica**.  
> Ele não é apresentado como sistema oficial de uma escola, produto comercial finalizado ou experiência profissional anterior.

---

## ✅ Estado atual

Atualmente o projeto possui:

- interface em **Português do Brasil (PT-BR)**;
- avaliação ativa em **Espanhol**;
- níveis de resultado de **A1 a C2**;
- Inglês e Francês representados na interface como idiomas planejados;
- fluxo de aluno;
- autenticação de usuário;
- acesso como visitante;
- portal exclusivo do professor;
- persistência em PostgreSQL;
- áudio de Listening via TTS;
- layout responsivo;
- testes automatizados;
- CI com GitHub Actions;
- configuração de deploy para Render.

---

## 🎯 Objetivos de aprendizagem

Durante o desenvolvimento, o projeto foi utilizado para praticar:

- arquitetura full stack;
- React e componentização;
- TypeScript;
- React Router;
- gerenciamento de estado com Zustand;
- APIs REST com Express;
- modelagem relacional;
- PostgreSQL;
- Prisma ORM;
- migrations;
- autenticação baseada em sessão;
- validação com Zod;
- hash de senhas;
- segurança de rotas;
- UX/UI responsivo;
- mobile-first;
- safe areas de iPhone;
- integração com serviços externos;
- Text-to-Speech;
- testes unitários;
- testes de componentes;
- testes de integração;
- testes end-to-end;
- CI/CD;
- deploy em ambiente cloud.

---

# ✨ Funcionalidades

## 👨‍🎓 Fluxo do aluno

O aluno pode:

- iniciar como visitante;
- criar uma conta;
- entrar em uma conta existente;
- escolher o idioma da avaliação;
- informar nome;
- informar e-mail opcional;
- selecionar obrigatoriamente o professor responsável;
- realizar o teste;
- responder questões de:
  - Gramática;
  - Vocabulário;
  - Listening;
- ouvir os áudios mais de uma vez;
- revisar as respostas antes da finalização;
- receber o resultado somente após concluir o teste;
- visualizar:
  - nota;
  - nível CEFR;
  - desempenho por habilidade;
  - recomendações;
- consultar o histórico de avaliações.

### Privacidade da avaliação

Durante o teste:

- o nível CEFR interno da questão não é enviado ao frontend;
- a resposta correta não é enviada ao frontend;
- a correção é realizada no backend.

---

## 👩‍🏫 Portal do professor

O professor possui autenticação separada da conta do aluno.

O painel permite:

- login exclusivo;
- criação segura do primeiro acesso pedagógico;
- visualizar quantidade de avaliações;
- visualizar quantidade de alunos;
- acompanhar média de desempenho;
- visualizar o último nível registrado;
- consultar distribuição dos resultados por CEFR;
- pesquisar aluno por nome, e-mail ou nível;
- abrir uma avaliação individual;
- consultar:
  - nota;
  - nível;
  - desempenho por habilidade;
  - respostas dadas;
  - respostas corretas;
- editar os dados administrativos de uma avaliação;
- excluir uma avaliação;
- limpar todas as avaliações listadas.

### Gestão das provas

Cada avaliação possui ações de:

#### ✏️ Editar

O professor pode corrigir:

- nome do aluno;
- e-mail do aluno.

A edição **não altera**:

- nota;
- nível CEFR;
- respostas;
- resultado pedagógico.

Isso evita mudanças indevidas no resultado original.

#### 🗑️ Excluir

O professor pode excluir uma avaliação específica.

Ao excluir, as respostas vinculadas à tentativa também são removidas pelo relacionamento do banco.

#### 🧹 Limpar todas

O professor pode remover todas as avaliações concluídas vinculadas ao próprio acesso.

A aplicação apresenta confirmação antes da operação.

### Isolamento entre professores

As operações de leitura, edição e exclusão verificam o professor autenticado.

Um professor não consegue:

- consultar avaliação de outro professor;
- editar avaliação de outro professor;
- excluir avaliação de outro professor;
- limpar avaliações pertencentes a outro professor.

---

# 🎧 Listening e Text-to-Speech

As questões de Listening possuem endpoint próprio:

```text
GET /api/tts/:questionId
```

A estratégia atual de áudio é:

```text
Google Cloud Text-to-Speech
          ↓
Google Translate TTS
          ↓
MP3 local de fallback
```

Quando `GOOGLE_TTS_API_KEY` está configurada, o backend utiliza Google Cloud TTS como primeira opção.

A voz configurada no ambiente Render é:

```text
es-ES-Chirp3-HD-Zephyr
```

O player possui:

- pré-carregamento;
- estado de carregamento;
- reprodução;
- interrupção;
- repetição;
- feedback visual;
- waveform animado;
- cache no backend;
- fallback em caso de indisponibilidade externa.

---

# 🌐 Idiomas

É importante separar dois conceitos:

## Idioma da interface

Atualmente:

```text
PT-BR
```

O seletor do cabeçalho representa o **idioma da interface**, não o idioma que está sendo avaliado.

## Idioma da avaliação

Atualmente disponível:

```text
Espanhol
```

Planejados na interface:

```text
Inglês
Francês
```

As bandeiras são renderizadas através de SVG próprio para manter a mesma aparência em Windows, macOS, Android, iOS e diferentes navegadores.

---

# 🧠 Classificação utilizada no projeto

A aplicação utiliza a seguinte regra para converter o percentual de acertos em um nível:

| Aproveitamento | Nível |
|---:|:---:|
| 0–20% | A1 |
| 21–40% | A2 |
| 41–60% | B1 |
| 61–80% | B2 |
| 81–95% | C1 |
| 96–100% | C2 |

A pontuação é calculada no backend.

> [!NOTE]
> Essa classificação é uma **regra de negócio criada para o projeto de estudos**.  
> O resultado não deve ser interpretado como certificação oficial de proficiência CEFR.

---

# 🛠️ Stack

| Área | Tecnologia |
|---|---|
| Frontend | React 19 |
| Bundler | Vite 8 |
| Linguagem | TypeScript 5 |
| Roteamento | React Router |
| Estado global | Zustand |
| UI | Tailwind CSS 4 |
| Ícones | Lucide React |
| Backend | Node.js 22 |
| API | Express 5 |
| Validação | Zod 4 |
| Segurança HTTP | Helmet |
| Hash de senha | bcryptjs |
| Banco | PostgreSQL |
| ORM | Prisma 7 |
| Driver | pg / Prisma PostgreSQL Adapter |
| Unit tests | Vitest |
| Component tests | Testing Library |
| API tests | Supertest |
| E2E | Playwright |
| CI | GitHub Actions |
| Deploy | Render |
| TTS | Google Cloud TTS + fallbacks |

---

# 🏗️ Arquitetura

```text
┌───────────────────────────────────────────────────────┐
│                       Usuários                        │
│                                                       │
│                 Aluno            Professor            │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │   React + Vite    │
                 │     Frontend      │
                 └─────────┬─────────┘
                           │
                         /api
                           │
                           ▼
                 ┌───────────────────┐
                 │ Node.js + Express │
                 │      Backend      │
                 └─────────┬─────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
      ┌─────────────┐ ┌──────────┐ ┌─────────────┐
      │ PostgreSQL  │ │ Prisma   │ │ TTS externo │
      │ Persistência│ │   ORM    │ │ + fallback  │
      └─────────────┘ └──────────┘ └─────────────┘
```

Em produção no Render, o Express também serve o build do frontend, permitindo comunicação com a API através da mesma origem:

```text
Frontend
   ↓
/api
   ↓
Express
   ↓
PostgreSQL
```

---

# 🗃️ Modelo de dados

Principais entidades:

### `User`

Conta persistente do aluno.

### `Session`

Sessão autenticada ou anônima do aluno.

### `Teacher`

Professor com acesso pedagógico.

### `TeacherSession`

Sessão exclusiva do professor.

### `Question`

Questões da avaliação, incluindo:

- categoria;
- nível interno;
- alternativas;
- resposta correta;
- mídia opcional.

### `TestAttempt`

Representa uma tentativa de nivelamento.

Armazena, entre outros:

- aluno;
- professor;
- idioma;
- questões utilizadas;
- status;
- nota;
- nível final;
- breakdown;
- data de conclusão.

### `AttemptAnswer`

Resposta individual de uma questão dentro de uma tentativa.

---

# 📂 Estrutura

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
│       ├── generated/
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
│   ├── global-setup.ts
│   └── placement-flow.spec.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── playwright.config.ts
├── vitest.server.config.ts
├── vitest.client.config.ts
├── vitest.api.config.ts
├── prisma7.config.ts
├── docker-compose.yml
├── render.yaml
├── vercel.json
└── package.json
```

---

# 🚀 Executando localmente

## Pré-requisitos

- Node.js 22+
- npm
- PostgreSQL
- ou Docker para subir o banco local

---

## 1. Clonar

```bash
git clone https://github.com/denilson-dev/idiomas-pro.git
cd idiomas-pro
```

---

## 2. Criar o arquivo de ambiente

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
```

Variáveis opcionais para Google Cloud TTS:

```env
GOOGLE_TTS_API_KEY=
GOOGLE_TTS_VOICE=es-ES-Chirp3-HD-Zephyr
```

> Nunca versione chaves ou credenciais reais.

---

## 3. Subir PostgreSQL

Com Docker:

```bash
docker compose up -d
```

---

## 4. Instalar dependências

```bash
npm install
```

O projeto utiliza npm workspaces para `client` e `server`.

---

## 5. Gerar o Prisma Client

```bash
npm run db:generate
```

---

## 6. Aplicar migrations existentes

```bash
npm run db:deploy
```

Para criar uma **nova migration durante desenvolvimento** após alterar o schema:

```bash
npm run db:migrate
```

---

## 7. Popular o banco

```bash
npm run db:seed
```

---

## 8. Executar em desenvolvimento

```bash
npm run dev
```

Por padrão:

```text
Frontend:    http://localhost:5173
Backend:     http://localhost:3333
API health:  http://localhost:3333/api/health
```

---

# 📜 Scripts principais

| Comando | Função |
|---|---|
| `npm run dev` | Executa frontend e backend |
| `npm run build` | Gera Prisma Client e compila o projeto |
| `npm start` | Executa o backend compilado |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:deploy` | Aplica migrations existentes |
| `npm run db:migrate` | Cria/aplica migration de desenvolvimento |
| `npm run db:seed` | Executa seed |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run test:unit` | Unitários + componentes |
| `npm run test:api` | Integração da API |
| `npm run test:e2e` | Build + Playwright |
| `npm run test:all` | Executa todas as suítes |

---

# 🔌 API

## Healthcheck

```http
GET /api/health
```

---

## Autenticação do aluno

```http
POST /api/auth/anonymous
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

---

## Professores disponíveis

```http
GET /api/teachers
```

---

## Autenticação do professor

```http
GET  /api/teacher/auth/bootstrap-status
POST /api/teacher/auth/bootstrap
POST /api/teacher/auth/login
GET  /api/teacher/auth/me
POST /api/teacher/auth/logout
```

---

## Painel e gestão do professor

```http
GET    /api/teacher/dashboard
DELETE /api/teacher/attempts

GET    /api/teacher/attempts/:attemptId
PATCH  /api/teacher/attempts/:attemptId
DELETE /api/teacher/attempts/:attemptId
```

---

## Teste

```http
POST /api/test/start
POST /api/test/:attemptId/submit
```

---

## Resultados

```http
GET /api/results/history
GET /api/results/:attemptId
```

---

## Listening

```http
GET /api/tts/:questionId
```

---

# 🧪 Testes automatizados

O projeto possui quatro camadas principais de testes.

| Tipo | Ferramentas | Exemplos |
|---|---|---|
| Unitário | Vitest | mapeamento CEFR, pontuação, breakdown |
| Componente | Testing Library + Vitest | seleção de alternativa e ocultação de nível |
| Integração | Supertest + Vitest | autenticação, API, professor, CRUD de avaliações |
| E2E | Playwright | jornada real aluno → professor |

---

## Regras CEFR testadas

Os limites são validados explicitamente:

```text
0%   → A1
20%  → A1

21%  → A2
40%  → A2

41%  → B1
60%  → B1

61%  → B2
80%  → B2

81%  → C1
95%  → C1

96%  → C2
100% → C2
```

---

## Integração da API

Entre os cenários cobertos:

- healthcheck;
- criação de visitante;
- criação do primeiro professor;
- exigência de professor no início do teste;
- não exposição do nível interno;
- não exposição da resposta correta;
- finalização da avaliação;
- registro no painel do professor;
- edição da identificação de uma prova;
- exclusão individual;
- limpeza de todas as provas;
- isolamento de leitura entre professores;
- isolamento de edição entre professores;
- isolamento de exclusão entre professores.

---

## E2E

O cenário principal automatiza:

```text
Página inicial
      ↓
Visitante
      ↓
Seleção de Espanhol
      ↓
Nome + e-mail + professor
      ↓
18 questões
      ↓
Revisão
      ↓
Finalização
      ↓
Resultado CEFR
      ↓
Login do professor
      ↓
Painel pedagógico
      ↓
Resultado do aluno
```

O Playwright executa o fluxo em:

- Desktop Chrome;
- Android / Pixel 7;
- iPhone 13 / WebKit.

Isso ajuda a detectar problemas de:

- responsividade;
- navegação;
- WebKit/Safari;
- scroll;
- safe areas;
- comportamento mobile.

---

# ⚙️ CI com GitHub Actions

Em cada push para `main` e em pull requests, a pipeline:

1. cria um PostgreSQL 16 descartável;
2. instala dependências;
3. gera o Prisma Client;
4. aplica as migrations;
5. executa o seed;
6. roda testes unitários e de componentes;
7. roda testes de integração da API;
8. compila o backend;
9. compila o frontend;
10. instala Chromium e WebKit;
11. executa testes E2E.

O banco utilizado pelo CI é isolado:

```text
idiomas_pro_test
```

Nenhum teste automatizado utiliza o banco de produção.

---

# 📱 UX/UI e responsividade

A interface foi desenvolvida com foco em experiência mobile e possui:

- layouts fluidos;
- safe areas para iOS;
- tipografia responsiva;
- cards adaptativos;
- glassmorphism;
- blur;
- microinterações;
- estados de toque;
- navegação compacta no teste;
- player de Listening responsivo;
- controle de overflow;
- tratamento de teclado virtual;
- tratamento específico para telas estreitas;
- tratamento específico para telas com pouca altura;
- `prefers-reduced-motion`;
- bandeiras SVG independentes do sistema operacional.

---

# 🔐 Segurança e integridade

Entre as práticas aplicadas:

- hash de senha com bcrypt;
- sessões persistidas em banco;
- sessão independente para professores;
- validação de dados com Zod;
- Helmet;
- CORS;
- credenciais externas por variáveis de ambiente;
- respostas corretas mantidas no backend;
- níveis internos das questões ocultos no frontend;
- isolamento de dados por professor;
- confirmação para operações destrutivas no painel;
- migrations versionadas;
- `.env` ignorado pelo Git;
- banco isolado nos testes.

---

# ☁️ Deploy no Render

O repositório possui `render.yaml` para provisionamento da aplicação.

A configuração atual prevê:

- Web Service Node.js;
- PostgreSQL;
- build do frontend e backend;
- migrations no startup;
- seed;
- healthcheck em `/api/health`;
- deploy automático após checks;
- `DATABASE_URL` ligada ao banco;
- `GOOGLE_TTS_API_KEY` como segredo;
- voz TTS configurável.

Fluxo:

```text
GitHub
  ↓
GitHub Actions
  ↓
checks aprovados
  ↓
Render build
  ↓
Prisma migrations
  ↓
seed
  ↓
Express + React
```

---

# 📈 Possíveis evoluções

Algumas ideias mantidas como continuidade de estudos:

- múltiplas escolas;
- administrador da instituição;
- cadastro de múltiplos professores pelo painel;
- turmas;
- convite de alunos;
- relatórios pedagógicos;
- filtros avançados;
- exportação para PDF;
- exportação para planilha;
- envio de resultado por e-mail;
- dashboard analítico mais completo;
- Inglês;
- Francês;
- banco maior de questões;
- testes personalizados por professor;
- reconhecimento de voz;
- avaliação de pronúncia;
- gamificação;
- trilhas de estudo.

---

# ✅ Validação com uma professora

A proposta foi apresentada a uma **professora de idiomas**, que avaliou e aprovou o conceito como uma solução interessante para o contexto de nivelamento e acompanhamento dos alunos.

Os feedbacks ajudaram a orientar mudanças como:

- melhoria da experiência mobile;
- ocultação do nível da questão durante a prova;
- atenção à compreensão dos áudios;
- revisão antes da finalização;
- associação do aluno ao professor;
- criação de um painel pedagógico.

Essa validação é tratada neste repositório como **feedback aplicado ao projeto de estudos**, e não como vínculo profissional ou implantação oficial em uma instituição.

---

# 👨‍💻 Contexto de aprendizagem

Este projeto registra meu processo de aprendizado por meio da prática.

A intenção não é afirmar experiência profissional que ainda não possuo, mas demonstrar contato prático com diferentes partes de uma aplicação moderna:

```text
Frontend
   +
Backend
   +
Banco de dados
   +
APIs
   +
Autenticação
   +
UX/UI
   +
Testes
   +
CI/CD
   +
Deploy
```

---

<div align="center">

## 📚 Teoria → prática → feedback → testes → evolução

**Projeto de estudos aplicado a um cenário real de ensino de idiomas.**

</div>
