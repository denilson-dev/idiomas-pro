# Engenharia de Dados — Idiomas Pro

Esta pasta transforma os dados operacionais do Idiomas Pro em um projeto de estudos de Engenharia de Dados usando PostgreSQL.

## Arquitetura

```text
public (OLTP)
   │
   │ Python + psycopg
   ▼
raw
   │
   │ dbt
   ▼
staging
   │
   ▼
warehouse
   ├── dim_student
   ├── dim_teacher
   ├── dim_question
   ├── dim_language
   ├── dim_cefr_level
   ├── dim_date
   ├── fact_test_attempt
   └── fact_answer
   │
   ▼
marts
   ├── mart_teacher_performance
   ├── mart_student_performance
   ├── mart_question_analysis
   ├── mart_cefr_distribution
   ├── mv_cefr_distribution
   └── mv_daily_performance
```

## 1. Ambiente

Crie um ambiente virtual Python:

```bash
python -m venv .venv
```

Ative o ambiente e instale:

```bash
pip install -r data-engineering/requirements-core.txt
```

Para usar Prefect:

```bash
pip install -r data-engineering/requirements-orchestration.txt
```

Copie o exemplo:

```bash
cp data-engineering/.env.example data-engineering/.env
```

## 2. Preparar PostgreSQL

A aplicação continua usando o schema `public`. A camada analítica cria schemas separados.

```bash
python data-engineering/src/bootstrap.py
```

## 3. Ingestão incremental

```bash
python data-engineering/src/ingest.py
```

O pipeline utiliza `monitoring.pipeline_control` para guardar o último watermark por origem.

A combinação usada é:

```text
timestamp + id
```

Isso reduz o risco de pular registros que possuam o mesmo timestamp.

Execuções são registradas em:

```text
monitoring.pipeline_runs
```

## 4. Transformações dbt

Primeiro construa o staging:

```bash
dbt run --select staging --project-dir data-engineering/dbt --profiles-dir data-engineering/dbt
```

Depois atualize o histórico SCD Type 2:

```bash
dbt snapshot --project-dir data-engineering/dbt --profiles-dir data-engineering/dbt
```

Construa todo o warehouse e execute os testes:

```bash
dbt build --project-dir data-engineering/dbt --profiles-dir data-engineering/dbt
```

## 5. Data Quality

Além dos testes do dbt existe uma camada de validação que registra rejeições:

```bash
python data-engineering/src/quality.py
```

Registros inválidos são armazenados em:

```text
data_quality.rejected_records
```

## 6. Materialized Views

```bash
python data-engineering/src/materialized_views.py
```

São criadas/atualizadas:

- `marts.mv_cefr_distribution`;
- `marts.mv_daily_performance`.

## 7. Particionamento

Para estudar particionamento por mês sem alterar a tabela principal:

```bash
python data-engineering/src/partition_demo.py
```

O script cria:

```text
warehouse.fact_answer_partitioned
```

com partições mensais.

> É uma tabela de demonstração para aprendizado. O volume atual da aplicação não exige particionamento.

## 8. Dados sintéticos

Para testar o pipeline sem poluir os dados reais:

```bash
python data-engineering/src/generate_synthetic_data.py
```

Padrão:

- 500 alunos;
- 20 professores;
- 120 questões;
- 5.000 avaliações;
- 18 respostas por avaliação.

Para um teste maior:

```bash
python data-engineering/src/generate_synthetic_data.py \
  --students 5000 \
  --teachers 50 \
  --questions 300 \
  --attempts 100000 \
  --answers-per-attempt 18
```

Depois:

```bash
SOURCE_SCHEMA=synthetic python data-engineering/src/ingest.py
```

Os registros são fictícios e existem apenas para testes de volume.

## 9. Orquestração com Prefect

```bash
python data-engineering/flows/daily_pipeline.py
```

Fluxo:

```text
bootstrap
   ↓
ingest
   ↓
dbt staging
   ↓
dbt snapshot
   ↓
dbt build
   ↓
data quality
   ↓
materialized views
```

## 10. Monitoramento

Exemplo:

```sql
SELECT *
FROM monitoring.pipeline_runs
ORDER BY started_at DESC;
```

Controle incremental:

```sql
SELECT *
FROM monitoring.pipeline_control
ORDER BY source_name;
```

Rejeições:

```sql
SELECT *
FROM data_quality.rejected_records
ORDER BY rejected_at DESC;
```

## 11. Performance

Os fatos e dimensões recebem índices através da configuração do dbt.

Para gerar um relatório de `EXPLAIN ANALYZE`:

```bash
python data-engineering/src/performance_report.py
```

## 12. BI

Os marts foram criados para serem consumidos diretamente por ferramentas de BI.

Consulte:

```text
data-engineering/docs/power-bi.md
```

Para experimentar Metabase localmente:

```bash
docker compose -f docker-compose.yml -f data-engineering/docker-compose.analytics.yml up -d
```

O Metabase ficará em:

```text
http://localhost:3000
```

## Observação

Esta implementação foi construída para aprendizado. Ela mostra padrões reais de Engenharia de Dados, mas não pretende afirmar que a aplicação necessita atualmente de infraestrutura de escala empresarial.
