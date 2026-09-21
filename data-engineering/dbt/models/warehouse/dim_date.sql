{{ config(
  materialized='table',
  indexes=[{'columns': ['date_day'], 'unique': true}]
) }}
with bounds as (
  select
    coalesce(min(created_at::date), current_date) as min_date,
    coalesce(max(coalesce(completed_at, created_at)::date), current_date) as max_date
  from {{ ref('stg_test_attempts') }}
),
dates as (
  select generate_series(min_date, max_date, interval '1 day')::date as date_day
  from bounds
)
select
  date_day,
  extract(year from date_day)::integer as year,
  extract(quarter from date_day)::integer as quarter,
  extract(month from date_day)::integer as month,
  to_char(date_day, 'TMMonth') as month_name,
  extract(week from date_day)::integer as week_of_year,
  extract(isodow from date_day)::integer as day_of_week,
  to_char(date_day, 'TMDay') as day_name,
  case when extract(isodow from date_day) in (6, 7) then true else false end as is_weekend
from dates
