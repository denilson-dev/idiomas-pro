from __future__ import annotations

import json
import os
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from psycopg import sql
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from common import connect, safe_identifier

SOURCE_SCHEMA = safe_identifier(os.getenv("SOURCE_SCHEMA", "public"))
BATCH_SIZE = max(1, int(os.getenv("PIPELINE_BATCH_SIZE", "1000")))

SOURCES = {
    "users": {"table": "User", "watermark": "updatedAt"},
    "teachers": {"table": "Teacher", "watermark": "updatedAt"},
    "questions": {"table": "Question", "watermark": "updatedAt"},
    "test_attempts": {"table": "TestAttempt", "watermark": "updatedAt"},
    "attempt_answers": {"table": "AttemptAnswer", "watermark": "createdAt"},
}


def json_ready(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: json_ready(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_ready(item) for item in value]
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, uuid.UUID):
        return str(value)
    return value


def start_run(conn, source_name: str) -> uuid.UUID:
    run_id = uuid.uuid4()
    conn.execute(
        """
        INSERT INTO monitoring.pipeline_runs
          (run_id, pipeline_name, source_name, status)
        VALUES (%s, 'incremental_ingestion', %s, 'RUNNING')
        """,
        (run_id, source_name),
    )
    return run_id


def finish_run(conn, run_id: uuid.UUID, status: str, read: int, written: int, error: str | None = None):
    conn.execute(
        """
        UPDATE monitoring.pipeline_runs
        SET finished_at = NOW(),
            records_read = %s,
            records_written = %s,
            status = %s,
            error_message = %s
        WHERE run_id = %s
        """,
        (read, written, status, error, run_id),
    )


def ingest_source(source_name: str, config: dict[str, str]) -> tuple[int, int]:
    total_read = 0
    total_written = 0

    with connect() as conn:
        run_id = start_run(conn, source_name)
        conn.commit()

        try:
            control = conn.execute(
                """
                SELECT last_watermark, last_source_pk
                FROM monitoring.pipeline_control
                WHERE source_name = %s
                """,
                (source_name,),
            ).fetchone()

            if control:
                last_watermark, last_source_pk = control
            else:
                last_watermark = datetime(1970, 1, 1)
                last_source_pk = ""

            source_table = sql.Identifier(SOURCE_SCHEMA, config["table"])
            watermark_col = sql.Identifier(config["watermark"])
            raw_table = sql.Identifier("raw", source_name)

            while True:
                query = sql.SQL(
                    """
                    SELECT *
                    FROM {source_table}
                    WHERE ({watermark}, "id") > (%s, %s)
                    ORDER BY {watermark}, "id"
                    LIMIT %s
                    """
                ).format(source_table=source_table, watermark=watermark_col)

                with conn.cursor(row_factory=dict_row) as cur:
                    cur.execute(query, (last_watermark, last_source_pk, BATCH_SIZE))
                    rows = cur.fetchall()

                if not rows:
                    break

                batch_id = uuid.uuid4()
                total_read += len(rows)

                upsert = sql.SQL(
                    """
                    INSERT INTO {raw_table}
                      (source_pk, payload, source_updated_at, ingested_at, batch_id, source_system)
                    VALUES (%s, %s, %s, NOW(), %s, %s)
                    ON CONFLICT (source_pk)
                    DO UPDATE SET
                      payload = EXCLUDED.payload,
                      source_updated_at = EXCLUDED.source_updated_at,
                      ingested_at = NOW(),
                      batch_id = EXCLUDED.batch_id,
                      source_system = EXCLUDED.source_system
                    """
                ).format(raw_table=raw_table)

                values = []
                for row in rows:
                    payload = json_ready(row)
                    source_pk = str(row["id"])
                    watermark = row[config["watermark"]]
                    values.append(
                        (
                            source_pk,
                            Jsonb(payload),
                            watermark,
                            batch_id,
                            f"idiomas_pro:{SOURCE_SCHEMA}",
                        )
                    )

                with conn.cursor() as cur:
                    cur.executemany(upsert, values)

                last_row = rows[-1]
                last_watermark = last_row[config["watermark"]]
                last_source_pk = str(last_row["id"])
                total_written += len(rows)

                conn.execute(
                    """
                    INSERT INTO monitoring.pipeline_control
                      (source_name, last_watermark, last_source_pk, updated_at)
                    VALUES (%s, %s, %s, NOW())
                    ON CONFLICT (source_name)
                    DO UPDATE SET
                      last_watermark = EXCLUDED.last_watermark,
                      last_source_pk = EXCLUDED.last_source_pk,
                      updated_at = NOW()
                    """,
                    (source_name, last_watermark, last_source_pk),
                )
                conn.commit()

            finish_run(conn, run_id, "SUCCESS", total_read, total_written)
            conn.commit()
        except Exception as exc:
            conn.rollback()
            finish_run(conn, run_id, "FAILED", total_read, total_written, str(exc)[:2000])
            conn.commit()
            raise

    return total_read, total_written


def main():
    print(f"Origem: schema {SOURCE_SCHEMA!r} | lote: {BATCH_SIZE}")
    for source_name, config in SOURCES.items():
        read, written = ingest_source(source_name, config)
        print(f"{source_name}: lidos={read}, gravados={written}")


if __name__ == "__main__":
    main()
