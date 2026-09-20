# 🌍 Idiomas Pro — Projeto de Estudos de Nivelamento de Idiomas

<div align="center">

**Aplicação full-stack de estudos para avaliação de nível de idiomas com classificação CEFR (A1–C2).**

Projeto desenvolvido a partir de uma necessidade real apresentada por uma **professora de idiomas** e posteriormente **avaliado e aprovado por ela como proposta de estudo e evolução da experiência de nivelamento**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)

</div>

---

## 📌 Sobre o projeto

O **Idiomas Pro** nasceu como um projeto de estudos aplicado: a ideia foi transformar conhecimentos de desenvolvimento web, banco de dados, APIs, UX/UI e deploy em uma solução funcional para um cenário real de ensino de idiomas.

A proposta foi apresentada a uma professora, que aprovou o conceito e o fluxo do projeto. A partir desse feedback, a aplicação passou a incluir também uma área pedagógica para acompanhamento dos resultados dos alunos.

> **Importante:** este repositório representa um projeto de estudo e prática técnica. Não é apresentado como sistema oficial de uma escola, produto comercial finalizado ou experiência profissional anterior.

---

## 🎯 Objetivos de aprendizagem

Durante o desenvolvimento, o projeto foi utilizado para praticar:

- arquitetura full-stack;
- React e componentização;
- TypeScript;
- criação de APIs REST com Express;
- modelagem de dados com PostgreSQL;
- Prisma ORM e migrations;
- autenticação baseada em sessão;
- estados globais com Zustand;
- responsividade e UX/UI mobile-first;
- integração de áudio/TTS;
- deploy e configuração de ambiente;
- CI com GitHub Actions;
- separação entre regras de negócio, interface e persistência.

---

## ✨ Funcionalidades atuais

### 👨‍🎓 Experiência do aluno

- acesso como visitante;
- cadastro e login;
- seleção do idioma;
- identificação do aluno antes da avaliação;
- seleção obrigatória do professor responsável;
- teste de nivelamento com 15 a 20 questões;
- questões distribuídas entre diferentes níveis CEFR;
- Gramática, Vocabulário e Listening;
- nível da questão oculto durante a avaliação;
- revisão das respostas antes da finalização;
- cálculo de nota;
- resultado CEFR de A1 a C2;
- desempenho separado por habilidade;
- histórico de avaliações;
- recomendações de próximos passos.

### 👩‍🏫 Área do professor

- acesso exclusivo para professores;
- criação segura do primeiro acesso pedagógico;
- autenticação independente do aluno;
- painel de resultados;
- quantidade de avaliações realizadas;
- quantidade de alunos acompanhados;
- média de desempenho;
- distribuição por nível CEFR;
- busca por aluno;
- acesso ao resultado individual;
- visualização das respostas corretas e incorretas;
- vínculo automático entre aluno, professor e avaliação.

### 🎧 Listening

O projeto possui suporte a áudio de compreensão auditiva com:

- endpoint próprio no backend;
- integração opcional com Google Cloud Text-to-Speech;
- voz espanhola configurável;
- cache de áudio;
- fallback para outras fontes de áudio;
- player responsivo para dispositivos móveis.

---

## 🧠 Regra de classificação CEFR

| Aproveitamento | Nível |
|---:|:---:|
| 0–20% | A1 |
| 21–40% | A2 |
| 41–60% | B1 |
| 61–80% | B2 |
| 81–95% | C1 |
| 96–100% | C2 |

A correção ocorre no backend. As respostas corretas não são enviadas previamente ao frontend durante o teste.

---

## 🛠️ Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| Estilização | Tailwind CSS 4 |
| Ícones | Lucide React |
| Estado | Zustand |
| Backend | Node.js, Express 5, TypeScript |
| Validação | Zod |
| Banco de dados | PostgreSQL |
| ORM | Prisma 7 |
| Autenticação | Sessões persistidas no banco |
| Áudio | Google Cloud TTS / fallback |
| CI | GitHub Actions |
| Deploy | Estrutura preparada para Render e Vercel |

---

## 🏗️ Arquitetura

```text
                        ┌─────────────────────┐
                        │      Usuário        │
                        │  Aluno / Professor  │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │   React + Vite      │
                        │      Frontend       │
                        └──────────┬──────────┘
                                   │
                                 /api
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │ Node.js + Express   │
                        │       Backend       │
                        └──────────┬──────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  ▼                ▼                ▼
          ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
          │ PostgreSQL   │  │ Prisma ORM   │  │ Google TTS  │
          │ Dados        │  │ Persistência │  │ Listening   │
          └──────────────┘  └──────────────┘  └─────────────┘
```

---

## 📂 Estrutura do repositório

