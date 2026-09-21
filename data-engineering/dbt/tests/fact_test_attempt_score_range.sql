select *
from {{ ref('fact_test_attempt') }}
where score is not null
  and (score < 0 or score > 100)
