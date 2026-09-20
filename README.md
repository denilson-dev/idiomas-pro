# Idiomas Pro — Sistema de Nivelamento de Espanhol

Aplicação full-stack para avaliação de espanhol com classificação CEFR de A1 a C2.

## Stack

- Frontend: React 19 + Vite 8 + TypeScript + Tailwind CSS 4 + Lucide Icons
- Estado: Zustand com persistência local da sessão
- Backend: Node.js + Express 5 + TypeScript
- Banco: PostgreSQL + Prisma ORM 7
- Autenticação: sessão persistida no PostgreSQL por `session_token`
- Listening: arquivos MP3 locais de demonstração incluídos em `client/public/media`

## Funcionalidades implementadas

- Teste anônimo com sessão temporária de 24 horas
- Cadastro e login de alunos
- Conta de demonstração criada pelo seed
- Testes configuráveis com 15, 18 ou 20 questões
- Sorteio aleatório com distribuição entre A1, A2, B1, B2, C1 e C2
- Garantia de pelo menos uma questão de Listening
- Correção exclusivamente no backend; a resposta correta nunca é enviada ao cliente
- Cálculo de nota de 0 a 100%
- Conversão para CEFR:
  - 0–20: A1
  - 21–40: A2
  - 41–60: B1
  - 61–80: B2
  - 81–95: C1
  - 96–100: C2
- Breakdown de Gramática, Vocabulário e Listening
- Recomendações de próximos cursos
- Histórico para alunos autenticados e para a sessão anônima atual
- Proteção contra envio de questões que não pertencem à tentativa criada

## Estrutura

```text
/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── server/
│   └── src/
│       ├── controllers/
│       ├── lib/
│       ├── routes/
│       ├── services/
│       └── index.ts
├── client/
│   ├── public/media/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── App.tsx
│       └── main.tsx
├── docker-compose.yml
├── prisma7.config.ts
└── package.json
```

## Como executar

### 1. Pré-requisitos

- Node.js 22+
- npm 10+
- Docker, ou um PostgreSQL já disponível

### 2. Configure o ambiente

Na raiz do projeto:

```bash
cp .env.example .env
```

Se o frontend for apontar para outra API, opcionalmente:

```bash
cp client/.env.example client/.env
```

### 3. Suba o PostgreSQL

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

### 6. Crie as tabelas

```bash
npm run db:migrate
```

### 7. Popule o banco

```bash
npm run db:seed
```

Conta de demonstração:

```text
E-mail: aluno@idiomaspro.com
Senha: Teste123!
```

### 8. Rode frontend e backend

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3333
- Healthcheck: http://localhost:3333/health

## Endpoints principais

```text
POST /api/auth/anonymous
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

GET  /api/test/start?count=18
POST /api/test/:attemptId/submit

GET  /api/results/history
GET  /api/results/:attemptId
```

As rotas de teste e resultado usam o header:

```text
x-session-token: <token>
```

## Observação de produção

Para produção, configure `DATABASE_URL`, `CLIENT_ORIGIN` e `VITE_API_URL` no provedor de hospedagem. Os arquivos de Listening incluídos são adequados para demonstração; em produção, você pode substituir `mediaUrl` por URLs do S3, Cloudinary ou outro CDN sem alterar a lógica do player.
