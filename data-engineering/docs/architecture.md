# Arquitetura de Engenharia de Dados

## Origem

O schema `public` continua sendo o banco OLTP da aplicação.

## RAW

Cada tabela raw guarda:

- `source_pk`;
- `payload` JSONB;
- `source_updated_at`;
- `ingested_at`;
- `batch_id`;
- `source_system`.

Essa abordagem preserva a representação recebida e desacopla ingestão da modelagem analítica.

## STAGING

O dbt converte JSONB para tipos relacionais e padroniza nomes e tipos.

## WAREHOUSE

Modelo dimensional em estrela:

```text
dim_student ─────┐
dim_teacher ─────┤
dim_language ────┼── fact_test_attempt
dim_cefr_level ──┤
dim_date ────────┘

dim_question ─────── fact_answer
                       │
                       └── fact_test_attempt
```

## SCD Type 2

`teachers_snapshot` usa dbt Snapshot com estratégia timestamp. Alterações de cadastro do professor são preservadas historicamente no snapshot.

A dimensão `dim_teacher` representa o estado atual para facilitar o consumo dos marts.

## Data Quality

A qualidade é validada em duas camadas:

1. testes do dbt;
2. verificações Python com persistência de rejeições.

## Observabilidade

`monitoring.pipeline_runs` registra:

- início/fim;
- origem;
- quantidade lida;
- quantidade gravada;
- quantidade rejeitada;
- status;
- erro.

`monitoring.pipeline_control` mantém os watermarks de carga incremental.

## Escalabilidade didática

O projeto possui gerador sintético e particionamento de demonstração para praticar cenários de volume sem afirmar que a carga atual exige essas técnicas.
