-- Execute após gerar um volume maior de dados sintéticos.

EXPLAIN (ANALYZE, BUFFERS)
SELECT
    q.question_id,
    count(*) AS total_answers,
    count(*) FILTER (WHERE NOT f.is_correct) AS errors
FROM warehouse.fact_answer f
JOIN warehouse.dim_question q ON q.question_key = f.question_key
WHERE f.question_key = 10
GROUP BY q.question_id;

-- Depois de executar o laboratório de particionamento, compare o plano:
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*)
FROM warehouse.fact_answer_partitioned
WHERE created_at >= '2026-01-01'
  AND created_at < '2027-01-01'
  AND is_correct = false;

-- Estatísticas úteis para análise:
SELECT
    schemaname,
    relname,
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname IN ('warehouse', 'marts')
ORDER BY idx_scan DESC;
