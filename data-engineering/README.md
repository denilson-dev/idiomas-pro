# Engenharia de Dados — Idiomas Pro

Esta pasta transforma os dados produzidos pela aplicação em um projeto de estudos de Engenharia de Dados com PostgreSQL.

## Arquitetura

```text
Aplicação (schema public / OLTP)
        |
        v
Python incremental ETL
        |
        v
raw  ->  staging  ->  warehouse  ->  marts
                   |
                   +-> data_quality
                   |
                   +-> Power BI / Metabase

Orquestração opcional: Airflow
Transformações alternativas: dbt
```

## Schemas PostgreSQL

- `public`: dados transacionais da aplicação.
- `meta`: controle de watermarks e execuções.
- `raw`: cópia analítica dos dados de origem.
- `staging`: limpeza, padronização e anonimização de e-mail.
- `warehouse`: modelo dimensional.
- `marts`: materialized views prontas para BI.
- `data_quality`: validações e rejeições.

## Modelo dimensional

Dimensões:

- `warehouse.dim_date`
- `warehouse.dim_student`
- `warehouse.dim_teacher` — SCD Type 2
- `warehouse.dim_question`
- `warehouse.dim_language`
- `warehouse.dim_cefr_level`

Fatos:

- `warehouse.fact_test_attempt`
- `warehouse.fact_answer`

## Data marts

- `marts.cefr_distribution`
- `marts.teacher_performance`
- `marts.question_analysis`
- `marts.student_progress`

Essas estruturas podem ser consumidas por Power BI, Metabase ou outra ferramenta SQL.

## Instalação

```bash
python -m venv .venv
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Depois:

```bash
pip install -r data-engineering/requirements.txt
```

O pipeline usa `ANALYTICS_DATABASE_URL` quando definida. Caso contrário, utiliza `DATABASE_URL`.

## Inicializar a arquitetura

```bash
python data-engineering/pipeline.py init
```

## Executar ingestão incremental

```bash
python data-engineering/pipeline.py extract
```

Cada entidade possui um watermark em `meta.pipeline_control`. Assim, execuções posteriores buscam somente registros novos ou atualizados.

## Construir Warehouse e marts

```bash
python data-engineering/pipeline.py transform
```

## Validar qualidade

```bash
python data-engineering/pipeline.py quality
```

A execução retorna código diferente de zero se existirem problemas críticos.

## Executar tudo

```bash
python data-engineering/pipeline.py run-all
```

## Observabilidade

Consulte:

```sql
SELECT *
FROM meta.pipeline_runs
ORDER BY started_at DESC;
```

Cada execução registra status, horário, quantidade de registros e erros.

## Dados sintéticos

Para estudar volume sem utilizar dados reais:

```bash
python data-engineering/synthetic/generate.py \
  --students 5000 \
  --teachers 50 \
  --questions 180 \
  --attempts 100000 \
  --answers-per-attempt 18
```

Os registros recebem `source_system = 'synthetic'` e são gravados na camada `raw`.

Depois:

```bash
python data-engineering/pipeline.py transform
```

Esses dados são deliberadamente artificiais e existem somente para estudo de volume, índices e consultas.

## Performance no PostgreSQL

Exemplo:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM warehouse.fact_answer
WHERE question_key = 10
  AND is_correct = false;
```

O projeto possui índices em chaves usadas por fatos, professores, alunos, datas e questões para permitir comparação de planos de execução.

## dbt

Copie o perfil de exemplo para seu diretório de perfis do dbt e ajuste as credenciais:

```bash
dbt debug --project-dir data-engineering/dbt
dbt build --project-dir data-engineering/dbt
```

O dbt é uma trilha alternativa de estudo. O pipeline principal continua funcionando somente com Python + SQL + PostgreSQL.

## Airflow

A DAG está em:

```text
data-engineering/airflow/dags/idiomas_pro_analytics.py
```

Fluxo:

```text
init -> extract -> transform -> quality
```

O agendamento de exemplo é diário às 01:00.

## Metabase

Suba o serviço:

```bash
docker compose -f docker-compose.analytics.yml up -d
```

Abra `http://localhost:3001` e conecte ao PostgreSQL.

No Windows/macOS com Docker Desktop, o host do banco pode ser `host.docker.internal`.

## Power BI

No Power BI Desktop:

1. Obter Dados.
2. PostgreSQL.
3. Informar servidor e banco.
4. Selecionar preferencialmente o schema `marts`.
5. Carregar as materialized views.

## Segurança e privacidade

O pipeline não copia hash de senha nem tokens de sessão.

Na camada de staging, e-mails são convertidos em hash MD5 para reduzir exposição direta de dados pessoais no Warehouse de estudos.

Para um sistema real, políticas de privacidade, criptografia, governança, LGPD e gestão de acessos precisariam ser aprofundadas.
