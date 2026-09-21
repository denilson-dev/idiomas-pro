DROP MATERIALIZED VIEW IF EXISTS marts.cefr_distribution;
CREATE MATERIALIZED VIEW marts.cefr_distribution AS
SELECT
    c.cefr_level,
    c.level_order,
    count(*) AS total_attempts,
    round(avg(f.score)::numeric, 2) AS average_score
FROM warehouse.fact_test_attempt f
JOIN warehouse.dim_cefr_level c ON c.cefr_key = f.cefr_key
WHERE f.status = 'COMPLETED'
GROUP BY c.cefr_level, c.level_order
ORDER BY c.level_order;

DROP MATERIALIZED VIEW IF EXISTS marts.teacher_performance;
CREATE MATERIALIZED VIEW marts.teacher_performance AS
SELECT
    t.teacher_id,
    t.name AS teacher_name,
    count(DISTINCT f.student_key) AS total_students,
    count(*) AS total_tests,
    round(avg(f.score)::numeric, 2) AS average_score,
    count(*) FILTER (WHERE c.cefr_level = 'A1') AS a1_students,
    count(*) FILTER (WHERE c.cefr_level = 'A2') AS a2_students,
    count(*) FILTER (WHERE c.cefr_level = 'B1') AS b1_students,
    count(*) FILTER (WHERE c.cefr_level = 'B2') AS b2_students,
    count(*) FILTER (WHERE c.cefr_level = 'C1') AS c1_students,
    count(*) FILTER (WHERE c.cefr_level = 'C2') AS c2_students
FROM warehouse.fact_test_attempt f
LEFT JOIN warehouse.dim_teacher t ON t.teacher_key = f.teacher_key
LEFT JOIN warehouse.dim_cefr_level c ON c.cefr_key = f.cefr_key
WHERE f.status = 'COMPLETED'
GROUP BY t.teacher_id, t.name;

DROP MATERIALIZED VIEW IF EXISTS marts.question_analysis;
CREATE MATERIALIZED VIEW marts.question_analysis AS
SELECT
    q.question_id,
    q.category,
    q.level,
    left(q.prompt, 120) AS question_preview,
    count(*) AS total_answers,
    count(*) FILTER (WHERE f.is_correct) AS correct_answers,
    count(*) FILTER (WHERE NOT f.is_correct) AS incorrect_answers,
    round(100.0 * avg(CASE WHEN f.is_correct THEN 1 ELSE 0 END), 2) AS accuracy_rate
FROM warehouse.fact_answer f
JOIN warehouse.dim_question q ON q.question_key = f.question_key
GROUP BY q.question_id, q.category, q.level, q.prompt;

DROP MATERIALIZED VIEW IF EXISTS marts.student_progress;
CREATE MATERIALIZED VIEW marts.student_progress AS
SELECT
    s.student_key,
    s.display_name,
    d.full_date,
    f.attempt_id,
    f.score,
    c.cefr_level,
    lag(c.cefr_level) OVER (
        PARTITION BY s.student_key
        ORDER BY f.completed_at NULLS LAST, f.created_at
    ) AS previous_level
FROM warehouse.fact_test_attempt f
JOIN warehouse.dim_student s ON s.student_key = f.student_key
LEFT JOIN warehouse.dim_cefr_level c ON c.cefr_key = f.cefr_key
LEFT JOIN warehouse.dim_date d ON d.date_key = f.date_key
WHERE f.status = 'COMPLETED';

CREATE UNIQUE INDEX IF NOT EXISTS uq_mart_question_analysis
ON marts.question_analysis (question_id);

CREATE INDEX IF NOT EXISTS idx_mart_student_progress_student_date
ON marts.student_progress (student_key, full_date);
