# Power BI / camada analítica

O Power BI deve consumir preferencialmente o schema `marts`, e não as tabelas transacionais da aplicação.

## Tabelas recomendadas

- `marts.mart_teacher_performance`
- `marts.mart_student_performance`
- `marts.mart_question_analysis`
- `marts.mart_cefr_distribution`
- `marts.mv_cefr_distribution`
- `marts.mv_daily_performance`

## Conexão local

No Power BI Desktop:

1. Obter Dados;
2. PostgreSQL;
3. servidor: `localhost:5432`;
4. banco: `idiomas_pro`;
5. escolha Import ou DirectQuery;
6. selecione as tabelas do schema `marts`.

## Sugestão de páginas

### Visão geral

- total de avaliações;
- total de alunos;
- média de nota;
- média de acurácia;
- distribuição A1-C2;
- evolução diária/mensal.

### Professores

- total de alunos por professor;
- total de avaliações;
- nota média;
- distribuição CEFR por professor.

### Questões

- questões com mais respostas;
- maior taxa de erro;
- maior taxa de acerto;
- desempenho por Gramática, Vocabulário e Listening.

### Alunos

- quantidade de avaliações;
- nível mais recente;
- nota média;
- evolução de desempenho.

## Princípio do projeto

O dashboard é a última etapa do fluxo. A regra é evitar lógica pesada no Power BI quando ela puder ser calculada e testada antes no warehouse/mart.
