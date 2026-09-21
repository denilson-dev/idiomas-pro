from common import connect

DDL = """
CREATE MATERIALIZED VIEW IF NOT EXISTS marts.mv_cefr_distribution AS
SELECT
  cefr_level,
  COUNT(*)::bigint AS total_tests,
  ROUND(AVG(score)::numeric, 2) AS average_score
FROM warehouse.fact_test_attempt
WHERE status = 'COMPLETED'
GROUP BY cefr_level
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS mv_cefr_distribution_level_idx
  ON marts.mv_cefr_distribution(cefr_level);

CREATE MATERIALIZED VIEW IF NOT EXISTS marts.mv_daily_performance AS
SELECT
  attempt_date,
  COUNT(*)::bigint AS total_tests,
  COUNT(DISTINCT student_key)::bigint AS total_students,
  ROUND(AVG(score)::numeric, 2) AS average_score
FROM warehouse.fact_test_attempt
WHERE status = 'COMPLETED'
GROUP BY attempt_date
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS mv_daily_performance_date_idx
  ON marts.mv_daily_performance(attempt_date);
"""

if __name__ == "__main__":
    with connect(autocommit=True) as conn:
        conn.execute(DDL)
        conn.execute("REFRESH MATERIALIZED VIEW marts.mv_cefr_distribution")
        conn.execute("REFRESH MATERIALIZED VIEW marts.mv_daily_performance")
        conn.execute("ANALYZE marts.mv_cefr_distribution")
        conn.execute("ANALYZE marts.mv_daily_performance")
    print("Materialized views atualizadas.")
