CREATE TABLE IF NOT EXISTS data_quality.rejected_records (
    rejection_id bigserial PRIMARY KEY,
    run_id uuid,
    source_table text NOT NULL,
    record_key text,
    error_reason text NOT NULL,
    payload jsonb,
    rejected_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW data_quality.current_issues AS
SELECT 'staging.test_attempts'::text AS source_table,
       attempt_id AS record_key,
       'score_out_of_range'::text AS error_reason
FROM staging.test_attempts
WHERE score IS NOT NULL AND (score < 0 OR score > 100)

UNION ALL
SELECT 'staging.test_attempts', attempt_id, 'invalid_cefr_level'
FROM staging.test_attempts
WHERE cefr_level IS NOT NULL
  AND cefr_level NOT IN ('A1','A2','B1','B2','C1','C2')

UNION ALL
SELECT 'staging.attempt_answers', a.answer_id, 'missing_attempt'
FROM staging.attempt_answers a
LEFT JOIN staging.test_attempts t
  ON t.attempt_id = a.attempt_id AND t.source_system = a.source_system
WHERE t.attempt_id IS NULL

UNION ALL
SELECT 'staging.attempt_answers', a.answer_id, 'missing_question'
FROM staging.attempt_answers a
LEFT JOIN staging.questions q
  ON q.question_id = a.question_id AND q.source_system = a.source_system
WHERE q.question_id IS NULL;

CREATE OR REPLACE VIEW data_quality.summary AS
SELECT source_table, error_reason, count(*) AS issue_count
FROM data_quality.current_issues
GROUP BY source_table, error_reason;
