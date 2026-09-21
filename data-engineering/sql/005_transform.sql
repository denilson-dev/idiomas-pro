INSERT INTO warehouse.dim_language (language_code, language_name)
VALUES ('ES','Espanhol'), ('EN','Inglês'), ('FR','Francês')
ON CONFLICT (language_code) DO NOTHING;

INSERT INTO warehouse.dim_cefr_level (cefr_level, level_order)
VALUES ('A1',1),('A2',2),('B1',3),('B2',4),('C1',5),('C2',6)
ON CONFLICT (cefr_level) DO UPDATE SET level_order = EXCLUDED.level_order;

INSERT INTO warehouse.dim_date (
    date_key, full_date, year, quarter, month, month_name,
    day, day_of_week, day_name, is_weekend
)
SELECT DISTINCT
    to_char(d::date, 'YYYYMMDD')::integer,
    d::date,
    extract(year from d)::smallint,
    extract(quarter from d)::smallint,
    extract(month from d)::smallint,
    to_char(d, 'FMMonth'),
    extract(day from d)::smallint,
    extract(isodow from d)::smallint,
    to_char(d, 'FMDay'),
    extract(isodow from d) IN (6,7)
FROM (
    SELECT coalesce(created_at, completed_at, now()) AS d FROM staging.test_attempts
    UNION
    SELECT coalesce(created_at, now()) AS d FROM staging.attempt_answers
) dates
ON CONFLICT (date_key) DO NOTHING;

INSERT INTO warehouse.dim_student (
    student_natural_key, user_id, display_name, email_hash,
    source_system, first_seen_at, last_seen_at
)
SELECT
    CASE WHEN a.user_id IS NOT NULL THEN 'user:' || a.user_id ELSE 'guest:' || a.attempt_id END,
    a.user_id,
    coalesce(u.name, a.student_name, 'Visitante'),
    CASE WHEN a.user_id IS NOT NULL THEN u.email_hash ELSE a.student_email_hash END,
    a.source_system,
    coalesce(a.created_at, now()),
    coalesce(a.completed_at, a.created_at, now())
FROM staging.test_attempts a
LEFT JOIN staging.users u
  ON u.user_id = a.user_id
 AND u.source_system = a.source_system
