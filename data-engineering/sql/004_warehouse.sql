CREATE TABLE IF NOT EXISTS warehouse.dim_date (
    date_key integer PRIMARY KEY,
    full_date date UNIQUE NOT NULL,
    year smallint NOT NULL,
    quarter smallint NOT NULL,
    month smallint NOT NULL,
    month_name text NOT NULL,
    day smallint NOT NULL,
    day_of_week smallint NOT NULL,
    day_name text NOT NULL,
    is_weekend boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse.dim_language (
    language_key smallserial PRIMARY KEY,
    language_code text UNIQUE NOT NULL,
    language_name text NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse.dim_cefr_level (
    cefr_key smallserial PRIMARY KEY,
    cefr_level text UNIQUE NOT NULL,
    level_order smallint NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse.dim_student (
    student_key bigserial PRIMARY KEY,
    student_natural_key text UNIQUE NOT NULL,
    user_id text,
    display_name text,
    email_hash text,
    source_system text NOT NULL,
    first_seen_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouse.dim_teacher (
    teacher_key bigserial PRIMARY KEY,
    teacher_id text NOT NULL,
    name text,
    email_hash text,
    is_active boolean,
    source_system text NOT NULL,
    valid_from timestamptz NOT NULL,
    valid_to timestamptz,
    is_current boolean NOT NULL DEFAULT true,
    hashdiff text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_dim_teacher_current
ON warehouse.dim_teacher (teacher_id, source_system)
WHERE is_current;

CREATE INDEX IF NOT EXISTS idx_dim_teacher_history
ON warehouse.dim_teacher (teacher_id, source_system, valid_from, valid_to);

CREATE TABLE IF NOT EXISTS warehouse.dim_question (
    question_key bigserial PRIMARY KEY,
    question_id text NOT NULL,
    source_system text NOT NULL,
    prompt text,
    category text,
    level text,
    is_active boolean,
    UNIQUE(question_id, source_system)
);

CREATE TABLE IF NOT EXISTS warehouse.fact_test_attempt (
    attempt_key bigserial PRIMARY KEY,
    attempt_id text NOT NULL,
    source_system text NOT NULL,
    student_key bigint NOT NULL REFERENCES warehouse.dim_student(student_key),
    teacher_key bigint REFERENCES warehouse.dim_teacher(teacher_key),
    language_key smallint NOT NULL REFERENCES warehouse.dim_language(language_key),
    cefr_key smallint REFERENCES warehouse.dim_cefr_level(cefr_key),
    date_key integer REFERENCES warehouse.dim_date(date_key),
    total_questions integer,
    correct_answers integer,
    incorrect_answers integer,
    score integer,
    status text,
    created_at timestamptz,
    completed_at timestamptz,
    UNIQUE(attempt_id, source_system)
);

CREATE TABLE IF NOT EXISTS warehouse.fact_answer (
    answer_key bigserial PRIMARY KEY,
    answer_id text NOT NULL,
    source_system text NOT NULL,
    attempt_key bigint NOT NULL REFERENCES warehouse.fact_test_attempt(attempt_key) ON DELETE CASCADE,
    question_key bigint NOT NULL REFERENCES warehouse.dim_question(question_key),
    date_key integer REFERENCES warehouse.dim_date(date_key),
    is_correct boolean NOT NULL,
    category text,
    question_level text,
    created_at timestamptz,
    UNIQUE(answer_id, source_system)
);

CREATE INDEX IF NOT EXISTS idx_fact_attempt_teacher_date
ON warehouse.fact_test_attempt (teacher_key, date_key);

CREATE INDEX IF NOT EXISTS idx_fact_attempt_student_date
ON warehouse.fact_test_attempt (student_key, date_key);

CREATE INDEX IF NOT EXISTS idx_fact_answer_question_correct
ON warehouse.fact_answer (question_key, is_correct);
