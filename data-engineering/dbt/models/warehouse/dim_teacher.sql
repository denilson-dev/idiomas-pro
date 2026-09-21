{{ config(
  materialized='table',
  indexes=[
    {'columns': ['teacher_key'], 'unique': true},
    {'columns': ['teacher_id'], 'unique': true}
  ]
) }}
select
  md5(teacher_id) as teacher_key,
  teacher_id,
  teacher_name,
  email,
  is_active,
  created_at,
  updated_at
from {{ ref('stg_teachers') }}
