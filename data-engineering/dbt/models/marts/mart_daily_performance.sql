select
    date_trunc('day', completed_at)::date as activity_date,
    language,
    cefr_level,
    count(*) as total_tests,
    round(avg(score)::numeric, 2) as average_score
from {{ ref('stg_test_attempts') }}
where status = 'COMPLETED'
group by 1, 2, 3
