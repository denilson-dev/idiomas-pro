select
  s.student_key,
  s.student_name,
  s.email,
  count(f.attempt_id)::bigint as total_tests,
  round(avg(f.score)::numeric, 2) as average_score,
  min(f.attempt_date) as first_test_date,
  max(f.attempt_date) as last_test_date,
  (array_agg(f.cefr_level order by f.completed_at desc nulls last))[1] as latest_cefr_level,
  round(avg(f.accuracy_rate)::numeric, 2) as average_accuracy_rate
from {{ ref('dim_student') }} s
left join {{ ref('fact_test_attempt') }} f
  on f.student_key = s.student_key
 and f.status = 'COMPLETED'
group by 1,2,3
