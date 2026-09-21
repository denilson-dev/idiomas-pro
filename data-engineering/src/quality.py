from __future__ import annotations

import json
import uuid

from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from common import connect

CHECKS = [
    (
        "warehouse.fact_test_attempt",
        "score_out_of_range",
        """
        SELECT attempt_id::text AS record_key, to_jsonb(t) AS payload
        FROM warehouse.fact_test_attempt t
        WHERE score IS NOT NULL AND (score < 0 OR score > 100)
        """,
    ),
    (
        "warehouse.fact_test_attempt",
        "invalid_cefr_level",
        """
        SELECT attempt_id::text AS record_key, to_jsonb(t) AS payload
        FROM warehouse.fact_test_attempt t
        WHERE cefr_level IS NOT NULL
          AND cefr_level NOT IN ('A1','A2','B1','B2','C1','C2')
        """,
    ),
    (
        "warehouse.fact_answer",
        "orphan_attempt",
        """
        SELECT answer_id::text AS record_key, to_jsonb(a) AS payload
        FROM warehouse.fact_answer a
        LEFT JOIN warehouse.fact_test_attempt t ON t.attempt_id = a.attempt_id
        WHERE t.attempt_id IS NULL
        """,
    ),
    (
        "warehouse.fact_answer",
        "orphan_question",
        """
        SELECT answer_id::text AS record_key, to_jsonb(a) AS payload
        FROM warehouse.fact_answer a
        LEFT JOIN warehouse.dim_question q ON q.question_id = a.question_id
        WHERE q.question_id IS NULL
        """,
    ),
]


def main():
    run_id = uuid.uuid4()
    rejected = 0

    with connect() as conn:
        conn.execute(
            """
            INSERT INTO monitoring.pipeline_runs
              (run_id, pipeline_name, status)
            VALUES (%s, 'data_quality', 'RUNNING')
            """,
            (run_id,),
        )
        conn.commit()

        try:
            for source_table, reason, query in CHECKS:
                with conn.cursor(row_factory=dict_row) as cur:
                    cur.execute(query)
                    rows = cur.fetchall()

                rejected += len(rows)
                for row in rows:
                    conn.execute(
                        """
                        INSERT INTO data_quality.rejected_records
                          (run_id, source_table, record_key, error_reason, payload)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            run_id,
                            source_table,
                            row["record_key"],
                            reason,
                            Jsonb(row["payload"]),
                        ),
                    )

            conn.execute(
                """
                UPDATE monitoring.pipeline_runs
                SET finished_at = NOW(),
                    records_rejected = %s,
                    status = %s
                WHERE run_id = %s
                """,
                (rejected, "FAILED" if rejected else "SUCCESS", run_id),
            )
            conn.commit()
        except Exception as exc:
            conn.rollback()
            conn.execute(
                """
                UPDATE monitoring.pipeline_runs
                SET finished_at = NOW(), status = 'FAILED', error_message = %s
                WHERE run_id = %s
                """,
                (str(exc)[:2000], run_id),
            )
            conn.commit()
            raise

    if rejected:
        raise SystemExit(f"Data Quality encontrou {rejected} registro(s) inválido(s).")

    print("Data Quality: nenhum problema encontrado.")


if __name__ == "__main__":
    main()
