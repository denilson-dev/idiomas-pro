from __future__ import annotations

from datetime import date

from psycopg import sql

from common import connect


def month_start(value: date) -> date:
    return value.replace(day=1)


def next_month(value: date) -> date:
    if value.month == 12:
        return value.replace(year=value.year + 1, month=1, day=1)
    return value.replace(month=value.month + 1, day=1)


if __name__ == "__main__":
    with connect(autocommit=True) as conn:
        bounds = conn.execute(
            "SELECT MIN(answer_date), MAX(answer_date) FROM warehouse.fact_answer"
        ).fetchone()

        if not bounds or bounds[0] is None:
            raise SystemExit("warehouse.fact_answer ainda não possui dados.")

        start = month_start(bounds[0])
        end = next_month(month_start(bounds[1]))

        conn.execute("DROP TABLE IF EXISTS warehouse.fact_answer_partitioned CASCADE")
        conn.execute(
            """
            CREATE TABLE warehouse.fact_answer_partitioned
            (LIKE warehouse.fact_answer INCLUDING DEFAULTS INCLUDING CONSTRAINTS)
            PARTITION BY RANGE (answer_date)
            """
        )

        cursor = start
        while cursor < end:
            nxt = next_month(cursor)
            partition_name = f"fact_answer_{cursor.year}_{cursor.month:02d}"
            conn.execute(
                sql.SQL(
                    """
                    CREATE TABLE warehouse.{partition}
                    PARTITION OF warehouse.fact_answer_partitioned
                    FOR VALUES FROM (%s) TO (%s)
                    """
                ).format(partition=sql.Identifier(partition_name)),
                (cursor, nxt),
            )
            cursor = nxt

        conn.execute(
            """
            INSERT INTO warehouse.fact_answer_partitioned
            SELECT * FROM warehouse.fact_answer
            """
        )
        conn.execute(
            """
            CREATE INDEX fact_answer_partitioned_attempt_idx
            ON warehouse.fact_answer_partitioned(attempt_key)
            """
        )
        conn.execute(
            """
            CREATE INDEX fact_answer_partitioned_question_idx
            ON warehouse.fact_answer_partitioned(question_key)
            """
        )
        conn.execute("ANALYZE warehouse.fact_answer_partitioned")

    print("Tabela particionada de demonstração reconstruída com sucesso.")
