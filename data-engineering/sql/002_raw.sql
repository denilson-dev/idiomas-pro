CREATE TABLE IF NOT EXISTS raw.users (
    user_id text NOT NULL,
    name text,
    email text,
    source_updated_at timestamptz NOT NULL,
    source_system text NOT NULL,
    batch_id uuid NOT NULL,
    ingested_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, source_system)
);

CREATE TABLE IF NOT EXISTS raw.teachers (
    teacher_id text NOT NULL,
    name text,
    email text,
    is_active boolean,
    source_updated_at timestamptz NOT NULL,
    source_system text NOT NULL,
    batch_id uuid NOT NULL,
    ingested_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (teacher_id, source_system)
);

CREATE TABLE IF NOT EXISTS raw.questions (
    question_id text NOT NULL,
    prompt text,
    category text,
    level text,
    is_active boolean,
    source_updated_at timestamptz NOT NULL,
    source_system text NOT NULL,
    batch_id uuid NOT NULL,
    ingested_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (question_id, source_system)
);

CREATE TABLE IF NOT EXISTS raw.test_attempts (
    attempt_id text NOT NULL,
    user_id text,
    teacher_id text,
    student_name text,
    student_email text,
    language text,
    status text,
    total_questions integer,
    score integer,
    cefr_level text,
    created_at timestamptz,
    completed_at timestamptz,
    source_updated_at timestamptz NOT NULL,
    source_system text NOT NULL,
    batch_id uuid NOT NULL,
    ingested_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (attempt_id, source_system)
);

CREATE TABLE IF NOT EXISTS raw.attempt_answers (
    answer_id text NOT NULL,
    attempt_id text,
    question_id text,
    selected_answer text,
    is_correct boolean,
    category text,
    question_level text,
    created_at timestamptz,
    source_updated_at timestamptz NOT NULL,
    source_system text NOT NULL,
    batch_id uuid NOT NULL,
    ingested_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (answer_id, source_system)
);

CREATE INDEX IF NOT EXISTS idx_raw_attempts_watermark ON raw.test_attempts (source_updated_at);
CREATE INDEX IF NOT EXISTS idx_raw_answers_attempt ON raw.attempt_answers (attempt_id);
CREATE INDEX IF NOT EXISTS idx_raw_questions_category_level ON raw.questions (category, level);
