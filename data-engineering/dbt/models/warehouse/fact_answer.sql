{{ config(
  materialized='table',
  indexes=[
    {'columns': ['answer_id'], 'unique': true},
    {'columns': ['attempt_key']},
    {'columns': ['question_key']},
    {'columns': ['answer_date']}
  ]
) }}
select
  md5(a.answer_id) as answer_key,
  a.answer_id,
  a.attempt_id,
  md5(a.attempt_id) as attempt_key,
  a.question_id,
  md5(a.question_id) as question_key,
  t.student_key,
  t.teacher_key,
  t.language_key,
  a.selected_answer,
  a.is_correct,
  a.category,
  a.question_level,
  a.created_at::date as answer_date,
  a.created_at
from {{ ref('stg_attempt_answers') }} a
inner join {{ ref('fact_test_attempt') }} t on t.attempt_id = a.attempt_id
