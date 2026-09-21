CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS warehouse;
CREATE SCHEMA IF NOT EXISTS marts;
CREATE SCHEMA IF NOT EXISTS data_quality;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS synthetic;

CREATE TABLE IF NOT EXISTS monitoring.pipeline_control (
  source_name TEXT PRIMARY KEY,
  last_watermark TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01 00:00:00+00',
  last_source_pk TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monitoring.pipeline_runs (
  run_id UUID PRIMARY KEY,
  pipeline_name TEXT NOT NULL,
  source_name TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  records_read BIGINT NOT NULL DEFAULT 0,
  records_written BIGINT NOT NULL DEFAULT 0,
  records_rejected BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS pipeline_runs_started_at_idx
  ON monitoring.pipeline_runs(started_at DESC);

CREATE TABLE IF NOT EXISTS data_quality.rejected_records (
  rejection_id BIGSERIAL PRIMARY KEY,
  run_id UUID,
  source_table TEXT NOT NULL,
  record_key TEXT,
  error_reason TEXT NOT NULL,
  payload JSONB,
  rejected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rejected_records_source_idx
  ON data_quality.rejected_records(source_table, rejected_at DESC);

CREATE TABLE IF NOT EXISTS raw.users (
  source_pk TEXT NOT NULL,
  payload JSONB NOT NULL,
  source_updated_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  batch_id UUID NOT NULL,
  source_system TEXT NOT NULL DEFAULT 'idiomas_pro:public',
  PRIMARY KEY (source_system, source_pk)
);

CREATE TABLE IF NOT EXISTS raw.teachers (LIKE raw.users INCLUDING ALL);
CREATE TABLE IF NOT EXISTS raw.questions (LIKE raw.users INCLUDING ALL);
CREATE TABLE IF NOT EXISTS raw.test_attempts (LIKE raw.users INCLUDING ALL);
CREATE TABLE IF NOT EXISTS raw.attempt_answers (LIKE raw.users INCLUDING ALL);

CREATE INDEX IF NOT EXISTS raw_users_watermark_idx ON raw.users(source_updated_at);
CREATE INDEX IF NOT EXISTS raw_teachers_watermark_idx ON raw.teachers(source_updated_at);
CREATE INDEX IF NOT EXISTS raw_questions_watermark_idx ON raw.questions(source_updated_at);
CREATE INDEX IF NOT EXISTS raw_attempts_watermark_idx ON raw.test_attempts(source_updated_at);
CREATE INDEX IF NOT EXISTS raw_answers_watermark_idx ON raw.attempt_answers(source_updated_at);
