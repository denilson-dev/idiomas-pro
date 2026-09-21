select
  t.teacher_key,
  t.teacher_id,
  t.teacher_name,
  count(f.attempt_id)::bigint as total_tests,
  count(distinct f.student_key)::bigint as total_students,
  round(avg(f.score)::numeric, 2) as average_score,
  round(avg(f.accuracy_rate)::numeric, 2) as average_accuracy_rate,
  count(*) filter (where f.cefr_level = 'A1')::bigint as a1_tests,
  count(*) filter (where f.cefr_level = 'A2')::bigint as a2_tests,
  count(*) filter (where f.cefr_level = 'B1')::bigint as b1_tests,
  count(*) filter (where f.cefr_level = 'B2')::bigint as b2_tests,
  count(*) filter (where f.cefr_level = 'C1')::bigint as c1_tests,
  count(*) filter (where f.cefr_level = 'C2')::bigint as c2_tests,
  max(f.completed_at) as last_test_at
from {{ ref('dim_teacher') }} t
left join {{ ref('fact_test_attempt') }} f
  on f.teacher_key = t.teacher_key
 and f.status = 'COMPLETED'
group by 1,2,3
