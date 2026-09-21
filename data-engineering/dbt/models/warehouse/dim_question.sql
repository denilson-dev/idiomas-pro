{{ config(
  materialized='table',
  indexes=[
    {'columns': ['question_key'], 'unique': true},
    {'columns': ['question_id'], 'unique': true},
    {'columns': ['category', 'cefr_level']}
  ]
) }}
select
  md5(question_id) as question_key,
  question_id,
  prompt,
  category,
  cefr_level,
  media_type,
  is_active,
  created_at,
  updated_at
from {{ ref('stg_questions') }}