```text
/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
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
│       └── index.ts
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── .github/workflows/
├── docker-compose.yml
├── prisma7.config.ts
├── render.yaml
├── vercel.json
└── package.json
```

---

## 🚀 Executando localmente

### Pré-requisitos

- Node.js 22+
- npm 10+
- Docker **ou** PostgreSQL disponível

### 1. Clone o repositório

```bash
git clone https://github.com/denilson-dev/idiomas-pro.git
cd idiomas-pro
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Suba o PostgreSQL com Docker

```bash
docker compose up -d
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Gere o Prisma Client

```bash
npm run db:generate
```

### 6. Execute as migrations

```bash
npm run db:migrate
```

### 7. Popule o banco com os dados de demonstração

```bash
npm run db:seed
```

### 8. Inicie frontend e backend

```bash
npm run dev
```

Por padrão:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3333`
- Healthcheck: `http://localhost:3333/api/health`

---

## 🔌 Principais rotas da API

### Alunos e sessões

```text
POST /api/auth/anonymous
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Professores

```text
GET  /api/teachers

GET  /api/teacher/auth/bootstrap-status
POST /api/teacher/auth/bootstrap
POST /api/teacher/auth/login
GET  /api/teacher/auth/me
POST /api/teacher/auth/logout

GET  /api/teacher/dashboard
GET  /api/teacher/attempts/:attemptId
```

### Avaliações

```text
POST /api/test/start
POST /api/test/:attemptId/submit

GET  /api/results/history
GET  /api/results/:attemptId
```

### Listening

```text
GET /api/tts/:questionId
```

---

## 🧪 Testes automatizados

O projeto possui testes em camadas para validar regras de negócio, componentes, API e o fluxo completo da aplicação.

| Camada | Ferramenta | Validação |
|---|---|---|
| Unitários | Vitest | Faixas CEFR, cálculo de nota e breakdown |
| Componentes | Testing Library + Vitest | Questões, interação e ocultação do nível |
| API | Supertest + Vitest | Sessões, professor, teste, resultado e isolamento de acesso |
| E2E | Playwright | Jornada real aluno → resultado → painel do professor |

### Comandos

```bash
npm run test:unit
npm run test:api
npm run test:e2e
npm run test:all
```

Os testes de API e E2E usam um PostgreSQL separado do ambiente de produção.

No GitHub Actions, um banco PostgreSQL descartável é criado automaticamente para cada execução. A pipeline aplica migrations, executa o seed, roda os testes, compila frontend/backend e finaliza com o cenário E2E.

O fluxo automatizado principal é:

```text
Visitante
   ↓
Seleciona espanhol
   ↓
Informa nome + professor
   ↓
Responde 18 questões
   ↓
Revisa e finaliza
   ↓
Recebe nível CEFR
   ↓
Professor entra no painel
   ↓
Visualiza o resultado do aluno
```

---

## 🔐 Segurança e boas práticas estudadas

- senhas armazenadas com hash;
- tokens de sessão persistidos no banco;
- rotas separadas para aluno e professor;
- credenciais externas mantidas em variáveis de ambiente;
- respostas corretas mantidas no backend;
- validação de payloads com Zod;
- migrations versionadas;
- arquivo `.env` fora do versionamento;
- CI para validar os builds de frontend e backend.

---

## 📈 Evoluções estudadas no projeto

Alguns pontos pensados para continuidade dos estudos:

- múltiplas escolas;
- cadastro administrativo de professores;
- turmas;
- relatórios pedagógicos;
- exportação de resultados em PDF;
- envio de resultado por e-mail;
- outros idiomas;
- reconhecimento de voz;
- avaliação de pronúncia;
- banco maior de questões;
- criação de testes personalizados por professor;
- gamificação;
- dashboards analíticos.

---

## ✅ Validação da ideia

A proposta foi apresentada a uma **professora de idiomas**, que avaliou e aprovou o projeto como uma solução interessante para o contexto de nivelamento e acompanhamento dos alunos.

O feedback serviu como referência para evoluir funcionalidades e experiência de uso, mantendo o projeto com foco principal em **aprendizado, prática e desenvolvimento técnico**.

---

## 👨‍💻 Sobre este repositório

Este projeto faz parte dos meus estudos práticos em desenvolvimento de software.

A intenção aqui não é afirmar experiência profissional que ainda não possuo, mas registrar o processo de aprendizagem através da construção de uma aplicação real, incluindo frontend, backend, banco de dados, APIs, autenticação, UX/UI, deploy e integração entre serviços.

---

<div align="center">

### 📚 Projeto de estudos aplicado a um cenário real

**Teoria → prática → feedback → evolução**

</div>