ON CONFLICT (student_natural_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    email_hash = EXCLUDED.email_hash,
    last_seen_at = greatest(warehouse.dim_student.last_seen_at, EXCLUDED.last_seen_at);

WITH incoming AS (
    SELECT
        teacher_id, name, email_hash, is_active, source_system, source_updated_at,
        md5(concat_ws('|', coalesce(name,''), coalesce(email_hash,''), coalesce(is_active::text,''))) AS hashdiff
    FROM staging.teachers
),
changed AS (
    SELECT i.*
    FROM incoming i
    JOIN warehouse.dim_teacher d
      ON d.teacher_id = i.teacher_id
     AND d.source_system = i.source_system
     AND d.is_current
    WHERE d.hashdiff <> i.hashdiff
)
UPDATE warehouse.dim_teacher d
SET valid_to = c.source_updated_at,
    is_current = false
FROM changed c
WHERE d.teacher_id = c.teacher_id
  AND d.source_system = c.source_system
  AND d.is_current;

INSERT INTO warehouse.dim_teacher (
    teacher_id, name, email_hash, is_active, source_system,
    valid_from, valid_to, is_current, hashdiff
)
SELECT
    i.teacher_id, i.name, i.email_hash, i.is_active, i.source_system,
    i.source_updated_at, NULL, true, i.hashdiff
FROM (
    SELECT
        teacher_id, name, email_hash, is_active, source_system, source_updated_at,
        md5(concat_ws('|', coalesce(name,''), coalesce(email_hash,''), coalesce(is_active::text,''))) AS hashdiff
    FROM staging.teachers
) i
LEFT JOIN warehouse.dim_teacher d
  ON d.teacher_id = i.teacher_id
 AND d.source_system = i.source_system
 AND d.is_current
WHERE d.teacher_key IS NULL OR d.hashdiff <> i.hashdiff;

INSERT INTO warehouse.dim_question (
    question_id, source_system, prompt, category, level, is_active
)
SELECT question_id, source_system, prompt, category, level, is_active
FROM staging.questions
ON CONFLICT (question_id, source_system) DO UPDATE SET
    prompt = EXCLUDED.prompt,
    category = EXCLUDED.category,
    level = EXCLUDED.level,
    is_active = EXCLUDED.is_active;

INSERT INTO warehouse.fact_test_attempt (
    attempt_id, source_system, student_key, teacher_key,
    language_key, cefr_key, date_key, total_questions,
    correct_answers, incorrect_answers, score, status,
    created_at, completed_at
)
SELECT
    a.attempt_id,
    a.source_system,
    s.student_key,
    t.teacher_key,
    l.language_key,
    c.cefr_key,
    CASE WHEN coalesce(a.completed_at, a.created_at) IS NULL THEN NULL
         ELSE to_char(coalesce(a.completed_at, a.created_at)::date, 'YYYYMMDD')::integer END,
    a.total_questions,
    count(ans.answer_id) FILTER (WHERE ans.is_correct),
    count(ans.answer_id) FILTER (WHERE NOT ans.is_correct),
    a.score,
    a.status,
    a.created_at,
    a.completed_at
FROM staging.test_attempts a
JOIN warehouse.dim_student s
  ON s.student_natural_key = CASE WHEN a.user_id IS NOT NULL THEN 'user:' || a.user_id ELSE 'guest:' || a.attempt_id END
JOIN warehouse.dim_language l ON l.language_code = a.language
LEFT JOIN warehouse.dim_cefr_level c ON c.cefr_level = a.cefr_level
LEFT JOIN warehouse.dim_teacher t
  ON t.teacher_id = a.teacher_id
 AND t.source_system = a.source_system
 AND a.created_at >= t.valid_from
 AND (t.valid_to IS NULL OR a.created_at < t.valid_to)
LEFT JOIN staging.attempt_answers ans
  ON ans.attempt_id = a.attempt_id
 AND ans.source_system = a.source_system
GROUP BY
    a.attempt_id, a.source_system, s.student_key, t.teacher_key,
    l.language_key, c.cefr_key, a.completed_at, a.created_at,
    a.total_questions, a.score, a.status
ON CONFLICT (attempt_id, source_system) DO UPDATE SET
    student_key = EXCLUDED.student_key,
    teacher_key = EXCLUDED.teacher_key,
    language_key = EXCLUDED.language_key,
    cefr_key = EXCLUDED.cefr_key,
    date_key = EXCLUDED.date_key,
    total_questions = EXCLUDED.total_questions,
    correct_answers = EXCLUDED.correct_answers,
    incorrect_answers = EXCLUDED.incorrect_answers,
    score = EXCLUDED.score,
    status = EXCLUDED.status,
    completed_at = EXCLUDED.completed_at;

INSERT INTO warehouse.fact_answer (
    answer_id, source_system, attempt_key, question_key,
    date_key, is_correct, category, question_level, created_at
)
SELECT
    a.answer_id,
    a.source_system,
    f.attempt_key,
    q.question_key,
    CASE WHEN a.created_at IS NULL THEN NULL ELSE to_char(a.created_at::date, 'YYYYMMDD')::integer END,
    a.is_correct,
    a.category,
    a.question_level,
    a.created_at
FROM staging.attempt_answers a
JOIN warehouse.fact_test_attempt f
  ON f.attempt_id = a.attempt_id
 AND f.source_system = a.source_system
JOIN warehouse.dim_question q
  ON q.question_id = a.question_id
 AND q.source_system = a.source_system
ON CONFLICT (answer_id, source_system) DO UPDATE SET
    is_correct = EXCLUDED.is_correct,
    category = EXCLUDED.category,
    question_level = EXCLUDED.question_level;
