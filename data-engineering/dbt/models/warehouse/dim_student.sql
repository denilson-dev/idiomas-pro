{{ config(
  materialized='table',
  indexes=[
    {'columns': ['student_key'], 'unique': true},
    {'columns': ['email']}
  ]
) }}
with candidates as (
  select
    coalesce(
      a.user_id,
      'guest:' || coalesce(lower(a.student_email), lower(a.student_name), a.attempt_id)
    ) as student_natural_key,
    a.user_id,
    coalesce(u.user_name, a.student_name, 'Visitante') as student_name,
    coalesce(u.email, a.student_email) as email,
    coalesce(u.created_at, a.created_at) as first_seen_at,
    a.updated_at as last_seen_at
  from {{ ref('stg_test_attempts') }} a
  left join {{ ref('stg_users') }} u on u.user_id = a.user_id
),
ranked as (
  select *,
    row_number() over (
      partition by student_natural_key
      order by last_seen_at desc nulls last
    ) as rn
  from candidates
)
select
  md5(student_natural_key) as student_key,
  student_natural_key,
  user_id,
  student_name,
  email,
  first_seen_at,
  last_seen_at
from ranked
where rn = 1
