CREATE SCHEMA IF NOT EXISTS meta;
CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS warehouse;
CREATE SCHEMA IF NOT EXISTS marts;
CREATE SCHEMA IF NOT EXISTS data_quality;

CREATE TABLE IF NOT EXISTS meta.pipeline_control (
    pipeline_name text PRIMARY KEY,
    last_successful_watermark timestamptz,
    last_run_id uuid,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta.pipeline_runs (
    run_id uuid PRIMARY KEY,
    pipeline_name text NOT NULL,
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    records_read bigint NOT NULL DEFAULT 0,
    records_written bigint NOT NULL DEFAULT 0,
    records_rejected bigint NOT NULL DEFAULT 0,
    status text NOT NULL CHECK (status IN ('RUNNING','SUCCESS','FAILED')),
    error_message text
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_name_started
ON meta.pipeline_runs (pipeline_name, started_at DESC);
