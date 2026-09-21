from __future__ import annotations

import argparse
import os
import sys
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg

BASE_DIR = Path(__file__).resolve().parent
SQL_DIR = BASE_DIR / "sql"


@dataclass(frozen=True)
class ExtractSpec:
    name: str
    target: str
    key: str
    columns: tuple[str, ...]
    select_sql: str


EXTRACTS = (
    ExtractSpec(
        "users",
        "raw.users",
        "user_id",
        ("user_id", "name", "email", "source_updated_at"),
        """
        SELECT id::text, name, email, "updatedAt"
        FROM "User"
        WHERE "updatedAt" > %s
        ORDER BY "updatedAt"
        """,
    ),
    ExtractSpec(
        "teachers",
        "raw.teachers",
        "teacher_id",
        ("teacher_id", "name", "email", "is_active", "source_updated_at"),
        """
        SELECT id::text, name, email, "isActive", "updatedAt"
        FROM "Teacher"
        WHERE "updatedAt" > %s
        ORDER BY "updatedAt"
        """,
    ),
    ExtractSpec(
        "questions",
        "raw.questions",
        "question_id",
        ("question_id", "prompt", "category", "level", "is_active", "source_updated_at"),
        """
        SELECT id::text, prompt, category::text, level::text, "isActive", "updatedAt"
        FROM "Question"
        WHERE "updatedAt" > %s
        ORDER BY "updatedAt"
        """,
    ),
    ExtractSpec(
        "test_attempts",
        "raw.test_attempts",
        "attempt_id",
        (
            "attempt_id", "user_id", "teacher_id", "student_name", "student_email",
            "language", "status", "total_questions", "score", "cefr_level",
            "created_at", "completed_at", "source_updated_at",
        ),
        """
        SELECT
            id::text,
            "userId"::text,
            "teacherId"::text,
            "studentName",
            "studentEmail",
            language,
            status::text,
            "totalQuestions",
            score,
            "cefrLevel"::text,
            "createdAt",
            "completedAt",
            coalesce("completedAt", "createdAt")
        FROM "TestAttempt"
        WHERE coalesce("completedAt", "createdAt") > %s
        ORDER BY coalesce("completedAt", "createdAt")
        """,
    ),
    ExtractSpec(
        "attempt_answers",
        "raw.attempt_answers",
        "answer_id",
        (
            "answer_id", "attempt_id", "question_id", "selected_answer",
            "is_correct", "category", "question_level", "created_at",
            "source_updated_at",
        ),
        """
        SELECT
            id::text,
            "attemptId"::text,
            "questionId"::text,
            "selectedAnswer",
            "isCorrect",
            category::text,
            "questionLevel"::text,
            "createdAt",
            "createdAt"
        FROM "AttemptAnswer"
        WHERE "createdAt" > %s
        ORDER BY "createdAt"
        """,
    ),
)


def database_url() -> str:
    value = os.getenv("ANALYTICS_DATABASE_URL") or os.getenv("DATABASE_URL")
    if not value:
        raise RuntimeError("Defina ANALYTICS_DATABASE_URL ou DATABASE_URL.")

    # Prisma aceita ?schema=public, mas libpq/psycopg não reconhece esse parâmetro.
    # Mantemos os demais parâmetros da URI (ex.: sslmode) e removemos apenas schema.
    parts = urlsplit(value)
    query = [(key, val) for key, val in parse_qsl(parts.query) if key != "schema"]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def execute_file(conn: psycopg.Connection, filename: str) -> None:
    sql = (SQL_DIR / filename).read_text(encoding="utf-8")
    with conn.cursor() as cur:
        cur.execute(sql)


def init_database(conn: psycopg.Connection) -> None:
    for filename in (
        "001_init_schemas.sql",
        "002_raw.sql",
        "003_staging.sql",
        "004_warehouse.sql",
        "007_quality.sql",
    ):
        execute_file(conn, filename)
    conn.commit()
    print("Camadas analíticas inicializadas.")


def start_run(conn: psycopg.Connection, name: str) -> uuid.UUID:
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO meta.pipeline_runs (run_id, pipeline_name, status)
            VALUES (%s, %s, 'RUNNING')
            """,
            (run_id, name),
        )
    conn.commit()
    return run_id


def finish_run(
    conn: psycopg.Connection,
    run_id: uuid.UUID,
    status: str,
    read: int = 0,
    written: int = 0,
    rejected: int = 0,
    error: str | None = None,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE meta.pipeline_runs
            SET finished_at = now(),
                status = %s,
                records_read = %s,
                records_written = %s,
                records_rejected = %s,
                error_message = %s
            WHERE run_id = %s
            """,
            (status, read, written, rejected, error, run_id),
        )
    conn.commit()


