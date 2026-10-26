# Idiomas Pro

Aplicação de nivelamento de idiomas com área do aluno, painel de professores e administração. O projeto também é usado para praticar PostgreSQL, SQL e Engenharia de Dados.

## O que tem no projeto

- Cadastro e acesso de alunos.
- Avaliações de nivelamento e consulta de resultados.
- Área do professor para acompanhar alunos.
- Área administrativa para gerenciar o sistema.
- Pipeline analítico em Python, SQL e PostgreSQL.

Este é um projeto de estudo. Os níveis apresentados seguem a escala CEFR (A1 a C2), mas os resultados não substituem uma certificação oficial de proficiência.

## Tecnologias

- **Frontend:** React, TypeScript e Vite.
- **Backend:** Node.js, Express e TypeScript.
- **Banco de dados:** PostgreSQL e Prisma.
- **Testes:** Vitest, Testing Library e Playwright.
- **Engenharia de Dados:** Python, psycopg e SQL. Airflow e dbt ficam como trilhas opcionais de estudo.

## Executar localmente

### Requisitos

- Node.js 22 ou superior.
- PostgreSQL 16.
- Python 3.12, caso queira executar o pipeline analítico.

### 1. Instalar dependências

Na raiz do repositório:

```bash
npm install
```

### 2. Configurar as variáveis de ambiente

Copie `.env.example` para `.env` e ajuste a conexão com seu PostgreSQL. Não coloque senhas reais ou chaves de API em arquivos versionados.

O banco indicado em `DATABASE_URL` deve existir antes de executar as migrations.

### 3. Preparar o banco

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

### 4. Iniciar a aplicação

```bash
npm run dev
```

O frontend e o backend serão iniciados juntos. Por padrão, o Vite usa a porta 5173 e a API usa a porta 3333; confira as variáveis do seu ambiente se essas portas já estiverem ocupadas.

## Comandos úteis

| Comando | Para que serve |
| --- | --- |
| `npm run dev` | Inicia frontend e backend em modo de desenvolvimento |
| `npm run build` | Gera os builds do servidor e do cliente |
| `npm test` | Executa testes unitários e de API |
| `npm run test:e2e` | Executa os testes de ponta a ponta |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run data:run` | Executa todas as etapas do pipeline analítico |

## Estrutura do repositório

```text
api/                  Entrada da API para deploy serverless
client/               Aplicação React
server/               API Express, rotas e regras de negócio
prisma/               Modelo do banco, migrations e seed
scripts/              Scripts administrativos
e2e/                  Testes de ponta a ponta
data-engineering/     Pipeline, SQL e modelos analíticos
```

A interface usada atualmente está em `client/src/premium`. A pasta `client/src/pages` contém páginas da implementação anterior; antes de remover ou reorganizar esses arquivos, confirme se não existem imports ou rotas que ainda dependam deles.

## Engenharia de Dados

A pasta `data-engineering/` contém um pipeline de estudo separado da aplicação principal. Ele extrai dados do PostgreSQL, organiza as camadas `raw`, `staging`, `warehouse` e `marts`, e executa verificações de qualidade.

Consulte [data-engineering/README.md](data-engineering/README.md) para instruções de instalação, execução e consulta dos dados analíticos.

## Testes

Para executar os testes principais:

```bash
npm run test:unit
npm run test:api
```

Os testes de ponta a ponta usam Playwright e precisam do ambiente configurado conforme `playwright.config.ts`.

## Segurança

- Mantenha arquivos `.env` fora do Git.
- Use senhas e credenciais próprias no ambiente local.
- Não reutilize credenciais de desenvolvimento em produção.
- Revise as configurações de autenticação, permissões e privacidade antes de disponibilizar o sistema publicamente.
