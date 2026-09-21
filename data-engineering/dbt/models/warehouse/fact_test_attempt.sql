{{ config(
  materialized='table',
  indexes=[
    {'columns': ['attempt_id'], 'unique': true},
    {'columns': ['student_key']},
    {'columns': ['teacher_key']},
    {'columns': ['attempt_date']},
    {'columns': ['cefr_level']}
  ]
) }}
with answer_stats as (
  select
    attempt_id,
    count(*)::integer as answered_questions,
    count(*) filter (where is_correct)::integer as correct_answers
  from {{ ref('stg_attempt_answers') }}
  group by attempt_id
)
select
  md5(a.attempt_id) as attempt_key,
  a.attempt_id,
  md5(
    coalesce(
      a.user_id,
      'guest:' || coalesce(lower(a.student_email), lower(a.student_name), a.attempt_id)
    )
  ) as student_key,
  case when a.teacher_id is not null then md5(a.teacher_id) end as teacher_key,
  md5(a.language) as language_key,
  case when a.cefr_level is not null then md5(a.cefr_level) end as cefr_key,
  a.language,
  a.status,
  a.cefr_level,
  a.total_questions,
  coalesce(s.answered_questions, 0) as answered_questions,
  coalesce(s.correct_answers, 0) as correct_answers,
  greatest(coalesce(s.answered_questions, 0) - coalesce(s.correct_answers, 0), 0) as incorrect_answers,
  a.score,
  case
    when coalesce(s.answered_questions, 0) = 0 then null
    else round((s.correct_answers::numeric / s.answered_questions::numeric) * 100, 2)
  end as accuracy_rate,
  a.created_at::date as attempt_date,
  a.created_at,
  a.updated_at,
  a.completed_at,
  a.breakdown
from {{ ref('stg_test_attempts') }} a
left join answer_stats s on s.attempt_id = a.attempt_id