def watermark(conn: psycopg.Connection, name: str) -> datetime:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT last_successful_watermark FROM meta.pipeline_control WHERE pipeline_name = %s",
            (name,),
        )
        row = cur.fetchone()
    return row[0] if row and row[0] else datetime(1970, 1, 1, tzinfo=timezone.utc)


def save_watermark(
    conn: psycopg.Connection,
    name: str,
    value: datetime,
    run_id: uuid.UUID,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO meta.pipeline_control (
                pipeline_name, last_successful_watermark, last_run_id, updated_at
            )
            VALUES (%s, %s, %s, now())
            ON CONFLICT (pipeline_name) DO UPDATE SET
                last_successful_watermark = EXCLUDED.last_successful_watermark,
                last_run_id = EXCLUDED.last_run_id,
                updated_at = now()
            """,
            (name, value, run_id),
        )


def extract_one(
    conn: psycopg.Connection,
    spec: ExtractSpec,
    source_system: str,
    run_id: uuid.UUID,
) -> tuple[int, int]:
    current_watermark = watermark(conn, f"extract_{spec.name}")
    with conn.cursor() as cur:
        cur.execute(spec.select_sql, (current_watermark,))
        rows = cur.fetchall()

    if not rows:
        print(f"{spec.name}: sem novos registros.")
        return 0, 0

    batch_id = uuid.uuid4()
    target_columns = (*spec.columns, "source_system", "batch_id")
    placeholders = ", ".join(["%s"] * len(target_columns))
    updates = ", ".join(
        f"{col} = EXCLUDED.{col}"
        for col in spec.columns
        if col != spec.key
    )

    insert_sql = f"""
        INSERT INTO {spec.target} ({", ".join(target_columns)})
        VALUES ({placeholders})
        ON CONFLICT ({spec.key}, source_system) DO UPDATE SET
            {updates},
            batch_id = EXCLUDED.batch_id,
            ingested_at = now()
    """

    payload = [tuple(row) + (source_system, batch_id) for row in rows]
    with conn.cursor() as cur:
        cur.executemany(insert_sql, payload)

    max_watermark = max(row[spec.columns.index("source_updated_at")] for row in rows)
    save_watermark(conn, f"extract_{spec.name}", max_watermark, run_id)
    conn.commit()
    print(f"{spec.name}: {len(rows)} registros carregados.")
    return len(rows), len(rows)


def extract_all(conn: psycopg.Connection) -> None:
    source_system = os.getenv("DATA_SOURCE_SYSTEM", "idiomas_pro")
    run_id = start_run(conn, "extract_incremental")
    read = written = 0
    try:
        for spec in EXTRACTS:
            r, w = extract_one(conn, spec, source_system, run_id)
            read += r
            written += w
        finish_run(conn, run_id, "SUCCESS", read, written)
    except Exception as exc:
        conn.rollback()
        finish_run(conn, run_id, "FAILED", read, written, error=str(exc))
        raise


def transform(conn: psycopg.Connection) -> None:
    run_id = start_run(conn, "transform_warehouse")
    try:
        execute_file(conn, "005_transform.sql")
        execute_file(conn, "006_marts.sql")
        conn.commit()
        finish_run(conn, run_id, "SUCCESS")
        print("Warehouse e marts atualizados.")
    except Exception as exc:
        conn.rollback()
        finish_run(conn, run_id, "FAILED", error=str(exc))
        raise


def quality(conn: psycopg.Connection) -> int:
    run_id = start_run(conn, "data_quality")
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO data_quality.rejected_records (
                    run_id, source_table, record_key, error_reason
                )
                SELECT %s, source_table, record_key, error_reason
                FROM data_quality.current_issues
                """,
                (run_id,),
            )
            cur.execute("SELECT count(*) FROM data_quality.current_issues")
            issues = cur.fetchone()[0]
        conn.commit()

        status = "SUCCESS" if issues == 0 else "FAILED"
        finish_run(conn, run_id, status, rejected=issues)
        print(f"Data quality: {issues} problema(s) encontrado(s).")
        return issues
    except Exception as exc:
        conn.rollback()
        finish_run(conn, run_id, "FAILED", error=str(exc))
        raise


def run_all(conn: psycopg.Connection) -> int:
    init_database(conn)
    extract_all(conn)
    transform(conn)
    return quality(conn)


def main() -> int:
    parser = argparse.ArgumentParser(description="Pipeline analítico do Idiomas Pro")
    parser.add_argument(
        "command",
        choices=("init", "extract", "transform", "quality", "run-all"),
    )
    args = parser.parse_args()

    with psycopg.connect(database_url()) as conn:
        if args.command == "init":
            init_database(conn)
            return 0
        if args.command == "extract":
            extract_all(conn)
            return 0
        if args.command == "transform":
            transform(conn)
            return 0
        if args.command == "quality":
            return 1 if quality(conn) else 0
        return 1 if run_all(conn) else 0


if __name__ == "__main__":
    sys.exit(main())
