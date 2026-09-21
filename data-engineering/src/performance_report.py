from __future__ import annotations

import json
from pathlib import Path

from common import connect

REPORT_DIR = Path(__file__).resolve().parents[1] / "reports"
REPORT_DIR.mkdir(exist_ok=True)

QUERIES = {
    "teacher_performance_lookup": """
        SELECT *
        FROM warehouse.fact_test_attempt
        WHERE teacher_key = (
          SELECT teacher_key FROM warehouse.dim_teacher LIMIT 1
        )
        ORDER BY attempt_date DESC
    """,
    "question_accuracy": """
        SELECT question_key, COUNT(*) AS total,
               AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) AS accuracy
        FROM warehouse.fact_answer
        GROUP BY question_key
        ORDER BY total DESC
        LIMIT 20
    """,
}

if __name__ == "__main__":
    output = {}
    with connect() as conn:
        for name, query in QUERIES.items():
            plan = conn.execute(
                "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + query
            ).fetchone()[0]
            output[name] = plan

    target = REPORT_DIR / "explain-analyze.json"
    target.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"Relatório salvo em {target}")
