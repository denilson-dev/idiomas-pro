CREATE OR REPLACE VIEW staging.users AS
SELECT user_id, nullif(trim(name), '') AS name,
       md5(lower(trim(coalesce(email, '')))) AS email_hash,
       source_updated_at, source_system
FROM raw.users;

CREATE OR REPLACE VIEW staging.teachers AS
SELECT teacher_id, nullif(trim(name), '') AS name,
       md5(lower(trim(coalesce(email, '')))) AS email_hash,
       coalesce(is_active, true) AS is_active,
       source_updated_at, source_system
FROM raw.teachers;

CREATE OR REPLACE VIEW staging.questions AS
SELECT question_id, nullif(trim(prompt), '') AS prompt,
       upper(category) AS category, upper(level) AS level,
       coalesce(is_active, true) AS is_active,
       source_updated_at, source_system
FROM raw.questions;

CREATE OR REPLACE VIEW staging.test_attempts AS
SELECT attempt_id, user_id, teacher_id,
       nullif(trim(student_name), '') AS student_name,
       md5(lower(trim(coalesce(student_email, '')))) AS student_email_hash,
       upper(coalesce(language, 'ES')) AS language,
       upper(status) AS status,
       total_questions, score, upper(cefr_level) AS cefr_level,
       created_at, completed_at, source_updated_at, source_system
FROM raw.test_attempts;

CREATE OR REPLACE VIEW staging.attempt_answers AS
SELECT answer_id, attempt_id, question_id, selected_answer, is_correct,
       upper(category) AS category, upper(question_level) AS question_level,
       created_at, source_updated_at, source_system
FROM raw.attempt_answers;
