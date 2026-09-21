-- Laboratório educacional de particionamento.
-- Não é executado pelo pipeline principal.
-- Cria uma cópia particionada dos fatos de resposta para estudar pruning de partições.

DROP TABLE IF EXISTS warehouse.fact_answer_partitioned CASCADE;

CREATE TABLE warehouse.fact_answer_partitioned (
    answer_key bigint NOT NULL,
    answer_id text NOT NULL,
    source_system text NOT NULL,
    attempt_key bigint NOT NULL,
    question_key bigint NOT NULL,
    date_key integer,
    is_correct boolean NOT NULL,
    category text,
    question_level text,
    created_at timestamptz NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE warehouse.fact_answer_partitioned_2025
PARTITION OF warehouse.fact_answer_partitioned
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE warehouse.fact_answer_partitioned_2026
PARTITION OF warehouse.fact_answer_partitioned
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE warehouse.fact_answer_partitioned_future
PARTITION OF warehouse.fact_answer_partitioned
FOR VALUES FROM ('2027-01-01') TO (MAXVALUE);

CREATE TABLE warehouse.fact_answer_partitioned_older
PARTITION OF warehouse.fact_answer_partitioned
FOR VALUES FROM (MINVALUE) TO ('2025-01-01');

INSERT INTO warehouse.fact_answer_partitioned
SELECT
    answer_key, answer_id, source_system, attempt_key, question_key,
    date_key, is_correct, category, question_level, created_at
FROM warehouse.fact_answer
WHERE created_at IS NOT NULL;

CREATE INDEX idx_fact_answer_p_question
ON warehouse.fact_answer_partitioned (question_key, is_correct);
