select
  f.cefr_level,
  c.level_order,
  count(*)::bigint as total_tests,
  round(avg(f.score)::numeric, 2) as average_score,
  round(avg(f.accuracy_rate)::numeric, 2) as average_accuracy_rate
from {{ ref('fact_test_attempt') }} f
left join {{ ref('dim_cefr_level') }} c on c.cefr_key = f.cefr_key
where f.status = 'COMPLETED'
  and f.cefr_level is not null
group by 1,2
order by c.level_order
