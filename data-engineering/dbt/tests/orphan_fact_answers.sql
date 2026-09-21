select a.*
from {{ ref('fact_answer') }} a
left join {{ ref('fact_test_attempt') }} t on t.attempt_key = a.attempt_key
where t.attempt_key is null
